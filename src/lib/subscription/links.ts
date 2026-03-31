import { generateConfirmationToken } from '@/lib/subscription/confirmation-token'
import { generateUnsubscribeToken } from '@/lib/subscription/unsubscribe-token'

export function buildConfirmationUrl({
  email,
  nonce,
  secret,
  siteUrl,
}: {
  email: string
  nonce: string
  secret: string
  siteUrl: string
}) {
  const token = generateConfirmationToken({
    email,
    nonce,
    secret,
  })

  return `${siteUrl}/api/confirm?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
}

export function buildUnsubscribeUrl({
  email,
  subscriberId,
  secret,
  siteUrl,
}: {
  email: string
  subscriberId: string
  secret: string
  siteUrl: string
}) {
  const token = generateUnsubscribeToken({
    email,
    subscriberId,
    secret,
  })

  return `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
}
