'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Agent {
  id: string
  name: string
  status: string
  created_at: string
}

function formatDate(value: string) {
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function DashboardPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<{ agentName: string; key: string } | null>(null)
  const [error, setError] = useState('')

  function getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('user_token') : null
  }

  async function fetchAgents() {
    const token = getToken()
    if (!token) { router.push('/login'); return }

    const res = await fetch('/api/agents', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 401) { router.push('/login'); return }

    const data = await res.json()
    setAgents(data.agents ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchAgents() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    setNewKey(null)

    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ name: newName.trim() }),
    })

    const data = await res.json()

    if (res.ok) {
      setNewKey({ agentName: data.agent.name, key: data.api_key })
      setNewName('')
      await fetchAgents()
    } else {
      setError(data.error || '创建失败')
    }
    setCreating(false)
  }

  async function handleRevoke(id: string, name: string) {
    if (!confirm(`确认撤销 Agent「${name}」的 Key？此操作不可恢复。`)) return

    const res = await fetch(`/api/agents/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })

    if (res.ok) await fetchAgents()
  }

  function handleLogout() {
    localStorage.removeItem('user_token')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-[var(--muted)]">加载中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <p className="kicker">控制台</p>
        <button
          onClick={handleLogout}
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          退出登录
        </button>
      </div>

      {/* New key banner */}
      {newKey && (
        <div className="mb-10 border border-[var(--foreground)] p-5">
          <p className="kicker mb-2">Agent「{newKey.agentName}」创建成功</p>
          <p className="text-xs text-[var(--muted)] mb-3">
            API Key 仅显示一次，请立即复制保存。
          </p>
          <code className="block text-sm break-all bg-[oklch(0.95_0_0)] px-3 py-2 select-all">
            {newKey.key}
          </code>
          <button
            onClick={() => setNewKey(null)}
            className="mt-4 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            已保存，关闭
          </button>
        </div>
      )}

      {/* Agent list */}
      <section className="mb-12">
        <p className="kicker mb-2">我的 Agent</p>
        <p className="text-sm text-[var(--muted)] mb-6">{agents.length} / 3 个</p>

        {agents.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-6">还没有 Agent，创建第一个吧。</p>
        ) : (
          <div className="divide-y divide-[oklch(0.85_0_0)]">
            {agents.map((agent) => (
              <div key={agent.id} className="py-5 flex items-center gap-6">
                <div className="flex-1">
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{formatDate(agent.created_at)}</p>
                </div>
                <span className="kicker">{agent.status === 'active' ? '运行中' : '已撤销'}</span>
                {agent.status === 'active' && (
                  <button
                    onClick={() => handleRevoke(agent.id, agent.name)}
                    className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    撤销
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create agent */}
      {agents.filter((a) => a.status === 'active').length < 3 && (
        <section className="border-t border-[oklch(0.85_0_0)] pt-10">
          <p className="kicker mb-6">创建 Agent</p>
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Agent 名称"
              required
              className="flex-1 border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--foreground)] transition placeholder:text-[var(--subtle)]"
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-[var(--foreground)] text-[var(--background)] px-6 py-3 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {creating ? '...' : '创建'}
            </button>
          </form>
          {error && <p className="mt-3 text-sm text-[var(--accent)]">{error}</p>}
          <p className="mt-4 text-xs text-[var(--muted)]">
            创建后 API Key 只显示一次，请妥善保存。
          </p>
        </section>
      )}

      {agents.filter((a) => a.status === 'active').length >= 3 && (
        <p className="text-sm text-[var(--muted)] border-t border-[oklch(0.85_0_0)] pt-8">
          已达到最大 Agent 数量（3 个）。撤销一个后可以创建新的。
        </p>
      )}
    </div>
  )
}
