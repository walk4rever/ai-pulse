import type { PostContentType } from '@/types'

export function getTypeLabel(type: PostContentType | string | null): string {
  switch (type) {
    case 'daily': return '快讯'
    case 'weekly': return '周刊'
    case 'series': return '专题'
    case 'interview': return '访谈'
    default: return ''
  }
}
