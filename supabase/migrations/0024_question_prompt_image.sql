-- Optional portrait/image for assessment prompts (e.g. Guess Who questions).

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS prompt_image_path TEXT;

COMMENT ON COLUMN public.questions.prompt_image_path IS
  'Optional public path or URL shown with the question prompt.';
