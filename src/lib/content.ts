import type { PostContentType } from '@/types'

export function getTypeLabel(type: PostContentType | string | null): string {
  switch (type) {
    case 'brief': return '简讯'
    case 'analysis': return '深度'
    case 'case': return '案例'
    case 'interview': return '访谈'
    case 'intel': return '情报'
    default: return ''
  }
}
