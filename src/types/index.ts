export type PostStatus = 'draft' | 'published'
export type PostContentType = 'brief' | 'analysis' | 'case' | 'interview'
export type SubscriberTier = 'free' | 'paid'
export type SubscriberStatus = 'pending' | 'active' | 'unsubscribed'

export interface Post {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string
  is_premium: boolean
  status: PostStatus
  content_type: PostContentType
  featured: boolean
  series_slug: string | null
  author_slug: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Subscriber {
  id: string
  email: string
  name: string | null
  tier: SubscriberTier
  status: SubscriberStatus
  stripe_customer_id?: string | null
  confirmed_at: string | null
  unsubscribed_at?: string | null
  subscribed_at: string
  confirmation_nonce_hash?: string | null
  confirmation_expires_at?: string | null
}
