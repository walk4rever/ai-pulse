import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdminSession } from '@/lib/admin-auth'

interface RouteParams {
  params: Promise<{ id: string, postId: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!await requireAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, postId } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const orderIndex = Number(body.order_index)
  if (!Number.isInteger(orderIndex) || orderIndex <= 0) {
    return NextResponse.json({ error: 'Field "order_index" must be a positive integer' }, { status: 422 })
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('ai_pulse_series_posts')
    .update({ order_index: orderIndex })
    .eq('series_id', id)
    .eq('post_id', postId)
    .select('id, series_id, post_id, order_index, created_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Order already exists in this series' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ relation: data })
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!await requireAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, postId } = await params
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('ai_pulse_series_posts')
    .delete()
    .eq('series_id', id)
    .eq('post_id', postId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
