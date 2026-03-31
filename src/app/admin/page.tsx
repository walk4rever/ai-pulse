import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTypeLabel } from '@/lib/content'
import { AdminActions } from './AdminActions'

export const dynamic = 'force-dynamic'

function formatDate(value: string | null) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default async function AdminPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (session !== process.env.ADMIN_PASSWORD) redirect('/admin/login')

  const supabase = await createServiceClient()
  const { data: posts } = await supabase
    .from('ai_pulse_posts')
    .select('id, slug, title, content_type, author_slug, status, featured, published_at')
    .order('published_at', { ascending: false })

  const allPosts = posts ?? []
  const featuredCount = allPosts.filter((p) => p.featured).length

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-8">
          <p className="text-lg font-semibold">管理后台</p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-[var(--muted)]">{allPosts.length} 篇 · 精选 {featuredCount}/3</span>
            <AdminActions mode="logout" />
          </div>
        </div>

        <div className="divide-y divide-[oklch(0.85_0_0)]">
          {allPosts.map((post) => (
            <div key={post.id} className="py-4 flex items-center gap-4">
              <span className="date shrink-0 w-24">{formatDate(post.published_at)}</span>
              <span className="kicker shrink-0 w-12">{getTypeLabel(post.content_type)}</span>
              <div className="flex-1 min-w-0">
                <a
                  href={`/post/${post.slug}`}
                  target="_blank"
                  className="text-sm leading-snug hover:text-[var(--accent)] transition-colors"
                >
                  {post.title}
                </a>
                <p className="text-xs text-[var(--muted)] mt-0.5">{post.author_slug}</p>
              </div>
              {post.status === 'draft' && (
                <span className="kicker text-[var(--muted)] shrink-0">草稿</span>
              )}
              <AdminActions
                mode="post"
                slug={post.slug}
                featured={post.featured}
                featuredCount={featuredCount}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
