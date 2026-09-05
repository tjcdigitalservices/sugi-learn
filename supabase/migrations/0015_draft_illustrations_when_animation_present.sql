-- When a chapter has a playable animation (media assigned), keep cover
-- illustrations as draft so they stay admin-editable fallbacks only.
-- Learner UI shows illustration only when no animation video is available.

UPDATE public.chapter_sections AS illus
SET
  review_status = 'draft',
  updated_at = now()
FROM public.chapters AS ch
WHERE illus.chapter_id = ch.id
  AND illus.kind = 'illustration'
  AND illus.review_status <> 'draft'
  AND EXISTS (
    SELECT 1
    FROM public.chapter_sections AS anim
    WHERE anim.chapter_id = ch.id
      AND anim.kind = 'animation'
      AND anim.media_asset_id IS NOT NULL
  );
