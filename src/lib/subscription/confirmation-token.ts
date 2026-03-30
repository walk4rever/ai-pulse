import crypto from 'crypto'

const DEFAULT_TTL_SECONDS = 60 * 60 * 24

export enum ConfirmationTokenError {
  Expired = 'expired',
  Invalid = 'invalid',
  Malformed = 'malformed',
}

type GenerateConfirmationTokenParams = {
  email: string
  nonce: string
  secret: string
  expiresInSeconds?: number
  now?: Date
}

type VerifyConfirmationTokenParams = {
  email: string
  nonce: string
  token: string
  secret: string
  now?: Date
}

type VerifyConfirmationTokenResult =
  | { ok: true; expiresAt: string }
  | { ok: false; reason: ConfirmationTokenError }

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(value: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url')
}

function getDefaultTtlSeconds() {
  const configured = Number(process.env.EMAIL_CONFIRMATION_TTL_SECONDS)

  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_TTL_SECONDS
  }

  return configured
}

export function generateConfirmationToken({
  email,
  nonce,
  secret,
  expiresInSeconds = getDefaultTtlSeconds(),
  now = new Date(),
}: GenerateConfirmationTokenParams) {
  const exp = now.getTime() + expiresInSeconds * 1000
  const payload = JSON.stringify({ email, nonce, exp })
  const encodedPayload = toBase64Url(payload)
  const signature = sign(encodedPayload, secret)

  return `${encodedPayload}.${signature}`
}

export function verifyConfirmationToken({
  email,
  nonce,
  token,
  secret,
  now = new Date(),
}: VerifyConfirmationTokenParams): VerifyConfirmationTokenResult {
  const [encodedPayload, providedSignature] = token.split('.')

  if (!encodedPayload || !providedSignature) {
    return { ok: false, reason: ConfirmationTokenError.Malformed }
  }

  const expectedSignature = sign(encodedPayload, secret)
  const providedBuffer = Buffer.from(providedSignature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return { ok: false, reason: ConfirmationTokenError.Invalid }
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encodedPayload)) as {
      email?: string
      nonce?: string
      exp?: number
    }

    if (
      parsed.email !== email ||
      parsed.nonce !== nonce ||
      typeof parsed.exp !== 'number'
    ) {
      return { ok: false, reason: ConfirmationTokenError.Invalid }
    }

    if (parsed.exp <= now.getTime()) {
      return { ok: false, reason: ConfirmationTokenError.Expired }
    }

    return { ok: true, expiresAt: new Date(parsed.exp).toISOString() }
  } catch {
    return { ok: false, reason: ConfirmationTokenError.Malformed }
  }
}

export function hashConfirmationNonce({
  nonce,
  secret,
}: {
  nonce: string
  secret: string
}) {
  return crypto.createHash('sha256').update(`${secret}:${nonce}`).digest('hex')
}
