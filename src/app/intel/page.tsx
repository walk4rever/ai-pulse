import { createClient } from '@/lib/supabase/server'
import { getSupabaseEnv } from '@/lib/supabase/env'
import { IntelCalendar, type IntelDay } from './IntelCalendar'

export const revalidate = 300

export const metadata = {
  title: '情报 | AI早知道',
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

export default async function IntelPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams
  const { hasPublicEnv } = getSupabaseEnv()
  if (!hasPublicEnv) {
    return <p className="text-sm text-[var(--muted)]">配置未完成。</p>
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
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
        <p className="kicker mb-2" style={{ color: 'var(--accent)' }}>每日信号</p>
        <h1 className="font-serif text-3xl font-medium tracking-tight">情报</h1>
      </div>
      <IntelCalendar year={year} month={month} days={days} initialDate={d} />
    </div>
  )
}
