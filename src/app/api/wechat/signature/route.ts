import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function sign(ticket: string, nonceStr: string, timestamp: number, url: string): string {
  const str = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`
  return createHash('sha1').update(str).digest('hex')
}

async function getTicketFromSupabase(): Promise<string> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('wechat_tokens')
    .select('value, expires_at')
    .eq('key', 'jsapi_ticket')
    .single()

  if (error || !data) throw new Error('jsapi_ticket not found in DB. Run the refresh script first.')

  if (new Date(data.expires_at) < new Date()) {
    throw new Error('jsapi_ticket has expired. Check the refresh script on Alibaba Cloud.')
  }

  return data.value
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  try {
    const ticket = await getTicketFromSupabase()
    const nonceStr = randomBytes(8).toString('hex')
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = sign(ticket, nonceStr, timestamp, url)
    const appId = process.env.WECHAT_APP_ID!

    return NextResponse.json({ appId, timestamp, nonceStr, signature })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
