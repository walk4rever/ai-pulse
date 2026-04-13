import { NextRequest } from 'next/server'
import { loadWikiResponse } from '@/lib/wiki-site'
import { transformWikiHtml } from '@/lib/wiki-theme'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await context.params
  const response = await loadWikiResponse(slug)

  if (!response) {
    return new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  const body = typeof response.body === 'string' && contentType.includes('text/html')
    ? transformWikiHtml(response.body)
    : response.body

  return new Response(body, {
    status: response.status,
    headers: response.headers,
  })
}
