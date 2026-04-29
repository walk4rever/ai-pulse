interface ListPageHeaderProps {
  kicker: string
  title: string
  description?: string
  count?: number
}

export function ListPageHeader({ kicker, title, description, count }: ListPageHeaderProps) {
  return (
    <header className="mb-14 pb-10 border-b border-[var(--border)]">
      <p className="kicker mb-5" style={{ color: 'var(--accent)' }}>
        {kicker}
      </p>
      <h1 className="font-serif text-4xl md:text-5xl font-medium leading-[1.15] tracking-tight text-[var(--foreground)]">
        {title}
      </h1>
      {description && (
        <p className="mt-6 text-base md:text-lg text-[var(--muted)] leading-relaxed">
          {description}
        </p>
      )}
      {typeof count === 'number' && (
        <p className="mt-6 date">共 {count} 篇</p>
      )}
    </header>
  )
}
