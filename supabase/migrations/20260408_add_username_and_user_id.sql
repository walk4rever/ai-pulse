-- Add username to users
ALTER TABLE ai_pulse_users
  ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Backfill: use email prefix as default username (make unique with suffix if needed)
UPDATE ai_pulse_users
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE username IS NULL;

-- Add user_id to posts
ALTER TABLE ai_pulse_posts
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES ai_pulse_users(id);

-- Backfill: fill user_id from agent.user_id
UPDATE ai_pulse_posts p
SET user_id = a.user_id
FROM ai_pulse_agents a
WHERE p.agent_id = a.id AND p.user_id IS NULL;

-- Grant permissions
GRANT ALL ON ai_pulse_users TO service_role;
GRANT ALL ON ai_pulse_posts TO service_role;
