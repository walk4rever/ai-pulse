import { createClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { IntelCalendar, type IntelDay } from './IntelCalendar'

export const revalidate = 300

export const metadata = {
  title: '情报 | AI早知道',
}

function parseYearMonth(value?: string): { year: number; month: number } | null {
  if (!value) return null
  const m = /^(\d{4})-(\d{2})$/.exec(value)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null
  return { year, month }
}

function parseDate(value?: string): { year: number; month: number } | null {
  if (!value) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null
  return { year, month }
}

function parseIntelContent(content: string): Pick<IntelDay, 'keywords' | 'signals' | 'image_url'> {
  try {
    const parsed = JSON.parse(content)
    return {
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      signals: Array.isArray(parsed.signals) ? parsed.signals : [],
      image_url: parsed.image_url ?? null,
    }
  } catch {
    return { keywords: [], signals: [], image_url: null }
  }
}

export default async function IntelPage({ searchParams }: { searchParams: Promise<{ d?: string; m?: string }> }) {
  const { d, m } = await searchParams
  const { hasPublicEnv } = getSupabaseEnv()
  if (!hasPublicEnv) {
    return <p className="text-sm text-[var(--muted)]">配置未完成。</p>
  }

  const now = new Date()
  const byDate = parseDate(d)
  const byMonth = parseYearMonth(m)
  const target = byDate ?? byMonth ?? { year: now.getFullYear(), month: now.getMonth() + 1 }
  const year = target.year
  const month = target.month
  const monthStart = new Date(year, month - 1, 1).toISOString()
  const monthEnd = new Date(year, month, 1).toISOString()

  const supabase = await createClient()
  const { data } = await supabase
    .from('ai_pulse_posts')
    .select('slug, excerpt, content, published_at')
    .eq('status', 'published')
    .eq('content_type', 'intel')
    .gte('published_at', monthStart)
    .lt('published_at', monthEnd)
    .order('published_at', { ascending: false })

  const days: IntelDay[] = (data ?? []).map((row) => {
    const date = row.published_at
      ? row.published_at.slice(0, 10)
      : row.slug.replace('intel-', '')
    return {
      date,
      overview: row.excerpt,
      ...parseIntelContent(row.content),
    }
  })

  return (
    <div>
      <div className="mb-8">
        <p className="kicker mb-2" style={{ color: 'var(--accent)' }}>Intel</p>
        <h1 className="font-serif text-3xl font-medium tracking-tight">情报</h1>
        <p className="mt-4 text-base md:text-lg text-[var(--muted)] leading-relaxed">
          每日 AI 信号精选 —— 追踪真正值得关注的变化，来自 HN、GitHub 与 arXiv。
        </p>
      </div>
      <IntelCalendar key={`${year}-${month}`} year={year} month={month} days={days} initialDate={d} />
    </div>
  )
}
