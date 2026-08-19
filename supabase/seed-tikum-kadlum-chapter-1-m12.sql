-- M12 — Tikum Kadlum Chapter 1 multimedia integration patch
-- Reorders illustration before characters and registers draft illustration metadata.
-- Safe to run on existing databases; does not overwrite approved client edits to media files.
--
-- Run manually:
--   psql $DATABASE_URL -f supabase/seed-tikum-kadlum-chapter-1-m12.sql

DO $$
DECLARE
  ch_id UUID;
  sec_illus UUID := 'a1000001-0001-4001-8001-000000000006';
  sec_chars UUID := 'a1000001-0001-4001-8001-000000000005';
  media_id UUID := 'd1000001-0001-4001-8001-000000000001';
BEGIN
  SELECT id INTO ch_id FROM public.chapters WHERE slug = 'tikum-kadlum';
  IF ch_id IS NULL THEN
    RAISE NOTICE 'Chapter tikum-kadlum not found; skipping M12 patch.';
    RETURN;
  END IF;

  -- Story flow: illustration after story sections, before characters
  UPDATE public.chapter_sections
  SET sort_order = 4, updated_at = now()
  WHERE id = sec_illus AND chapter_id = ch_id;

  UPDATE public.chapter_sections
  SET sort_order = 5, updated_at = now()
  WHERE id = sec_chars AND chapter_id = ch_id;

  INSERT INTO public.media_assets (
    id,
    chapter_id,
    section_id,
    kind,
    title,
    caption,
    alt_text,
    source_reference,
    storage_path,
    review_status
  )
  VALUES (
    media_id,
    ch_id,
    sec_illus,
    'illustration',
    'Tikum Kadlum — The Unusual Bamboo',
    'Scene candidate: Tikum Kadlum draws attention to the unusual bamboo tree (source summary).',
    'PENDING CLIENT APPROVAL — Alt text for the approved illustration of the unusual bamboo scene.',
    'docs/TIKUM_KADLUM_CHAPTER_1_SOURCE_MAP.md',
    NULL,
    'draft'
  )
  ON CONFLICT (id) DO NOTHING;

  UPDATE public.chapter_sections
  SET media_asset_id = media_id, updated_at = now()
  WHERE id = sec_illus
    AND chapter_id = ch_id
    AND media_asset_id IS NULL;

  RAISE NOTICE 'M12 Tikum Kadlum Chapter 1 multimedia patch applied.';
END $$;
