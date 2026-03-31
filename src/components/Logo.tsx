interface LogoProps {
  size?: number
  showWordmark?: boolean
}

/**
 * AI早知道 logo mark
 *
 * Mark: geometric abstraction of 早 (early/morning)
 *   日 (sun) — outer rectangle + inner horizontal
 *   十 (ground) — wide horizontal + short vertical descender
 */
export function Logo({ size = 22, showWordmark = true }: LogoProps) {
  const h = Math.round(size * 1.27)

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={h}
        viewBox="0 0 22 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* 日 — outer rectangle */}
        <rect x="2" y="1" width="18" height="11" rx="0.75" stroke="currentColor" strokeWidth="1.75" />
        {/* 日 — inner horizontal (bisects the rectangle) */}
        <line x1="2" y1="6.5" x2="20" y2="6.5" stroke="currentColor" strokeWidth="1.75" />
        {/* 十 — long horizontal baseline */}
        <line x1="0" y1="17" x2="22" y2="17" stroke="currentColor" strokeWidth="1.75" />
        {/* 十 — vertical descender */}
        <line x1="11" y1="17" x2="11" y2="27" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>

      {showWordmark && (
        <span
          style={{ fontFamily: '"Noto Serif SC", "Source Han Serif SC", serif', fontWeight: 600 }}
          className="text-xl tracking-tight leading-none"
        >
          AI早知道
        </span>
      )}
    </div>
  )
}
