import { describe, expect, it } from 'vitest'
import { buildConfirmationUrl, buildUnsubscribeUrl } from './links'

describe('subscription links', () => {
  it('builds a confirmation url', () => {
    const url = buildConfirmationUrl({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      secret: 'secret',
      siteUrl: 'https://ai.air7.fun',
    })

    expect(url).toContain('https://ai.air7.fun/api/confirm?email=reader%40example.com&token=')
  })

  it('builds an unsubscribe url', () => {
    const url = buildUnsubscribeUrl({
      email: 'reader@example.com',
      subscriberId: 'subscriber-1',
      secret: 'secret',
      siteUrl: 'https://ai.air7.fun',
    })

    expect(url).toContain('https://ai.air7.fun/api/unsubscribe?email=reader%40example.com&token=')
  })
})
