import { createClient } from '@/lib/supabase/server'
import { Post } from '@/types'
import Link from 'next/link'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, title, excerpt, is_premium, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">AI早知道</h1>
        <p className="text-gray-500">每周精选AI领域最重要的进展，深度解析技术趋势与商业影响。</p>
      </div>

      <div className="divide-y divide-gray-100">
        {posts?.map((post: Partial<Post>) => (
          <article key={post.id} className="py-6">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <Link href={`/post/${post.slug}`}>
                  <h2 className="text-lg font-semibold hover:text-gray-600 transition-colors mb-1">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-gray-500 text-sm leading-relaxed mb-2">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('zh-CN') : ''}</span>
                  {post.is_premium && (
                    <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-amber-600 font-medium">
                      付费
                    </span>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}

        {(!posts || posts.length === 0) && (
          <p className="py-10 text-center text-gray-400">文章即将发布，敬请订阅获取通知。</p>
        )}
      </div>
    </div>
  )
}
