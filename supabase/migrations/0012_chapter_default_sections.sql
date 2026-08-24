-- Normalize chapter sections to the product default: Animation / Video + Characters.
-- Learning points are removed from the product. Other section kinds can still be
-- added later via admin "Add section".

-- 1) Remove learning-point associations and records
DELETE FROM public.section_learning_points;
DELETE FROM public.learning_points;

-- 2) Remove learning_points sections
DELETE FROM public.chapter_sections
WHERE kind = 'learning_points';

-- 3) Remove non-default section kinds (keep animation + characters only)
DELETE FROM public.chapter_sections
WHERE kind NOT IN ('animation', 'characters');

-- 4) Keep a single animation section per chapter (prefer earliest sort_order, then id)
DELETE FROM public.chapter_sections s
USING public.chapter_sections keep
WHERE s.kind = 'animation'
  AND keep.kind = 'animation'
  AND s.chapter_id = keep.chapter_id
  AND (
    s.sort_order > keep.sort_order
    OR (s.sort_order = keep.sort_order AND s.id::text > keep.id::text)
  );

-- 5) Keep a single characters section per chapter
DELETE FROM public.chapter_sections s
USING public.chapter_sections keep
WHERE s.kind = 'characters'
  AND keep.kind = 'characters'
  AND s.chapter_id = keep.chapter_id
  AND (
    s.sort_order > keep.sort_order
    OR (s.sort_order = keep.sort_order AND s.id::text > keep.id::text)
  );

-- 6) Move remaining sections out of the 0/1 sort_order range to avoid unique conflicts
UPDATE public.chapter_sections
SET sort_order = sort_order + 10000,
    updated_at = now()
WHERE kind IN ('animation', 'characters');

-- 7) Ensure every chapter has Animation / Video
DO $$
DECLARE
  ch RECORD;
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
    INSERT INTO public.chapter_sections (
      id, chapter_id, kind, title, sort_order, review_status
    )
    VALUES (
      gen_random_uuid(),
      ch.chapter_id,
      'animation',
      'Animation / Video',
      10000,
      'draft'
    );
  END LOOP;
END $$;

-- 8) Ensure every chapter has Characters
DO $$
DECLARE
  ch RECORD;
BEGIN
  FOR ch IN
    SELECT c.id AS chapter_id
    FROM public.chapters c
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.chapter_sections s
      WHERE s.chapter_id = c.id
        AND s.kind = 'characters'
    )
  LOOP
    INSERT INTO public.chapter_sections (
      id, chapter_id, kind, title, sort_order, review_status
    )
    VALUES (
      gen_random_uuid(),
      ch.chapter_id,
      'characters',
      'Characters in This Chapter',
      10001,
      'draft'
    );
  END LOOP;
END $$;

-- 9) Normalize sort order: animation first, characters second
UPDATE public.chapter_sections
SET sort_order = 0, updated_at = now()
WHERE kind = 'animation';

UPDATE public.chapter_sections
SET sort_order = 1, updated_at = now()
WHERE kind = 'characters';
