import { createServiceClient } from '@/lib/supabase/server'
import {
  ConfirmationTokenError,
  hashConfirmationNonce,
  verifyConfirmationToken,
} from '@/lib/subscription/confirmation-token'
import { NextRequest, NextResponse } from 'next/server'

function buildStatusUrl(req: NextRequest, status: 'success' | 'invalid' | 'expired' | 'error') {
  return new URL(`/subscribe/confirmed?status=${status}`, req.url)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  if (!email || !token) {
    return NextResponse.redirect(buildStatusUrl(req, 'invalid'))
  }

  const confirmationSecret = process.env.EMAIL_CONFIRMATION_SECRET

  if (!confirmationSecret) {
    console.error('[confirm] missing EMAIL_CONFIRMATION_SECRET')
    return NextResponse.redirect(buildStatusUrl(req, 'error'))
  }

  const supabase = await createServiceClient()
  const { data: subscriber } = await supabase
    .from('ai_pulse_subscribers')
    .select('id, status, confirmed_at, confirmation_nonce_hash, confirmation_expires_at')
    .eq('email', email)
    .single()

  if (!subscriber?.confirmation_nonce_hash || subscriber.status === 'active' || subscriber.confirmed_at) {
    return NextResponse.redirect(buildStatusUrl(req, 'invalid'))
  }

  if (
    subscriber.confirmation_expires_at &&
    new Date(subscriber.confirmation_expires_at).getTime() <= Date.now()
  ) {
    return NextResponse.redirect(buildStatusUrl(req, 'expired'))
  }

  const nonce = extractConfirmationNonce(token)

  if (!nonce) {
    return NextResponse.redirect(buildStatusUrl(req, 'invalid'))
  }

  if (
    hashConfirmationNonce({ nonce, secret: confirmationSecret }) !==
    subscriber.confirmation_nonce_hash
  ) {
    return NextResponse.redirect(buildStatusUrl(req, 'invalid'))
  }

  const verification = verifyConfirmationToken({
    email,
    nonce,
    token,
    secret: confirmationSecret,
  })

  if (!verification.ok) {
    const status =
      verification.reason === ConfirmationTokenError.Expired ? 'expired' : 'invalid'
    return NextResponse.redirect(buildStatusUrl(req, status))
  }

  const { error } = await supabase
    .from('ai_pulse_subscribers')
    .update({
      status: 'active',
      confirmed_at: new Date().toISOString(),
      unsubscribed_at: null,
      confirmation_nonce_hash: null,
      confirmation_expires_at: null,
    })
    .eq('email', email)
    .is('confirmed_at', null)

  if (error) {
    console.error('[confirm] database update failed', {
      email,
      message: error.message,
    })
    return NextResponse.redirect(buildStatusUrl(req, 'error'))
  }

  const { data: updatedSubscriber } = await supabase
    .from('ai_pulse_subscribers')
    .select('status, confirmed_at, unsubscribed_at')
    .eq('email', email)
    .single()

  if (
    updatedSubscriber &&
    updatedSubscriber.confirmed_at &&
    !updatedSubscriber.unsubscribed_at &&
    updatedSubscriber.status !== 'active'
  ) {
    const { error: repairError } = await supabase
      .from('ai_pulse_subscribers')
      .update({ status: 'active' })
      .eq('email', email)

    if (repairError) {
      console.error('[confirm] status repair failed', {
        email,
        message: repairError.message,
      })
      return NextResponse.redirect(buildStatusUrl(req, 'error'))
    }
  }

  return NextResponse.redirect(buildStatusUrl(req, 'success'))
}

function extractConfirmationNonce(token: string) {
  const [encodedPayload] = token.split('.')

  if (!encodedPayload) {
    return null
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as { nonce?: string }

    return typeof payload.nonce === 'string' ? payload.nonce : null
  } catch {
    return null
  }
}
