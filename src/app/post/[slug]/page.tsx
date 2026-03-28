import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  return (
    <article>
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
          {post.is_premium && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-amber-600 font-medium text-xs">
              付费内容
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold leading-tight mb-3">{post.title}</h1>
        <p className="text-lg text-gray-500 leading-relaxed">{post.excerpt}</p>
      </header>

      {post.is_premium ? (
        <PremiumPaywall excerpt={post.excerpt} />
      ) : (
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}
    </article>
  )
}

function PremiumPaywall({ excerpt }: { excerpt: string }) {
  return (
    <div>
      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: excerpt }}
      />
      <div className="relative mt-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white pointer-events-none h-24" />
        <div className="border border-gray-200 rounded-2xl p-8 text-center mt-4">
          <h3 className="text-lg font-semibold mb-2">订阅以阅读完整内容</h3>
          <p className="text-gray-500 text-sm mb-5">加入数千位读者，每周获取深度AI分析。</p>
          <a
            href="/subscribe"
            className="inline-block rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            免费订阅 →
          </a>
        </div>
      </div>
    </div>
  )
}
