import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import { config } from './config.mjs'
import { pool, withTransaction } from './db/connection.mjs'
import { seedDatabase } from './db/seedData.mjs'
import { rateLimit } from './rateLimit.mjs'
import {
  validate,
  loginSchema,
  createPostSchema,
  createReactionSchema,
  createCommentSchema,
  createReportSchema,
  updateReportSchema,
  markNotificationSchema,
  categories,
} from './validation.mjs'

const app = express()
const port = config.port
const sessionMaxAgeMs = 7 * 24 * 60 * 60 * 1000
const distDir = path.join(process.cwd(), 'dist')
const indexHtmlPath = path.join(distDir, 'index.html')

app.use(express.json())

function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [key, ...rest] = item.split('=')
        return [key, decodeURIComponent(rest.join('='))]
      }),
  )
}

function setSessionCookie(response, sid) {
  response.setHeader('Set-Cookie', `sid=${sid}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`)
}

function clearSessionCookie(response) {
  response.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict')
}

function getRequestIdentifier(request) {
  return request.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || request.socket.remoteAddress || 'unknown'
}

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    role: row.role,
    company: row.company ?? undefined,
    bio: row.bio,
  }
}

function mapPost(row) {
  return {
    id: Number(row.id),
    authorId: row.author_id,
    recipient: row.recipient,
    recipientUserId: row.recipient_user_id ?? undefined,
    message: row.message,
    category: row.category,
    location: row.location ?? '',
    visibility: row.visibility,
    giftAmount: Number(row.gift_amount),
    giftProvider: row.gift_provider,
    createdAt: row.created_at,
    company: row.company ?? undefined,
  }
}

function mapReaction(row) {
  return {
    id: Number(row.id),
    postId: Number(row.post_id),
    userId: row.user_id,
    type: row.type,
    createdAt: row.created_at,
  }
}

function mapComment(row) {
  return {
    id: Number(row.id),
    postId: Number(row.post_id),
    authorId: row.author_id,
    body: row.body,
    createdAt: row.created_at,
  }
}

function mapReport(row) {
  return {
    id: Number(row.id),
    postId: Number(row.post_id),
    reporterId: row.reporter_id,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
  }
}

function mapNotification(row) {
  return {
    id: Number(row.id),
    userId: row.user_id,
    actorId: row.actor_id ?? undefined,
    type: row.type,
    message: row.message,
    link: row.link,
    createdAt: row.created_at,
    readAt: row.read_at ?? undefined,
  }
}

function mapClaimRequest(row) {
  return {
    id: Number(row.id),
    postId: Number(row.post_id),
    requesterUserId: row.requester_user_id,
    status: row.status,
    createdAt: row.created_at,
    decidedAt: row.decided_at ?? undefined,
  }
}

function mapAuditLog(row) {
  return {
    id: Number(row.id),
    actorUserId: row.actor_user_id ?? undefined,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id ?? undefined,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  }
}

const onboardingPrompts = [
  {
    id: 'sprint-review',
    title: 'Sprint review ritual',
    body: 'Ask every team lead to appreciate one person who made the sprint materially easier.',
    category: 'ritual',
  },
  {
    id: 'incident-recovery',
    title: 'After incident recovery',
    body: 'Capture the teammate who reduced stress, clarified ownership, or stabilized the release.',
    category: 'ops',
  },
  {
    id: 'onboarding-support',
    title: 'Mentorship prompt',
    body: 'Recognize the person who helped a new teammate ramp faster this week.',
    category: 'teamwork',
  },
]

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}

function verifyPassword(password, passwordHash) {
  const [salt, expectedHash] = passwordHash.split(':')
  const actualHash = hashPassword(password, salt)
  return crypto.timingSafeEqual(Buffer.from(actualHash, 'hex'), Buffer.from(expectedHash, 'hex'))
}

async function cleanupExpiredSessions(client = pool) {
  await client.query('delete from session_token where expires_at <= now()')
}

async function getSessionFromRequest(request) {
  const sid = parseCookies(request.headers.cookie).sid
  if (!sid) return { sid: null, session: null, user: null }

  await cleanupExpiredSessions()

  const result = await pool.query(
    `select s.id, s.user_id, s.csrf_token, s.expires_at, u.id as uid, u.name, u.email, u.avatar, u.role, u.company, u.bio
     from session_token s
     join app_user u on u.id = s.user_id
     where s.id = $1`,
    [sid],
  )

  if (!result.rows[0]) return { sid: null, session: null, user: null }

  const row = result.rows[0]
  return {
    sid,
    session: {
      id: row.id,
      userId: row.user_id,
      csrfToken: row.csrf_token,
      expiresAt: row.expires_at,
    },
    user: mapUser({
      id: row.uid,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      role: row.role,
      company: row.company,
      bio: row.bio,
    }),
  }
}

const POST_LIMIT = 100
const REACTION_LIMIT = 500
const COMMENT_LIMIT = 500
const NOTIFICATION_LIMIT = 50

async function loadStateForUser(user) {
  const [users, posts, reactions, reports, comments, notifications, claimRequests, claimCandidates, claimableStats, postReceivedStats, auditLogs] = await Promise.all([
    pool.query('select id, name, email, avatar, role, company, bio from app_user order by created_at asc'),
    pool.query(`select * from appreciation_post order by created_at desc limit ${POST_LIMIT}`),
    pool.query(`select * from appreciation_reaction order by created_at desc limit ${REACTION_LIMIT}`),
    pool.query('select * from moderation_report order by created_at desc'),
    pool.query(`select * from appreciation_comment order by created_at desc limit ${COMMENT_LIMIT}`),
    pool.query('select * from notification where user_id = $1 order by created_at desc limit $2', [user.id, NOTIFICATION_LIMIT]),
    pool.query('select * from recipient_claim_request where requester_user_id = $1 order by created_at desc', [user.id]),
    pool.query(
      `select p.id as post_id, p.recipient, p.message, p.created_at, coalesce(u.name, 'Someone') as author_name
       from appreciation_post p
       left join app_user u on u.id = p.author_id
       where p.recipient_user_id is null and lower(p.recipient) = lower((select name from app_user where id = $1))
       order by p.created_at desc
       limit 20`,
      [user.id],
    ),
    pool.query(
      `select
         count(*) filter (where lower(p.recipient) in (select lower(name) from app_user))::int as claimable_total,
         count(*) filter (where p.recipient_user_id is not null and lower(p.recipient) in (select lower(name) from app_user))::int as claimed_total
       from appreciation_post p`,
    ),
    pool.query(
      `select
         count(*)::int as total,
         count(*) filter (where read_at is not null)::int as opened
       from notification
       where type = 'post_received'`,
    ),
    user.role === 'moderator'
      ? pool.query('select * from audit_log order by created_at desc limit 100')
      : Promise.resolve({ rows: [] }),
  ])

  const giverCounts = new Map()
  for (const row of posts.rows) {
    giverCounts.set(row.author_id, (giverCounts.get(row.author_id) ?? 0) + 1)
  }
  const activeGivers = Array.from(giverCounts.values()).filter((count) => count > 0).length
  const repeatGivers = Array.from(giverCounts.values()).filter((count) => count > 1).length
  const weeklyMeaningfulAppreciations = posts.rows.filter((row) => new Date(row.created_at).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000).length
  const claimableTotal = claimableStats.rows[0]?.claimable_total ?? 0
  const claimedTotal = claimableStats.rows[0]?.claimed_total ?? 0
  const postReceivedTotal = postReceivedStats.rows[0]?.total ?? 0
  const postReceivedOpened = postReceivedStats.rows[0]?.opened ?? 0

  return {
    users: users.rows.map(mapUser),
    posts: posts.rows.map(mapPost),
    reactions: reactions.rows.map(mapReaction),
    reports: reports.rows.map(mapReport),
    comments: comments.rows.map(mapComment),
    notifications: notifications.rows.map(mapNotification),
    claimRequests: claimRequests.rows.map(mapClaimRequest),
    auditLogs: auditLogs.rows.map(mapAuditLog),
      claimCandidates: claimCandidates.rows.map((row) => ({
      postId: Number(row.post_id),
      recipient: row.recipient,
      message: row.message,
      createdAt: row.created_at,
      authorName: row.author_name,
    })),
    onboardingPrompts,
    launchMetrics: {
      weeklyMeaningfulAppreciations,
      repeatGiverRate: activeGivers ? Math.round((repeatGivers / activeGivers) * 100) : 0,
      recipientOpenRate: postReceivedTotal ? Math.round((postReceivedOpened / postReceivedTotal) * 100) : 0,
      claimRate: claimableTotal ? Math.round((claimedTotal / claimableTotal) * 100) : 0,
      moderationRate: posts.rows.length ? Math.round((reports.rows.length / posts.rows.length) * 100) : 0,
      activeGivers,
    },
  }
}

async function buildBootstrapPayload(user, session) {
  return {
    currentUser: user,
    csrfToken: session.csrfToken,
      state: await loadStateForUser(user),
  }
}

async function createNotification(client, notification) {
  await client.query(
    `insert into notification (user_id, actor_id, type, message, link)
     values ($1, $2, $3, $4, $5)`,
    [notification.userId, notification.actorId ?? null, notification.type, notification.message, notification.link],
  )
}

async function createAuditLog(client, entry) {
  await client.query(
    `insert into audit_log (actor_user_id, action, target_type, target_id, metadata)
     values ($1, $2, $3, $4, $5::jsonb)`,
    [entry.actorUserId ?? null, entry.action, entry.targetType, entry.targetId ?? null, JSON.stringify(entry.metadata ?? {})],
  )
}

async function getPostById(postId) {
  const result = await pool.query('select * from appreciation_post where id = $1', [postId])
  return result.rows[0] ? mapPost(result.rows[0]) : null
}

async function claimPostForUser(postId, currentUser) {
  await withTransaction(async (client) => {
    const postQuery = await client.query('select id, recipient, recipient_user_id from appreciation_post where id = $1', [postId])
    const post = postQuery.rows[0]
    if (!post) {
      throw new Error('Post not found')
    }

    if (post.recipient_user_id) {
      throw new Error('This appreciation has already been claimed')
    }

    if (String(post.recipient).trim().toLowerCase() !== currentUser.name.trim().toLowerCase()) {
      throw new Error('Only the matching recipient can claim this appreciation')
    }

    await client.query(
      `insert into recipient_claim_request (post_id, requester_user_id, status, decided_at)
       values ($1, $2, 'approved', now())
       on conflict (post_id)
       do update set requester_user_id = excluded.requester_user_id, status = 'approved', decided_at = now()`,
      [postId, currentUser.id],
    )

    await client.query('update appreciation_post set recipient_user_id = $2 where id = $1', [postId, currentUser.id])

    await createAuditLog(client, {
      actorUserId: currentUser.id,
      action: 'recipient.claim_approved',
      targetType: 'post',
      targetId: String(postId),
      metadata: {},
    })
  })
}

async function requireAuth(request, response, next) {
  try {
    const { sid, session, user } = await getSessionFromRequest(request)
    if (!sid || !session || !user) {
      response.status(401).send('Unauthorized')
      return
    }

    request.sessionId = sid
    request.session = session
    request.currentUser = user
    next()
  } catch (error) {
    next(error)
  }
}

function requireCsrf(request, response, next) {
  const token = request.headers['x-csrf-token']
  if (!request.session || typeof token !== 'string' || token !== request.session.csrfToken) {
    response.status(403).send('Invalid CSRF token')
    return
  }
  next()
}

function requireModerator(request, response, next) {
  if (request.currentUser.role !== 'moderator') {
    response.status(403).send('Moderator access required')
    return
  }
  next()
}

function requireAdminResetEnabled(_request, response, next) {
  if (!config.allowAdminReset) {
    response.status(404).send('Not found')
    return
  }
  next()
}

app.get('/api/health', async (_request, response, next) => {
  try {
    await pool.query('select 1')
    response.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

app.get('/api/auth/session', async (request, response, next) => {
  try {
    const { session, user } = await getSessionFromRequest(request)
    response.json({ currentUser: user, csrfToken: session?.csrfToken ?? null })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/login', async (request, response, next) => {
  try {
    const authRate = rateLimit({
      scope: 'login',
      identifier: getRequestIdentifier(request),
      limit: 10,
      windowMs: 10 * 60 * 1000,
    })
    if (!authRate.allowed) {
      response.status(429).send('Too many login attempts. Please try again later.')
      return
    }

    const parsed = validate(loginSchema, request.body)
    if (!parsed.success) {
      response.status(400).send(parsed.error)
      return
    }
    const { email, password } = parsed.data

    const result = await pool.query('select * from app_user where email = $1', [email])
    const row = result.rows[0]

    if (!row) {
      await createAuditLog(pool, {
        actorUserId: null,
        action: 'auth.login_failed',
        targetType: 'session',
        targetId: null,
        metadata: { email, identifier: getRequestIdentifier(request), reason: 'user_not_found' },
      })
      response.status(401).send('Invalid email or password')
      return
    }

    if (!verifyPassword(password, row.password_hash)) {
      await createAuditLog(pool, {
        actorUserId: row.id,
        action: 'auth.login_failed',
        targetType: 'session',
        targetId: null,
        metadata: { email, identifier: getRequestIdentifier(request), reason: 'wrong_password' },
      })
      response.status(401).send('Invalid email or password')
      return
    }

    const sid = crypto.randomUUID()
    const csrfToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + sessionMaxAgeMs).toISOString()

    await pool.query('delete from session_token where user_id = $1', [row.id])
    await pool.query(
      `insert into session_token (id, user_id, csrf_token, expires_at)
       values ($1, $2, $3, $4)`,
      [sid, row.id, csrfToken, expiresAt],
    )
    await createAuditLog(pool, {
      actorUserId: row.id,
      action: 'auth.login_succeeded',
      targetType: 'session',
      targetId: sid,
      metadata: { identifier: getRequestIdentifier(request) },
    })

    setSessionCookie(response, sid)
    response.json({ currentUser: mapUser(row), csrfToken })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/logout', requireAuth, requireCsrf, async (request, response, next) => {
  try {
    await createAuditLog(pool, {
      actorUserId: request.currentUser.id,
      action: 'auth.logout',
      targetType: 'session',
      targetId: request.sessionId,
      metadata: {},
    })
    await pool.query('delete from session_token where id = $1', [request.sessionId])
    clearSessionCookie(response)
    response.json({ ok: true, csrfToken: null })
  } catch (error) {
    next(error)
  }
})

app.get('/api/bootstrap', requireAuth, async (request, response, next) => {
  try {
    response.json(await buildBootstrapPayload(request.currentUser, request.session))
  } catch (error) {
    next(error)
  }
})

app.get('/api/posts/:postId', requireAuth, async (request, response, next) => {
  try {
    const postId = Number(request.params.postId)
    const post = await getPostById(postId)
    if (!post) {
      response.status(404).send('Post not found')
      return
    }

    const [comments, reactions] = await Promise.all([
      pool.query('select * from appreciation_comment where post_id = $1 order by created_at desc limit 100', [postId]),
      pool.query('select * from appreciation_reaction where post_id = $1 order by created_at desc limit 100', [postId]),
    ])

    response.json({
      csrfToken: request.session.csrfToken,
      post,
      comments: comments.rows.map(mapComment),
      reactions: reactions.rows.map(mapReaction),
    })
  } catch (error) {
    next(error)
  }
})

app.get('/api/claim/:token', async (request, response, next) => {
  try {
    const result = await pool.query(
      `select cit.token, cit.post_id, cit.expires_at, p.recipient, p.message, p.created_at, coalesce(u.name, 'Someone') as author_name
       from claim_invite_token cit
       join appreciation_post p on p.id = cit.post_id
       left join app_user u on u.id = p.author_id
       where cit.token = $1 and cit.expires_at > now()`,
      [request.params.token],
    )
    const row = result.rows[0]
    if (!row) {
      response.status(404).send('Claim invite not found or expired')
      return
    }

    const { session } = await getSessionFromRequest(request)
    response.json({
      csrfToken: session?.csrfToken ?? null,
      invite: {
        token: row.token,
        postId: Number(row.post_id),
        recipient: row.recipient,
        message: row.message,
        authorName: row.author_name,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
      },
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/posts', requireAuth, requireCsrf, async (request, response, next) => {
  try {
    const appreciationRate = rateLimit({
      scope: 'appreciation-create',
      identifier: request.currentUser.id,
      limit: 20,
      windowMs: 24 * 60 * 60 * 1000,
    })
    if (!appreciationRate.allowed) {
      response.status(429).send('Daily appreciation limit reached. Please come back tomorrow with more gratitude.')
      return
    }

    const parsed = validate(createPostSchema, request.body)
    if (!parsed.success) {
      response.status(400).send(parsed.error)
      return
    }
    const { recipient, recipientUserId, message, category, location, visibility, giftAmount, giftProvider } = parsed.data

    await withTransaction(async (client) => {
      const inserted = await client.query(
        `insert into appreciation_post
          (author_id, recipient, recipient_user_id, message, category, location, visibility, gift_amount, gift_provider, company)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         returning id`,
        [
          request.currentUser.id,
          recipient,
          recipientUserId || null,
          message,
          category,
          location,
          visibility,
          giftAmount,
          giftAmount > 0 ? giftProvider : 'None',
          request.currentUser.company ?? null,
        ],
      )

      const newPostId = inserted.rows[0].id

      if (recipientUserId && recipientUserId !== request.currentUser.id) {
        await createNotification(client, {
          userId: recipientUserId,
          actorId: request.currentUser.id,
          type: 'post_received',
          message: `${request.currentUser.name} appreciated you`,
          link: `/posts/${newPostId}`,
        })
      }

      await createAuditLog(client, {
        actorUserId: request.currentUser.id,
        action: 'appreciation.created',
        targetType: 'post',
        targetId: String(newPostId),
        metadata: { visibility, recipientUserId: recipientUserId || null },
      })
    })

    response.json(await buildBootstrapPayload(request.currentUser, request.session))
  } catch (error) {
    next(error)
  }
})

app.post('/api/posts/:postId/reactions', requireAuth, requireCsrf, async (request, response, next) => {
  try {
    const postId = Number(request.params.postId)

    const parsed = validate(createReactionSchema, request.body)
    if (!parsed.success) {
      response.status(400).send(parsed.error)
      return
    }
    const { type } = parsed.data

    await withTransaction(async (client) => {
      await client.query(
        `insert into appreciation_reaction (post_id, user_id, type)
         values ($1, $2, $3)
         on conflict (post_id, user_id)
         do update set type = excluded.type, created_at = now()`,
        [postId, request.currentUser.id, type],
      )

      const postQuery = await client.query('select author_id from appreciation_post where id = $1', [postId])
      const post = postQuery.rows[0]
      if (post && post.author_id !== request.currentUser.id) {
        await createNotification(client, {
          userId: post.author_id,
          actorId: request.currentUser.id,
          type: 'reaction_received',
          message: `${request.currentUser.name} reacted to your appreciation post`,
          link: `/posts/${postId}`,
        })
      }
    })

    response.json(await buildBootstrapPayload(request.currentUser, request.session))
  } catch (error) {
    next(error)
  }
})

app.post('/api/posts/:postId/comments', requireAuth, requireCsrf, async (request, response, next) => {
  try {
    const postId = Number(request.params.postId)

    const parsed = validate(createCommentSchema, request.body)
    if (!parsed.success) {
      response.status(400).send(parsed.error)
      return
    }
    const { body } = parsed.data

    await withTransaction(async (client) => {
      await client.query(
        `insert into appreciation_comment (post_id, author_id, body)
         values ($1, $2, $3)`,
        [postId, request.currentUser.id, body],
      )

      const postQuery = await client.query('select author_id from appreciation_post where id = $1', [postId])
      const post = postQuery.rows[0]
      if (post && post.author_id !== request.currentUser.id) {
        await createNotification(client, {
          userId: post.author_id,
          actorId: request.currentUser.id,
          type: 'comment_received',
          message: `${request.currentUser.name} commented on your appreciation post`,
          link: `/posts/${postId}`,
        })
      }
    })

    response.json(await buildBootstrapPayload(request.currentUser, request.session))
  } catch (error) {
    next(error)
  }
})

app.post('/api/posts/:postId/claim', requireAuth, requireCsrf, async (request, response, next) => {
  try {
    const postId = Number(request.params.postId)
    await claimPostForUser(postId, request.currentUser)

    response.json(await buildBootstrapPayload(request.currentUser, request.session))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to claim post'
    if (message === 'Post not found') {
      response.status(404).send(message)
      return
    }
    if (message === 'This appreciation has already been claimed' || message === 'Only the matching recipient can claim this appreciation') {
      response.status(400).send(message)
      return
    }
    next(error)
  }
})

app.post('/api/claim/:token', requireAuth, requireCsrf, async (request, response, next) => {
  try {
    const result = await pool.query('select post_id from claim_invite_token where token = $1 and expires_at > now()', [request.params.token])
    if (!result.rows[0]) {
      response.status(404).send('Claim invite not found or expired')
      return
    }

    await claimPostForUser(Number(result.rows[0].post_id), request.currentUser)
    response.json(await buildBootstrapPayload(request.currentUser, request.session))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to claim invite'
    if (message === 'Post not found' || message === 'Claim invite not found or expired') {
      response.status(404).send(message)
      return
    }
    if (message === 'This appreciation has already been claimed' || message === 'Only the matching recipient can claim this appreciation') {
      response.status(400).send(message)
      return
    }
    next(error)
  }
})

app.post('/api/posts/:postId/invite', requireAuth, requireCsrf, async (request, response, next) => {
  try {
    const postId = Number(request.params.postId)
    const post = await getPostById(postId)
    if (!post) {
      response.status(404).send('Post not found')
      return
    }
    if (post.authorId !== request.currentUser.id) {
      response.status(403).send('Only the author can create a claim invite')
      return
    }
    if (post.recipientUserId) {
      response.status(400).send('Recipient already linked')
      return
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    await pool.query(
      `insert into claim_invite_token (token, post_id, created_by_user_id, expires_at)
       values ($1, $2, $3, $4)
       on conflict (post_id)
       do update set token = excluded.token, created_by_user_id = excluded.created_by_user_id, expires_at = excluded.expires_at`,
      [token, postId, request.currentUser.id, expiresAt],
    )
    await createAuditLog(pool, {
      actorUserId: request.currentUser.id,
      action: 'recipient.claim_invite_created',
      targetType: 'post',
      targetId: String(postId),
      metadata: { expiresAt },
    })

    response.json({ csrfToken: request.session.csrfToken, inviteLink: `/claim/${token}` })
  } catch (error) {
    next(error)
  }
})

app.post('/api/posts/:postId/reports', requireAuth, requireCsrf, async (request, response, next) => {
  try {
    const reportRate = rateLimit({
      scope: 'report',
      identifier: request.currentUser.id,
      limit: 8,
      windowMs: 60 * 60 * 1000,
    })
    if (!reportRate.allowed) {
      response.status(429).send('Too many reports in a short period. Please slow down.')
      return
    }

    const postId = Number(request.params.postId)

    const parsed = validate(createReportSchema, request.body)
    if (!parsed.success) {
      response.status(400).send(parsed.error)
      return
    }
    const { reason } = parsed.data

    await withTransaction(async (client) => {
      await client.query(
        `insert into moderation_report (post_id, reporter_id, reason, status)
         values ($1, $2, $3, 'open')`,
        [postId, request.currentUser.id, reason],
      )
      await createAuditLog(client, {
        actorUserId: request.currentUser.id,
        action: 'moderation.report_created',
        targetType: 'post',
        targetId: String(postId),
        metadata: { reason },
      })

      const moderators = await client.query("select id from app_user where role = 'moderator'")
      for (const moderator of moderators.rows) {
        await createNotification(client, {
          userId: moderator.id,
          actorId: request.currentUser.id,
          type: 'report_opened',
          message: `${request.currentUser.name} opened a moderation report`,
          link: `/posts/${postId}`,
        })
      }
    })

    response.json(await buildBootstrapPayload(request.currentUser, request.session))
  } catch (error) {
    next(error)
  }
})

app.patch('/api/reports/:reportId', requireAuth, requireCsrf, requireModerator, async (request, response, next) => {
  try {
    const reportId = Number(request.params.reportId)

    const parsed = validate(updateReportSchema, request.body)
    if (!parsed.success) {
      response.status(400).send(parsed.error)
      return
    }
    const { status } = parsed.data

    const result = await pool.query(
      `update moderation_report
       set status = $2
       where id = $1
       returning id`,
      [reportId, status],
    )

    if (!result.rows[0]) {
      response.status(404).send('Report not found')
      return
    }

    await createAuditLog(pool, {
      actorUserId: request.currentUser.id,
      action: 'moderation.report_updated',
      targetType: 'report',
      targetId: String(reportId),
      metadata: { status },
    })

    response.json(await buildBootstrapPayload(request.currentUser, request.session))
  } catch (error) {
    next(error)
  }
})

app.patch('/api/notifications/:notificationId', requireAuth, requireCsrf, async (request, response, next) => {
  try {
    const notificationId = Number(request.params.notificationId)

    const parsed = validate(markNotificationSchema, request.body)
    if (!parsed.success) {
      response.status(400).send(parsed.error)
      return
    }
    const { read } = parsed.data

    const result = await pool.query(
      `update notification
       set read_at = case when $3 then now() else null end
       where id = $1 and user_id = $2
       returning id`,
      [notificationId, request.currentUser.id, read],
    )

    if (!result.rows[0]) {
      response.status(404).send('Notification not found')
      return
    }

    response.json(await buildBootstrapPayload(request.currentUser, request.session))
  } catch (error) {
    next(error)
  }
})

app.get('/api/admin/audit-logs', requireAuth, requireModerator, async (request, response, next) => {
  try {
    const result = await pool.query('select * from audit_log order by created_at desc limit 200')
    response.json({ csrfToken: request.session.csrfToken, auditLogs: result.rows.map(mapAuditLog) })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/reset-demo', requireAuth, requireCsrf, requireModerator, requireAdminResetEnabled, async (request, response, next) => {
  try {
    const resetRate = rateLimit({
      scope: 'reset-demo',
      identifier: request.currentUser.id,
      limit: 3,
      windowMs: 15 * 60 * 1000,
    })
    if (!resetRate.allowed) {
      response.status(429).send('Demo reset rate limit reached. Please wait before resetting again.')
      return
    }

    await withTransaction(async (client) => {
      await seedDatabase(client)
      await createAuditLog(client, {
        actorUserId: request.currentUser.id,
        action: 'admin.demo_reset',
        targetType: 'environment',
        targetId: config.appEnv,
        metadata: {},
      })
    })

    const refreshed = await getSessionFromRequest(request)
    if (!refreshed.user || !refreshed.session) {
      response.status(401).send('Session expired during reset')
      return
    }

    response.json(await buildBootstrapPayload(refreshed.user, refreshed.session))
  } catch (error) {
    next(error)
  }
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).send('Internal server error')
})

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))

  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(indexHtmlPath)
  })
}

app.listen(port, () => {
  console.log(`Appreciation API listening on http://localhost:${port} (${config.appEnv})`)
})
