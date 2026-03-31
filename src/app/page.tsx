import { createClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { Post } from '@/types'
import Link from 'next/link'

export const revalidate = 60

interface HomePageProps {
  searchParams: Promise<{ confirmed?: string }>
}

type HomePost = Pick<
  Post,
  'id' | 'slug' | 'title' | 'excerpt' | 'is_premium' | 'published_at' | 'content_type' | 'featured' | 'series_slug'
>

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

function PostItem({ post }: { post: HomePost }) {
  return (
    <article className="py-6 flex items-baseline gap-6">
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
  )
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { confirmed } = await searchParams
  const { hasPublicEnv } = getSupabaseEnv()

  if (!hasPublicEnv) {
    return (
      <div className="space-y-4">
        <p className="kicker">配置未完成</p>
        <p className="text-[var(--muted)] text-sm">请在 .env.local 配置 Supabase 环境变量。</p>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('ai_pulse_posts')
    .select('id, slug, title, excerpt, is_premium, published_at, content_type, featured, series_slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const allPosts = (posts ?? []) as HomePost[]

  return (
    <div>
      {confirmed === 'true' && (
        <p className="mb-12 text-sm text-[var(--muted)]">订阅已确认，感谢。</p>
      )}

      {/* Hero */}
      <section className="mb-20">
        <p className="text-lg font-semibold leading-relaxed">
          帮你读懂 AI，而不只是跟上 AI。
        </p>
      </section>

      {/* Three dimensions */}
      <section className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-[oklch(0.85_0_0)] pt-14">
        {[
          {
            label: '创造力',
            body: 'AI 降低了执行的门槛，但放大了想象力的差距。真正的问题不是会不会用工具，而是用来做什么。',
          },
          {
            label: '判断力',
            body: '每天都有新模型、新工具、新突破。知道哪些值得跟进，哪些是噪音，才是真正的竞争优势。',
          },
          {
            label: '审美',
            body: '好的 AI 工程师不只是会调用 API。他们知道什么是好的系统，好的产品，好的决策。',
          },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-base font-semibold mb-3">{item.label}</p>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>

      {/* Post list */}
      <section>
        <div className="divide-y divide-[oklch(0.85_0_0)]">
          {allPosts.length > 0 ? (
            allPosts.map((post) => <PostItem key={post.id} post={post} />)
          ) : (
            <p className="py-8 text-[var(--muted)] text-sm">内容即将发布</p>
          )}
        </div>
      </section>
    </div>
  )
}
