function isValidHttpUrl(value: string | undefined) {
  if (!value) {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  return {
    url,
    anonKey,
    serviceRoleKey,
    hasPublicEnv: isValidHttpUrl(url) && Boolean(anonKey),
    hasServiceRoleEnv: isValidHttpUrl(url) && Boolean(serviceRoleKey),
  }
}
