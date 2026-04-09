'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTypeLabel } from '@/lib/content'

interface Series {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

interface AdminPost {
  id: string
  slug: string
  title: string
  content_type: string
  status: string
  published_at: string | null
}

interface SeriesPost {
  post_id: string
  order_index: number
  joined_at: string
  post: AdminPost
}

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('user_token') : null
}

export default function AdminSeriesPage() {
  const router = useRouter()
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [allPosts, setAllPosts] = useState<AdminPost[]>([])
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('')
  const [seriesPosts, setSeriesPosts] = useState<SeriesPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSeriesName, setNewSeriesName] = useState('')
  const [newSeriesDescription, setNewSeriesDescription] = useState('')
  const [selectedPostId, setSelectedPostId] = useState('')
  const [customOrder, setCustomOrder] = useState('')

  const selectedSeries = useMemo(
    () => seriesList.find((item) => item.id === selectedSeriesId) ?? null,
    [seriesList, selectedSeriesId]
  )

  const fetchSeries = useCallback(async () => {
    const res = await fetch('/api/admin/series', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (res.status === 401) { router.push('/login'); return }
    const data = await res.json()
    const list = (data.series ?? []) as Series[]
    setSeriesList(list)
    if (list.length > 0 && !selectedSeriesId) {
      setSelectedSeriesId(list[0].id)
    }
  }, [router, selectedSeriesId])

  const fetchPosts = useCallback(async () => {
    const res = await fetch('/api/admin/posts', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (res.status === 401) { router.push('/login'); return }
    const data = await res.json()
    setAllPosts(data.posts ?? [])
  }, [router])

  const fetchSeriesPosts = useCallback(async (seriesId: string) => {
    if (!seriesId) {
      setSeriesPosts([])
      return
    }
    const res = await fetch(`/api/admin/series/${seriesId}/posts`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (res.status === 401) { router.push('/login'); return }
    const data = await res.json()
    setSeriesPosts((data.posts ?? []) as SeriesPost[])
  }, [router])

  useEffect(() => {
    const role = localStorage.getItem('user_role')
    if (!getToken() || role !== 'admin') { router.push('/login'); return }

    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true)
        await Promise.all([fetchSeries(), fetchPosts()])
        setLoading(false)
      })()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [fetchPosts, fetchSeries, router])

  useEffect(() => {
    if (!selectedSeriesId) return
    const timer = window.setTimeout(() => {
      void fetchSeriesPosts(selectedSeriesId)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [fetchSeriesPosts, selectedSeriesId])

  async function createSeries() {
    if (!newSeriesName.trim()) return
    setSaving(true)

    const res = await fetch('/api/admin/series', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        name: newSeriesName.trim(),
        description: newSeriesDescription.trim(),
      }),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      alert(data?.error ?? '创建系列失败')
      setSaving(false)
      return
    }

    const created = data?.series as Series
    setSeriesList((prev) => [created, ...prev])
    setSelectedSeriesId(created.id)
    setNewSeriesName('')
    setNewSeriesDescription('')
    setSaving(false)
  }

  async function updateSeries() {
    if (!selectedSeries) return
    setSaving(true)

    const res = await fetch(`/api/admin/series/${selectedSeries.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        name: selectedSeries.name,
        description: selectedSeries.description,
      }),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      alert(data?.error ?? '更新系列失败')
      setSaving(false)
      return
    }

    const updated = data?.series as Series
    setSeriesList((prev) => prev.map((item) => item.id === updated.id ? updated : item))
    setSaving(false)
  }

  async function deleteSeries() {
    if (!selectedSeries) return
    if (!confirm(`确认删除系列「${selectedSeries.name}」？`)) return

    setSaving(true)
    const res = await fetch(`/api/admin/series/${selectedSeries.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      alert(data?.error ?? '删除系列失败')
      setSaving(false)
      return
    }

    const next = seriesList.filter((item) => item.id !== selectedSeries.id)
    setSeriesList(next)
    setSelectedSeriesId(next[0]?.id ?? '')
    setSeriesPosts([])
    setSaving(false)
  }

  async function addPostToSeries() {
    if (!selectedSeries || !selectedPostId) return
    setSaving(true)

    const order = customOrder.trim() ? Number(customOrder) : null
    const body: Record<string, unknown> = { post_id: selectedPostId }
    if (order && Number.isInteger(order) && order > 0) {
      body.order_index = order
    }

    const res = await fetch(`/api/admin/series/${selectedSeries.id}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      alert(data?.error ?? '加入系列失败')
      setSaving(false)
      return
    }

    await fetchSeriesPosts(selectedSeries.id)
    setSelectedPostId('')
    setCustomOrder('')
    setSaving(false)
  }

  async function updateOrder(postId: string, nextOrder: string) {
    if (!selectedSeries) return

    const order = Number(nextOrder)
    if (!Number.isInteger(order) || order <= 0) {
      alert('排序必须是正整数')
      return
    }

    const res = await fetch(`/api/admin/series/${selectedSeries.id}/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ order_index: order }),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      alert(data?.error ?? '更新排序失败')
      return
    }

    await fetchSeriesPosts(selectedSeries.id)
  }

  async function removeFromSeries(postId: string) {
    if (!selectedSeries) return

    const res = await fetch(`/api/admin/series/${selectedSeries.id}/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      alert(data?.error ?? '移除失败')
      return
    }

    await fetchSeriesPosts(selectedSeries.id)
  }

  if (loading) {
    return <p className="text-sm text-[var(--muted)] p-8">加载中...</p>
  }

  const postOptions = allPosts.filter((post) => !seriesPosts.some((item) => item.post_id === post.id))

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-lg font-semibold">系列管理</p>
            <p className="text-sm text-[var(--muted)] mt-1">管理员可创建系列，并将任意类型文章加入系列排序。</p>
          </div>
          <a href="/admin" className="kicker text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            返回文章管理
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          <section className="border border-[var(--subtle)] border-opacity-30 p-4 space-y-4">
            <p className="kicker">新建系列</p>
            <input
              value={newSeriesName}
              onChange={(e) => setNewSeriesName(e.target.value)}
              placeholder="系列名"
              className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-3 py-2 text-sm outline-none"
            />
            <textarea
              value={newSeriesDescription}
              onChange={(e) => setNewSeriesDescription(e.target.value)}
              placeholder="描述（可选）"
              rows={3}
              className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={createSeries}
              disabled={saving}
              className="bg-[var(--foreground)] text-[var(--background)] px-4 py-2 text-sm disabled:opacity-50"
            >
              创建
            </button>

            <div className="pt-4 border-t border-[var(--subtle)] border-opacity-30">
              <p className="kicker mb-3">已有系列</p>
              <div className="space-y-2 max-h-[420px] overflow-auto">
                {seriesList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSeriesId(item.id)}
                    className={`w-full text-left px-3 py-2 text-sm border transition-colors ${
                      selectedSeriesId === item.id
                        ? 'border-[var(--foreground)] text-[var(--foreground)]'
                        : 'border-[var(--subtle)] border-opacity-30 text-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
                {seriesList.length === 0 && <p className="text-xs text-[var(--muted)]">暂无系列</p>}
              </div>
            </div>
          </section>

          <section className="border border-[var(--subtle)] border-opacity-30 p-4">
            {!selectedSeries && (
              <p className="text-sm text-[var(--muted)]">请先在左侧创建或选择一个系列。</p>
            )}

            {selectedSeries && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="kicker">系列信息</p>
                  <input
                    value={selectedSeries.name}
                    onChange={(e) => setSeriesList((prev) => prev.map((item) => item.id === selectedSeries.id ? { ...item, name: e.target.value } : item))}
                    className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-3 py-2 text-sm outline-none"
                  />
                  <textarea
                    value={selectedSeries.description}
                    onChange={(e) => setSeriesList((prev) => prev.map((item) => item.id === selectedSeries.id ? { ...item, description: e.target.value } : item))}
                    rows={3}
                    className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-3 py-2 text-sm outline-none"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={updateSeries}
                      disabled={saving}
                      className="bg-[var(--foreground)] text-[var(--background)] px-4 py-2 text-sm disabled:opacity-50"
                    >
                      保存系列
                    </button>
                    <button
                      onClick={deleteSeries}
                      disabled={saving}
                      className="border border-red-500 text-red-500 px-4 py-2 text-sm disabled:opacity-50"
                    >
                      删除系列
                    </button>
                  </div>
                </div>

                <div className="space-y-3 border-t border-[var(--subtle)] border-opacity-30 pt-4">
                  <p className="kicker">加入文章</p>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-3 items-center">
                    <select
                      value={selectedPostId}
                      onChange={(e) => setSelectedPostId(e.target.value)}
                      className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-3 py-2 text-sm outline-none"
                    >
                      <option value="">选择文章</option>
                      {postOptions.map((post) => (
                        <option key={post.id} value={post.id}>
                          {post.title}
                        </option>
                      ))}
                    </select>
                    <input
                      value={customOrder}
                      onChange={(e) => setCustomOrder(e.target.value)}
                      placeholder="顺序(可选)"
                      className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-3 py-2 text-sm outline-none"
                    />
                    <button
                      onClick={addPostToSeries}
                      disabled={saving || !selectedPostId}
                      className="bg-[var(--foreground)] text-[var(--background)] px-4 py-2 text-sm disabled:opacity-50"
                    >
                      加入
                    </button>
                  </div>
                  <p className="text-xs text-[var(--muted)]">不填顺序时，自动按加入时间排在最后。</p>
                </div>

                <div className="space-y-3 border-t border-[var(--subtle)] border-opacity-30 pt-4">
                  <p className="kicker">系列文章</p>
                  <div className="divide-y divide-[var(--subtle)] divide-opacity-30">
                    {seriesPosts.map((item) => (
                      <div key={item.post_id} className="py-3 flex items-center gap-4">
                        <input
                          type="number"
                          min={1}
                          defaultValue={item.order_index}
                          onBlur={(e) => { void updateOrder(item.post_id, e.target.value) }}
                          className="w-16 border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-2 py-1 text-sm outline-none"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-snug">{item.post.title}</p>
                          <p className="text-xs text-[var(--muted)] mt-1">
                            {getTypeLabel(item.post.content_type)} · {item.post.slug}
                          </p>
                        </div>
                        <button
                          onClick={() => { void removeFromSeries(item.post_id) }}
                          className="kicker text-[var(--muted)] hover:text-red-500 transition-colors"
                        >
                          移除
                        </button>
                      </div>
                    ))}
                    {seriesPosts.length === 0 && (
                      <p className="text-sm text-[var(--muted)] py-2">当前系列还没有文章。</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
