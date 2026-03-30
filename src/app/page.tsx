import { createClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { Post } from '@/types'
import Link from 'next/link'

export const revalidate = 60

interface HomePageProps {
  searchParams: Promise<{ confirmed?: string }>
}

function getConfirmedBanner(confirmed?: string) {
  switch (confirmed) {
    case 'true':
      return {
        tone: 'success',
        title: '订阅确认成功',
        message: '你的邮箱已确认，后续将收到 AI早知道 的更新邮件。',
      }
    case 'invalid':
      return {
        tone: 'error',
        title: '确认链接无效',
        message: '该确认链接已失效或不正确，请重新提交订阅。',
      }
    case 'error':
      return {
        tone: 'error',
        title: '确认失败',
        message: '系统暂时无法完成确认，请稍后重试。',
      }
    default:
      return null
  }
}

type HomePost = Pick<
  Post,
  'id' | 'slug' | 'title' | 'excerpt' | 'is_premium' | 'published_at' | 'content_type' | 'featured' | 'series_slug'
>

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString('zh-CN') : ''
}

function getTypeLabel(post: Pick<Post, 'content_type' | 'series_slug'>) {
  if (post.content_type === 'weekly') return '周刊'
  if (post.content_type === 'deep_dive') return post.series_slug ? `深度 · ${post.series_slug}` : '深度'
  return 'Brief'
}

function SectionHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-5 border-b border-[var(--border)] pb-3">
      <h2 className="text-[1.55rem] font-semibold tracking-[-0.03em] text-[var(--foreground)]">{title}</h2>
      <p className="mt-2 max-w-2xl text-[0.98rem] leading-7 text-[var(--muted)]">{description}</p>
    </div>
  )
}

function PostCard({ post, compact = false }: { post: HomePost; compact?: boolean }) {
  return (
    <article className={compact ? 'py-5' : 'py-6'}>
      <div className="flex-1">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[0.78rem] text-[var(--subtle)]">
          <span className="editorial-label">{getTypeLabel(post)}</span>
          <span>{formatDate(post.published_at)}</span>
          {post.is_premium && <span className="editorial-label">付费</span>}
        </div>
        <Link href={`/post/${post.slug}`}>
          <h3
            className={`${compact ? 'text-[1.32rem] leading-[1.45]' : 'text-[1.55rem] leading-[1.4]'} font-semibold tracking-[-0.03em] text-[var(--foreground)] transition hover:text-[var(--accent)]`}
          >
            {post.title}
          </h3>
        </Link>
        <p className="mt-3 max-w-3xl text-[1.03rem] leading-8 text-[var(--muted)]">{post.excerpt}</p>
      </div>
    </article>
  )
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { confirmed } = await searchParams
  const banner = getConfirmedBanner(confirmed)
  const { hasPublicEnv } = getSupabaseEnv()

  if (!hasPublicEnv) {
    return (
      <div className="space-y-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-6 text-amber-950">
          <h1 className="text-2xl font-bold">Supabase 本地配置未完成</h1>
          <p className="mt-3 text-sm leading-6">
            当前 `.env.local` 里的 `NEXT_PUBLIC_SUPABASE_URL` 或
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` 还是空值或占位值，所以首页无法连接数据库。
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 px-6 py-6">
          <h2 className="text-lg font-semibold">补齐这两个值后刷新页面</h2>
          <div className="mt-4 space-y-2 font-mono text-sm text-gray-700">
            <p>NEXT_PUBLIC_SUPABASE_URL=https://&lt;your-project-ref&gt;.supabase.co</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=&lt;your-anon-key&gt;</p>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            如果你还要测试订阅和确认接口，还需要同时配置 `SUPABASE_SERVICE_ROLE_KEY`、
            `RESEND_API_KEY` 和邮件相关变量。
          </p>
        </div>
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
  const featuredPost = allPosts.find((post) => post.featured) ?? allPosts[0] ?? null
  const remainingPosts = featuredPost
    ? allPosts.filter((post) => post.id !== featuredPost.id)
    : allPosts
  const weeklyPosts = remainingPosts.filter((post) => post.content_type === 'weekly').slice(0, 3)
  const deepDivePosts = remainingPosts.filter((post) => post.content_type === 'deep_dive').slice(0, 4)
  const harnessPosts = deepDivePosts.filter((post) => post.series_slug === 'harness')

  return (
    <div>
      {banner && (
        <div
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
            banner.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          <p className="font-medium">{banner.title}</p>
          <p className="mt-1">{banner.message}</p>
        </div>
      )}

      <section className="mb-14 grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="editorial-card-strong rounded-[2.15rem] px-7 py-10 lg:px-10 lg:py-12">
          <div className="max-w-3xl">
            <p className="editorial-kicker mb-4">Weekly research letter for AI builders</p>
            <h1 className="max-w-3xl text-[2.65rem] font-semibold leading-[1.08] tracking-[-0.06em] text-[var(--foreground)] lg:text-[3.7rem]">
              不是追所有 AI 新闻，
              <br className="hidden lg:block" />
              而是解释真正重要的变化。
            </h1>
            <p className="mt-6 max-w-2xl text-[1.08rem] leading-9 text-[var(--muted)] lg:text-[1.18rem]">
              AI早知道面向正在使用 AI 写代码、关心模型、工具链与 agent workflow 演进的工程师。周刊负责筛选，深度负责理解，判断决定差异。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/subscribe"
                className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-92"
              >
                订阅周刊
              </Link>
              {featuredPost && (
                <Link
                  href={`/post/${featuredPost.slug}`}
                  className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/35 hover:text-[var(--accent)]"
                >
                  阅读本周主打
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="editorial-card rounded-[2.15rem] px-7 py-8 lg:px-8 lg:py-10">
          <p className="editorial-kicker">Why read</p>
          <div className="editorial-rule mt-3 w-16" />
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-[0.82rem] uppercase tracking-[0.12em] text-[var(--subtle)]">01</p>
              <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em]">筛选</h2>
              <p className="mt-2 text-[0.98rem] leading-7 text-[var(--muted)]">替你从一周密集噪音里挑出真正重要的变化。</p>
            </div>
            <div>
              <p className="text-[0.82rem] uppercase tracking-[0.12em] text-[var(--subtle)]">02</p>
              <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em]">研究</h2>
              <p className="mt-2 text-[0.98rem] leading-7 text-[var(--muted)]">不是堆链接，而是把问题讲透，把判断讲清楚。</p>
            </div>
            <div>
              <p className="text-[0.82rem] uppercase tracking-[0.12em] text-[var(--subtle)]">03</p>
              <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em]">长期判断</h2>
              <p className="mt-2 text-[0.98rem] leading-7 text-[var(--muted)]">帮助 AI 工程师理解今天的变化，如何塑造未来 6 到 12 个月。</p>
            </div>
          </div>
        </div>
      </section>

      {featuredPost && (
        <section className="mb-14">
          <SectionHeader title="本周主打" description="当前最值得先读的一篇内容。" />
          <div className="editorial-card-strong rounded-[2rem] px-7 py-8 lg:px-9 lg:py-10">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[0.78rem] text-[var(--subtle)]">
              <span className="editorial-label">{getTypeLabel(featuredPost)}</span>
              <span>{formatDate(featuredPost.published_at)}</span>
            </div>
            <Link href={`/post/${featuredPost.slug}`}>
              <h2 className="max-w-3xl text-[2rem] font-semibold leading-[1.18] tracking-[-0.045em] text-[var(--foreground)] transition hover:text-[var(--accent)] lg:text-[2.5rem]">
                {featuredPost.title}
              </h2>
            </Link>
            <p className="mt-5 max-w-3xl text-[1.08rem] leading-9 text-[var(--muted)] lg:text-[1.14rem]">
              {featuredPost.excerpt}
            </p>
            <div className="editorial-rule mt-8 w-full max-w-[12rem]" />
            <p className="mt-5 max-w-xl text-[0.92rem] leading-7 text-[var(--subtle)]">
              本周主打是编辑部认为最值得优先理解的一篇内容，不一定最新，但一定最重要。
            </p>
          </div>
        </section>
      )}

      <section className="mb-14">
        <SectionHeader title="周刊" description="每周筛选真正重要的变化，先给判断，再给信息。" />
        <div className="editorial-card divide-y divide-[var(--border-light)] rounded-[1.75rem] px-7 lg:px-8">
          {weeklyPosts.length > 0 ? (
            weeklyPosts.map((post) => <PostCard key={post.id} post={post} compact />)
          ) : (
            <p className="py-8 text-sm text-gray-400">周刊内容即将发布。</p>
          )}
        </div>
      </section>

      <section className="mb-14">
        <SectionHeader title="深度" description="围绕关键主题做系列化拆解，承担长期认知升级。" />
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="editorial-card-strong rounded-[1.75rem] px-7 py-7 lg:px-8 lg:py-8">
            <div className="mb-4 flex items-center gap-2 text-[0.78rem] text-[var(--subtle)]">
              <span className="editorial-label">系列</span>
              <span>Harness</span>
            </div>
            <h3 className="text-[1.72rem] font-semibold tracking-[-0.04em] text-[var(--foreground)]">当 AI 开始写代码，工程师的工作变成了什么？</h3>
            <p className="mt-3 text-[1.02rem] leading-8 text-[var(--muted)]">
              Harness 系列把 Anthropic、OpenAI、Mario、Karpathy 和一线独立开发者实践放到同一张认知地图里，回答一个越来越现实的问题：你怎么让 agent 持续地产出、持续地可控？
            </p>
            {harnessPosts.length > 0 ? (
              <div className="mt-6 divide-y divide-[var(--border-light)]">
                {harnessPosts.map((post) => (
                  <PostCard key={post.id} post={post} compact />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-[var(--subtle)]">Harness 系列即将上线。</p>
            )}
          </div>
          <div className="editorial-card rounded-[1.75rem] px-7 py-7 lg:px-8 lg:py-8">
            <p className="text-[0.82rem] uppercase tracking-[0.12em] text-[var(--subtle)]">研究方向</p>
            <ul className="mt-5 space-y-4 text-[1rem] leading-7 text-[var(--muted)]">
              <li>• Generator-Evaluator 如何改变长任务质量控制</li>
              <li>• Knowledge as Code 是否会成为 agent-first 团队的新纪律</li>
              <li>• 可见性、记忆与约束，哪个才是最小可行 harness</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="editorial-card-strong rounded-[2rem] px-7 py-8 lg:px-10 lg:py-10">
        <p className="editorial-kicker">Join the letter</p>
        <h2 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.04em] text-[var(--foreground)] lg:text-[2.2rem]">每周一次，帮你筛掉噪音，只留下值得理解的变化。</h2>
        <p className="mt-4 max-w-2xl text-[1rem] leading-8 text-[var(--muted)]">
          订阅 AI早知道，你收到的不是信息洪流，而是一位认真主编替你做过筛选后的研究性简报。
        </p>
        <div className="mt-6">
          <Link
            href="/subscribe"
            className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-92"
          >
            免费订阅
          </Link>
        </div>
      </section>
    </div>
  )
}
