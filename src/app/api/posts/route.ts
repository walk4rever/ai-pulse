import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { markdownToHtml } from '@/lib/markdown'
import { resolveAuthor } from '@/lib/api-auth'
import type { PostContentType } from '@/types'

const VALID_TYPES = new Set<PostContentType>(['daily', 'weekly', 'series', 'interview'])
const VALID_STATUS = new Set(['draft', 'published'])

interface PostPayload {
  slug: string
  title: string
  content: string
  type: PostContentType
  date?: string
  excerpt?: string
  featured?: boolean
  status?: string
  series?: string
  is_premium?: boolean
}

export async function POST(req: NextRequest) {
  // Auth
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  const author = resolveAuthor(token)

  if (!author) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  let body: PostPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { slug, title, content, type, date, excerpt, featured, status, series, is_premium } = body

  // Validate required fields
  if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'Field "slug" is required and must be lowercase alphanumeric with hyphens' },
      { status: 422 }
    )
  }

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'Field "title" is required' }, { status: 422 })
  }

  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Field "content" is required (markdown string)' }, { status: 422 })
  }

  if (!VALID_TYPES.has(type)) {
    return NextResponse.json(
      { error: `Field "type" must be one of: daily, weekly, series, interview` },
      { status: 422 }
    )
  }

  // Authorization: check allowed types for this key
  if (!author.allowedTypes.includes(type)) {
    return NextResponse.json(
      { error: `This API key is not authorized to publish type "${type}"` },
      { status: 403 }
    )
  }

  const resolvedStatus = VALID_STATUS.has(status ?? '') ? status! : 'published'

  const publishedAt = date
    ? new Date(date).toISOString()
    : new Date().toISOString()

  if (date && isNaN(new Date(date).getTime())) {
    return NextResponse.json({ error: 'Field "date" is not a valid date' }, { status: 422 })
  }

  // Render markdown
  let html: string
  try {
    html = await markdownToHtml(content)
  } catch {
    return NextResponse.json({ error: 'Failed to render markdown content' }, { status: 422 })
  }

  const derivedExcerpt = excerpt?.trim() || deriveExcerpt(content)

  const supabase = await createServiceClient()
  const { error } = await supabase.from('ai_pulse_posts').upsert(
    {
      slug,
      title: title.trim(),
      content: html,
      excerpt: derivedExcerpt,
      content_type: type,
      author_slug: author.authorSlug,
      series_slug: series?.toLowerCase() ?? null,
      featured: Boolean(featured),
      is_premium: Boolean(is_premium),
      status: resolvedStatus,
      published_at: publishedAt,
    },
    { onConflict: 'slug' }
  )

  if (error) {
    console.error('[api/posts] upsert failed', { slug, message: error.message })
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, slug, author: author.authorSlug }, { status: 200 })
}

function deriveExcerpt(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_>~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
}
