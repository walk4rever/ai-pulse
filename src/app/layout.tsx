import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { NavUser } from '@/components/NavUser'
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
          <div className="px-5 md:px-6 py-6 md:py-12">
            {/* Top row: logo + actions (mobile: flex, desktop: grid cols 3 with centered nav) */}
            <div className="flex items-center justify-between md:grid md:grid-cols-3">
              <Link href="/" className="block">
                <Logo />
              </Link>
              {/* Desktop nav — center column */}
              <nav className="hidden md:flex items-center justify-center gap-6">
                <Link href="/brief" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">简讯</Link>
                <Link href="/analysis" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">深度</Link>
                <Link href="/cases" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">案例</Link>
                <Link href="/interview" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">访谈</Link>
                <Link href="/series" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">专题</Link>
              </nav>
              <div className="flex items-center justify-end gap-3 md:gap-4">
                <NavUser />
                <Link
                  href="/subscribe"
                  className="text-sm border border-[var(--foreground)] px-3 py-1.5 md:px-4 md:py-2 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
                >
                  订阅
                </Link>
              </div>
            </div>

            {/* Mobile nav — second row, horizontal scrollable */}
            <nav className="md:hidden mt-5 -mx-5 px-5 flex items-center gap-6 overflow-x-auto scrollbar-hide">
              <Link href="/brief" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors whitespace-nowrap">简讯</Link>
              <Link href="/analysis" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors whitespace-nowrap">深度</Link>
              <Link href="/cases" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors whitespace-nowrap">案例</Link>
              <Link href="/interview" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors whitespace-nowrap">访谈</Link>
              <Link href="/series" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors whitespace-nowrap">专题</Link>
            </nav>
          </div>
        </header>

        <main className="px-6 pb-20">{children}</main>

        <footer className="border-t border-[var(--subtle)] border-opacity-20">
          <div className="px-5 md:px-6 py-8 md:py-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <span className="text-sm">AI早知道 © 2026</span>
              <span className="text-xs text-[var(--subtle)]">·</span>
              <span className="text-xs text-[var(--subtle)]">Powered by Air7.fun</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/docs"
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                API
              </Link>
              <span className="text-[var(--subtle)] opacity-40 cursor-not-allowed" aria-disabled="true">
                RSS
              </span>
              <a
                href="mailto:walkklaw@gmail.com"
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                联系
              </a>
            </div>
          </div>
        </footer>
        </div>
      </body>
    </html>
  )
}
