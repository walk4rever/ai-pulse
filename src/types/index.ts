export type PostStatus = 'draft' | 'published'
export type SubscriberTier = 'free' | 'paid'

export interface Post {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  is_premium: boolean
  status: PostStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Subscriber {
  id: string
  email: string
  name: string | null
  tier: SubscriberTier
  confirmed_at: string | null
  subscribed_at: string
}
