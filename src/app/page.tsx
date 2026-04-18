import { createClient, createServiceClient } from '@/lib/supabase/server'
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

interface SeriesItem {
  id: string
  name: string
  description: string
  postCount: number
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}


function FeaturedCard({ post }: { post: HomePost }) {
  return (
    <article className="bg-[var(--background)] rounded-2xl p-6 flex flex-col gap-4 shadow-[0_0_0_1px_var(--border-subtle),0_4px_24px_rgba(20,20,19,0.04)] transition-shadow hover:shadow-[0_0_0_1px_var(--ring),0_8px_32px_rgba(20,20,19,0.08)]">
      <div className="flex items-center justify-between">
        <span className="kicker" style={{ color: 'var(--accent)' }}>{getTypeLabel(post.content_type)}</span>
        <span className="date">{formatDate(post.published_at)}</span>
      </div>
      <Link href={`/post/${post.slug}`} className="group flex-1">
        <h3 className="font-serif text-xl font-medium leading-snug group-hover:text-[var(--accent)] transition-colors">
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
    <article className="py-6 flex items-baseline gap-6">
      <span className="date shrink-0 w-24">{formatDate(post.published_at)}</span>
      <div className="flex-1 min-w-0">
        <Link href={`/post/${post.slug}`} className="group">
          <h3 className="font-serif text-lg md:text-xl font-medium leading-snug group-hover:text-[var(--accent)] transition-colors">
            {post.title}
          </h3>
        </Link>
      </div>
      <span className="kicker shrink-0" style={{ color: 'var(--accent)' }}>{getTypeLabel(post.content_type)}</span>
    </article>
  )
}

function buildSections(posts: HomePost[]): { featured: HomePost[]; recent: HomePost[] } {
  const featured = posts.filter((p) => p.featured).slice(0, 3)
  const recent = posts.slice(0, 10)
  return { featured, recent }
}

function SeriesCard({ item }: { item: SeriesItem }) {
  return (
    <Link
      href="/series"
      className="group flex flex-col gap-2 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-serif text-lg font-medium text-[#faf9f5] leading-snug group-hover:text-[var(--accent-coral)] transition-colors">
          {item.name}
        </h3>
        <span className="shrink-0 text-xs text-[#b0aea5] mt-1">{item.postCount} 篇</span>
      </div>
      {item.description && (
        <p className="text-sm text-[#b0aea5] leading-relaxed line-clamp-2">{item.description}</p>
      )}
    </Link>
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
  const serviceSupabase = await createServiceClient()

  const [{ data: posts }, { data: seriesData }, { data: seriesRelations }] = await Promise.all([
    supabase
      .from('ai_pulse_posts')
      .select('id, slug, title, excerpt, is_premium, published_at, content_type, featured, series_slug')
      .eq('status', 'published')
      .order('published_at', { ascending: false }).order('created_at', { ascending: false }),
    serviceSupabase
      .from('ai_pulse_series')
      .select('id, name, description')
      .order('created_at', { ascending: false }),
    serviceSupabase
      .from('ai_pulse_series_posts')
      .select('series_id'),
  ])

  const allPosts = (posts ?? []) as HomePost[]
  const { featured, recent } = buildSections(allPosts)

  const countMap = new Map<string, number>()
  for (const row of (seriesRelations ?? [])) {
    countMap.set(row.series_id, (countMap.get(row.series_id) ?? 0) + 1)
  }
  const seriesList: SeriesItem[] = (seriesData ?? []).map((s) => ({
    ...s,
    postCount: countMap.get(s.id) ?? 0,
  }))

  return (
    <div>
      {confirmed === 'true' && (
        <p className="mb-12 text-sm text-[var(--muted)]">订阅已确认，感谢。</p>
      )}

      {/* Hero */}
      <section className="mb-20 md:mb-28">
        <p className="kicker mb-6" style={{ color: 'var(--accent)' }}>AI 早知道 · 每周</p>
        <h1 className="font-serif text-[2.5rem] md:text-6xl font-medium leading-[1.1] tracking-tight text-[var(--foreground)]">
          帮你读懂 AI，<br />而不只是跟上 AI。
        </h1>
        <p className="mt-8 text-lg md:text-xl text-[var(--muted)] leading-relaxed max-w-2xl">
          AI 降低了执行的门槛，放大了判断力与审美的差距。我们不追所有新闻，只解释真正值得跟进的变化 —— 给 AI 工程师的每周精选、深度分析与长期判断。
        </p>
        <div className="mt-10">
          <Link
            href="/subscribe"
            className="inline-flex items-center bg-[var(--accent)] text-[#faf9f5] px-6 py-3 rounded-xl text-base font-medium hover:bg-[var(--accent-coral)] transition-colors shadow-[0_0_0_1px_var(--accent),0_4px_24px_rgba(201,100,66,0.2)]"
          >
            免费订阅 →
          </Link>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mb-20 border-t border-[var(--border)] pt-14">
          <p className="kicker mb-8">精选</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.map((post) => (
              <FeaturedCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Series overview */}
      {seriesList.length > 0 && (
        <section className="mb-20 -mx-6 bg-[#141413] px-8 md:px-12 py-16 md:py-20 rounded-3xl">
          <div className="flex items-baseline justify-between mb-8">
            <p className="kicker" style={{ color: 'var(--accent-coral)' }}>专题</p>
            <Link href="/series" className="kicker text-[#b0aea5] hover:text-[var(--accent-coral)] transition-colors">
              全部专题 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seriesList.slice(0, 4).map((item) => (
              <SeriesCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent */}
      <section className="border-t border-[var(--border)] pt-14">
        <p className="kicker mb-2">最新</p>
        <div className="divide-y divide-[var(--border-subtle)]">
          {recent.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
        {recent.length === 0 && (
          <p className="py-8 text-sm text-[var(--muted)]">暂无文章。</p>
        )}
        <div className="mt-8">
          <Link href="/archive" className="kicker hover:text-[var(--accent)] transition-colors">
            全部文章 →
          </Link>
        </div>
      </section>
    </div>
  )
}
