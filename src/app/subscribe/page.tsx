'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function SubscribePage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()

    if (res.ok) {
      setStatus('success')
      setMessage(data.message)
    } else {
      setStatus('error')
      setMessage(data.error || '订阅失败，请稍后重试。')
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-2xl">
        <div className="text-center py-12">
          <p className="kicker mb-6">已发送确认邮件</p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            请查收确认邮件
          </h1>
          <p className="mt-6 text-[var(--muted)] leading-relaxed max-w-md mx-auto">{message}</p>
          <div className="mt-10">
            <Link href="/" className="kicker hover:text-[var(--foreground)] transition-colors">
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-12">
        <Link href="/" className="kicker hover:text-[var(--foreground)] transition-colors">
          ← AI早知道
        </Link>
      </div>

      <div>
        <p className="kicker mb-4">Subscribe</p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight">
          订阅 AI早知道
        </h1>
        <p className="mt-6 text-lg text-[var(--muted)] leading-relaxed max-w-xl">
          每周一次，收到一封面向 AI 工程师的研究型简报：筛掉噪音，只留下真正重要的变化与判断。完全免费。
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-4 py-3 text-[0.95rem] outline-none transition focus:border-[var(--foreground)] placeholder:text-[var(--subtle)]"
            />
          </div>

          {status === 'error' && (
            <p className="text-sm text-[var(--accent)]">{message}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-[var(--foreground)] text-[var(--background)] py-3.5 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {status === 'loading' ? '处理中...' : '免费订阅'}
          </button>
        </form>

        <p className="kicker mt-8 text-center">订阅即表示同意接收邮件。随时可以取消订阅。</p>
      </div>
    </div>
  )
}
