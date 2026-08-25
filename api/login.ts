import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import pg from 'pg'
import { checkRateLimit, getClientIp } from './_lib/rateLimit'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  try {
    const allowed = await checkRateLimit(
      pool,
      `login:${getClientIp(req)}`,
      10, // attempts
      5 * 60, // per 5 minutes
    )
    if (!allowed) {
      res.status(429).json({ error: 'Too many attempts. Try again later.' })
      return
    }

    const userResult = await pool.query(
      'SELECT id, password_hash FROM users WHERE email = $1',
      [email],
    )
    const user = userResult.rows[0]

    // Deliberately the same error for "no such email" and "wrong password" —
    // telling them apart would let an attacker enumerate which emails have
    // accounts on this system.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const sessionToken = crypto.randomBytes(32).toString('hex')
    const maxAgeSeconds = 7 * 24 * 60 * 60
    const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000)

    await pool.query(
      'INSERT INTO sessions (session_token, user_id, expires_at) VALUES ($1, $2, $3)',
      [sessionToken, user.id, expiresAt],
    )

    const isProduction = process.env.VERCEL_ENV === 'production'
    const cookie = [
      `session_token=${sessionToken}`,
      'HttpOnly',
      'Path=/',
      `Max-Age=${maxAgeSeconds}`,
      'SameSite=Lax',
      isProduction ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ')

    res.setHeader('Set-Cookie', cookie)
    res.status(200).json({ user: { id: user.id, email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}
