import { createClient } from '@/lib/supabase/server'
import { Post } from '@/types'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

function formatPublishedAt(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''
}

function getContentTypeLabel(post: Pick<Post, 'content_type' | 'series_slug'>) {
  if (post.content_type === 'weekly') return '周刊'
  if (post.content_type === 'deep_dive') return '深度'
  return 'Brief'
}

function formatSeriesLabel(seriesSlug: string | null) {
  if (!seriesSlug) return null

  return seriesSlug
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function formatAuthorLabel(authorSlug: string | null) {
  if (!authorSlug) return '编辑部'
  if (authorSlug === 'rafa') return 'RAFA'

  return authorSlug
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('ai_pulse_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  const contentTypeLabel = getContentTypeLabel(post)
  const seriesLabel = formatSeriesLabel(post.series_slug)
  const authorLabel = formatAuthorLabel(post.author_slug)

  return (
    <article className="mx-auto max-w-[46rem]">
      <header className="mb-10 border-b border-[var(--border)] pb-9">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-[0.8rem] text-[var(--subtle)]">
          <span className="editorial-label">{contentTypeLabel}</span>
          {seriesLabel && <span className="editorial-label">系列 · {seriesLabel}</span>}
          <span>{authorLabel}</span>
          <span>·</span>
          <span>{formatPublishedAt(post.published_at)}</span>
          {post.is_premium && <span className="editorial-label">付费内容</span>}
        </div>
        <h1 className="max-w-4xl text-[2.45rem] font-semibold leading-[1.18] tracking-[-0.05em] text-[var(--foreground)] lg:text-[3rem]">
          {post.title}
        </h1>
        <p className="mt-5 max-w-3xl text-[1.18rem] leading-9 text-[var(--muted)]">{post.excerpt}</p>
      </header>

      {post.is_premium ? (
        <PremiumPaywall excerpt={post.excerpt} />
      ) : (
        <div className="editorial-prose" dangerouslySetInnerHTML={{ __html: post.content }} />
      )}
    </article>
  )
}

function PremiumPaywall({ excerpt }: { excerpt: string }) {
  return (
    <div>
      <div className="editorial-prose" dangerouslySetInnerHTML={{ __html: excerpt }} />
      <div className="relative mt-8">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent to-[var(--background)] pointer-events-none" />
        <div className="editorial-card mt-5 rounded-[1.75rem] px-8 py-9 text-center">
          <p className="text-[0.82rem] uppercase tracking-[0.12em] text-[var(--subtle)]">Members edition</p>
          <h3 className="mt-3 text-[1.55rem] font-semibold tracking-[-0.03em] text-[var(--foreground)]">订阅以阅读完整内容</h3>
          <p className="mx-auto mt-3 max-w-xl text-[1rem] leading-8 text-[var(--muted)]">
            加入 AI早知道 的读者名单，每周获取更完整的深度分析与长期判断。
          </p>
          <a
            href="/subscribe"
            className="mt-6 inline-block rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-92"
          >
            免费订阅
          </a>
        </div>
      </div>
    </div>
  )
}
