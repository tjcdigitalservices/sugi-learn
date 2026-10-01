-- Reclassify assets already linked as chapter covers to the book_cover kind.
-- Must run after 0020 commits the new enum value.

UPDATE public.media_assets AS media
SET kind = 'book_cover'
FROM public.chapters AS chapter
WHERE chapter.cover_media_asset_id = media.id
  AND media.kind = 'illustration';
