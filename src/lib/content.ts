import type { PostContentType } from '@/types'

export function getTypeLabel(type: PostContentType | string | null): string {
  switch (type) {
    case 'brief': return '简讯'
    case 'analysis': return '深度'
    case 'cases': return '案例'
    case 'series': return '系列'
    case 'interview': return '访谈'
    default: return ''
  }
}
