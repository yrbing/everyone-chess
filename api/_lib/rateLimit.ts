import type { VercelRequest } from '@vercel/node'
import type pg from 'pg'

export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded
  return first?.split(',')[0]?.trim() ?? 'unknown'
}

/**
 * Fixed-window counter backed by Postgres. The INSERT ... ON CONFLICT is a
 * single atomic statement, so concurrent requests for the same key can't
 * race each other into under-counting.
 */
export async function checkRateLimit(
  pool: pg.Pool,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const result = await pool.query(
    `INSERT INTO rate_limits (key, count, window_start)
     VALUES ($1, 1, now())
     ON CONFLICT (key) DO UPDATE SET
       count = CASE
         WHEN rate_limits.window_start < now() - make_interval(secs => $2)
           THEN 1
         ELSE rate_limits.count + 1
       END,
       window_start = CASE
         WHEN rate_limits.window_start < now() - make_interval(secs => $2)
           THEN now()
         ELSE rate_limits.window_start
       END
     RETURNING count`,
    [key, windowSeconds],
  )
  return result.rows[0].count <= limit
}
