import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { resolveSession } from '@/lib/auth/session'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const token = extractBearer(req)
  const user = await resolveSession(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = await createServiceClient()

  // Verify this agent belongs to the user
  const { data: agent } = await supabase
    .from('ai_pulse_agents')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (!agent || agent.user_id !== user.id) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('ai_pulse_agents')
    .update({ status: 'revoked' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Failed to revoke agent' }, { status: 500 })

  return NextResponse.json({ ok: true })
}

function extractBearer(req: NextRequest): string | null {
  const header = req.headers.get('authorization') ?? ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}
