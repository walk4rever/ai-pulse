import { createClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { Post } from '@/types'
import Link from 'next/link'

export const revalidate = 60

export const metadata = {
  title: '访谈 | AI早知道',
}

type ListPost = Pick<Post, 'id' | 'slug' | 'title' | 'excerpt' | 'published_at' | 'content_type' | 'series_slug'>

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default async function InterviewPage() {
  const { hasPublicEnv } = getSupabaseEnv()
  if (!hasPublicEnv) return <p className="text-sm text-[var(--muted)]">配置未完成。</p>

  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('ai_pulse_posts')
    .select('id, slug, title, excerpt, published_at, content_type, series_slug')
    .eq('status', 'published')
    .eq('content_type', 'interview')
    .order('published_at', { ascending: false }).order('created_at', { ascending: false })

  const allPosts = (posts ?? []) as ListPost[]

  return (
    <div>
      <p className="kicker mb-2">访谈</p>
      <p className="text-sm text-[var(--muted)] mb-10">{allPosts.length} 篇</p>
      <div className="divide-y divide-[oklch(0.85_0_0)]">
        {allPosts.map((post) => (
          <article key={post.id} className="py-7">
            <div className="flex items-baseline justify-between mb-3">
              <Link href={`/post/${post.slug}`} className="group flex-1 min-w-0 mr-6">
                <h3 className="text-base font-semibold leading-snug group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </h3>
              </Link>
              <span className="date shrink-0">{formatDate(post.published_at)}</span>
            </div>
            {post.excerpt && (
              <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-2">{post.excerpt}</p>
            )}
          </article>
        ))}
        {allPosts.length === 0 && (
          <p className="py-8 text-sm text-[var(--muted)]">访谈内容即将发布。</p>
        )}
      </div>
    </div>
  )
}
