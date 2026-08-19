-- SugiLearn M2: Row Level Security policies

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_learning_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_insert_admin
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() OR id = auth.uid());

-- ---------------------------------------------------------------------------
-- Chapters — official titles are public catalog metadata (no story content)
-- ---------------------------------------------------------------------------

CREATE POLICY chapters_select_catalog
  ON public.chapters
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY chapters_admin_write
  ON public.chapters
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Chapter sections — learners read approved content only
-- ---------------------------------------------------------------------------

CREATE POLICY chapter_sections_select_approved
  ON public.chapter_sections
  FOR SELECT
  TO authenticated
  USING (
    review_status = 'approved'
    OR public.is_admin()
  );

CREATE POLICY chapter_sections_admin_write
  ON public.chapter_sections
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Media assets
-- ---------------------------------------------------------------------------

CREATE POLICY media_assets_select_approved
  ON public.media_assets
  FOR SELECT
  TO authenticated
  USING (
    review_status = 'approved'
    OR public.is_admin()
  );

CREATE POLICY media_assets_admin_write
  ON public.media_assets
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Characters
-- ---------------------------------------------------------------------------

CREATE POLICY characters_select_approved
  ON public.characters
  FOR SELECT
  TO authenticated
  USING (
    review_status = 'approved'
    OR public.is_admin()
  );

CREATE POLICY characters_admin_write
  ON public.characters
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY chapter_characters_select_approved
  ON public.chapter_characters
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.characters c
      WHERE c.id = chapter_characters.character_id
        AND c.review_status = 'approved'
    )
  );

CREATE POLICY chapter_characters_admin_write
  ON public.chapter_characters
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY section_characters_select_approved
  ON public.section_characters
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.chapter_sections s
      WHERE s.id = section_characters.section_id
        AND s.review_status = 'approved'
    )
  );

CREATE POLICY section_characters_admin_write
  ON public.section_characters
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Learning points
-- ---------------------------------------------------------------------------

CREATE POLICY learning_points_select_approved
  ON public.learning_points
  FOR SELECT
  TO authenticated
  USING (
    review_status = 'approved'
    OR public.is_admin()
  );

CREATE POLICY learning_points_admin_write
  ON public.learning_points
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY section_learning_points_select_approved
  ON public.section_learning_points
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.chapter_sections s
      WHERE s.id = section_learning_points.section_id
        AND s.review_status = 'approved'
    )
  );

CREATE POLICY section_learning_points_admin_write
  ON public.section_learning_points
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Assessments & questions
-- ---------------------------------------------------------------------------

CREATE POLICY assessments_select_approved
  ON public.assessments
  FOR SELECT
  TO authenticated
  USING (
    review_status = 'approved'
    OR public.is_admin()
  );

CREATE POLICY assessments_admin_write
  ON public.assessments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY questions_select_approved
  ON public.questions
  FOR SELECT
  TO authenticated
  USING (
    review_status = 'approved'
    OR public.is_admin()
  );

CREATE POLICY questions_admin_write
  ON public.questions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY question_options_select_approved
  ON public.question_options
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.questions q
      WHERE q.id = question_options.question_id
        AND q.review_status = 'approved'
    )
  );

CREATE POLICY question_options_admin_write
  ON public.question_options
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Learner progress — own rows only
-- ---------------------------------------------------------------------------

CREATE POLICY learner_progress_select_own
  ON public.learner_chapter_progress
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY learner_progress_insert_own
  ON public.learner_chapter_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY learner_progress_update_own
  ON public.learner_chapter_progress
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin())
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY learner_progress_delete_admin
  ON public.learner_chapter_progress
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- Assessment attempts — own rows only
-- ---------------------------------------------------------------------------

CREATE POLICY assessment_attempts_select_own
  ON public.assessment_attempts
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY assessment_attempts_insert_own
  ON public.assessment_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY assessment_attempts_update_own
  ON public.assessment_attempts
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin())
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

CREATE POLICY assessment_attempts_delete_admin
  ON public.assessment_attempts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY assessment_answers_select_own
  ON public.assessment_answers
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.assessment_attempts a
      WHERE a.id = assessment_answers.attempt_id
        AND a.profile_id = auth.uid()
    )
  );

CREATE POLICY assessment_answers_insert_own
  ON public.assessment_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.assessment_attempts a
      WHERE a.id = assessment_answers.attempt_id
        AND a.profile_id = auth.uid()
    )
  );

CREATE POLICY assessment_answers_update_own
  ON public.assessment_answers
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.assessment_attempts a
      WHERE a.id = assessment_answers.attempt_id
        AND a.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.assessment_attempts a
      WHERE a.id = assessment_answers.attempt_id
        AND a.profile_id = auth.uid()
    )
  );

CREATE POLICY assessment_answers_delete_admin
  ON public.assessment_answers
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
