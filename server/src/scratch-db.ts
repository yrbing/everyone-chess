import pg from 'pg'

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const result = await client.query('SELECT version()')
console.log(result.rows[0])

const result1 = await client.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`)

console.log('users table created', result1)

const result2 = await client.query(`
   CREATE TABLE IF NOT EXISTS sessions (
    session_token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`)

console.log('sessions table created', result2)

await client.end()
