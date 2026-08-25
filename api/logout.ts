// api/logout.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const sessionToken = req.cookies.session_token

  try {
    if (sessionToken) {
      await pool.query('DELETE FROM sessions WHERE session_token = $1', [
        sessionToken,
      ])
    }

    res.setHeader(
      'Set-Cookie',
      'session_token=; HttpOnly; Path=/; Max-Age=0;SameSite=Lax',
    )
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}
