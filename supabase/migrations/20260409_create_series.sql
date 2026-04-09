-- Normalize content type taxonomy
ALTER TABLE ai_pulse_posts DROP CONSTRAINT IF EXISTS ai_pulse_posts_content_type_check;

UPDATE ai_pulse_posts SET content_type = 'case' WHERE content_type = 'cases';
UPDATE ai_pulse_posts SET content_type = 'analysis' WHERE content_type = 'series';

ALTER TABLE ai_pulse_posts
  ADD CONSTRAINT ai_pulse_posts_content_type_check
  CHECK (content_type IN ('brief', 'analysis', 'case', 'interview'));

-- Series metadata
CREATE TABLE IF NOT EXISTS ai_pulse_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Many-to-many relation between posts and series
CREATE TABLE IF NOT EXISTS ai_pulse_series_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES ai_pulse_series(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES ai_pulse_posts(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_pulse_series_posts_unique_series_post UNIQUE (series_id, post_id),
  CONSTRAINT ai_pulse_series_posts_unique_series_order UNIQUE (series_id, order_index),
  CONSTRAINT ai_pulse_series_posts_order_positive CHECK (order_index > 0)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ai_pulse_series_updated_at') THEN
    CREATE TRIGGER ai_pulse_series_updated_at
      BEFORE UPDATE ON ai_pulse_series
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END;
$$;

ALTER TABLE ai_pulse_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_pulse_series_posts ENABLE ROW LEVEL SECURITY;

GRANT ALL ON ai_pulse_series TO service_role;
GRANT ALL ON ai_pulse_series_posts TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ai_pulse_series'
      AND policyname = 'service_role full access ai_pulse_series'
  ) THEN
    CREATE POLICY "service_role full access ai_pulse_series"
      ON ai_pulse_series
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ai_pulse_series_posts'
      AND policyname = 'service_role full access ai_pulse_series_posts'
  ) THEN
    CREATE POLICY "service_role full access ai_pulse_series_posts"
      ON ai_pulse_series_posts
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_ai_pulse_series_created_at ON ai_pulse_series (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_pulse_series_posts_series_order ON ai_pulse_series_posts (series_id, order_index ASC);
CREATE INDEX IF NOT EXISTS idx_ai_pulse_series_posts_post_id ON ai_pulse_series_posts (post_id);

-- Backfill from legacy posts.series_slug if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ai_pulse_posts'
      AND column_name = 'series_slug'
  ) THEN
    INSERT INTO ai_pulse_series (name, description)
    SELECT DISTINCT initcap(replace(lower(trim(series_slug)), '-', ' ')), ''
    FROM ai_pulse_posts
    WHERE series_slug IS NOT NULL AND btrim(series_slug) <> ''
    ON CONFLICT DO NOTHING;

    INSERT INTO ai_pulse_series_posts (series_id, post_id, order_index, created_at)
    SELECT
      s.id,
      p.id,
      ROW_NUMBER() OVER (PARTITION BY p.series_slug ORDER BY p.published_at ASC NULLS LAST, p.created_at ASC),
      now()
    FROM ai_pulse_posts p
    JOIN ai_pulse_series s
      ON s.name = initcap(replace(lower(trim(p.series_slug)), '-', ' '))
    WHERE p.series_slug IS NOT NULL AND btrim(p.series_slug) <> ''
    ON CONFLICT (series_id, post_id) DO NOTHING;
  END IF;
END;
$$;
