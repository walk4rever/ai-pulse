import { describe, expect, it } from 'vitest'
import {
  generateUnsubscribeToken,
  UnsubscribeTokenError,
  verifyUnsubscribeToken,
} from './unsubscribe-token'

describe('unsubscribe token', () => {
  it('round-trips a valid token', () => {
    const token = generateUnsubscribeToken({
      email: 'reader@example.com',
      subscriberId: 'subscriber-1',
      secret: 'test-secret',
    })

    const result = verifyUnsubscribeToken({
      email: 'reader@example.com',
      subscriberId: 'subscriber-1',
      token,
      secret: 'test-secret',
    })

    expect(result).toEqual({ ok: true })
  })

  it('rejects malformed tokens', () => {
    const result = verifyUnsubscribeToken({
      email: 'reader@example.com',
      subscriberId: 'subscriber-1',
      token: 'bad-token',
      secret: 'test-secret',
    })

    expect(result).toEqual({
      ok: false,
      reason: UnsubscribeTokenError.Malformed,
    })
  })

  it('rejects tokens signed for another subscriber', () => {
    const token = generateUnsubscribeToken({
      email: 'reader@example.com',
      subscriberId: 'subscriber-1',
      secret: 'test-secret',
    })

    const result = verifyUnsubscribeToken({
      email: 'reader@example.com',
      subscriberId: 'subscriber-2',
      token,
      secret: 'test-secret',
    })

    expect(result).toEqual({
      ok: false,
      reason: UnsubscribeTokenError.Invalid,
    })
  })
})
