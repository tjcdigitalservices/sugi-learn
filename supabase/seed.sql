-- Sugidanon development seed (M2)
-- Seeds ONLY the 13 official chapter titles and numbers.
-- No story content, characters, questions, or assessments.

INSERT INTO public.chapters (slug, chapter_number, title, review_status)
VALUES
  ('tikum-kadlum', 1, 'Tikum Kadlum', 'draft'),
  ('amburukay', 2, 'Amburukay', 'draft'),
  ('derikaryong-pada', 3, 'Derikaryong Pada', 'draft'),
  ('balanakon', 4, 'Balanakon', 'draft'),
  ('kalampay', 5, 'Kalampay', 'draft'),
  ('pahagunong', 6, 'Pahagunong', 'draft'),
  ('sinagnayan', 7, 'Sinagnayan', 'draft'),
  ('humadapnon-tarangban', 8, 'Humadapnon: Tarangban', 'draft'),
  ('humadapnon-pagbalukat-ka-biday', 9, 'Humadapnon: Pagbalukat ka Biday', 'draft'),
  ('humadapnon-hungaw', 10, 'Humadapnon: Hungaw', 'draft'),
  ('humadapnon-ginlawan', 11, 'Humadapnon: Ginlawan', 'draft'),
  ('alayaw', 12, 'Alayaw', 'draft'),
  ('nagbuhis', 13, 'Nagbuhis', 'draft')
ON CONFLICT (slug) DO UPDATE
SET
  chapter_number = EXCLUDED.chapter_number,
  title = EXCLUDED.title,
  updated_at = now();
