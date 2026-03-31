-- AI Pulse posts table
CREATE TABLE IF NOT EXISTS ai_pulse_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  content_type TEXT NOT NULL DEFAULT 'daily' CHECK (content_type IN ('daily', 'weekly', 'series', 'interview')),
  featured BOOLEAN NOT NULL DEFAULT false,
  series_slug TEXT,
  author_slug TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Pulse subscribers table
CREATE TABLE IF NOT EXISTS ai_pulse_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'paid')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed')),
  stripe_customer_id TEXT,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  confirmation_nonce_hash TEXT,
  confirmation_expires_at TIMESTAMPTZ,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Pulse email send log
CREATE TABLE IF NOT EXISTS ai_pulse_email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES ai_pulse_posts(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES ai_pulse_subscribers(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_pulse_posts_updated_at
  BEFORE UPDATE ON ai_pulse_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: AI Pulse posts are publicly readable when published
ALTER TABLE ai_pulse_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published ai_pulse_posts" ON ai_pulse_posts
  FOR SELECT USING (status = 'published');

-- RLS: AI Pulse subscribers can only be inserted/updated via service role
ALTER TABLE ai_pulse_subscribers ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_pulse_posts_status_published_at ON ai_pulse_posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_pulse_posts_content_type_published_at ON ai_pulse_posts (content_type, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_pulse_posts_featured_published_at ON ai_pulse_posts (featured, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_ai_pulse_posts_series_slug_published_at ON ai_pulse_posts (series_slug, published_at DESC) WHERE series_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_pulse_subscribers_email ON ai_pulse_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_ai_pulse_subscribers_confirmed ON ai_pulse_subscribers (confirmed_at) WHERE confirmed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_pulse_subscribers_status ON ai_pulse_subscribers (status);

-- Grants for Supabase API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ai_pulse_posts TO anon, authenticated;
GRANT ALL ON ai_pulse_subscribers TO service_role;
GRANT ALL ON ai_pulse_email_sends TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, service_role;
