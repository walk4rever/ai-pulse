import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI早知道 | 面向 AI 工程师的周刊与深度研究',
  description: '不是追所有 AI 新闻，而是解释真正重要的变化。给 AI 工程师的每周精选、深度分析与长期判断。',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${geist.className} editorial-shell text-[var(--foreground)] antialiased`}>
        <header className="border-b border-[var(--border)]/90 bg-[color:rgba(248,243,235,0.88)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-[58rem] items-start justify-between px-5 py-5 lg:px-8">
            <div>
              <p className="editorial-kicker">AI Research Letter</p>
              <Link href="/" className="mt-2 block text-[1.7rem] font-semibold tracking-[-0.05em] text-[var(--foreground)]">
                AI早知道
              </Link>
              <p className="mt-1 max-w-md text-[0.95rem] leading-6 text-[var(--muted)]">
                面向 AI 工程师的周刊、系列研究与长期判断。
              </p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Link href="/" className="text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]">
                首页
              </Link>
              <Link
                href="/subscribe"
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:border-[var(--accent)]/35 hover:bg-white"
              >
                订阅周刊
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[58rem] px-5 py-10 lg:px-8 lg:py-14">{children}</main>
        <footer className="mt-24 border-t border-[var(--border)]/90">
          <div className="mx-auto flex max-w-[58rem] flex-col gap-6 px-5 py-8 text-sm text-[var(--subtle)] lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div>
              <p className="editorial-kicker">AI早知道</p>
              <p className="mt-2 font-medium text-[var(--muted)]">© 2026 AI早知道</p>
              <p className="mt-1 max-w-md">给 AI 工程师的周刊、深度研究与长期判断。</p>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/subscribe" className="transition hover:text-[var(--foreground)]">
                免费订阅
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
