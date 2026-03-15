import { pool } from './connection.mjs'

const [users, posts, health] = await Promise.all([
  pool.query('select count(*)::int as count from app_user'),
  pool.query('select count(*)::int as count from appreciation_post'),
  pool.query('select now() as now'),
])

console.log(
  JSON.stringify(
    {
      ok: true,
      users: users.rows[0].count,
      posts: posts.rows[0].count,
      serverTime: health.rows[0].now,
    },
    null,
    2,
  ),
)

await pool.end()
