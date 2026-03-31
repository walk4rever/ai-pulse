'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError('密码错误')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm">
        <p className="kicker mb-6 text-center">管理后台</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            required
            className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--foreground)] transition"
          />
          {error && <p className="text-sm text-[var(--accent)]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--foreground)] text-[var(--background)] py-3 text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {loading ? '...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
