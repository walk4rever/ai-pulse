'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Post {
  slug: string
  title: string
  excerpt: string
  featured: boolean
  status: string
  published_at: string | null
  series_slug: string | null
  is_premium: boolean
  content_type: string
  author_slug: string | null
}

export function EditForm({ post }: { post: Post }) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: post.title,
    excerpt: post.excerpt ?? '',
    featured: post.featured,
    status: post.status,
    published_at: post.published_at ? post.published_at.slice(0, 10) : '',
    series_slug: post.series_slug ?? '',
    is_premium: post.is_premium,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const body = {
      title: form.title,
      excerpt: form.excerpt,
      featured: form.featured,
      status: form.status,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
      series_slug: form.series_slug || null,
      is_premium: form.is_premium,
    }

    const res = await fetch(`/api/admin/posts/${post.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setSaved(true)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? '保存失败')
    }
    setSaving(false)
  }

  const inputClass = 'w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--foreground)] transition'
  const labelClass = 'kicker mb-2 block'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-xs text-[var(--muted)] mb-4">
          {post.content_type} · {post.author_slug} · {post.slug}
        </p>
      </div>

      <div>
        <label className={labelClass}>标题</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>摘要</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => update('excerpt', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>发布日期</label>
        <input
          type="date"
          value={form.published_at}
          onChange={(e) => update('published_at', e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>系列 slug（可选）</label>
        <input
          type="text"
          value={form.series_slug}
          onChange={(e) => update('series_slug', e.target.value)}
          placeholder="harness"
          className={inputClass}
        />
      </div>

      <div className="flex gap-8">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update('featured', e.target.checked)}
          />
          <span className="kicker">精选</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_premium}
            onChange={(e) => update('is_premium', e.target.checked)}
          />
          <span className="kicker">付费</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.status === 'published'}
            onChange={(e) => update('status', e.target.checked ? 'published' : 'draft')}
          />
          <span className="kicker">已发布</span>
        </label>
      </div>

      {error && <p className="text-sm text-[var(--accent)]">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-[var(--foreground)] text-[var(--background)] px-6 py-2.5 text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存'}
        </button>
        {saved && <span className="text-sm text-[var(--muted)]">已保存</span>}
      </div>
    </form>
  )
}
