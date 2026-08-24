-- Ensure every chapter has a default Animation / Video section slot.
-- Content may remain empty (draft, no media) until an admin assigns a file.
-- Project multimedia scope still limits how many custom animations are produced.

DO $$
DECLARE
  ch RECORD;
  insert_at INTEGER;
  max_sort INTEGER;
BEGIN
  FOR ch IN
    SELECT c.id AS chapter_id
    FROM public.chapters c
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.chapter_sections s
      WHERE s.chapter_id = c.id
        AND s.kind = 'animation'
    )
  LOOP
    SELECT sort_order
    INTO insert_at
    FROM public.chapter_sections
    WHERE chapter_id = ch.chapter_id
      AND kind = 'completion'
    ORDER BY sort_order
    LIMIT 1;

    IF insert_at IS NOT NULL THEN
      UPDATE public.chapter_sections
      SET sort_order = sort_order + 1,
          updated_at = now()
      WHERE chapter_id = ch.chapter_id
        AND sort_order >= insert_at;
    ELSE
      SELECT COALESCE(MAX(sort_order), -1) + 1
      INTO insert_at
      FROM public.chapter_sections
      WHERE chapter_id = ch.chapter_id;
    END IF;

    INSERT INTO public.chapter_sections (
      id,
      chapter_id,
      kind,
      title,
      sort_order,
      review_status,
      body_text,
      media_asset_id,
      completion_message
    )
    VALUES (
      gen_random_uuid(),
      ch.chapter_id,
      'animation',
      'Animation / Video',
      insert_at,
      'draft',
      NULL,
      NULL,
      NULL
    );
  END LOOP;
END $$;
