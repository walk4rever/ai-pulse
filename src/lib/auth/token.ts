import crypto from 'crypto'

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export function generateSessionToken(): { token: string; hash: string; expiresAt: string } {
  const token = crypto.randomBytes(32).toString('base64url')
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()
  return { token, hash, expiresAt }
}

export function generateAgentKey(): { key: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('base64url')
  const key = `aipk_${raw}`
  const hash = crypto.createHash('sha256').update(key).digest('hex')
  return { key, hash }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
