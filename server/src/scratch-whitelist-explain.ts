import pg from 'pg'

const email = process.argv[2]
if (!email) {
  console.error('Usage: tsx scratch-whitelist-explain.ts <email>')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

const result = await pool.query(
  'UPDATE users SET can_explain = true WHERE email = $1 RETURNING id, email',
  [email],
)

if (result.rows.length === 0) {
  console.log(`No user found with email ${email}`)
} else {
  console.log('Whitelisted:', result.rows[0])
}

await pool.end()

/**
 * local/dev
  npx tsx --env-file=server/.env server/src/scratch-whitelist-explain.ts your-real-email@example.com

 * production (pull the connection string first, remove it after)
  vercel env pull --environment=production server/.env.production
  npx tsx --env-file=server/.env.production server/src/scratch-whitelist-explain.ts your-real-email@example.com
  rm server/.env.production
  */
