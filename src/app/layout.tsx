import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI早知道 | 精选AI资讯与深度分析',
  description: '每周精选AI领域最重要的进展，深度解析技术趋势与商业影响。',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${geist.className} bg-white text-gray-900 antialiased`}>
        <header className="border-b border-gray-100">
          <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="font-bold text-xl tracking-tight">AI早知道</a>
            <a
              href="/subscribe"
              className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              订阅
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-10">
          {children}
        </main>
        <footer className="border-t border-gray-100 mt-20">
          <div className="mx-auto max-w-2xl px-4 py-6 text-sm text-gray-400 flex justify-between">
            <span>© 2026 AI早知道</span>
            <a href="/subscribe" className="hover:text-gray-600">免费订阅</a>
          </div>
        </footer>
      </body>
    </html>
  )
}
