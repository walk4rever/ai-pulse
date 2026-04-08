-- Rename content_type values to match new taxonomy
-- daily -> brief, weekly -> analysis
ALTER TABLE ai_pulse_posts DROP CONSTRAINT ai_pulse_posts_content_type_check;

UPDATE ai_pulse_posts SET content_type = 'brief'    WHERE content_type = 'daily';
UPDATE ai_pulse_posts SET content_type = 'analysis' WHERE content_type = 'weekly';

ALTER TABLE ai_pulse_posts
  ADD CONSTRAINT ai_pulse_posts_content_type_check
  CHECK (content_type IN ('brief', 'analysis', 'cases', 'series', 'interview'));
