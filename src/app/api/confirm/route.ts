import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function verifyToken(email: string, token: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(email)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  if (!email || !token) {
    return NextResponse.redirect(new URL('/?confirmed=invalid', req.url))
  }

  if (!verifyToken(email, token)) {
    return NextResponse.redirect(new URL('/?confirmed=invalid', req.url))
  }

  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('subscribers')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('email', email)
    .is('confirmed_at', null)

  if (error) {
    console.error('Confirm error:', error)
    return NextResponse.redirect(new URL('/?confirmed=error', req.url))
  }

  return NextResponse.redirect(new URL('/?confirmed=true', req.url))
}
