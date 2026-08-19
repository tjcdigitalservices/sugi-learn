-- SugiLearn M2: Foundation schema
-- Enums, tables, indexes, triggers, profile bootstrap

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.review_status AS ENUM (
  'draft',
  'for_review',
  'approved',
  'needs_revision'
);

CREATE TYPE public.user_role AS ENUM (
  'learner',
  'admin'
);

CREATE TYPE public.section_kind AS ENUM (
  'introduction',
  'story',
  'characters',
  'cultural_context',
  'illustration',
  'audio',
  'animation',
  'learning_points',
  'activity',
  'completion'
);

CREATE TYPE public.media_kind AS ENUM (
  'illustration',
  'audio',
  'animation'
);

CREATE TYPE public.assessment_type AS ENUM (
  'pre',
  'post'
);

-- ---------------------------------------------------------------------------
-- Utility functions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (extends Supabase Auth — no credential storage)
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'learner',
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'learner')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Chapters
-- ---------------------------------------------------------------------------

CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  chapter_number INTEGER NOT NULL UNIQUE CHECK (chapter_number > 0),
  title TEXT NOT NULL,
  subtitle TEXT,
  summary TEXT,
  review_status public.review_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX chapters_review_status_idx ON public.chapters (review_status);

CREATE TRIGGER chapters_set_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Media assets (metadata; files in Storage — M11+)
-- ---------------------------------------------------------------------------

CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.chapters (id) ON DELETE SET NULL,
  section_id UUID,
  kind public.media_kind NOT NULL,
  storage_path TEXT,
  title TEXT,
  caption TEXT,
  alt_text TEXT,
  duration_seconds INTEGER CHECK (
    duration_seconds IS NULL OR duration_seconds >= 0
  ),
  review_status public.review_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX media_assets_chapter_id_idx ON public.media_assets (chapter_id);
CREATE INDEX media_assets_section_id_idx ON public.media_assets (section_id);

CREATE TRIGGER media_assets_set_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Chapter sections
-- ---------------------------------------------------------------------------

CREATE TABLE public.chapter_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.chapters (id) ON DELETE CASCADE,
  kind public.section_kind NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
  review_status public.review_status NOT NULL DEFAULT 'draft',
  body_text TEXT,
  transcript TEXT,
  completion_message TEXT,
  media_asset_id UUID REFERENCES public.media_assets (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (chapter_id, sort_order)
);

ALTER TABLE public.media_assets
  ADD CONSTRAINT media_assets_section_id_fkey
  FOREIGN KEY (section_id) REFERENCES public.chapter_sections (id) ON DELETE SET NULL;

CREATE INDEX chapter_sections_chapter_id_idx ON public.chapter_sections (chapter_id);
CREATE INDEX chapter_sections_chapter_sort_idx
  ON public.chapter_sections (chapter_id, sort_order);

CREATE TRIGGER chapter_sections_set_updated_at
  BEFORE UPDATE ON public.chapter_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Characters (reusable across chapters)
-- ---------------------------------------------------------------------------

CREATE TABLE public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  media_asset_id UUID REFERENCES public.media_assets (id) ON DELETE SET NULL,
  review_status public.review_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER characters_set_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.chapter_characters (
  chapter_id UUID NOT NULL REFERENCES public.chapters (id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES public.characters (id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (chapter_id, character_id)
);

CREATE INDEX chapter_characters_character_id_idx
  ON public.chapter_characters (character_id);

CREATE TABLE public.section_characters (
  section_id UUID NOT NULL REFERENCES public.chapter_sections (id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES public.characters (id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (section_id, character_id)
);

-- ---------------------------------------------------------------------------
-- Learning points
-- ---------------------------------------------------------------------------

CREATE TABLE public.learning_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.chapters (id) ON DELETE CASCADE,
  title TEXT,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  review_status public.review_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX learning_points_chapter_id_idx ON public.learning_points (chapter_id);

CREATE TRIGGER learning_points_set_updated_at
  BEFORE UPDATE ON public.learning_points
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.section_learning_points (
  section_id UUID NOT NULL REFERENCES public.chapter_sections (id) ON DELETE CASCADE,
  learning_point_id UUID NOT NULL REFERENCES public.learning_points (id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (section_id, learning_point_id)
);

-- ---------------------------------------------------------------------------
-- Assessments & questions
-- ---------------------------------------------------------------------------

CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.assessment_type NOT NULL UNIQUE,
  title TEXT NOT NULL,
  instructions TEXT,
  review_status public.review_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER assessments_set_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments (id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters (id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  explanation TEXT,
  source_reference TEXT,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
  review_status public.review_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, sort_order)
);

CREATE INDEX questions_assessment_id_idx ON public.questions (assessment_id);
CREATE INDEX questions_chapter_id_idx ON public.questions (chapter_id);

CREATE TRIGGER questions_set_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions (id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
  is_correct BOOLEAN NOT NULL DEFAULT false,
  explanation TEXT,
  UNIQUE (question_id, sort_order)
);

CREATE INDEX question_options_question_id_idx
  ON public.question_options (question_id);

-- ---------------------------------------------------------------------------
-- Learner progress
-- ---------------------------------------------------------------------------

CREATE TABLE public.learner_chapter_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters (id) ON DELETE CASCADE,
  current_section_id UUID REFERENCES public.chapter_sections (id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, chapter_id)
);

CREATE INDEX learner_chapter_progress_profile_id_idx
  ON public.learner_chapter_progress (profile_id);

CREATE TRIGGER learner_chapter_progress_set_updated_at
  BEFORE UPDATE ON public.learner_chapter_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Assessment attempts & answers
-- ---------------------------------------------------------------------------

CREATE TABLE public.assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.assessments (id) ON DELETE CASCADE,
  score INTEGER CHECK (score IS NULL OR score >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX assessment_attempts_profile_id_idx
  ON public.assessment_attempts (profile_id);

CREATE INDEX assessment_attempts_assessment_id_idx
  ON public.assessment_attempts (assessment_id);

CREATE TRIGGER assessment_attempts_set_updated_at
  BEFORE UPDATE ON public.assessment_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.assessment_attempts (id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions (id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES public.question_options (id) ON DELETE SET NULL,
  UNIQUE (attempt_id, question_id)
);

CREATE INDEX assessment_answers_attempt_id_idx
  ON public.assessment_answers (attempt_id);
