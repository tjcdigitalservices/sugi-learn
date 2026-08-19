-- M18.5 — Dynamic chapter scalability: soft-archive without deleting data

ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS chapters_is_active_idx
  ON public.chapters (is_active)
  WHERE is_active = true;

COMMENT ON COLUMN public.chapters.is_active IS
  'When false, chapter is archived: hidden from new learner journeys; existing progress and analytics records are preserved.';
