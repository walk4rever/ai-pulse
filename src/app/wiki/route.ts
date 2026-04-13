import { loadWikiResponse } from '@/lib/wiki-site'
import { transformWikiHtml } from '@/lib/wiki-theme'

export const dynamic = 'force-dynamic'

export async function GET() {
  const response = await loadWikiResponse(undefined)

  if (!response) {
    return new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  const body = typeof response.body === 'string' && contentType.includes('text/html')
    ? transformWikiHtml(response.body, { root: true })
    : response.body

  return new Response(body, {
    status: response.status,
    headers: response.headers,
  })
}
