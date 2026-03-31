'use client'

import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="kicker hover:text-[var(--foreground)] transition-colors"
    >
      ← 返回
    </button>
  )
}
