import type { VercelRequest, VercelResponse } from '@vercel/node'
import pg from 'pg'
import { checkRateLimit } from './_lib/rateLimit'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const sessionToken = req.cookies.session_token
  if (!sessionToken) {
    res.status(401).json({ error: 'Not logged in' })
    return
  }

  const { fen, move, description } = req.body

  if (!fen || !move || !description) {
    res.status(400).json({ error: 'fen, move, and description are required' })
    return
  }

  try {
    const result = await pool.query(
      `SELECT users.id, users.can_explain, sessions.expires_at
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

    if (!row.can_explain) {
      res.status(403).json({ error: 'Not enabled for this account' })
      return
    }

    const allowed = await checkRateLimit(
      pool,
      `explain:${row.id}`,
      30, // attempts
      60 * 60, // per hour
    )
    if (!allowed) {
      res.status(429).json({ error: 'Too many requests. Try again later.' })
      return
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      res.status(500).json({ error: 'Explanations are not configured' })
      return
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        system: `You are a chess coach helping absolute beginners. Your explanations must:
- Be 1–2 sentences, plain English only
- Never use algebraic notation or square names (no "e4", "Nf3", "g1")
- Explain WHY the move is strategically good, not what the move is
- Reference concrete concepts: controlling the center, developing pieces, protecting the king, creating threats, winning material
- Speak directly to the player using "This move..." or "By doing this..."`,
        messages: [
          {
            role: 'user',
            content: `Position (FEN): ${fen}\nBest move: ${description} (${move}).\nIn 1–2 plain-English sentences, explain WHY this is the best move right now. Focus on strategy, not mechanics.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      res.status(502).json({ error: 'Explanation service unavailable' })
      return
    }

    const data = await response.json()
    const explanation = data.content?.[0]?.text?.trim() ?? ''
    res.status(200).json({ explanation })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}
