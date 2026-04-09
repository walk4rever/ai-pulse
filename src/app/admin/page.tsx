'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTypeLabel } from '@/lib/content'

interface Post {
  id: string
  slug: string
  title: string
  content_type: string
  author_slug: string | null
  status: string
  featured: boolean
  published_at: string | null
}

function formatDate(value: string | null) {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('user_token') : null
}

export default function AdminPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    const res = await fetch('/api/admin/posts', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (res.status === 401) { router.push('/login'); return }
    const data = await res.json()
    setPosts(data.posts ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => {
    const role = localStorage.getItem('user_role')
    if (!getToken() || role !== 'admin') { router.push('/login'); return }
    const timer = window.setTimeout(() => {
      void fetchPosts()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [fetchPosts, router])

  async function toggleFeatured(slug: string, current: boolean, featuredCount: number) {
    if (!current && featuredCount >= 3) {
      alert('最多精选 3 篇，请先取消其他精选文章。')
      return
    }
    await fetch(`/api/admin/posts/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ featured: !current }),
    })
    await fetchPosts()
  }

  async function deletePost(slug: string) {
    if (!confirm(`确认删除「${slug}」？此操作不可撤销。`)) return
    await fetch(`/api/admin/posts/${slug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    await fetchPosts()
  }

  function handleLogout() {
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_role')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[var(--muted)]">加载中...</p>
      </div>
    )
  }

  const featuredCount = posts.filter((p) => p.featured).length

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between mb-8">
          <p className="text-lg font-semibold">管理后台</p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-[var(--muted)]">{posts.length} 篇 · 精选 {featuredCount}/3</span>
            <a href="/admin/series" className="kicker text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              系列管理
            </a>
            <a href="/dashboard" className="kicker text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              控制台
            </a>
            <button
              onClick={handleLogout}
              className="kicker text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              退出
            </button>
          </div>
        </div>

        <div className="divide-y divide-[oklch(0.85_0_0)]">
          {posts.map((post) => (
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
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={`/admin/edit/${post.slug}`}
                  className="kicker text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  编辑
                </a>
                <button
                  onClick={() => toggleFeatured(post.slug, post.featured, featuredCount)}
                  className={`kicker transition-colors ${post.featured ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
                >
                  {post.featured ? '★ 精选' : '☆ 精选'}
                </button>
                <button
                  onClick={() => deletePost(post.slug)}
                  className="kicker text-[var(--muted)] hover:text-red-500 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
