import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcrypt'
import pg from 'pg'

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
    const hash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hash],
    )
    res.status(201).json({ user: result.rows[0] })
  } catch (err) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      err.code === '23505'
    ) {
      res.status(409).json({ error: 'That email is already registered' })
      return
    }
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}
