import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

function generateConfirmToken(email: string): string {
  return crypto
    .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(email)
    .digest('hex')
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, name } = body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '请输入有效的邮箱地址。' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // 检查是否已订阅
  const { data: existing } = await supabase
    .from('subscribers')
    .select('id, confirmed_at')
    .eq('email', email)
    .single()

  if (existing?.confirmed_at) {
    return NextResponse.json({ error: '该邮箱已订阅。' }, { status: 409 })
  }

  // 插入或更新订阅者
  const { error } = await supabase
    .from('subscribers')
    .upsert({ email, name: name || null, tier: 'free' }, { onConflict: 'email' })

  if (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: '订阅失败，请稍后重试。' }, { status: 500 })
  }

  // 发送确认邮件
  const token = generateConfirmToken(email)
  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/confirm?email=${encodeURIComponent(email)}&token=${token}`

  await resend.emails.send({
    from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
    to: email,
    subject: '请确认您的订阅 — AI早知道',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="font-size: 20px; font-weight: bold;">欢迎订阅 AI早知道 👋</h2>
        <p style="color: #555; line-height: 1.6;">
          ${name ? `${name}，你好！` : '你好！'}点击下方按钮确认订阅，开始接收每周AI精选资讯。
        </p>
        <a href="${confirmUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #000; color: #fff; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 500;">
          确认订阅 →
        </a>
        <p style="margin-top: 24px; font-size: 12px; color: #999;">
          如果你没有订阅过 AI早知道，请忽略此邮件。
        </p>
      </div>
    `,
  })

  return NextResponse.json({ message: '确认邮件已发送，请查收并点击确认链接。' })
}
