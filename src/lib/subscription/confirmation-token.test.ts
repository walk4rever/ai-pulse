import { describe, expect, it, vi } from 'vitest'
import {
  ConfirmationTokenError,
  generateConfirmationToken,
  verifyConfirmationToken,
} from './confirmation-token'

describe('confirmation token', () => {
  it('round-trips a valid token', () => {
    const token = generateConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      secret: 'test-secret',
      expiresInSeconds: 3600,
      now: new Date('2026-03-28T00:00:00.000Z'),
    })

    const result = verifyConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      token,
      secret: 'test-secret',
      now: new Date('2026-03-28T00:10:00.000Z'),
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.expiresAt).toBe('2026-03-28T01:00:00.000Z')
    }
  })

  it('rejects expired tokens', () => {
    const token = generateConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      secret: 'test-secret',
      expiresInSeconds: 60,
      now: new Date('2026-03-28T00:00:00.000Z'),
    })

    const result = verifyConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      token,
      secret: 'test-secret',
      now: new Date('2026-03-28T00:02:00.000Z'),
    })

    expect(result).toEqual({
      ok: false,
      reason: ConfirmationTokenError.Expired,
    })
  })

  it('rejects tokens signed for another email', () => {
    const token = generateConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      secret: 'test-secret',
      expiresInSeconds: 3600,
      now: new Date('2026-03-28T00:00:00.000Z'),
    })

    const result = verifyConfirmationToken({
      email: 'other@example.com',
      nonce: 'nonce-1',
      token,
      secret: 'test-secret',
      now: new Date('2026-03-28T00:10:00.000Z'),
    })

    expect(result).toEqual({
      ok: false,
      reason: ConfirmationTokenError.Invalid,
    })
  })

  it('rejects malformed tokens', () => {
    const result = verifyConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      token: 'malformed-token',
      secret: 'test-secret',
      now: new Date('2026-03-28T00:10:00.000Z'),
    })

    expect(result).toEqual({
      ok: false,
      reason: ConfirmationTokenError.Malformed,
    })
  })

  it('uses the configured default ttl', () => {
    vi.stubEnv('EMAIL_CONFIRMATION_TTL_SECONDS', '120')

    const token = generateConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      secret: 'test-secret',
      now: new Date('2026-03-28T00:00:00.000Z'),
    })

    const result = verifyConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      token,
      secret: 'test-secret',
      now: new Date('2026-03-28T00:01:00.000Z'),
    })

    expect(result.ok).toBe(true)

    vi.unstubAllEnvs()
  })

  it('rejects tokens signed for another nonce', () => {
    const token = generateConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      secret: 'test-secret',
      expiresInSeconds: 3600,
      now: new Date('2026-03-28T00:00:00.000Z'),
    })

    const result = verifyConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-2',
      token,
      secret: 'test-secret',
      now: new Date('2026-03-28T00:10:00.000Z'),
    })

    expect(result).toEqual({
      ok: false,
      reason: ConfirmationTokenError.Invalid,
    })
  })
})
