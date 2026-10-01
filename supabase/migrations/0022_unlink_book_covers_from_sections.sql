-- Book covers must not remain linked to content sections (kind mismatch).
UPDATE public.chapter_sections AS section
SET media_asset_id = null
FROM public.media_assets AS media
WHERE section.media_asset_id = media.id
  AND media.kind = 'book_cover';

UPDATE public.media_assets
SET section_id = null
WHERE kind = 'book_cover'
  AND section_id IS NOT NULL;
