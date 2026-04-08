'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (res.ok) {
      localStorage.setItem('user_token', data.token)
      localStorage.setItem('user_email', data.email)
      router.push('/dashboard')
    } else {
      setStatus('error')
      setMessage(data.error || '登录失败，请稍后重试。')
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <p className="kicker mb-8 text-center">登录</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱"
            className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--foreground)] transition placeholder:text-[var(--subtle)]"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--foreground)] transition placeholder:text-[var(--subtle)]"
          />

          {status === 'error' && (
            <p className="text-sm text-[var(--accent)]">{message}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-[var(--foreground)] text-[var(--background)] py-3 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {status === 'loading' ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-[var(--muted)]">
          <Link href="/forgot" className="hover:text-[var(--foreground)] transition-colors">
            忘记密码
          </Link>
          <Link href="/register" className="text-[var(--foreground)] hover:opacity-70 transition-opacity">
            注册账号
          </Link>
        </div>
      </div>
    </div>
  )
}
