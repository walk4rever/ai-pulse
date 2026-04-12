'use client'

import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="kicker hover:text-[var(--accent)] transition-colors"
      style={{ borderRadius: 0 }}
    >
      ← 返回
    </button>
  )
}
