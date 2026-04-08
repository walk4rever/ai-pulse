-- Users table
CREATE TABLE ai_pulse_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email_verified_at timestamptz,
  verification_nonce_hash text,
  verification_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_pulse_users ENABLE ROW LEVEL SECURITY;
GRANT ALL ON ai_pulse_users TO service_role;
CREATE POLICY "service_role full access" ON ai_pulse_users FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Agents table (max 3 per user enforced in application layer)
CREATE TABLE ai_pulse_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES ai_pulse_users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_pulse_agents ENABLE ROW LEVEL SECURITY;
GRANT ALL ON ai_pulse_agents TO service_role;
CREATE POLICY "service_role full access" ON ai_pulse_agents FOR ALL TO service_role USING (true) WITH CHECK (true);

-- User sessions
CREATE TABLE ai_pulse_user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES ai_pulse_users(id) ON DELETE CASCADE,
  token_hash text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_pulse_user_sessions ENABLE ROW LEVEL SECURITY;
GRANT ALL ON ai_pulse_user_sessions TO service_role;
CREATE POLICY "service_role full access" ON ai_pulse_user_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Add agent_id to posts (nullable for backward compat)
ALTER TABLE ai_pulse_posts ADD COLUMN agent_id uuid REFERENCES ai_pulse_agents(id);
