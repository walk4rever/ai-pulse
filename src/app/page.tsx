import { createClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { Post } from '@/types'
import { getTypeLabel } from '@/lib/content'
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


function FeaturedCard({ post }: { post: HomePost }) {
  return (
    <article className="border border-[oklch(0.85_0_0)] p-6 flex flex-col gap-4 hover:border-[var(--foreground)] transition-colors">
      <div className="flex items-center justify-between">
        <span className="kicker">{getTypeLabel(post.content_type)}</span>
        <span className="date">{formatDate(post.published_at)}</span>
      </div>
      <Link href={`/post/${post.slug}`} className="group flex-1">
        <h3 className="text-base font-semibold leading-snug group-hover:text-[var(--accent)] transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        )}
      </Link>
    </article>
  )
}

function PostItem({ post }: { post: HomePost }) {
  return (
    <article className="py-5 flex items-baseline gap-6">
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
  )
}

function buildSections(posts: HomePost[]): { featured: HomePost[]; recent: HomePost[] } {
  const featured = posts.filter((p) => p.featured).slice(0, 3)
  const featuredIds = new Set(featured.map((p) => p.id))
  const recent = posts.filter((p) => !featuredIds.has(p.id)).slice(0, 5)
  return { featured, recent }
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
  const { featured, recent } = buildSections(allPosts)

  return (
    <div>
      {confirmed === 'true' && (
        <p className="mb-12 text-sm text-[var(--muted)]">订阅已确认，感谢。</p>
      )}

      {/* Hero */}
      <section className="mb-16">
        <p className="text-lg font-semibold leading-relaxed">
          帮你读懂 AI，而不只是跟上 AI。
        </p>
      </section>

      {/* Three dimensions */}
      <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-[oklch(0.85_0_0)] pt-14">
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

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mb-16 border-t border-[oklch(0.85_0_0)] pt-14">
          <p className="kicker mb-8">精选</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.map((post) => (
              <FeaturedCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Recent */}
      <section className="border-t border-[oklch(0.85_0_0)] pt-14">
        <p className="kicker mb-2">最近</p>
        <div className="divide-y divide-[oklch(0.85_0_0)]">
          {recent.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
        <div className="mt-8">
          <Link href="/archive" className="kicker hover:text-[var(--foreground)] transition-colors">
            全部文章 →
          </Link>
        </div>
      </section>
    </div>
  )
}
