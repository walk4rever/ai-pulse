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
    .order('published_at', { ascending: false }).order('created_at', { ascending: false })

  const allPosts = (posts ?? []) as HomePost[]
  const { featured, recent } = buildSections(allPosts)

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

      {/* Dark chapter break */}
      <section className="mb-20 -mx-6 bg-[#141413] px-8 md:px-12 py-16 md:py-20 rounded-3xl">
        <p className="kicker mb-6" style={{ color: 'var(--accent-coral)' }}>
          Editor&apos;s note
        </p>
        <blockquote className="font-serif text-2xl md:text-3xl font-medium leading-[1.3] text-[#faf9f5] max-w-xl">
          在噪音里挑信号，在信号里挑判断 —— 这是我们每期在做的事。
        </blockquote>
        <p className="mt-6 text-sm text-[#b0aea5] leading-relaxed max-w-xl">
          如果你只有十分钟读 AI 相关内容，我们希望那十分钟花在这里。
        </p>
      </section>

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
