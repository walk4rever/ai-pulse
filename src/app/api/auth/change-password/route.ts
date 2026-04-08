import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { resolveSession } from '@/lib/auth/session'
import { verifyPassword, hashPassword } from '@/lib/auth/password'

export async function POST(req: NextRequest) {
  const token = extractBearer(req)
  const user = await resolveSession(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { current_password?: string; new_password?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { current_password, new_password } = body

  if (!current_password || !new_password) {
    return NextResponse.json({ error: 'current_password and new_password are required' }, { status: 422 })
  }

  if (new_password.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 422 })
  }

  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('ai_pulse_users')
    .select('password_hash')
    .eq('id', user.id)
    .single()

  if (!data || !verifyPassword(current_password, data.password_hash)) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
  }

  const { error } = await supabase
    .from('ai_pulse_users')
    .update({ password_hash: hashPassword(new_password) })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })

  return NextResponse.json({ ok: true })
}

function extractBearer(req: NextRequest): string | null {
  const h = req.headers.get('authorization') ?? ''
  return h.startsWith('Bearer ') ? h.slice(7) : null
}
