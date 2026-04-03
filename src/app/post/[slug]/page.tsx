import { createClient } from '@/lib/supabase/server'
import { getTypeLabel } from '@/lib/content'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { BackButton } from '@/components/BackButton'
import { MermaidContent } from '@/components/MermaidContent'
import { WechatShare } from '@/components/WechatShare'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('ai_pulse_posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai.air7.fun'
  const imageUrl = `${siteUrl}/post/${slug}/opengraph-image`

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${siteUrl}/post/${slug}`,
      siteName: 'AI早知道',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
      type: 'article',
    },
  }
}

function formatPublishedAt(value: string | null) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
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

  const contentTypeLabel = getTypeLabel(post.content_type)
  const seriesLabel = formatSeriesLabel(post.series_slug)
  const authorLabel = formatAuthorLabel(post.author_slug)

  return (
    <article className="max-w-2xl">
      <div className="mb-12">
        <BackButton />
      </div>

      <header className="mb-12 pb-8 border-b border-[var(--subtle)] border-opacity-20">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="kicker">{contentTypeLabel}</span>
          {seriesLabel && <span className="kicker">系列 · {seriesLabel}</span>}
          {post.is_premium && <span className="kicker text-[var(--accent)]">付费内容</span>}
        </div>
        <h1 className="text-3xl lg:text-4xl font-semibold leading-tight tracking-tight">
          {post.title}
        </h1>
        <p className="mt-6 text-lg text-[var(--muted)] leading-relaxed">{post.excerpt}</p>
        <p className="mt-6 date">{authorLabel} · {formatPublishedAt(post.published_at)}</p>
      </header>

      {post.is_premium ? (
        <PremiumPaywall excerpt={post.excerpt} />
      ) : (
        <MermaidContent className="prose" html={post.content} />
      )}

      <WechatShare
        title={post.title}
        description={post.excerpt ?? ''}
        imageUrl={post.cover_image ?? undefined}
      />
    </article>
  )
}

function PremiumPaywall({ excerpt }: { excerpt: string }) {
  return (
    <div>
      <MermaidContent className="prose" html={excerpt} />
      <div className="relative mt-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-transparent to-[var(--background)]" />
        <div className="mt-8 border border-[var(--subtle)] border-opacity-30 px-8 py-10 text-center">
          <p className="kicker mb-4">Members Edition</p>
          <h3 className="text-2xl font-semibold leading-tight tracking-tight">
            订阅以阅读完整内容
          </h3>
          <p className="mt-4 text-[var(--muted)] leading-relaxed max-w-md mx-auto">
            加入 AI早知道 的读者名单，每周获取更完整的深度分析与长期判断。
          </p>
          <div className="mt-8">
            <Link
              href="/subscribe"
              className="inline-block bg-[var(--foreground)] text-[var(--background)] px-6 py-3 text-sm hover:opacity-80 transition-opacity"
            >
              免费订阅
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
