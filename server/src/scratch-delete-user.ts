import pg from 'pg'

const email = process.argv[2]
if (!email) {
  console.error('Usage: tsx scratch-delete-user.ts <email>')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// sessions.user_id has ON DELETE CASCADE, so this also removes any of
// their active sessions, no separate DELETE FROM sessions needed.
const result = await pool.query(
  'DELETE FROM users WHERE email = $1 RETURNING id, email',
  [email],
)

if (result.rows.length === 0) {
  console.log(`No user found with email ${email}`)
} else {
  console.log('Deleted:', result.rows[0])
}

await pool.end()

/**
 * local/dev
  npx tsx --env-file=server/.env server/src/scratch-delete-user.ts your-real-email@example.com

 * production (pull the connection string first, remove it after)
  vercel env pull --environment=production server/.env.production
  npx tsx --env-file=server/.env.production server/src/scratch-delete-user.ts your-real-email@example.com
  rm server/.env.production
  */
