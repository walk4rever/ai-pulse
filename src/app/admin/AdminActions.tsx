'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LogoutProps {
  mode: 'logout'
}

interface PostProps {
  mode: 'post'
  slug: string
  featured: boolean
  featuredCount: number
}

type Props = LogoutProps | PostProps

export function AdminActions(props: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (props.mode === 'logout') {
    return (
      <button
        onClick={async () => {
          await fetch('/api/admin/login', { method: 'DELETE' })
          router.push('/admin/login')
        }}
        className="kicker text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        退出
      </button>
    )
  }

  const { slug, featured, featuredCount } = props

  async function toggleFeatured() {
    if (!featured && featuredCount >= 3) {
      alert('最多只能精选 3 篇，请先取消其他精选文章。')
      return
    }
    setLoading(true)
    await fetch(`/api/admin/posts/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !featured }),
    })
    router.push('/admin')
  }

  async function deletePost() {
    if (!confirm(`确认删除「${slug}」？此操作不可撤销。`)) return
    setLoading(true)
    await fetch(`/api/admin/posts/${slug}`, { method: 'DELETE' })
    router.push('/admin')
  }

  return (
    <div className="flex items-center gap-3 shrink-0">
      <a
        href={`/admin/edit/${slug}`}
        className="kicker text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        编辑
      </a>
      <button
        onClick={toggleFeatured}
        disabled={loading}
        className={`kicker transition-colors ${
          featured
            ? 'text-[var(--accent)]'
            : 'text-[var(--muted)] hover:text-[var(--foreground)]'
        }`}
      >
        {featured ? '★ 精选' : '☆ 精选'}
      </button>
      <button
        onClick={deletePost}
        disabled={loading}
        className="kicker text-[var(--muted)] hover:text-red-500 transition-colors"
      >
        删除
      </button>
    </div>
  )
}
