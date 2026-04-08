import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPassword } from '@/lib/auth/password'
import { generateSessionToken } from '@/lib/auth/token'

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 422 })
  }

  const supabase = await createServiceClient()

  const { data: user, error: queryError } = await supabase
    .from('ai_pulse_users')
    .select('id, password_hash, email_verified_at')
    .eq('email', email)
    .single()

  console.error('[login] query result:', { user: !!user, queryError })

  // Constant-time: always verify even if user not found (use dummy hash)
  const storedHash = user?.password_hash ?? 'pbkdf2:100000:dummy:dummy'
  const valid = verifyPassword(password, storedHash)

  console.error('[login] valid:', valid, 'user found:', !!user)

  if (!user || !valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  if (!user.email_verified_at) {
    return NextResponse.json({ error: 'Email not verified. Please check your inbox.' }, { status: 403 })
  }

  const { token, hash, expiresAt } = generateSessionToken()

  const { error } = await supabase.from('ai_pulse_user_sessions').insert({
    user_id: user.id,
    token_hash: hash,
    expires_at: expiresAt,
  })

  if (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }

  return NextResponse.json({ token, expires_at: expiresAt })
}
