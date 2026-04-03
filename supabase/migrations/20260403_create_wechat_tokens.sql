CREATE TABLE IF NOT EXISTS ai_pulse_wechat_tokens (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ai_pulse_wechat_tokens ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE ai_pulse_wechat_tokens TO service_role;

CREATE POLICY "service_role full access"
  ON ai_pulse_wechat_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
