// server/src/scratch-login.ts
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import pg from 'pg'

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const email = 'robin@example.com'
const password = 'hunter2'

const userResult = await client.query(
  'SELECT id, password_hash FROM users WHERE email = $1',
  [email],
)
const user = userResult.rows[0]

if (!user) {
  console.log('no account with that email')
} else {
  const matches = await bcrypt.compare(password, user.password_hash)
  if (!matches) {
    console.log('wrong password')
  } else {
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

    await client.query(
      'INSERT INTO sessions (session_token, user_id, expires_at) VALUES ($1, $2, $3)',
      [sessionToken, user.id, expiresAt],
    )

    console.log('logged in, session token:', sessionToken)
  }
}

await client.end()
