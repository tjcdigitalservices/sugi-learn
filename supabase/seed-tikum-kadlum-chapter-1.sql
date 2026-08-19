-- M10 — Tikum Kadlum Chapter 1 vertical slice seed
-- Source: docs/sources/Tikum-Kadlum-Sugidanon-Source.docx
-- Educational summary content — not the full epic text. Final wording: PENDING CLIENT APPROVAL.
--
-- Run manually after foundation seed:
--   psql $DATABASE_URL -f supabase/seed-tikum-kadlum-chapter-1.sql
--
-- Does NOT overwrite existing Chapter 1 sections (preserves admin edits).

DO $$
DECLARE
  ch_id UUID;
  section_count INTEGER;
  sec_intro UUID := 'a1000001-0001-4001-8001-000000000001';
  sec_story1 UUID := 'a1000001-0001-4001-8001-000000000002';
  sec_story2 UUID := 'a1000001-0001-4001-8001-000000000003';
  sec_story3 UUID := 'a1000001-0001-4001-8001-000000000004';
  sec_chars UUID := 'a1000001-0001-4001-8001-000000000005';
  sec_illus UUID := 'a1000001-0001-4001-8001-000000000006';
  sec_learn UUID := 'a1000001-0001-4001-8001-000000000007';
  sec_complete UUID := 'a1000001-0001-4001-8001-000000000008';
BEGIN
  SELECT id INTO ch_id FROM public.chapters WHERE slug = 'tikum-kadlum';
  IF ch_id IS NULL THEN
    RAISE EXCEPTION 'Chapter tikum-kadlum not found. Run supabase/seed.sql first.';
  END IF;

  SELECT COUNT(*) INTO section_count FROM public.chapter_sections WHERE chapter_id = ch_id;
  IF section_count > 0 THEN
    RAISE NOTICE 'Chapter 1 already has % section(s); skipping M10 seed to preserve existing content.', section_count;
    RETURN;
  END IF;

  UPDATE public.chapters
  SET
    subtitle = 'Sugidanon (Epics) of Panay Book I',
    summary = 'Datu Paiburong goes hunting with his brother Dumaraog and his extraordinary dog, Tikum Kadlum. The dog repeatedly draws their attention to an unusual bamboo tree, but Paiburong does not understand the warning and cuts it down. The bamboo belongs to Makabagting, a dangerous man-eating being, and his hermit sister Amburukay. Paiburong has entered another being''s territory and destroyed something that was not his. After negotiation, the owners agree to accept Paiburong''s daughters, Matan-ayon and Saranggaon, as compensation. Paiburong and Bulawanon try to hide the girls by disguising them with soot, but Makabagting sees through the deception.',
    updated_at = now()
  WHERE id = ch_id;

  INSERT INTO public.characters (id, name, description, review_status)
  VALUES
    ('b1000001-0001-4001-8001-000000000001', 'Datu Paiburong', 'Goes hunting with Dumaraog and Tikum Kadlum. Does not understand the dog''s warning, cuts down the bamboo, enters another being''s territory, and offers his daughters Matan-ayon and Saranggaon as compensation after negotiation.', 'approved'),
    ('b1000001-0001-4001-8001-000000000002', 'Dumaraog', 'Paiburong''s brother; goes hunting with Paiburong and Tikum Kadlum.', 'approved'),
    ('b1000001-0001-4001-8001-000000000003', 'Tikum Kadlum', 'Paiburong''s extraordinary dog; repeatedly draws attention to an unusual bamboo tree.', 'approved'),
    ('b1000001-0001-4001-8001-000000000004', 'Makabagting', 'A dangerous man-eating being; owner of the bamboo tree with his hermit sister Amburukay. Sees through the attempt to disguise the girls with soot.', 'approved'),
    ('b1000001-0001-4001-8001-000000000005', 'Amburukay', 'Hermit sister of Makabagting; associated with the bamboo that Paiburong destroys.', 'approved'),
    ('b1000001-0001-4001-8001-000000000006', 'Matan-ayon', 'Paiburong''s daughter; accepted as compensation after negotiation.', 'approved'),
    ('b1000001-0001-4001-8001-000000000007', 'Saranggaon', 'Paiburong''s daughter; accepted as compensation after negotiation.', 'approved'),
    ('b1000001-0001-4001-8001-000000000008', 'Bulawanon', 'With Paiburong, attempts to hide the girls by disguising them with soot.', 'approved')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.chapter_characters (chapter_id, character_id, sort_order)
  VALUES
    (ch_id, 'b1000001-0001-4001-8001-000000000001', 0),
    (ch_id, 'b1000001-0001-4001-8001-000000000002', 1),
    (ch_id, 'b1000001-0001-4001-8001-000000000003', 2),
    (ch_id, 'b1000001-0001-4001-8001-000000000004', 3),
    (ch_id, 'b1000001-0001-4001-8001-000000000005', 4),
    (ch_id, 'b1000001-0001-4001-8001-000000000006', 5),
    (ch_id, 'b1000001-0001-4001-8001-000000000007', 6),
    (ch_id, 'b1000001-0001-4001-8001-000000000008', 7)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.learning_points (id, chapter_id, title, description, sort_order, review_status)
  VALUES
    ('c1000001-0001-4001-8001-000000000001', ch_id, 'Territory and what is not one''s own', 'PENDING CLIENT APPROVAL — The source states that Paiburong entered another being''s territory and destroyed something that was not his.', 0, 'draft'),
    ('c1000001-0001-4001-8001-000000000002', ch_id, 'Negotiation and compensation', 'PENDING CLIENT APPROVAL — The source describes negotiation after which Makabagting and Amburukay accept Paiburong''s daughters as compensation.', 1, 'draft'),
    ('c1000001-0001-4001-8001-000000000003', ch_id, 'Deception and recognition', 'PENDING CLIENT APPROVAL — The source describes an attempt to disguise the girls with soot and Makabagting seeing through the deception.', 2, 'draft')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.chapter_sections (id, chapter_id, kind, title, sort_order, review_status, body_text, completion_message)
  VALUES
    (sec_intro, ch_id, 'introduction', 'Chapter Introduction', 0, 'approved',
     E'This chapter presents an educational summary adapted from the client-provided source document Tikum Kadlum: Sugidanon (Epics) of Panay Book I (Magos, Alicia P. et al.).\n\nThis material is a source-based summary for learning purposes. It is not the complete published epic text.\n\nSource reference: docs/sources/Tikum-Kadlum-Sugidanon-Source.docx',
     NULL),
    (sec_story1, ch_id, 'story', 'The Hunting Trip', 1, 'approved',
     'Datu Paiburong goes hunting with his brother Dumaraog and his extraordinary dog, Tikum Kadlum. The dog repeatedly draws their attention to an unusual bamboo tree, but Paiburong does not understand the warning and cuts it down.',
     NULL),
    (sec_story2, ch_id, 'story', 'Territory and Negotiation', 2, 'approved',
     'The bamboo belongs to Makabagting, a dangerous man-eating being, and his hermit sister Amburukay. Paiburong has entered another being''s territory and destroyed something that was not his. After negotiation, the owners agree to accept Paiburong''s daughters, Matan-ayon and Saranggaon, as compensation.',
     NULL),
    (sec_story3, ch_id, 'story', 'Compensation and Deception', 3, 'approved',
     'Paiburong and Bulawanon try to hide the girls by disguising them with soot, but Makabagting sees through the deception.',
     NULL),
    (sec_illus, ch_id, 'illustration', 'Illustration: The Unusual Bamboo', 4, 'approved', NULL, NULL),
    (sec_chars, ch_id, 'characters', 'Characters in This Chapter', 5, 'approved', NULL, NULL),
    (sec_learn, ch_id, 'learning_points', 'Learning Points', 6, 'draft', NULL, NULL),
    (sec_complete, ch_id, 'completion', 'Chapter Complete', 7, 'approved', NULL,
     'You have reached the end of this chapter summary. Continue the Sugidanon journey when the next chapter is available.');

  INSERT INTO public.section_characters (section_id, character_id, sort_order)
  SELECT sec_chars, character_id, sort_order
  FROM public.chapter_characters
  WHERE chapter_id = ch_id
  ON CONFLICT DO NOTHING;

  INSERT INTO public.section_learning_points (section_id, learning_point_id, sort_order)
  VALUES
    (sec_learn, 'c1000001-0001-4001-8001-000000000001', 0),
    (sec_learn, 'c1000001-0001-4001-8001-000000000002', 1),
    (sec_learn, 'c1000001-0001-4001-8001-000000000003', 2)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'M10 Tikum Kadlum Chapter 1 seed applied successfully.';
END $$;
