ALTER TABLE ai_pulse_posts
  DROP CONSTRAINT ai_pulse_posts_content_type_check,
  ADD CONSTRAINT ai_pulse_posts_content_type_check
    CHECK (content_type IN ('brief', 'analysis', 'case', 'interview', 'intel'));
