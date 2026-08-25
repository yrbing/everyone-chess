import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

await pool.query(`
  CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`)

console.log('rate_limits table created')
await pool.end()
