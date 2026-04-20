'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/wiki'

interface WikiTocProps {
  items: TocItem[]
}

export function WikiToc({ items }: WikiTocProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-20% 0% -70% 0%' },
    )

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav className="text-sm">
      <p className="text-xs font-medium text-[var(--subtle)] uppercase tracking-wide mb-3">
        目录
      </p>
      <ul className="space-y-1.5">
        {items.map(({ id, text, level }) => (
          <li key={id} style={{ paddingLeft: `${(level - 2) * 12}px` }}>
            <a
              href={`#${id}`}
              className={`block leading-snug transition-colors hover:text-[var(--accent)] ${
                activeId === id
                  ? 'text-[var(--accent)] font-medium'
                  : 'text-[var(--muted)]'
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
