import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { resolveSession } from '@/lib/auth/session'
import { generateAgentKey } from '@/lib/auth/token'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const token = extractBearer(req)
  const user = await resolveSession(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = await createServiceClient()

  const { data: agent } = await supabase
    .from('ai_pulse_agents')
    .select('id, user_id, name, status')
    .eq('id', id)
    .single()

  if (!agent || agent.user_id !== user.id) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  if (agent.status !== 'active') {
    return NextResponse.json({ error: 'Cannot rotate key of a revoked agent' }, { status: 422 })
  }

  const { key, hash } = generateAgentKey()

  const { error } = await supabase
    .from('ai_pulse_agents')
    .update({ key_hash: hash })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Failed to rotate key' }, { status: 500 })

  return NextResponse.json({ api_key: key })
}

function extractBearer(req: NextRequest): string | null {
  const h = req.headers.get('authorization') ?? ''
  return h.startsWith('Bearer ') ? h.slice(7) : null
}
