import type { PostContentType } from '@/types'

interface AuthorConfig {
  authorSlug: string
  allowedTypes: PostContentType[]
}

function buildKeyMap(): Map<string, AuthorConfig> {
  const map = new Map<string, AuthorConfig>()

  const entries: Array<[string, AuthorConfig]> = [
    [
      process.env.API_KEY_RAFA ?? '',
      { authorSlug: 'rafa', allowedTypes: ['series', 'interview'] },
    ],
    [
      process.env.API_KEY_MONICA ?? '',
      { authorSlug: 'monica', allowedTypes: ['analysis'] },
    ],
    [
      process.env.API_KEY_DWIGHT ?? '',
      { authorSlug: 'dwight', allowedTypes: ['brief'] },
    ],
    [
      process.env.API_KEY_ROSS ?? '',
      { authorSlug: 'ross', allowedTypes: ['brief'] },
    ],
  ]

  for (const [key, config] of entries) {
    if (key) map.set(key, config)
  }

  return map
}

export function resolveAuthor(
  bearerToken: string | null
): AuthorConfig | null {
  if (!bearerToken) return null
  const map = buildKeyMap()
  return map.get(bearerToken) ?? null
}
