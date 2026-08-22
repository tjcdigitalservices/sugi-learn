-- Optional Hiligaynon translations for assessment questions (English remains canonical).
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS prompt_hiligaynon TEXT,
  ADD COLUMN IF NOT EXISTS explanation_hiligaynon TEXT;

ALTER TABLE public.question_options
  ADD COLUMN IF NOT EXISTS label_hiligaynon TEXT;
