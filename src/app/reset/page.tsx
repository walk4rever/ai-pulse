'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ResetForm() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const nonce = searchParams.get('nonce') ?? ''
  const invalidLink = !email || !nonce

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (invalidLink) {
      setStatus('error')
      setMessage('链接无效，请重新申请。')
      return
    }
    if (password !== confirm) {
      setStatus('error')
      setMessage('两次密码不一致')
      return
    }
    setStatus('loading')
    setMessage('')

    const res = await fetch('/api/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nonce, new_password: password }),
    })

    const data = await res.json()

    if (res.ok) {
      setStatus('success')
    } else {
      setStatus('error')
      setMessage(data.error || '重置失败，请重新申请。')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <p className="kicker mb-6">密码已重置</p>
        <p className="text-sm text-[var(--muted)] mb-8">请使用新密码登录。</p>
        <Link
          href="/login"
          className="bg-[var(--foreground)] text-[var(--background)] px-6 py-3 text-sm font-medium hover:opacity-80 transition-opacity"
        >
          前往登录 →
        </Link>
      </div>
    )
  }

  if (invalidLink) {
    return (
      <div className="text-center">
        <p className="kicker mb-6">链接无效</p>
        <Link href="/forgot" className="kicker hover:text-[var(--foreground)] transition-colors">
          重新申请 →
        </Link>
      </div>
    )
  }

  return (
    <>
      <p className="kicker mb-8 text-center">设置新密码</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="新密码（至少 8 位）"
          className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--foreground)] transition placeholder:text-[var(--subtle)]"
        />
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="确认新密码"
          className="w-full border border-[var(--subtle)] border-opacity-30 bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--foreground)] transition placeholder:text-[var(--subtle)]"
        />
        {status === 'error' && message && (
          <p className="text-sm text-[var(--accent)]">{message}</p>
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-[var(--foreground)] text-[var(--background)] py-3 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {status === 'loading' ? '处理中...' : '确认重置'}
        </button>
      </form>
    </>
  )
}

export default function ResetPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <Suspense fallback={<p className="text-sm text-[var(--muted)] text-center">加载中...</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
