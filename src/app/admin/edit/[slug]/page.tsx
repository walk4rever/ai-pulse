import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { EditForm } from './EditForm'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EditPage({ params }: Props) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (session !== process.env.ADMIN_PASSWORD) redirect('/admin/login')

  const { slug } = await params
  const supabase = await createServiceClient()
  const { data: post } = await supabase
    .from('ai_pulse_posts')
    .select('slug, title, excerpt, featured, status, published_at, series_slug, is_premium, content_type, author_slug')
    .eq('slug', slug)
    .single()

  if (!post) notFound()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <a href="/admin" className="kicker text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            ← 返回列表
          </a>
          <a href={`/post/${post.slug}`} target="_blank" className="kicker text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            查看文章 →
          </a>
        </div>
        <p className="text-lg font-semibold mb-6">编辑文章</p>
        <EditForm post={post} />
      </div>
    </div>
  )
}
