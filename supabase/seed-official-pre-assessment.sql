-- Official SugiLearn Pre-Assessment content (client PDF question bank).
-- Source of truth for initial content: lib/assessment/official-question-bank.json
-- Regenerate: node scripts/generate-official-assessment-seeds.mjs
-- Safe for staging/production. Admins may edit further in /admin/assessments.
--
--   psql $DATABASE_URL -f supabase/seed-official-pre-assessment.sql

BEGIN;

INSERT INTO public.assessments (id, type, title, instructions, review_status)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  'pre',
  'Pre-Assessment',
  'Measure baseline knowledge before the learning experience. Choose the best answer for each question. 1 point per question.',
  'approved'
)
ON CONFLICT (type) DO UPDATE
SET
  title = EXCLUDED.title,
  instructions = EXCLUDED.instructions,
  review_status = EXCLUDED.review_status,
  updated_at = now();

-- Remove development placeholder questions for this assessment type only.
DELETE FROM public.questions q
USING public.assessments a
WHERE q.assessment_id = a.id
  AND a.type = 'pre'
  AND q.prompt LIKE '[DEVELOPMENT TEST]%';

-- Clear prior rows for these official question ids (re-seed safe).
DELETE FROM public.questions
WHERE id IN (
  'b1000000-0000-4000-8000-000000000001',
  'b1000000-0000-4000-8000-000000000002',
  'b1000000-0000-4000-8000-000000000003',
  'b1000000-0000-4000-8000-000000000004',
  'b1000000-0000-4000-8000-000000000005',
  'b1000000-0000-4000-8000-000000000006',
  'b1000000-0000-4000-8000-000000000007',
  'b1000000-0000-4000-8000-000000000008',
  'b1000000-0000-4000-8000-000000000009',
  'b1000000-0000-4000-8000-000000000010',
  'b1000000-0000-4000-8000-000000000011',
  'b1000000-0000-4000-8000-000000000012',
  'b1000000-0000-4000-8000-000000000013',
  'b1000000-0000-4000-8000-000000000014',
  'b1000000-0000-4000-8000-000000000015'
);

-- Free sort slots 1–15 if other CMS questions occupy them.
UPDATE public.questions q
SET sort_order = q.sort_order + 1000,
    updated_at = now()
FROM public.assessments a
WHERE q.assessment_id = a.id
  AND a.type = 'pre'
  AND q.sort_order BETWEEN 1 AND 15;

INSERT INTO public.questions (
  id,
  assessment_id,
  prompt,
  sort_order,
  review_status
)
SELECT
  v.id,
  a.id,
  v.prompt,
  v.sort_order,
  'approved'
FROM (
  VALUES
    ('b1000000-0000-4000-8000-000000000001'::uuid, 'Who is Tikum Kadlum?', 1),
    ('b1000000-0000-4000-8000-000000000002'::uuid, 'What happened when Paiburong cut the unusual bamboo?', 2),
    ('b1000000-0000-4000-8000-000000000003'::uuid, 'How did Amburukay keep Matan-ayon and Saranggaon?', 3),
    ('b1000000-0000-4000-8000-000000000004'::uuid, 'What did Labaw Donggon need to obtain from Amburukay?', 4),
    ('b1000000-0000-4000-8000-000000000005'::uuid, 'What was the significance of the gold medallion in Derikaryong Pada?', 5),
    ('b1000000-0000-4000-8000-000000000006'::uuid, 'What makes Balanakon different from an ordinary warrior?', 6),
    ('b1000000-0000-4000-8000-000000000007'::uuid, 'In Kalampay, what does Masangladon transform into an island?', 7),
    ('b1000000-0000-4000-8000-000000000008'::uuid, 'What happens to Labaw Donggon in Pahagunong?', 8),
    ('b1000000-0000-4000-8000-000000000009'::uuid, 'Where is Sinagnayan''s life-force concealed?', 9),
    ('b1000000-0000-4000-8000-000000000010'::uuid, 'Who is Nagmalitong Yawa, also frequently called Mali?', 10),
    ('b1000000-0000-4000-8000-000000000011'::uuid, 'What is the tuos in the Pagbalukat ka Biday story?', 11),
    ('b1000000-0000-4000-8000-000000000012'::uuid, 'What happens during the Hungaw story?', 12),
    ('b1000000-0000-4000-8000-000000000013'::uuid, 'What happens to Mali during Ginlawan?', 13),
    ('b1000000-0000-4000-8000-000000000014'::uuid, 'What is the purpose of the alayaw tree in Alayaw?', 14),
    ('b1000000-0000-4000-8000-000000000015'::uuid, 'What does Nagbuhis reveal about Mali?', 15)
) AS v(id, prompt, sort_order)
CROSS JOIN public.assessments a
WHERE a.type = 'pre';

INSERT INTO public.question_options (id, question_id, label, sort_order, is_correct)
VALUES
  ('b2000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'A powerful underworld being', 1, false),
  ('b2000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000001', 'An extraordinary dog belonging to Datu Paiburong', 2, true),
  ('b2000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000001', 'A rival of Labaw Donggon', 3, false),
  ('b2000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000001', 'A ritual specialist', 4, false),
  ('b2000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000002', 'He discovered a hidden treasure', 1, false),
  ('b2000000-0000-4000-8000-000000000006', 'b1000000-0000-4000-8000-000000000002', 'The bamboo transformed into an island', 2, false),
  ('b2000000-0000-4000-8000-000000000007', 'b1000000-0000-4000-8000-000000000002', 'It caused a dispute because the bamboo belonged to Makabagting and Amburukay', 3, true),
  ('b2000000-0000-4000-8000-000000000008', 'b1000000-0000-4000-8000-000000000002', 'Tikum Kadlum became ill', 4, false),
  ('b2000000-0000-4000-8000-000000000009', 'b1000000-0000-4000-8000-000000000003', 'In a golden chamber as binukot', 1, true),
  ('b2000000-0000-4000-8000-000000000010', 'b1000000-0000-4000-8000-000000000003', 'In an underworld kingdom', 2, false),
  ('b2000000-0000-4000-8000-000000000011', 'b1000000-0000-4000-8000-000000000003', 'On a magical island', 3, false),
  ('b2000000-0000-4000-8000-000000000012', 'b1000000-0000-4000-8000-000000000003', 'In a sailing vessel', 4, false),
  ('b2000000-0000-4000-8000-000000000013', 'b1000000-0000-4000-8000-000000000004', 'Her golden boat', 1, false),
  ('b2000000-0000-4000-8000-000000000014', 'b1000000-0000-4000-8000-000000000004', 'Her golden hair', 2, true),
  ('b2000000-0000-4000-8000-000000000015', 'b1000000-0000-4000-8000-000000000004', 'Her magical necklace', 3, false),
  ('b2000000-0000-4000-8000-000000000016', 'b1000000-0000-4000-8000-000000000004', 'Her heirloom vessel', 4, false),
  ('b2000000-0000-4000-8000-000000000017', 'b1000000-0000-4000-8000-000000000005', 'It represented a weapon', 1, false),
  ('b2000000-0000-4000-8000-000000000018', 'b1000000-0000-4000-8000-000000000005', 'It marked an agreement promising Matan-ayon to Labaw Donggon', 2, true),
  ('b2000000-0000-4000-8000-000000000019', 'b1000000-0000-4000-8000-000000000005', 'It belonged to Paglambuhan', 3, false),
  ('b2000000-0000-4000-8000-000000000020', 'b1000000-0000-4000-8000-000000000005', 'It was used to enter the underworld', 4, false),
  ('b2000000-0000-4000-8000-000000000021', 'b1000000-0000-4000-8000-000000000006', 'He owns a magical boat', 1, false),
  ('b2000000-0000-4000-8000-000000000022', 'b1000000-0000-4000-8000-000000000006', 'He possesses extraordinary innate power as a dalagangan', 2, true),
  ('b2000000-0000-4000-8000-000000000023', 'b1000000-0000-4000-8000-000000000006', 'He controls the underworld', 3, false),
  ('b2000000-0000-4000-8000-000000000024', 'b1000000-0000-4000-8000-000000000006', 'He can transform into a pawikan', 4, false),
  ('b2000000-0000-4000-8000-000000000025', 'b1000000-0000-4000-8000-000000000007', 'A bamboo tree', 1, false),
  ('b2000000-0000-4000-8000-000000000026', 'b1000000-0000-4000-8000-000000000007', 'A giant turtle', 2, false),
  ('b2000000-0000-4000-8000-000000000027', 'b1000000-0000-4000-8000-000000000007', 'A crab', 3, true),
  ('b2000000-0000-4000-8000-000000000028', 'b1000000-0000-4000-8000-000000000007', 'A lion', 4, false),
  ('b2000000-0000-4000-8000-000000000029', 'b1000000-0000-4000-8000-000000000008', 'He becomes a lion', 1, false),
  ('b2000000-0000-4000-8000-000000000030', 'b1000000-0000-4000-8000-000000000008', 'He becomes a pawikan', 2, true),
  ('b2000000-0000-4000-8000-000000000031', 'b1000000-0000-4000-8000-000000000008', 'He becomes a giant crab', 3, false),
  ('b2000000-0000-4000-8000-000000000032', 'b1000000-0000-4000-8000-000000000008', 'He becomes a tree', 4, false),
  ('b2000000-0000-4000-8000-000000000033', 'b1000000-0000-4000-8000-000000000009', 'Inside a golden boat', 1, false),
  ('b2000000-0000-4000-8000-000000000034', 'b1000000-0000-4000-8000-000000000009', 'Inside a bamboo tree', 2, false),
  ('b2000000-0000-4000-8000-000000000035', 'b1000000-0000-4000-8000-000000000009', 'In an eggshell inside the heart of a lion', 3, true),
  ('b2000000-0000-4000-8000-000000000036', 'b1000000-0000-4000-8000-000000000009', 'Inside an enchanted pillow', 4, false),
  ('b2000000-0000-4000-8000-000000000037', 'b1000000-0000-4000-8000-000000000010', 'Labaw Donggon''s mother', 1, false),
  ('b2000000-0000-4000-8000-000000000038', 'b1000000-0000-4000-8000-000000000010', 'Humadapnon''s courtship partner', 2, true),
  ('b2000000-0000-4000-8000-000000000039', 'b1000000-0000-4000-8000-000000000010', 'Sinagnayan''s mother', 3, false),
  ('b2000000-0000-4000-8000-000000000040', 'b1000000-0000-4000-8000-000000000010', 'Laon Sina''s sister', 4, false),
  ('b2000000-0000-4000-8000-000000000041', 'b1000000-0000-4000-8000-000000000011', 'A mark of engagement represented by an heirloom boat', 1, true),
  ('b2000000-0000-4000-8000-000000000042', 'b1000000-0000-4000-8000-000000000011', 'A ritual performed by Ginduluman', 2, false),
  ('b2000000-0000-4000-8000-000000000043', 'b1000000-0000-4000-8000-000000000011', 'A magical weapon', 3, false),
  ('b2000000-0000-4000-8000-000000000044', 'b1000000-0000-4000-8000-000000000011', 'A golden chamber', 4, false),
  ('b2000000-0000-4000-8000-000000000045', 'b1000000-0000-4000-8000-000000000012', 'Humadapnon and Mali''s marriage is formally arranged', 1, true),
  ('b2000000-0000-4000-8000-000000000046', 'b1000000-0000-4000-8000-000000000012', 'Matan-ayon enters the underworld', 2, false),
  ('b2000000-0000-4000-8000-000000000047', 'b1000000-0000-4000-8000-000000000012', 'Paiburong cuts the unusual bamboo', 3, false),
  ('b2000000-0000-4000-8000-000000000048', 'b1000000-0000-4000-8000-000000000012', 'Sinagnayan fights Balanakon', 4, false),
  ('b2000000-0000-4000-8000-000000000049', 'b1000000-0000-4000-8000-000000000013', 'She becomes a pawikan', 1, false),
  ('b2000000-0000-4000-8000-000000000050', 'b1000000-0000-4000-8000-000000000013', 'She is carried into the underworld', 2, false),
  ('b2000000-0000-4000-8000-000000000051', 'b1000000-0000-4000-8000-000000000013', 'She dies during the conflict and is later restored to life', 3, true),
  ('b2000000-0000-4000-8000-000000000052', 'b1000000-0000-4000-8000-000000000013', 'She becomes a ritual specialist', 4, false),
  ('b2000000-0000-4000-8000-000000000053', 'b1000000-0000-4000-8000-000000000014', 'To protect Humadapnon from Sinagnayan', 1, false),
  ('b2000000-0000-4000-8000-000000000054', 'b1000000-0000-4000-8000-000000000014', 'To entice Mali outside her enclosure so Humadapnon can see her', 2, true),
  ('b2000000-0000-4000-8000-000000000055', 'b1000000-0000-4000-8000-000000000014', 'To open a passage into the underworld', 3, false),
  ('b2000000-0000-4000-8000-000000000056', 'b1000000-0000-4000-8000-000000000014', 'To restore Matan-ayon''s health', 4, false),
  ('b2000000-0000-4000-8000-000000000057', 'b1000000-0000-4000-8000-000000000015', 'She is only a passive character in Humadapnon''s story', 1, false),
  ('b2000000-0000-4000-8000-000000000058', 'b1000000-0000-4000-8000-000000000015', 'She has no connection to ritual knowledge', 2, false),
  ('b2000000-0000-4000-8000-000000000059', 'b1000000-0000-4000-8000-000000000015', 'She uses deception and magic and is connected to the inheritance of ritual knowledge through her maternal family', 3, true),
  ('b2000000-0000-4000-8000-000000000060', 'b1000000-0000-4000-8000-000000000015', 'She is the owner of the heirloom boat', 4, false)
;

COMMIT;
