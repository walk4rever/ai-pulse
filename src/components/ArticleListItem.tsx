import Link from 'next/link'
import type { Post } from '@/types'
import { getTypeLabel } from '@/lib/content'

type ListPost = Pick<
  Post,
  'id' | 'slug' | 'title' | 'excerpt' | 'published_at' | 'content_type'
>

interface ArticleListItemProps {
  post: ListPost
  showType?: boolean
  showExcerpt?: boolean
}

function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function ArticleListItem({
  post,
  showType = false,
  showExcerpt = true,
}: ArticleListItemProps) {
  return (
    <article className="py-7">
      <div className="flex items-baseline justify-between mb-3 gap-6">
        <Link href={`/post/${post.slug}`} className="group flex-1 min-w-0">
          <h3 className="font-serif text-lg md:text-xl font-medium leading-snug group-hover:text-[var(--accent)] transition-colors">
            {post.title}
          </h3>
        </Link>
        <div className="flex items-center gap-3 shrink-0">
          {showType && (
            <span className="kicker" style={{ color: 'var(--accent)' }}>
              {getTypeLabel(post.content_type)}
            </span>
          )}
          <span className="date">{formatDate(post.published_at)}</span>
        </div>
      </div>
      {showExcerpt && post.excerpt && (
        <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
      )}
    </article>
  )
}
