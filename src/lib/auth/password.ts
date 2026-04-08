import crypto from 'crypto'

const ITERATIONS = 100_000
const KEY_LEN = 32
const DIGEST = 'sha256'

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString('hex')
  return `pbkdf2:${ITERATIONS}:${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const [, iters, salt, hash] = parts
  const computed = crypto.pbkdf2Sync(password, salt, Number(iters), KEY_LEN, DIGEST).toString('hex')
  const a = Buffer.from(computed, 'hex')
  const b = Buffer.from(hash, 'hex')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
