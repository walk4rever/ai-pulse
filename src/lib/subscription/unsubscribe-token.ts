import crypto from 'crypto'

export enum UnsubscribeTokenError {
  Invalid = 'invalid',
  Malformed = 'malformed',
}

type GenerateUnsubscribeTokenParams = {
  email: string
  subscriberId: string
  secret: string
}

type VerifyUnsubscribeTokenParams = {
  email: string
  subscriberId: string
  token: string
  secret: string
}

type VerifyUnsubscribeTokenResult =
  | { ok: true }
  | { ok: false; reason: UnsubscribeTokenError }

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(value: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url')
}

export function generateUnsubscribeToken({
  email,
  subscriberId,
  secret,
}: GenerateUnsubscribeTokenParams) {
  const payload = JSON.stringify({ email, subscriberId })
  const encodedPayload = toBase64Url(payload)
  const signature = sign(encodedPayload, secret)

  return `${encodedPayload}.${signature}`
}

export function verifyUnsubscribeToken({
  email,
  subscriberId,
  token,
  secret,
}: VerifyUnsubscribeTokenParams): VerifyUnsubscribeTokenResult {
  const [encodedPayload, providedSignature] = token.split('.')

  if (!encodedPayload || !providedSignature) {
    return { ok: false, reason: UnsubscribeTokenError.Malformed }
  }

  const expectedSignature = sign(encodedPayload, secret)
  const providedBuffer = Buffer.from(providedSignature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return { ok: false, reason: UnsubscribeTokenError.Invalid }
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encodedPayload)) as {
      email?: string
      subscriberId?: string
    }

    if (parsed.email !== email || parsed.subscriberId !== subscriberId) {
      return { ok: false, reason: UnsubscribeTokenError.Invalid }
    }

    return { ok: true }
  } catch {
    return { ok: false, reason: UnsubscribeTokenError.Malformed }
  }
}
