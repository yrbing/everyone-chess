import bcrypt from 'bcrypt'

const password = 'hunter2'

const hash = await bcrypt.hash(password, 10)
console.log('hash:', hash)

const matches = await bcrypt.compare(password, hash)
console.log(`correct password matches: ${matches}`)

const wrongMatches = await bcrypt.compare('wrongpassword', hash)
console.log(`wrong password matches: ${wrongMatches}`)
