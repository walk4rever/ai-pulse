import { createServiceClient } from '@/lib/supabase/server'
import {
  generateConfirmationToken,
  hashConfirmationNonce,
} from '@/lib/subscription/confirmation-token'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '请求格式无效。' }, { status: 400 })
  }

  const { email, name } = body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '请输入有效的邮箱地址。' }, { status: 400 })
  }

  const confirmationSecret = process.env.EMAIL_CONFIRMATION_SECRET

  if (!confirmationSecret) {
    console.error('[subscribe] missing EMAIL_CONFIRMATION_SECRET')
    return NextResponse.json({ error: '订阅服务暂不可用，请稍后重试。' }, { status: 500 })
  }

  const supabase = await createServiceClient()
  const now = new Date()
  const confirmationNonce = crypto.randomBytes(16).toString('base64url')
  const token = generateConfirmationToken({
    email,
    nonce: confirmationNonce,
    secret: confirmationSecret,
    now,
  })
  const verificationResult = verifyStoredConfirmation({
    nonce: confirmationNonce,
    secret: confirmationSecret,
  })

  const { data: existing } = await supabase
    .from('ai_pulse_subscribers')
    .select('id, confirmed_at')
    .eq('email', email)
    .single()

  if (existing?.confirmed_at) {
    return NextResponse.json({ error: '该邮箱已订阅。' }, { status: 409 })
  }

  const { error } = await supabase
    .from('ai_pulse_subscribers')
    .upsert(
      {
        email,
        name: name || null,
        tier: 'free',
        confirmation_nonce_hash: verificationResult.hash,
        confirmation_expires_at: verificationResult.expiresAt,
      },
      { onConflict: 'email' }
    )

  if (error) {
    console.error('[subscribe] database upsert failed', {
      email,
      message: error.message,
    })
    return NextResponse.json({ error: '订阅失败，请稍后重试。' }, { status: 500 })
  }

  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/confirm?email=${encodeURIComponent(email)}&token=${token}`

  const resendResult = await resend.emails.send({
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

  if (resendResult.error) {
    console.error('[subscribe] resend send failed', {
      email,
      message: resendResult.error.message,
    })
    return NextResponse.json(
      { error: '确认邮件发送失败，请稍后重试。' },
      { status: 502 }
    )
  }

  const message = existing
    ? '确认邮件已重新发送，请查收并点击确认链接。'
    : '确认邮件已发送，请查收并点击确认链接。'

  return NextResponse.json({ message })
}

function verifyStoredConfirmation({
  nonce,
  secret,
}: {
  nonce: string
  secret: string
}) {
  const expiresAt = new Date(
    Date.now() + (Number(process.env.EMAIL_CONFIRMATION_TTL_SECONDS) || 60 * 60 * 24) * 1000
  ).toISOString()

  return {
    hash: hashConfirmationNonce({ nonce, secret }),
    expiresAt,
  }
}
