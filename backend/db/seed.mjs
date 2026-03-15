import { withTransaction, pool } from './connection.mjs'
import { seedDatabase } from './seedData.mjs'

await withTransaction(async (client) => {
  await seedDatabase(client)
})

await pool.end()
console.log('Database seeded with demo data')
