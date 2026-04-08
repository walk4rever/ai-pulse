import { createServiceClient } from '@/lib/supabase/server'
import { hashToken } from '@/lib/auth/token'

export interface SessionUser {
  id: string
  email: string
  role: string
}

export async function resolveSession(bearerToken: string | null): Promise<SessionUser | null> {
  if (!bearerToken) return null

  const hash = hashToken(bearerToken)
  const supabase = await createServiceClient()

  const { data } = await supabase
    .from('ai_pulse_user_sessions')
    .select('user_id, expires_at, ai_pulse_users(id, email, role)')
    .eq('token_hash', hash)
    .single()

  if (!data) return null
  if (new Date(data.expires_at) < new Date()) return null

  const user = Array.isArray(data.ai_pulse_users) ? data.ai_pulse_users[0] : data.ai_pulse_users
  if (!user) return null

  return { id: user.id, email: user.email, role: user.role }
}
