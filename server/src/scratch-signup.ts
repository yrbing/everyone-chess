// server/src/scratch-signup.ts
import bcrypt from 'bcrypt'
import pg from 'pg'

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const email = 'robin@example.com'
const password = 'hunter2'

const hash = await bcrypt.hash(password, 10)

try {
  const result = await client.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, hash],
  )
  console.log('created user:', result.rows[0])
} catch (err) {
  if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
    console.log('that email is already registered')
  } else {
    throw err
  }
}

await client.end()
