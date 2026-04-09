import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdminSession } from '@/lib/admin-auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface RelationRow {
  post_id: string
  order_index: number
  created_at: string
  ai_pulse_posts: {
    id: string
    slug: string
    title: string
    content_type: string
    status: string
    published_at: string | null
  }
}

async function nextOrderIndex(seriesId: string): Promise<number> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('ai_pulse_series_posts')
    .select('order_index')
    .eq('series_id', seriesId)
    .order('order_index', { ascending: false })
    .limit(1)

  if (error) throw new Error(error.message)
  return (data?.[0]?.order_index ?? 0) + 1
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!await requireAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createServiceClient()

  const { data: relations, error } = await supabase
    .from('ai_pulse_series_posts')
    .select('series_id, post_id, order_index, created_at, ai_pulse_posts!inner(id, slug, title, content_type, status, published_at)')
    .eq('series_id', id)
    .order('order_index', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const posts = ((relations ?? []) as RelationRow[]).map((item) => ({
    post_id: item.post_id,
    order_index: item.order_index,
    joined_at: item.created_at,
    post: item.ai_pulse_posts,
  }))

  return NextResponse.json({ posts })
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!await requireAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const postId = typeof body.post_id === 'string' ? body.post_id.trim() : ''
  if (!postId) return NextResponse.json({ error: 'Field "post_id" is required' }, { status: 422 })

  const requestedOrder = Number(body.order_index)
  const hasCustomOrder = Number.isInteger(requestedOrder) && requestedOrder > 0
  const orderIndex = hasCustomOrder ? requestedOrder : await nextOrderIndex(id)

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('ai_pulse_series_posts')
    .insert({
      series_id: id,
      post_id: postId,
      order_index: orderIndex,
    })
    .select('id, series_id, post_id, order_index, created_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Post already exists in this series or order is duplicated' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ relation: data }, { status: 201 })
}
