import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { resolveSession } from '@/lib/auth/session'

interface RouteParams {
  params: Promise<{ slug: string }>
}

async function verifyOwnership(supabase: Awaited<ReturnType<typeof createServiceClient>>, slug: string, userId: string) {
  const { data: post } = await supabase
    .from('ai_pulse_posts')
    .select('slug, agent_id, title, excerpt, featured, status, published_at, series_slug, is_premium, content_type, author_slug')
    .eq('slug', slug)
    .single()

  if (!post) return null

  const { data: agent } = await supabase
    .from('ai_pulse_agents')
    .select('id')
    .eq('id', post.agent_id)
    .eq('user_id', userId)
    .single()

  if (!agent) return null

  return post
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const token = extractBearer(req)
  const user = await resolveSession(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const supabase = await createServiceClient()
  const post = await verifyOwnership(supabase, slug, user.id)

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ post })
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const token = extractBearer(req)
  const user = await resolveSession(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const supabase = await createServiceClient()
  const post = await verifyOwnership(supabase, slug, user.id)
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const allowed = ['title', 'excerpt', 'status', 'published_at', 'series_slug', 'is_premium']
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 422 })
  }

  const { error } = await supabase.from('ai_pulse_posts').update(update).eq('slug', slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/archive')
  revalidatePath(`/post/${slug}`)

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const token = extractBearer(req)
  const user = await resolveSession(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const supabase = await createServiceClient()
  const post = await verifyOwnership(supabase, slug, user.id)
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase.from('ai_pulse_posts').delete().eq('slug', slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/archive')
  revalidatePath(`/post/${slug}`)

  return NextResponse.json({ ok: true })
}

function extractBearer(req: NextRequest): string | null {
  const h = req.headers.get('authorization') ?? ''
  return h.startsWith('Bearer ') ? h.slice(7) : null
}
