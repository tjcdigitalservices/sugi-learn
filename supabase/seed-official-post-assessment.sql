-- Official SugiLearn Post-Assessment content (client PDF question bank).
-- Source of truth for initial content: lib/assessment/official-question-bank.json
-- Regenerate: node scripts/generate-official-assessment-seeds.mjs
-- Safe for staging/production. Admins may edit further in /admin/assessments.
--
--   psql $DATABASE_URL -f supabase/seed-official-post-assessment.sql

BEGIN;

INSERT INTO public.assessments (id, type, title, instructions, review_status)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
  'post',
  'Post-Assessment',
  'Measure understanding after completing the SugiLearn learning experience. Choose the best answer for each question. 1 point per question.',
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
  AND a.type = 'post'
  AND q.prompt LIKE '[DEVELOPMENT TEST]%';

-- Clear prior rows for these official question ids (re-seed safe).
DELETE FROM public.questions
WHERE id IN (
  'c1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000002',
  'c1000000-0000-4000-8000-000000000003',
  'c1000000-0000-4000-8000-000000000004',
  'c1000000-0000-4000-8000-000000000005',
  'c1000000-0000-4000-8000-000000000006',
  'c1000000-0000-4000-8000-000000000007',
  'c1000000-0000-4000-8000-000000000008',
  'c1000000-0000-4000-8000-000000000009',
  'c1000000-0000-4000-8000-000000000010',
  'c1000000-0000-4000-8000-000000000011',
  'c1000000-0000-4000-8000-000000000012',
  'c1000000-0000-4000-8000-000000000013',
  'c1000000-0000-4000-8000-000000000014',
  'c1000000-0000-4000-8000-000000000015'
);

-- Free sort slots 1–15 if other CMS questions occupy them.
UPDATE public.questions q
SET sort_order = q.sort_order + 1000,
    updated_at = now()
FROM public.assessments a
WHERE q.assessment_id = a.id
  AND a.type = 'post'
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
    ('c1000000-0000-4000-8000-000000000001'::uuid, 'Why did Paiburong''s cutting of the unusual bamboo create a conflict?', 1),
    ('c1000000-0000-4000-8000-000000000002'::uuid, 'What was unusual about Amburukay''s treatment of Matan-ayon and Saranggaon?', 2),
    ('c1000000-0000-4000-8000-000000000003'::uuid, 'What does the story of Amburukay demonstrate about Labaw Donggon''s actions?', 3),
    ('c1000000-0000-4000-8000-000000000004'::uuid, 'In Derikaryong Pada, why was recovering the heirloom sailboat important?', 4),
    ('c1000000-0000-4000-8000-000000000005'::uuid, 'What does the conflict involving Balanakon demonstrate?', 5),
    ('c1000000-0000-4000-8000-000000000006'::uuid, 'Why was Matan-ayon carried toward the underworld in Kalampay?', 6),
    ('c1000000-0000-4000-8000-000000000007'::uuid, 'What does Labaw Donggon''s experience with Masangladon show?', 7),
    ('c1000000-0000-4000-8000-000000000008'::uuid, 'How did Matan-ayon respond when Pahagunong became involved in the conflict?', 8),
    ('c1000000-0000-4000-8000-000000000009'::uuid, 'How was Sinagnayan ultimately defeated?', 9),
    ('c1000000-0000-4000-8000-000000000010'::uuid, 'Which statement best describes Mali/Nagmalitong Yawa?', 10),
    ('c1000000-0000-4000-8000-000000000011'::uuid, 'What does the tuos represent in Pagbalukat ka Biday?', 11),
    ('c1000000-0000-4000-8000-000000000012'::uuid, 'What is the significance of the Hungaw story?', 12),
    ('c1000000-0000-4000-8000-000000000013'::uuid, 'What important idea is presented through Mali''s death and restoration in Ginlawan?', 13),
    ('c1000000-0000-4000-8000-000000000014'::uuid, 'Why did Laon Sina recommend planting an alayaw tree?', 14),
    ('c1000000-0000-4000-8000-000000000015'::uuid, 'What does Nagbuhis reveal about Mali''s role and the transmission of knowledge?', 15)
) AS v(id, prompt, sort_order)
CROSS JOIN public.assessments a
WHERE a.type = 'post';

INSERT INTO public.question_options (id, question_id, label, sort_order, is_correct)
VALUES
  ('c2000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'The bamboo belonged to his brother', 1, false),
  ('c2000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'The bamboo was a sacred object owned by Makabagting and Amburukay', 2, true),
  ('c2000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 'The bamboo contained a hidden treasure', 3, false),
  ('c2000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 'The bamboo was needed to build a boat', 4, false),
  ('c2000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000002', 'She imprisoned them in the underworld', 1, false),
  ('c2000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000002', 'She raised them as her own daughters in a golden chamber as binukot', 2, true),
  ('c2000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000002', 'She sent them to Labaw Donggon', 3, false),
  ('c2000000-0000-4000-8000-000000000008', 'c1000000-0000-4000-8000-000000000002', 'She trained them to become warriors', 4, false),
  ('c2000000-0000-4000-8000-000000000009', 'c1000000-0000-4000-8000-000000000003', 'Taking what one wants can create obligations and consequences', 1, true),
  ('c2000000-0000-4000-8000-000000000010', 'c1000000-0000-4000-8000-000000000003', 'Physical strength always solves conflicts', 2, false),
  ('c2000000-0000-4000-8000-000000000011', 'c1000000-0000-4000-8000-000000000003', 'Marriage is unrelated to family obligations', 3, false),
  ('c2000000-0000-4000-8000-000000000012', 'c1000000-0000-4000-8000-000000000003', 'Magical objects have no importance', 4, false),
  ('c2000000-0000-4000-8000-000000000013', 'c1000000-0000-4000-8000-000000000004', 'It was needed to enter the underworld', 1, false),
  ('c2000000-0000-4000-8000-000000000014', 'c1000000-0000-4000-8000-000000000004', 'It was the condition through which a suitor could prove his right to marry Matan-ayon', 2, true),
  ('c2000000-0000-4000-8000-000000000015', 'c1000000-0000-4000-8000-000000000004', 'It belonged to Sinagnayan', 3, false),
  ('c2000000-0000-4000-8000-000000000016', 'c1000000-0000-4000-8000-000000000004', 'It was used during a ritual ceremony', 4, false),
  ('c2000000-0000-4000-8000-000000000017', 'c1000000-0000-4000-8000-000000000005', 'Every conflict can be solved through greater physical strength', 1, false),
  ('c2000000-0000-4000-8000-000000000018', 'c1000000-0000-4000-8000-000000000005', 'Extraordinary power makes negotiation unnecessary', 2, false),
  ('c2000000-0000-4000-8000-000000000019', 'c1000000-0000-4000-8000-000000000005', 'Some conflicts require an authoritative intermediary rather than force alone', 3, true),
  ('c2000000-0000-4000-8000-000000000020', 'c1000000-0000-4000-8000-000000000005', 'Rivalries are always resolved through marriage', 4, false),
  ('c2000000-0000-4000-8000-000000000021', 'c1000000-0000-4000-8000-000000000006', 'She intentionally travelled there to meet Masangladon', 1, false),
  ('c2000000-0000-4000-8000-000000000022', 'c1000000-0000-4000-8000-000000000006', 'She unknowingly entered the transformed crab-island while gathering fruit', 2, true),
  ('c2000000-0000-4000-8000-000000000023', 'c1000000-0000-4000-8000-000000000006', 'Labaw Donggon sent her there', 3, false),
  ('c2000000-0000-4000-8000-000000000024', 'c1000000-0000-4000-8000-000000000006', 'She was searching for Sinagnayan', 4, false),
  ('c2000000-0000-4000-8000-000000000025', 'c1000000-0000-4000-8000-000000000007', 'Even a powerful hero may need to respect other jurisdictions and powers', 1, true),
  ('c2000000-0000-4000-8000-000000000026', 'c1000000-0000-4000-8000-000000000007', 'Heroes always win through combat', 2, false),
  ('c2000000-0000-4000-8000-000000000027', 'c1000000-0000-4000-8000-000000000007', 'The underworld has no rules', 3, false),
  ('c2000000-0000-4000-8000-000000000028', 'c1000000-0000-4000-8000-000000000007', 'Matan-ayon can resolve every conflict herself', 4, false),
  ('c2000000-0000-4000-8000-000000000029', 'c1000000-0000-4000-8000-000000000008', 'She remained passive and waited for Labaw Donggon', 1, false),
  ('c2000000-0000-4000-8000-000000000030', 'c1000000-0000-4000-8000-000000000008', 'She transformed herself into a man and entered the conflict', 2, true),
  ('c2000000-0000-4000-8000-000000000031', 'c1000000-0000-4000-8000-000000000008', 'She escaped into the underworld', 3, false),
  ('c2000000-0000-4000-8000-000000000032', 'c1000000-0000-4000-8000-000000000008', 'She asked Sinagnayan for help', 4, false),
  ('c2000000-0000-4000-8000-000000000033', 'c1000000-0000-4000-8000-000000000009', 'Labaw Donggon defeated him through strength alone', 1, false),
  ('c2000000-0000-4000-8000-000000000034', 'c1000000-0000-4000-8000-000000000009', 'Matan-ayon defeated him with magic', 2, false),
  ('c2000000-0000-4000-8000-000000000035', 'c1000000-0000-4000-8000-000000000009', 'Knowledge about his hidden life-force, disguise, cooperation, and strategy made his defeat possible', 3, true),
  ('c2000000-0000-4000-8000-000000000036', 'c1000000-0000-4000-8000-000000000009', 'Balanakon defeated him', 4, false),
  ('c2000000-0000-4000-8000-000000000037', 'c1000000-0000-4000-8000-000000000010', 'She is mainly a passive character waiting for Humadapnon', 1, false),
  ('c2000000-0000-4000-8000-000000000038', 'c1000000-0000-4000-8000-000000000010', 'She actively uses disguise, ritual, magic, strategy, and rescue throughout the story', 2, true),
  ('c2000000-0000-4000-8000-000000000039', 'c1000000-0000-4000-8000-000000000010', 'She appears only during the wedding', 3, false),
  ('c2000000-0000-4000-8000-000000000040', 'c1000000-0000-4000-8000-000000000010', 'She is primarily an antagonist to Humadapnon', 4, false),
  ('c2000000-0000-4000-8000-000000000041', 'c1000000-0000-4000-8000-000000000011', 'A punishment for breaking a promise', 1, false),
  ('c2000000-0000-4000-8000-000000000042', 'c1000000-0000-4000-8000-000000000011', 'A mark of engagement represented by an heirloom boat', 2, true),
  ('c2000000-0000-4000-8000-000000000043', 'c1000000-0000-4000-8000-000000000011', 'A weapon used by Paglambuhan', 3, false),
  ('c2000000-0000-4000-8000-000000000044', 'c1000000-0000-4000-8000-000000000011', 'A ceremony for entering the underworld', 4, false),
  ('c2000000-0000-4000-8000-000000000045', 'c1000000-0000-4000-8000-000000000012', 'It focuses on a formal marriage involving extended families, hospitality, and social relationships', 1, true),
  ('c2000000-0000-4000-8000-000000000046', 'c1000000-0000-4000-8000-000000000012', 'It explains how Tikum Kadlum was born', 2, false),
  ('c2000000-0000-4000-8000-000000000047', 'c1000000-0000-4000-8000-000000000012', 'It describes Matan-ayon''s journey into the underworld', 3, false),
  ('c2000000-0000-4000-8000-000000000048', 'c1000000-0000-4000-8000-000000000012', 'It focuses on Balanakon''s powers', 4, false),
  ('c2000000-0000-4000-8000-000000000049', 'c1000000-0000-4000-8000-000000000013', 'Supernatural powers always guarantee a happy ending', 1, false),
  ('c2000000-0000-4000-8000-000000000050', 'c1000000-0000-4000-8000-000000000013', 'Honour, loyalty, justice, and marital obligations can have consequences even after supernatural rescue', 2, true),
  ('c2000000-0000-4000-8000-000000000051', 'c1000000-0000-4000-8000-000000000013', 'Marriage eliminates all conflict', 3, false),
  ('c2000000-0000-4000-8000-000000000052', 'c1000000-0000-4000-8000-000000000013', 'Humadapnon''s actions have no consequences', 4, false),
  ('c2000000-0000-4000-8000-000000000053', 'c1000000-0000-4000-8000-000000000014', 'To protect Mali''s family', 1, false),
  ('c2000000-0000-4000-8000-000000000054', 'c1000000-0000-4000-8000-000000000014', 'To provide food for Humadapnon', 2, false),
  ('c2000000-0000-4000-8000-000000000055', 'c1000000-0000-4000-8000-000000000014', 'To entice Mali out of her enclosure so Humadapnon could see her', 3, true),
  ('c2000000-0000-4000-8000-000000000056', 'c1000000-0000-4000-8000-000000000014', 'To open a passage to the underworld', 4, false),
  ('c2000000-0000-4000-8000-000000000057', 'c1000000-0000-4000-8000-000000000015', 'Mali is excluded completely from ritual knowledge', 1, false),
  ('c2000000-0000-4000-8000-000000000058', 'c1000000-0000-4000-8000-000000000015', 'Mali is connected to the inheritance of ritual knowledge and authority through her maternal family', 2, true),
  ('c2000000-0000-4000-8000-000000000059', 'c1000000-0000-4000-8000-000000000015', 'Only Humadapnon can possess supernatural knowledge', 3, false),
  ('c2000000-0000-4000-8000-000000000060', 'c1000000-0000-4000-8000-000000000015', 'Ritual knowledge is unrelated to family', 4, false)
;

COMMIT;
