import { createServiceClient } from '@/lib/supabase/server'
import {
  UnsubscribeTokenError,
  verifyUnsubscribeToken,
} from '@/lib/subscription/unsubscribe-token'
import { NextRequest, NextResponse } from 'next/server'

type UnsubscribeStatus = 'unsubscribed' | 'unsubscribe-invalid' | 'unsubscribe-error'

function buildStatusUrl(req: NextRequest, status: UnsubscribeStatus) {
  return new URL(`/subscribe/confirmed?status=${status}`, req.url)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  if (!email || !token) {
    return NextResponse.redirect(buildStatusUrl(req, 'unsubscribe-invalid'))
  }

  const confirmationSecret = process.env.EMAIL_CONFIRMATION_SECRET

  if (!confirmationSecret) {
    console.error('[unsubscribe] missing EMAIL_CONFIRMATION_SECRET')
    return NextResponse.redirect(buildStatusUrl(req, 'unsubscribe-error'))
  }

  const supabase = await createServiceClient()
  const { data: subscriber } = await supabase
    .from('ai_pulse_subscribers')
    .select('id, status')
    .eq('email', email)
    .single()

  if (!subscriber?.id || subscriber.status !== 'active') {
    return NextResponse.redirect(buildStatusUrl(req, 'unsubscribe-invalid'))
  }

  const verification = verifyUnsubscribeToken({
    email,
    subscriberId: subscriber.id,
    token,
    secret: confirmationSecret,
  })

  if (!verification.ok) {
    const status =
      verification.reason === UnsubscribeTokenError.Invalid
        ? 'unsubscribe-invalid'
        : 'unsubscribe-invalid'
    return NextResponse.redirect(buildStatusUrl(req, status))
  }

  const { error } = await supabase
    .from('ai_pulse_subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
      confirmation_nonce_hash: null,
      confirmation_expires_at: null,
    })
    .eq('email', email)
    .eq('status', 'active')

  if (error) {
    console.error('[unsubscribe] database update failed', {
      email,
      message: error.message,
    })
    return NextResponse.redirect(buildStatusUrl(req, 'unsubscribe-error'))
  }

  return NextResponse.redirect(buildStatusUrl(req, 'unsubscribed'))
}
