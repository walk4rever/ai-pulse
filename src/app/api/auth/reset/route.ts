import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashConfirmationNonce } from '@/lib/subscription/confirmation-token'
import { hashPassword } from '@/lib/auth/password'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  let body: { email?: string; nonce?: string; new_password?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, nonce, new_password } = body

  if (!email || !nonce || !new_password) {
    return NextResponse.json({ error: 'email, nonce, and new_password are required' }, { status: 422 })
  }

  if (new_password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 422 })
  }

  const secret = process.env.EMAIL_CONFIRMATION_SECRET
  if (!secret) return NextResponse.json({ error: 'Service unavailable' }, { status: 500 })

  const supabase = await createServiceClient()
  const { data: user } = await supabase
    .from('ai_pulse_users')
    .select('id, reset_nonce_hash, reset_expires_at')
    .eq('email', email)
    .single()

  if (!user?.reset_nonce_hash || !user?.reset_expires_at) {
    return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
  }

  if (new Date(user.reset_expires_at) < new Date()) {
    return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 })
  }

  const expectedHash = hashConfirmationNonce({ nonce, secret })
  const provided = Buffer.from(user.reset_nonce_hash)
  const expected = Buffer.from(expectedHash)

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
  }

  const { error } = await supabase
    .from('ai_pulse_users')
    .update({
      password_hash: hashPassword(new_password),
      reset_nonce_hash: null,
      reset_expires_at: null,
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
