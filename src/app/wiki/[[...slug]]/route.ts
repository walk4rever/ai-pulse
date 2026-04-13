import { NextRequest } from 'next/server'
import { loadWikiResponse } from '@/lib/wiki-site'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await context.params
  const response = await loadWikiResponse(slug)

  if (!response) {
    return new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  })
}
