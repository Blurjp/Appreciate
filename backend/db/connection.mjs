import { Pool } from 'pg'
import { config } from '../config.mjs'

const isLocalConnection = /localhost|127\.0\.0\.1/.test(config.databaseUrl)
const ssl = isLocalConnection || config.pgDisableSsl
  ? undefined
  : { rejectUnauthorized: false }

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl,
})

export async function withTransaction(run) {
  const client = await pool.connect()
  try {
    await client.query('begin')
    const result = await run(client)
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}
