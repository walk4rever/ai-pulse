import type { Metadata } from 'next'
import { getWikiPages, WIKI_CATEGORIES, CATEGORY_LABELS } from '@/lib/wiki'
import { WikiCard } from '@/components/wiki/WikiCard'

export const metadata: Metadata = {
  title: 'Wiki · AI早知道',
  description: 'AI 概念、工具与研究的知识库',
}

export const revalidate = 3600

export default async function WikiPage() {
  const allPages = await getWikiPages()

  const grouped = WIKI_CATEGORIES.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    pages: allPages.filter((p) => p.category === cat),
  })).filter((g) => g.pages.length > 0)

  return (
    <div className="py-8">
      <div className="mb-10">
        <h1 className="font-serif text-2xl font-medium text-[var(--foreground)] mb-2">Wiki</h1>
        <p className="text-sm text-[var(--muted)]">
          AI 概念、工具与研究的知识库 · {allPages.length} 篇
        </p>
      </div>

      <div className="space-y-12">
        {grouped.map(({ category, label, pages }) => (
          <section key={category}>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-sm font-semibold text-[var(--foreground-soft)] uppercase tracking-wide">
                {label}
              </h2>
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-[var(--subtle)]">{pages.length}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pages.map((page) => (
                <WikiCard key={`${page.category}/${page.slug}`} page={page} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
