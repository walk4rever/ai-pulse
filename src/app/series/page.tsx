import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 60

export const metadata = {
  title: '专题 | AI早知道',
}

interface SeriesItem {
  id: string
  name: string
  description: string
}

interface SeriesPostRow {
  series_id: string
  order_index: number
  post_id: string
}

interface PublishedPost {
  id: string
  slug: string
  title: string
  published_at: string | null
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default async function SeriesPage() {
  const supabase = await createServiceClient()

  const { data: series } = await supabase
    .from('ai_pulse_series')
    .select('id, name, description')
    .order('created_at', { ascending: false })

  const { data: relations } = await supabase
    .from('ai_pulse_series_posts')
    .select('series_id, post_id, order_index')
    .order('order_index', { ascending: true })

  const seriesList = (series ?? []) as SeriesItem[]
  const relationRows = (relations ?? []) as SeriesPostRow[]

  const postIds = [...new Set(relationRows.map((row) => row.post_id))]
  let postMap = new Map<string, PublishedPost>()
  if (postIds.length > 0) {
    const { data: publishedPosts } = await supabase
      .from('ai_pulse_posts')
      .select('id, slug, title, published_at')
      .eq('status', 'published')
      .in('id', postIds)

    postMap = new Map((publishedPosts ?? []).map((post) => [post.id, post as PublishedPost]))
  }

  const grouped = new Map<string, SeriesPostRow[]>()
  for (const row of relationRows) {
    const list = grouped.get(row.series_id) ?? []
    list.push(row)
    grouped.set(row.series_id, list)
  }

  return (
    <div>
      <p className="kicker mb-2">专题</p>
      <p className="text-sm text-[var(--muted)] mb-10">{seriesList.length} 个专题</p>

      {seriesList.length === 0 && (
        <p className="text-sm text-[var(--muted)]">专题内容即将发布。</p>
      )}

      <div className="space-y-14">
        {seriesList.map((seriesItem) => {
          const items = grouped.get(seriesItem.id) ?? []
          return (
            <section key={seriesItem.id} className="border-t border-[oklch(0.85_0_0)] pt-10">
              <p className="text-base font-semibold mb-1">{seriesItem.name}</p>
              {seriesItem.description && (
                <p className="text-sm text-[var(--muted)] mb-6">{seriesItem.description}</p>
              )}
              {!seriesItem.description && <div className="mb-6" />}

              <div className="divide-y divide-[oklch(0.85_0_0)]">
                {items.map((item) => {
                  const post = postMap.get(item.post_id)
                  if (!post) return null
                  return (
                    <article key={post.id} className="py-4 flex items-baseline gap-6">
                      <span className="kicker shrink-0 w-6">{String(item.order_index).padStart(2, '0')}</span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/post/${post.slug}`} className="group">
                          <h3 className="text-base leading-snug group-hover:text-[var(--accent)] transition-colors">
                            {post.title}
                          </h3>
                        </Link>
                      </div>
                      <span className="date shrink-0">{formatDate(post.published_at)}</span>
                    </article>
                  )
                })}

                {items.length === 0 && (
                  <p className="text-sm text-[var(--muted)] py-2">这个专题还没有公开文章。</p>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
