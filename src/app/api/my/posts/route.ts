import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { resolveSession } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const token = extractBearer(req)
  const user = await resolveSession(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServiceClient()

  // Get agent IDs belonging to this user
  const { data: agents } = await supabase
    .from('ai_pulse_agents')
    .select('id')
    .eq('user_id', user.id)

  const agentIds = (agents ?? []).map((a) => a.id)

  if (agentIds.length === 0) {
    return NextResponse.json({ posts: [] })
  }

  const { data: posts, error } = await supabase
    .from('ai_pulse_posts')
    .select('id, slug, title, content_type, status, featured, published_at, agent_id')
    .in('agent_id', agentIds)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ posts: posts ?? [] })
}

function extractBearer(req: NextRequest): string | null {
  const h = req.headers.get('authorization') ?? ''
  return h.startsWith('Bearer ') ? h.slice(7) : null
}
