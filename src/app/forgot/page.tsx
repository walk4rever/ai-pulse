'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    await fetch('/api/auth/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-sm text-center">
          <p className="kicker mb-6">邮件已发送</p>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            如果该邮箱已注册，你将收到一封重置密码的邮件。请在 1 小时内完成重置。
          </p>
          <div className="mt-8">
            <Link href="/login" className="kicker hover:text-[var(--foreground)] transition-colors">
              返回登录 →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <p className="kicker mb-8 text-center">忘记密码</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="注册邮箱"
            className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--foreground)] transition placeholder:text-[var(--subtle)]"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-[var(--foreground)] text-[var(--background)] py-3 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {status === 'loading' ? '发送中...' : '发送重置邮件'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link href="/login" className="hover:text-[var(--foreground)] transition-colors">
            返回登录
          </Link>
        </p>
      </div>
    </div>
  )
}
