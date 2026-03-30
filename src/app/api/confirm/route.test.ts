import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  generateConfirmationToken,
  hashConfirmationNonce,
} from '@/lib/subscription/confirmation-token'

const single = vi.fn()
const select = vi.fn()
const update = vi.fn()
const selectEq = vi.fn()
const updateEq = vi.fn()
const is = vi.fn()
const from = vi.fn()
const createServiceClient = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient,
}))

describe('GET /api/confirm', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.stubEnv('EMAIL_CONFIRMATION_SECRET', 'confirmation-secret')

    single.mockResolvedValue({
      data: {
        id: 'subscriber-1',
        confirmed_at: null,
        confirmation_nonce_hash: hashConfirmationNonce({
          nonce: 'nonce-1',
          secret: 'confirmation-secret',
        }),
        confirmation_expires_at: '2026-03-28T01:00:00.000Z',
      },
    })
    selectEq.mockReturnValue({ single })
    select.mockReturnValue({ eq: selectEq })
    is.mockResolvedValue({ error: null })
    updateEq.mockReturnValue({ is })
    update.mockReturnValue({ eq: updateEq })
    from.mockImplementation((table: string) => {
      if (table === 'ai_pulse_subscribers') {
        return { select, update }
      }

      throw new Error(`Unexpected table: ${table}`)
    })
    createServiceClient.mockResolvedValue({ from })
  })

  it('redirects to invalid status when params are missing', async () => {
    const { GET } = await import('./route')

    const res = await GET(new NextRequest('http://localhost/api/confirm'))

    expect(res.headers.get('location')).toBe('http://localhost/subscribe/confirmed?status=invalid')
  })

  it('redirects to expired status when token is expired', async () => {
    const token = generateConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      secret: 'confirmation-secret',
      expiresInSeconds: 60,
      now: new Date('2026-03-28T00:00:00.000Z'),
    })

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-28T00:02:00.000Z'))

    const { GET } = await import('./route')
    const res = await GET(
      new NextRequest(
        `http://localhost/api/confirm?email=${encodeURIComponent('reader@example.com')}&token=${encodeURIComponent(token)}`
      )
    )

    expect(res.headers.get('location')).toBe('http://localhost/subscribe/confirmed?status=expired')

    vi.useRealTimers()
  })

  it('redirects to success status when confirmation succeeds', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-28T00:10:00.000Z'))

    const token = generateConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      secret: 'confirmation-secret',
      expiresInSeconds: 3600,
      now: new Date('2026-03-28T00:00:00.000Z'),
    })

    const { GET } = await import('./route')
    const res = await GET(
      new NextRequest(
        `http://localhost/api/confirm?email=${encodeURIComponent('reader@example.com')}&token=${encodeURIComponent(token)}`
      )
    )

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ confirmed_at: expect.any(String) }))
    expect(res.headers.get('location')).toBe('http://localhost/subscribe/confirmed?status=success')

    vi.useRealTimers()
  })

  it('redirects to error status when database update fails', async () => {
    is.mockResolvedValue({ error: { message: 'db error' } })
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-28T00:10:00.000Z'))

    const token = generateConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      secret: 'confirmation-secret',
      expiresInSeconds: 3600,
      now: new Date('2026-03-28T00:00:00.000Z'),
    })

    const { GET } = await import('./route')
    const res = await GET(
      new NextRequest(
        `http://localhost/api/confirm?email=${encodeURIComponent('reader@example.com')}&token=${encodeURIComponent(token)}`
      )
    )

    expect(res.headers.get('location')).toBe('http://localhost/subscribe/confirmed?status=error')

    vi.useRealTimers()
  })

  it('redirects to invalid status when nonce no longer matches the latest email', async () => {
    single.mockResolvedValue({
      data: {
        id: 'subscriber-1',
        confirmed_at: null,
        confirmation_nonce_hash: hashConfirmationNonce({
          nonce: 'newer-nonce',
          secret: 'confirmation-secret',
        }),
        confirmation_expires_at: '2026-03-28T01:00:00.000Z',
      },
    })

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-28T00:10:00.000Z'))

    const token = generateConfirmationToken({
      email: 'reader@example.com',
      nonce: 'nonce-1',
      secret: 'confirmation-secret',
      expiresInSeconds: 3600,
      now: new Date('2026-03-28T00:00:00.000Z'),
    })

    const { GET } = await import('./route')
    const res = await GET(
      new NextRequest(
        `http://localhost/api/confirm?email=${encodeURIComponent('reader@example.com')}&token=${encodeURIComponent(token)}`
      )
    )

    expect(res.headers.get('location')).toBe('http://localhost/subscribe/confirmed?status=invalid')

    vi.useRealTimers()
  })
})
