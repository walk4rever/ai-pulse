import { createClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { Post } from '@/types'
import Link from 'next/link'

export const revalidate = 60

export const metadata = {
  title: '系列 | AI早知道',
}

type ListPost = Pick<Post, 'id' | 'slug' | 'title' | 'published_at' | 'content_type' | 'series_slug'>

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function groupBySeries(posts: ListPost[]): Map<string, ListPost[]> {
  const map = new Map<string, ListPost[]>()
  for (const post of posts) {
    const key = post.series_slug ?? '__unsorted__'
    const group = map.get(key) ?? []
    map.set(key, [...group, post])
  }
  return map
}

export default async function SeriesPage() {
  const { hasPublicEnv } = getSupabaseEnv()
  if (!hasPublicEnv) return <p className="text-sm text-[var(--muted)]">配置未完成。</p>

  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('ai_pulse_posts')
    .select('id, slug, title, published_at, content_type, series_slug')
    .eq('status', 'published')
    .eq('content_type', 'deep_dive')
    .order('published_at', { ascending: true })

  const allPosts = (posts ?? []) as ListPost[]
  const grouped = groupBySeries(allPosts)

  // Series with a slug first, unsorted last
  const seriesKeys = [...grouped.keys()].filter((k) => k !== '__unsorted__')
  const unsorted = grouped.get('__unsorted__') ?? []

  return (
    <div>
      <p className="kicker mb-2">系列</p>
      <p className="text-sm text-[var(--muted)] mb-10">{seriesKeys.length} 个系列</p>

      {seriesKeys.length === 0 && unsorted.length === 0 && (
        <p className="text-sm text-[var(--muted)]">系列内容即将发布。</p>
      )}

      <div className="space-y-14">
        {seriesKeys.map((seriesSlug) => {
          const items = grouped.get(seriesSlug) ?? []
          return (
            <section key={seriesSlug} className="border-t border-[oklch(0.85_0_0)] pt-10">
              <p className="text-base font-semibold mb-6">{seriesSlug}</p>
              <div className="divide-y divide-[oklch(0.85_0_0)]">
                {items.map((post, i) => (
                  <article key={post.id} className="py-4 flex items-baseline gap-6">
                    <span className="kicker shrink-0 w-6">{String(i + 1).padStart(2, '0')}</span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/post/${post.slug}`} className="group">
                        <h3 className="text-base leading-snug group-hover:text-[var(--accent)] transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                    </div>
                    <span className="date shrink-0">{formatDate(post.published_at)}</span>
                  </article>
                ))}
              </div>
            </section>
          )
        })}

        {unsorted.length > 0 && (
          <section className="border-t border-[oklch(0.85_0_0)] pt-10">
            <p className="text-base font-semibold mb-6">深度</p>
            <div className="divide-y divide-[oklch(0.85_0_0)]">
              {unsorted.map((post) => (
                <article key={post.id} className="py-4 flex items-baseline gap-6">
                  <div className="flex-1 min-w-0">
                    <Link href={`/post/${post.slug}`} className="group">
                      <h3 className="text-base leading-snug group-hover:text-[var(--accent)] transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                  </div>
                  <span className="date shrink-0">{formatDate(post.published_at)}</span>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
