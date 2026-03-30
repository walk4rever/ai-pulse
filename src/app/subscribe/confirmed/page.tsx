import Link from 'next/link'

type ConfirmationStatus = 'success' | 'invalid' | 'expired' | 'error'

interface ConfirmationPageProps {
  searchParams: Promise<{ status?: string }>
}

const contentByStatus: Record<
  ConfirmationStatus,
  {
    title: string
    description: string
    tone: string
  }
> = {
  success: {
    title: '订阅确认成功',
    description: '你的邮箱已完成确认，后续将收到 AI早知道 的更新邮件。',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  },
  invalid: {
    title: '确认链接无效',
    description: '该链接不正确或已被篡改。请重新提交订阅以获取新的确认邮件。',
    tone: 'border-rose-200 bg-rose-50 text-rose-950',
  },
  expired: {
    title: '确认链接已过期',
    description: '为了保证安全，确认链接有有效期。请重新提交订阅，我们会发送新的确认邮件。',
    tone: 'border-amber-200 bg-amber-50 text-amber-950',
  },
  error: {
    title: '确认失败',
    description: '系统暂时无法完成确认，请稍后再试。如果问题持续，请重新订阅。',
    tone: 'border-rose-200 bg-rose-50 text-rose-950',
  },
}

function isConfirmationStatus(value?: string): value is ConfirmationStatus {
  return value === 'success' || value === 'invalid' || value === 'expired' || value === 'error'
}

export default async function ConfirmedPage({ searchParams }: ConfirmationPageProps) {
  const { status } = await searchParams
  const resolvedStatus: ConfirmationStatus = isConfirmationStatus(status) ? status : 'invalid'
  const content = contentByStatus[resolvedStatus]

  return (
    <div className="mx-auto max-w-xl py-12">
      <div className={`rounded-3xl border px-6 py-8 ${content.tone}`}>
        <h1 className="text-3xl font-bold">{content.title}</h1>
        <p className="mt-3 text-sm leading-6">{content.description}</p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/subscribe"
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            返回订阅
          </Link>
          <Link
            href="/"
            className="rounded-full border border-current px-5 py-2.5 text-sm font-medium"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
