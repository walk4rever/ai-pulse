import { NextRequest } from 'next/server'
import { resolveSession } from '@/lib/auth/session'

export async function requireAdminSession(req: NextRequest): Promise<boolean> {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  const user = await resolveSession(token)
  return user?.role === 'admin'
}
