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
      <div className="text-center py-16">
        <div className="text-4xl mb-4">✉️</div>
        <h1 className="text-2xl font-bold mb-2">请查收确认邮件</h1>
        <p className="text-gray-500">{message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">订阅 AI早知道</h1>
      <p className="text-gray-500 mb-8">
        每周精选AI领域最重要的进展，深度解析技术趋势与商业影响。完全免费。
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            姓名（可选）
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="你的名字"
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black transition-colors"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            邮箱地址 <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black transition-colors"
          />
        </div>

        {status === 'error' && (
          <p className="text-sm text-red-500">{message}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-full bg-black py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? '处理中...' : '免费订阅'}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-400 text-center">
        订阅即表示同意接收邮件。随时可以取消订阅。
      </p>
    </div>
  )
}
