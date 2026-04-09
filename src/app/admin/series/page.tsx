'use client'

import { SeriesManager } from '@/app/admin/SeriesManager'

export default function AdminSeriesPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="text-lg font-semibold">专题管理</p>
          <a href="/admin" className="kicker text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            返回后台
          </a>
        </div>
        <SeriesManager />
      </div>
    </div>
  )
}
