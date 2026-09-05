-- Backfill an admin-editable Illustration section for each chapter using the
-- chapter cover (uploaded cover_media_asset_id, or public /chapter-covers fallback).
-- Sections and media remain normal DB rows — admins can edit, replace, or delete.

DO $$
DECLARE
  ch RECORD;
  illus_asset_id UUID;
  illus_section_id UUID;
  cover_path TEXT;
  next_sort INTEGER;
BEGIN
  FOR ch IN
    SELECT
      c.id,
      c.slug,
      c.chapter_number,
      c.title,
      c.cover_media_asset_id
    FROM public.chapters c
    WHERE c.chapter_number > 0
    ORDER BY c.chapter_number
  LOOP
    -- Skip chapters that already have an illustration section with media assigned.
    IF EXISTS (
      SELECT 1
      FROM public.chapter_sections s
      WHERE s.chapter_id = ch.id
        AND s.kind = 'illustration'
        AND s.media_asset_id IS NOT NULL
    ) THEN
      CONTINUE;
    END IF;

    illus_asset_id := NULL;
    illus_section_id := NULL;

    IF ch.cover_media_asset_id IS NOT NULL THEN
      illus_asset_id := ch.cover_media_asset_id;

      UPDATE public.media_assets ma
      SET
        review_status = 'approved',
        kind = 'illustration',
        chapter_id = COALESCE(ma.chapter_id, ch.id),
        updated_at = now()
      WHERE ma.id = illus_asset_id;
    ELSE
      cover_path :=
        '/chapter-covers/'
        || lpad(ch.chapter_number::text, 2, '0')
        || '-'
        || ch.slug
        || '.png';

      SELECT ma.id
      INTO illus_asset_id
      FROM public.media_assets ma
      WHERE ma.chapter_id = ch.id
        AND ma.kind = 'illustration'
        AND ma.storage_path = cover_path
      ORDER BY ma.created_at
      LIMIT 1;

      IF illus_asset_id IS NULL THEN
        INSERT INTO public.media_assets (
          id,
          chapter_id,
          kind,
          storage_path,
          title,
          alt_text,
          review_status
        )
        VALUES (
          gen_random_uuid(),
          ch.id,
          'illustration',
          cover_path,
          ch.title || ' Cover',
          ch.title || ' chapter cover illustration',
          'approved'
        )
        RETURNING id INTO illus_asset_id;
      ELSE
        UPDATE public.media_assets ma
        SET
          review_status = 'approved',
          updated_at = now()
        WHERE ma.id = illus_asset_id;
      END IF;

      -- Wire chapter cover metadata to the same asset when unset (still admin-editable).
      UPDATE public.chapters
      SET
        cover_media_asset_id = illus_asset_id,
        updated_at = now()
      WHERE id = ch.id
        AND cover_media_asset_id IS NULL;
    END IF;

    -- Reuse an empty illustration section if one exists.
    SELECT s.id
    INTO illus_section_id
    FROM public.chapter_sections s
    WHERE s.chapter_id = ch.id
      AND s.kind = 'illustration'
    ORDER BY s.sort_order, s.id
    LIMIT 1;

    IF illus_section_id IS NOT NULL THEN
      UPDATE public.chapter_sections s
      SET
        media_asset_id = illus_asset_id,
        review_status = 'approved',
        updated_at = now()
      WHERE s.id = illus_section_id;

      UPDATE public.media_assets ma
      SET
        section_id = illus_section_id,
        updated_at = now()
      WHERE ma.id = illus_asset_id;
    ELSE
      SELECT COALESCE(MAX(s.sort_order), -1) + 1
      INTO next_sort
      FROM public.chapter_sections s
      WHERE s.chapter_id = ch.id;

      INSERT INTO public.chapter_sections (
        id,
        chapter_id,
        kind,
        title,
        sort_order,
        review_status,
        media_asset_id
      )
      VALUES (
        gen_random_uuid(),
        ch.id,
        'illustration',
        ch.title || ' Cover',
        next_sort,
        'approved',
        illus_asset_id
      )
      RETURNING id INTO illus_section_id;

      UPDATE public.media_assets ma
      SET
        section_id = illus_section_id,
        updated_at = now()
      WHERE ma.id = illus_asset_id;
    END IF;
  END LOOP;
END $$;
