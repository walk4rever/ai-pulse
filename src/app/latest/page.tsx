import { createClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { Post } from '@/types'
import Link from 'next/link'

export const revalidate = 60

export const metadata = {
  title: '最新 | AI早知道',
}

type ListPost = Pick<Post, 'id' | 'slug' | 'title' | 'published_at' | 'content_type' | 'series_slug'>

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function getTypeLabel(post: Pick<Post, 'content_type' | 'series_slug'>) {
  if (post.content_type === 'weekly') return '周刊'
  if (post.content_type === 'deep_dive') return '深度'
  return 'Brief'
}

export default async function LatestPage() {
  const { hasPublicEnv } = getSupabaseEnv()
  if (!hasPublicEnv) return <p className="text-sm text-[var(--muted)]">配置未完成。</p>

  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('ai_pulse_posts')
    .select('id, slug, title, published_at, content_type, series_slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const allPosts = (posts ?? []) as ListPost[]

  return (
    <div>
      <p className="kicker mb-2">最新</p>
      <p className="text-sm text-[var(--muted)] mb-10">{allPosts.length} 篇</p>
      <div className="divide-y divide-[oklch(0.85_0_0)]">
        {allPosts.map((post) => (
          <article key={post.id} className="py-5 flex items-baseline gap-6">
            <span className="date shrink-0 w-24">{formatDate(post.published_at)}</span>
            <div className="flex-1 min-w-0">
              <Link href={`/post/${post.slug}`} className="group">
                <h3 className="text-base leading-snug group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </h3>
              </Link>
            </div>
            <span className="kicker shrink-0">{getTypeLabel(post)}</span>
          </article>
        ))}
      </div>
    </div>
  )
}
