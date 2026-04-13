import { existsSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const WIKI_PUBLIC_DIR = path.resolve(/* turbopackIgnore: true */ process.cwd(), 'wiki-site', 'public')

const TEXT_EXTENSIONS = new Set([
  '.html',
  '.css',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.xml',
  '.txt',
  '.svg',
  '.map',
  '.webmanifest',
  '.rss',
  '.atom',
])

function ensureInsideWikiPublic(candidate: string) {
  const root = WIKI_PUBLIC_DIR.endsWith(path.sep) ? WIKI_PUBLIC_DIR : `${WIKI_PUBLIC_DIR}${path.sep}`
  return candidate === WIKI_PUBLIC_DIR || candidate.startsWith(root)
}

function detectContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.js':
    case '.mjs':
    case '.cjs':
      return 'application/javascript; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.xml':
    case '.rss':
    case '.atom':
      return 'application/xml; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.txt':
      return 'text/plain; charset=utf-8'
    case '.webmanifest':
      return 'application/manifest+json; charset=utf-8'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.gif':
      return 'image/gif'
    case '.webp':
      return 'image/webp'
    case '.ico':
      return 'image/x-icon'
    case '.woff':
      return 'font/woff'
    case '.woff2':
      return 'font/woff2'
    case '.mp4':
      return 'video/mp4'
    case '.webm':
      return 'video/webm'
    default:
      return 'application/octet-stream'
  }
}

function normalizeSlug(segments: string[] | undefined) {
  if (!segments || segments.length === 0) return ''
  return path.posix.join(...segments)
}

function candidateFiles(slug: string) {
  const normalized = slug ? slug.replace(/^\/+/, '') : ''
  const basePath = path.resolve(WIKI_PUBLIC_DIR, normalized)
  const candidates = new Set<string>()

  if (!normalized || normalized === '.') {
    candidates.add(path.resolve(WIKI_PUBLIC_DIR, 'index.html'))
  } else {
    candidates.add(basePath)
    candidates.add(`${basePath}.html`)
    candidates.add(path.join(basePath, 'index.html'))
  }

  return [...candidates].filter(ensureInsideWikiPublic)
}

function findExistingFile(segments: string[] | undefined) {
  const slug = normalizeSlug(segments)
  for (const candidate of candidateFiles(slug)) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate
    }
  }
  return null
}

export async function loadWikiResponse(segments: string[] | undefined) {
  const filePath = findExistingFile(segments) ?? findExistingFile(['404'])
  if (!filePath) return null

  const body = await readFile(filePath)
  const contentType = detectContentType(filePath)
  const isText = TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase())
  const headers = new Headers({
    'Content-Type': contentType,
    'Cache-Control': isText ? 'no-cache' : 'public, max-age=31536000, immutable',
  })

  return {
    body: isText ? body.toString('utf8') : body,
    headers,
    status: filePath.endsWith(`${path.sep}404.html`) || path.basename(filePath) === '404.html' ? 404 : 200,
  }
}
