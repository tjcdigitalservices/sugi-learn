-- Remove Characters sections from all chapters.
-- Admins can still add a Characters section later via "Add section".
-- Character catalog / chapter_characters associations are retained.

DELETE FROM public.chapter_sections
WHERE kind = 'characters';
