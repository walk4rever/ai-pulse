import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashConfirmationNonce } from '@/lib/subscription/confirmation-token'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const email = searchParams.get('email')
  const nonce = searchParams.get('nonce')

  if (!email || !nonce) {
    return NextResponse.redirect(new URL('/auth/verify?error=invalid', req.nextUrl.origin))
  }

  const secret = process.env.EMAIL_CONFIRMATION_SECRET
  if (!secret) {
    return NextResponse.redirect(new URL('/auth/verify?error=server', req.nextUrl.origin))
  }

  const supabase = await createServiceClient()

  const { data: user } = await supabase
    .from('ai_pulse_users')
    .select('id, email_verified_at, verification_nonce_hash, verification_expires_at')
    .eq('email', email)
    .single()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/verify?error=invalid', req.nextUrl.origin))
  }

  if (user.email_verified_at) {
    return NextResponse.redirect(new URL('/auth/verify?success=already', req.nextUrl.origin))
  }

  if (!user.verification_expires_at || new Date(user.verification_expires_at) < new Date()) {
    return NextResponse.redirect(new URL('/auth/verify?error=expired', req.nextUrl.origin))
  }

  const expectedHash = hashConfirmationNonce({ nonce, secret })
  const provided = Buffer.from(user.verification_nonce_hash ?? '')
  const expected = Buffer.from(expectedHash)

  if (
    provided.length !== expected.length ||
    !crypto.timingSafeEqual(provided, expected)
  ) {
    return NextResponse.redirect(new URL('/auth/verify?error=invalid', req.nextUrl.origin))
  }

  await supabase
    .from('ai_pulse_users')
    .update({
      email_verified_at: new Date().toISOString(),
      verification_nonce_hash: null,
      verification_expires_at: null,
    })
    .eq('id', user.id)

  return NextResponse.redirect(new URL('/auth/verify?success=true', req.nextUrl.origin))
}
