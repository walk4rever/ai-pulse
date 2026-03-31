import { createClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { Post } from '@/types'
import { getTypeLabel } from '@/lib/content'
import Link from 'next/link'

export const revalidate = 60

export const metadata = {
  title: '全部文章 | AI早知道',
}

type ArchivePost = Pick<Post, 'id' | 'slug' | 'title' | 'published_at' | 'content_type' | 'series_slug'>

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}


export default async function ArchivePage() {
  const { hasPublicEnv } = getSupabaseEnv()

  if (!hasPublicEnv) {
    return <p className="text-sm text-[var(--muted)]">配置未完成。</p>
  }

  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('ai_pulse_posts')
    .select('id, slug, title, published_at, content_type, series_slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const allPosts = (posts ?? []) as ArchivePost[]

  return (
    <div>
      <div className="mb-10">
        <Link href="/" className="kicker hover:text-[var(--foreground)] transition-colors">
          ← 首页
        </Link>
      </div>

      <p className="kicker mb-2">全部文章</p>
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
            <span className="kicker shrink-0">{getTypeLabel(post.content_type)}</span>
          </article>
        ))}
      </div>
    </div>
  )
}
