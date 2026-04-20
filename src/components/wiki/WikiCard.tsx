import Link from 'next/link'
import type { WikiPage } from '@/lib/wiki'
import { CATEGORY_LABELS, formatWikiDate } from '@/lib/wiki'

interface WikiCardProps {
  page: WikiPage
}

export function WikiCard({ page }: WikiCardProps) {
  const { slug, category, frontmatter, excerpt } = page
  const date = formatWikiDate(frontmatter.updated ?? frontmatter.created)

  return (
    <Link
      href={`/wiki/${category}/${slug}`}
      className="group block rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 hover:border-[var(--ring-deep)] hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-md bg-[var(--surface-sand)] text-[var(--muted)]">
          {CATEGORY_LABELS[category]}
        </span>
        {date && (
          <span className="text-xs text-[var(--subtle)] shrink-0">{date}</span>
        )}
      </div>

      <h3 className="font-serif text-base font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors leading-snug mb-2">
        {frontmatter.title}
      </h3>

      <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-3">
        {excerpt}
      </p>

      {frontmatter.tags && frontmatter.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {frontmatter.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs text-[var(--subtle)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
