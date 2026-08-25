import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

await pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS can_explain BOOLEAN NOT NULL DEFAULT false
`)

console.log('can_explain column added')
await pool.end()
