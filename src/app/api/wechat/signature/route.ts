import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const APP_ID = process.env.WECHAT_APP_ID!
const APP_SECRET = process.env.WECHAT_APP_SECRET!

// In-memory cache for access_token and jsapi_ticket (TTL: 7000s < 7200s)
const cache: { accessToken?: string; ticket?: string; expiresAt?: number } = {}

async function getAccessToken(): Promise<string> {
  if (cache.accessToken && cache.expiresAt && Date.now() < cache.expiresAt) {
    return cache.accessToken
  }
  const res = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`
  )
  const data = await res.json()
  if (!data.access_token) throw new Error(`WeChat token error: ${JSON.stringify(data)}`)
  cache.accessToken = data.access_token
  cache.expiresAt = Date.now() + 7000 * 1000
  cache.ticket = undefined
  return cache.accessToken!
}

async function getJsapiTicket(): Promise<string> {
  if (cache.ticket && cache.expiresAt && Date.now() < cache.expiresAt) {
    return cache.ticket
  }
  const token = await getAccessToken()
  const res = await fetch(
    `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`
  )
  const data = await res.json()
  if (!data.ticket) throw new Error(`WeChat ticket error: ${JSON.stringify(data)}`)
  cache.ticket = data.ticket
  return cache.ticket!
}

function sign(ticket: string, nonceStr: string, timestamp: number, url: string): string {
  const str = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`
  return createHash('sha1').update(str).digest('hex')
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  try {
    const ticket = await getJsapiTicket()
    const nonceStr = randomBytes(8).toString('hex')
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = sign(ticket, nonceStr, timestamp, url)

    return NextResponse.json({ appId: APP_ID, timestamp, nonceStr, signature })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
