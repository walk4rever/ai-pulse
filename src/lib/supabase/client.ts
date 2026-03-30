import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseEnv } from './env'

export function createClient() {
  const { url, anonKey, hasPublicEnv } = getSupabaseEnv()

  if (!hasPublicEnv || !url || !anonKey) {
    throw new Error(
      'Supabase public env is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.'
    )
  }

  return createBrowserClient(url, anonKey)
}
