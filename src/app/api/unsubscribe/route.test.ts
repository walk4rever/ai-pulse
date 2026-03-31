import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  generateUnsubscribeToken,
} from '@/lib/subscription/unsubscribe-token'

const single = vi.fn()
const select = vi.fn()
const update = vi.fn()
const selectEq = vi.fn()
const updateEq = vi.fn()
const updateStatusEq = vi.fn()
const from = vi.fn()
const createServiceClient = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient,
}))

describe('GET /api/unsubscribe', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.stubEnv('EMAIL_CONFIRMATION_SECRET', 'confirmation-secret')

    single.mockResolvedValue({
      data: {
        id: 'subscriber-1',
        status: 'active',
      },
    })
    selectEq.mockReturnValue({ single })
    select.mockReturnValue({ eq: selectEq })
    updateStatusEq.mockResolvedValue({ error: null })
    updateEq.mockReturnValue({ eq: updateStatusEq })
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

    const res = await GET(new NextRequest('http://localhost/api/unsubscribe'))

    expect(res.headers.get('location')).toBe(
      'http://localhost/subscribe/confirmed?status=unsubscribe-invalid'
    )
  })

  it('redirects to invalid status when token is invalid', async () => {
    const { GET } = await import('./route')
    const res = await GET(
      new NextRequest(
        `http://localhost/api/unsubscribe?email=${encodeURIComponent('reader@example.com')}&token=bad-token`
      )
    )

    expect(res.headers.get('location')).toBe(
      'http://localhost/subscribe/confirmed?status=unsubscribe-invalid'
    )
  })

  it('redirects to unsubscribed status when unsubscribe succeeds', async () => {
    const token = generateUnsubscribeToken({
      email: 'reader@example.com',
      subscriberId: 'subscriber-1',
      secret: 'confirmation-secret',
    })

    const { GET } = await import('./route')
    const res = await GET(
      new NextRequest(
        `http://localhost/api/unsubscribe?email=${encodeURIComponent('reader@example.com')}&token=${encodeURIComponent(token)}`
      )
    )

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'unsubscribed',
        unsubscribed_at: expect.any(String),
      })
    )
    expect(res.headers.get('location')).toBe(
      'http://localhost/subscribe/confirmed?status=unsubscribed'
    )
  })

  it('redirects to error status when database update fails', async () => {
    updateStatusEq.mockResolvedValue({ error: { message: 'db error' } })
    const token = generateUnsubscribeToken({
      email: 'reader@example.com',
      subscriberId: 'subscriber-1',
      secret: 'confirmation-secret',
    })

    const { GET } = await import('./route')
    const res = await GET(
      new NextRequest(
        `http://localhost/api/unsubscribe?email=${encodeURIComponent('reader@example.com')}&token=${encodeURIComponent(token)}`
      )
    )

    expect(res.headers.get('location')).toBe(
      'http://localhost/subscribe/confirmed?status=unsubscribe-error'
    )
  })
})
