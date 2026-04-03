import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI早知道 | 面向 AI 工程师的周刊与深度研究',
  description: '不是追所有 AI 新闻，而是解释真正重要的变化。给 AI 工程师的每周精选、深度分析与长期判断。',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <div className="mx-auto max-w-3xl bg-[var(--background)]">
        <header>
          <div className="px-6 py-12">
            <div className="grid grid-cols-3 items-center">
              <Link href="/" className="block">
                <Logo />
              </Link>
              <nav className="flex items-center justify-center gap-6">
                <Link href="/latest" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">最新</Link>
                <Link href="/weekly" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">周刊</Link>
                <Link href="/series" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">系列</Link>
              </nav>
              <div className="flex justify-end">
                <Link
                  href="/subscribe"
                  className="text-sm border border-[var(--foreground)] px-4 py-2 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
                >
                  订阅
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 pb-20">{children}</main>

        <footer className="border-t border-[var(--subtle)] border-opacity-20">
          <div className="px-6 py-10 flex items-center justify-center gap-4">
            <span className="text-sm text-[var(--muted)]">AI早知道 © 2026</span>
            <span className="text-xs text-[var(--subtle)]">Powered by Air7.fun</span>
          </div>
        </footer>
        </div>
      </body>
    </html>
  )
}
