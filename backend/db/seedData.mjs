export const seedUsers = [
  {
    id: 'maya-patel',
    name: 'Maya Patel',
    email: 'maya@appreciation.dev',
    passwordHash:
      '78acf78a10b989c8dc570c7c415c9196:3d99fe6b7d7940ff2791c0e6adb4c4cb4d2c691121abb6e7ebae35176e902ecd56c60d4091144fbb5e6db3aa44918ab91389ed2f46f917747ff3e8b65747d9ec',
    avatar: 'MP',
    role: 'member',
    company: 'Northstar Labs',
    bio: 'Product lead who believes the best teams remember who made the hard days easier.',
  },
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    email: 'sarah@northstar.dev',
    passwordHash:
      '78a2fa3659766968b814780c58fdf2ca:5ce5dff8f6e16bdb88c5c885d3b799703990a7c2e67653b66dc058871fd04e7501fd4a1f35004c45befc2d272a714a294fc7b15cd651785eea5071623412462d',
    avatar: 'SC',
    role: 'member',
    company: 'Northstar Labs',
    bio: 'Reliability engineer known for calm incident response and careful handoffs.',
  },
  {
    id: 'emma-brooks',
    name: 'Emma Brooks',
    email: 'emma@launchguild.dev',
    passwordHash:
      '70814b808f4c311d0b2b8655ddc9db9c:677c2d9e29beb5d3db62bd210ae067442e349e8f6987604dfb786014453322568bbf4b60ee61775e0cfdc6b4c30d181486fb2301ce8f7c996cdefd6db3035de6',
    avatar: 'EB',
    role: 'member',
    company: 'Launch Guild',
    bio: 'Community organizer who turns chaotic events into welcoming rooms.',
  },
  {
    id: 'jason-park',
    name: 'Jason Park',
    email: 'jason@northstar.dev',
    passwordHash:
      '7efc20194b2740ec9ae022ab04ca63ff:ed1c5827c847079fd35e59c29987b5258b3998eae9c0b46562c7a2a4c4e7063771c8bfde1d2521fec95eb7a3c25e370e6c76c6dab7df5fc28627def1baaedc9a',
    avatar: 'JP',
    role: 'member',
    company: 'Northstar Labs',
    bio: 'Customer advocate with a habit of quietly taking the hardest shifts.',
  },
  {
    id: 'alina-moderator',
    name: 'Alina Moderator',
    email: 'alina@appreciation.dev',
    passwordHash:
      '0c8cc6dbd137be266f1c6f077be510f3:28272b2aaac793e1c7f67aec6d11d4fcb6b063365a42fe3707b68bca8d4f9820f3d95fce12bbef2446f81240ace15ce145259e70d48f1a5de2b51e9804ab877b',
    avatar: 'AM',
    role: 'moderator',
    company: 'Appreciation',
    bio: 'Trust and safety lead focused on keeping recognition sincere and safe.',
  },
]

export async function seedDatabase(client) {
  await client.query('truncate table audit_log, recipient_claim_request, session_token, notification, moderation_report, appreciation_comment, appreciation_reaction, appreciation_post, app_user restart identity cascade')

  for (const user of seedUsers) {
    await client.query(
      `insert into app_user (id, name, email, password_hash, avatar, role, company, bio)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [user.id, user.name, user.email, user.passwordHash, user.avatar, user.role, user.company, user.bio],
    )
  }

  await client.query(
    `insert into appreciation_post
      (id, author_id, recipient, recipient_user_id, message, category, location, visibility, gift_amount, gift_provider, company, created_at)
     values
      (1, 'maya-patel', 'Sarah Chen', 'sarah-chen', 'Sarah stayed after standup to help untangle our release rollback and documented the fix so the next on-call shift would be calmer.', 'Teamwork', 'San Francisco', 'public', 15, 'Gift Card', 'Northstar Labs', '2026-03-12T17:40:00.000Z'),
      (2, 'jason-park', 'Maya Patel', 'maya-patel', 'Maya rewrote the launch memo overnight so the team could brief investors with confidence the next morning.', 'Leadership', 'Remote', 'public', 0, 'None', 'Northstar Labs', '2026-03-13T09:05:00.000Z'),
      (3, 'maya-patel', 'Emma Brooks', null, 'Emma organized the hackathon volunteer list, fixed missing badges, and still made time to welcome every new attendee.', 'Leadership', 'Boston', 'anonymous', 10, 'Venmo', 'Launch Guild', '2026-03-13T11:05:00.000Z'),
      (4, 'maya-patel', 'Leo Martinez', null, 'Leo noticed I was carrying too many boxes into the studio and came back from his car just to help me finish in one trip.', 'Everyday Kindness', 'Oakland', 'private', 5, 'Cash App', 'Northstar Labs', '2026-03-11T18:15:00.000Z')`,
  )

  await client.query(
    `insert into appreciation_reaction (id, post_id, user_id, type, created_at)
     values
      (1, 1, 'jason-park', 'support', '2026-03-12T18:00:00.000Z'),
      (2, 1, 'emma-brooks', 'inspiring', '2026-03-12T18:10:00.000Z')`,
  )

  await client.query(
    `insert into appreciation_comment (id, post_id, author_id, body, created_at)
     values (1, 1, 'jason-park', 'This kind of handoff is why the team trusts you during incidents.', '2026-03-12T18:12:00.000Z')`,
  )

  await client.query(
    `insert into moderation_report (id, post_id, reporter_id, reason, status, created_at)
     values (1, 3, 'alina-moderator', 'Needs verification because the recipient is unnamed in the public copy and may be too vague for ranking.', 'reviewing', '2026-03-13T12:15:00.000Z')`,
  )

  await client.query(
    `insert into notification (id, user_id, actor_id, type, message, link, created_at, read_at)
     values
      (1, 'maya-patel', 'jason-park', 'post_received', 'Jason Park appreciated you', '/posts/2', '2026-03-13T09:05:00.000Z', null),
      (2, 'maya-patel', 'jason-park', 'comment_received', 'Jason Park commented on your appreciation post', '/posts/1', '2026-03-12T18:12:00.000Z', '2026-03-12T19:00:00.000Z'),
      (3, 'alina-moderator', 'maya-patel', 'report_opened', 'Maya Patel opened a moderation report', '/posts/3', '2026-03-13T12:20:00.000Z', null)`,
  )

  await client.query("select setval(pg_get_serial_sequence('appreciation_post', 'id'), 4, true)")
  await client.query("select setval(pg_get_serial_sequence('appreciation_reaction', 'id'), 2, true)")
  await client.query("select setval(pg_get_serial_sequence('appreciation_comment', 'id'), 1, true)")
  await client.query("select setval(pg_get_serial_sequence('moderation_report', 'id'), 1, true)")
  await client.query("select setval(pg_get_serial_sequence('notification', 'id'), 3, true)")
}
