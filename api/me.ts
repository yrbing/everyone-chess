import type { VercelRequest, VercelResponse } from '@vercel/node'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const sessionToken = req.cookies.session_token

  if (!sessionToken) {
    res.status(401).json({ error: 'Not logged in' })
    return
  }

  try {
    const result = await pool.query(
      `SELECT users.id, users.email, sessions.expires_at
         FROM sessions
         JOIN users ON users.id = sessions.user_id
         WHERE sessions.session_token = $1`,
      [sessionToken],
    )
    const row = result.rows[0]

    if (!row || row.expires_at < new Date()) {
      res.status(401).json({ error: 'Not logged in' })
      return
    }

    res.status(200).json({ user: { id: row.id, email: row.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}
