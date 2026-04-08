'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    })

    const data = await res.json()

    if (res.ok) {
      setStatus('success')
    } else {
      setStatus('error')
      setMessage(data.error || '注册失败，请稍后重试。')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-sm text-center">
          <p className="kicker mb-6">验证邮件已发送</p>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            请查收 <span className="text-[var(--foreground)]">{email}</span> 的邮件，点击链接完成验证后即可登录。
          </p>
          <div className="mt-8">
            <Link href="/login" className="kicker hover:text-[var(--foreground)] transition-colors">
              前往登录 →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <p className="kicker mb-8 text-center">注册</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱"
            className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--foreground)] transition placeholder:text-[var(--subtle)]"
          />
          <div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="用户名（仅小写字母、数字、连字符）"
              minLength={3}
              maxLength={30}
              pattern="[a-z0-9-]{3,30}"
              className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--foreground)] transition placeholder:text-[var(--subtle)]"
            />
            <p className="mt-1 text-xs text-[var(--muted)]">用于文章署名，注册后可修改</p>
          </div>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码（至少 8 位）"
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
            {status === 'loading' ? '处理中...' : '注册'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          已有账号？{' '}
          <Link href="/login" className="text-[var(--foreground)] hover:opacity-70 transition-opacity">
            登录
          </Link>
        </p>
      </div>
    </div>
  )
}
