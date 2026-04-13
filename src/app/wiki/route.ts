import { loadWikiResponse } from '@/lib/wiki-site'

export const dynamic = 'force-dynamic'

function normalizeRootHtml(html: string) {
  return html
    .replaceAll('href="./', 'href="/wiki/')
    .replaceAll('src="./', 'src="/wiki/')
    .replaceAll('fetch("./', 'fetch("/wiki/')
    .replaceAll("fetch('./", "fetch('/wiki/")
    .replaceAll('href="."', 'href="/wiki"')
}

export async function GET() {
  const response = await loadWikiResponse(undefined)

  if (!response) {
    return new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  const body = typeof response.body === 'string' && contentType.includes('text/html')
    ? normalizeRootHtml(response.body)
    : response.body

  return new Response(body, {
    status: response.status,
    headers: response.headers,
  })
}
