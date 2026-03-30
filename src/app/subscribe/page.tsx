'use client'

import { useState } from 'react'

export default function SubscribePage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
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
      <div className="editorial-card mx-auto max-w-[42rem] rounded-[2rem] px-8 py-14 text-center">
        <div className="text-4xl">✉️</div>
        <h1 className="mt-4 text-[2rem] font-semibold tracking-[-0.04em] text-[var(--foreground)]">请查收确认邮件</h1>
        <p className="mx-auto mt-4 max-w-xl text-[1rem] leading-8 text-[var(--muted)]">{message}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[42rem] py-6">
      <div className="editorial-card rounded-[2rem] px-8 py-10 lg:px-10 lg:py-12">
        <p className="text-[0.82rem] uppercase tracking-[0.12em] text-[var(--subtle)]">Subscribe</p>
        <h1 className="mt-4 text-[2.2rem] font-semibold leading-[1.18] tracking-[-0.05em] text-[var(--foreground)]">
          订阅 AI早知道
        </h1>
        <p className="mt-4 max-w-2xl text-[1.05rem] leading-8 text-[var(--muted)]">
          每周一次，收到一封面向 AI 工程师的研究型简报：筛掉噪音，只留下真正重要的变化与判断。完全免费。
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-[var(--muted)]">
              姓名（可选）
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你的名字"
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[0.98rem] outline-none transition focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--muted)]">
              邮箱地址 <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[0.98rem] outline-none transition focus:border-[var(--accent)]"
            />
          </div>

          {status === 'error' && <p className="text-sm text-[#8A2D2D]">{message}</p>}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-full bg-[var(--accent)] py-3 text-sm font-medium text-white transition hover:opacity-92 disabled:opacity-50"
          >
            {status === 'loading' ? '处理中...' : '免费订阅'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-[var(--subtle)]">
          订阅即表示同意接收邮件。随时可以取消订阅。
        </p>
      </div>
    </div>
  )
}
