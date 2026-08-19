-- M18 — Production query indexes (additive; safe on existing databases)

-- Learner attempt lookup: getCompletedAttempt(profile_id, assessment_id)
CREATE INDEX IF NOT EXISTS assessment_attempts_profile_assessment_idx
  ON public.assessment_attempts (profile_id, assessment_id);

-- Analytics / history: completed attempts ordered by time
CREATE INDEX IF NOT EXISTS assessment_attempts_completed_at_idx
  ON public.assessment_attempts (completed_at DESC NULLS LAST)
  WHERE completed_at IS NOT NULL;

-- Admin review queue / dashboard: filter sections by review status
CREATE INDEX IF NOT EXISTS chapter_sections_review_status_idx
  ON public.chapter_sections (review_status);

CREATE INDEX IF NOT EXISTS media_assets_review_status_idx
  ON public.media_assets (review_status);

CREATE INDEX IF NOT EXISTS questions_review_status_idx
  ON public.questions (review_status);
