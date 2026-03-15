import { pool } from './connection.mjs'

const [user, post, moderator, notifications, claimable] = await Promise.all([
  pool.query("select id, email from app_user where email = 'maya@appreciation.dev' limit 1"),
  pool.query('select id, recipient, visibility from appreciation_post order by id asc limit 1'),
  pool.query("select id from app_user where role = 'moderator' limit 1"),
  pool.query('select count(*)::int as count from notification'),
  pool.query("select count(*)::int as count from appreciation_post where recipient_user_id is null and lower(recipient) = 'emma brooks'"),
])

if (!user.rows[0]) throw new Error('Missing seeded Maya user')
if (!post.rows[0]) throw new Error('Missing seeded appreciation post')
if (!moderator.rows[0]) throw new Error('Missing moderator account')

console.log(
  JSON.stringify(
    {
      ok: true,
      user: user.rows[0],
      firstPost: post.rows[0],
      notificationCount: notifications.rows[0].count,
      claimableEmmaPosts: claimable.rows[0].count,
    },
    null,
    2,
  ),
)

await pool.end()
