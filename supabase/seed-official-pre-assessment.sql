-- Official Sugidanon Pre-Assessment content (client PDF question bank).
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
  prompt_hiligaynon,
  sort_order,
  review_status
)
SELECT
  v.id,
  a.id,
  v.prompt,
  v.prompt_hiligaynon,
  v.sort_order,
  'approved'
FROM (
  VALUES
    ('b1000000-0000-4000-8000-000000000001'::uuid, 'Who is Tikum Kadlum?', 'Sin-o si Tikum Kadlum?', 1),
    ('b1000000-0000-4000-8000-000000000002'::uuid, 'What happened when Paiburong cut the unusual bamboo?', 'Ano ang natabo sang gin-utod ni Paiburong ang indi ordinaryo nga kawayan?', 2),
    ('b1000000-0000-4000-8000-000000000003'::uuid, 'How did Amburukay keep Matan-ayon and Saranggaon?', 'Paano gintago kag ginpadaku ni Amburukay sanday Matan-ayon kag Saranggaon?', 3),
    ('b1000000-0000-4000-8000-000000000004'::uuid, 'What did Labaw Donggon need to obtain from Amburukay?', 'Ano ang kinahanglan makuha ni Labaw Donggon gikan kay Amburukay?', 4),
    ('b1000000-0000-4000-8000-000000000005'::uuid, 'What was the significance of the gold medallion in Derikaryong Pada?', 'Ano ang kahulugan sang bulawan nga medalyon sa Derikaryong Pada?', 5),
    ('b1000000-0000-4000-8000-000000000006'::uuid, 'What makes Balanakon different from an ordinary warrior?', 'Ano ang nakatuhay kay Balanakon kumpara sa ordinaryo nga bagani?', 6),
    ('b1000000-0000-4000-8000-000000000007'::uuid, 'In Kalampay, what does Masangladon transform into an island?', 'Sa Kalampay, ano ang ginliwat ni Masangladon nga maging isla?', 7),
    ('b1000000-0000-4000-8000-000000000008'::uuid, 'What happens to Labaw Donggon in Pahagunong?', 'Ano ang natabo kay Labaw Donggon sa Pahagunong?', 8),
    ('b1000000-0000-4000-8000-000000000009'::uuid, 'Where is Sinagnayan''s life-force concealed?', 'Diin nakatago ang kabuhi o ginhawa ni Sinagnayan?', 9),
    ('b1000000-0000-4000-8000-000000000010'::uuid, 'Who is Nagmalitong Yawa, also frequently called Mali?', 'Sin-o si Nagmalitong Yawa, nga masami man ginatawag nga Mali?', 10),
    ('b1000000-0000-4000-8000-000000000011'::uuid, 'What is the tuos in the Pagbalukat ka Biday story?', 'Ano ang "tuos" sa istorya sang Pagbalukat ka Biday?', 11),
    ('b1000000-0000-4000-8000-000000000012'::uuid, 'What happens during the Hungaw story?', 'Ano ang natabo sa istorya sang Hungaw?', 12),
    ('b1000000-0000-4000-8000-000000000013'::uuid, 'What happens to Mali during Ginlawan?', 'Ano ang natabo kay Mali sa Ginlawan?', 13),
    ('b1000000-0000-4000-8000-000000000014'::uuid, 'What is the purpose of the alayaw tree in Alayaw?', 'Ano ang katuyoan sang kahoy nga alayaw sa Alayaw?', 14),
    ('b1000000-0000-4000-8000-000000000015'::uuid, 'What does Nagbuhis reveal about Mali?', 'Ano ang ginapahayag ni Nagbuhis nahanungod kay Mali?', 15)
) AS v(id, prompt, prompt_hiligaynon, sort_order)
CROSS JOIN public.assessments a
WHERE a.type = 'pre';

INSERT INTO public.question_options (id, question_id, label, label_hiligaynon, sort_order, is_correct)
VALUES
  ('b2000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'A powerful underworld being', 'Isa ka gamhanan nga tinuga sa idalom sang duta', 1, false),
  ('b2000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000001', 'An extraordinary dog belonging to Datu Paiburong', 'Isa ka pinasahi nga ayam ni Datu Paiburong', 2, true),
  ('b2000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000001', 'A rival of Labaw Donggon', 'Isa ka kaaway ni Labaw Donggon', 3, false),
  ('b2000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000001', 'A ritual specialist', 'Isa ka babaylan', 4, false),
  ('b2000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000002', 'He discovered a hidden treasure', 'Nakatukib sia sang tago nga manggad', 1, false),
  ('b2000000-0000-4000-8000-000000000006', 'b1000000-0000-4000-8000-000000000002', 'The bamboo transformed into an island', 'Ang kawayan nahimo nga isa ka isla', 2, false),
  ('b2000000-0000-4000-8000-000000000007', 'b1000000-0000-4000-8000-000000000002', 'It caused a dispute because the bamboo belonged to Makabagting and Amburukay', 'Nagtuga ini sang banggianay kay ang kawayan ila nanday Makabagting kag Amburukay', 3, true),
  ('b2000000-0000-4000-8000-000000000008', 'b1000000-0000-4000-8000-000000000002', 'Tikum Kadlum became ill', 'Nagmasakit si Tikum Kadlum', 4, false),
  ('b2000000-0000-4000-8000-000000000009', 'b1000000-0000-4000-8000-000000000003', 'In a golden chamber as binukot', 'Sa isa ka bulawan nga kuwarto bilang binukot', 1, true),
  ('b2000000-0000-4000-8000-000000000010', 'b1000000-0000-4000-8000-000000000003', 'In an underworld kingdom', 'Sa isa ka ginharian sa idalom sang duta', 2, false),
  ('b2000000-0000-4000-8000-000000000011', 'b1000000-0000-4000-8000-000000000003', 'On a magical island', 'Sa isa ka engkantado nga isla', 3, false),
  ('b2000000-0000-4000-8000-000000000012', 'b1000000-0000-4000-8000-000000000003', 'In a sailing vessel', 'Sa isa ka sakayan', 4, false),
  ('b2000000-0000-4000-8000-000000000013', 'b1000000-0000-4000-8000-000000000004', 'Her golden boat', 'Ang iya bulawan nga sakayan', 1, false),
  ('b2000000-0000-4000-8000-000000000014', 'b1000000-0000-4000-8000-000000000004', 'Her golden hair', 'Ang iya bulawan nga buhok', 2, true),
  ('b2000000-0000-4000-8000-000000000015', 'b1000000-0000-4000-8000-000000000004', 'Her magical necklace', 'Ang iya engkantado nga kulintas', 3, false),
  ('b2000000-0000-4000-8000-000000000016', 'b1000000-0000-4000-8000-000000000004', 'Her heirloom vessel', 'Ang iya ginpanubli nga biday', 4, false),
  ('b2000000-0000-4000-8000-000000000017', 'b1000000-0000-4000-8000-000000000005', 'It represented a weapon', 'Nagsimbolo ini sang isa ka armas', 1, false),
  ('b2000000-0000-4000-8000-000000000018', 'b1000000-0000-4000-8000-000000000005', 'It marked an agreement promising Matan-ayon to Labaw Donggon', 'Nagtanda ini sang kasugtanan nga nagapasalig kay Matan-ayon para kay Labaw Donggon', 2, true),
  ('b2000000-0000-4000-8000-000000000019', 'b1000000-0000-4000-8000-000000000005', 'It belonged to Paglambuhan', 'Iya ini ni Paglambuhan', 3, false),
  ('b2000000-0000-4000-8000-000000000020', 'b1000000-0000-4000-8000-000000000005', 'It was used to enter the underworld', 'Gingamit ini para makasulod sa idalom sang duta', 4, false),
  ('b2000000-0000-4000-8000-000000000021', 'b1000000-0000-4000-8000-000000000006', 'He owns a magical boat', 'May engkantado sia nga biday', 1, false),
  ('b2000000-0000-4000-8000-000000000022', 'b1000000-0000-4000-8000-000000000006', 'He possesses extraordinary innate power as a dalagangan', 'May pinasahi kag kinaiya nga gahum sia bilang dalagangan', 2, true),
  ('b2000000-0000-4000-8000-000000000023', 'b1000000-0000-4000-8000-000000000006', 'He controls the underworld', 'Sia ang nagagahum sa idalom sang duta', 3, false),
  ('b2000000-0000-4000-8000-000000000024', 'b1000000-0000-4000-8000-000000000006', 'He can transform into a pawikan', 'Mahimo sia nga pawikan', 4, false),
  ('b2000000-0000-4000-8000-000000000025', 'b1000000-0000-4000-8000-000000000007', 'A bamboo tree', 'Isa ka punu sang kawayan', 1, false),
  ('b2000000-0000-4000-8000-000000000026', 'b1000000-0000-4000-8000-000000000007', 'A giant turtle', 'Isa ka daku nga pawikan', 2, false),
  ('b2000000-0000-4000-8000-000000000027', 'b1000000-0000-4000-8000-000000000007', 'A crab', 'Isa ka alimango', 3, true),
  ('b2000000-0000-4000-8000-000000000028', 'b1000000-0000-4000-8000-000000000007', 'A lion', 'Isa ka leon', 4, false),
  ('b2000000-0000-4000-8000-000000000029', 'b1000000-0000-4000-8000-000000000008', 'He becomes a lion', 'Nahimo sia nga leon', 1, false),
  ('b2000000-0000-4000-8000-000000000030', 'b1000000-0000-4000-8000-000000000008', 'He becomes a pawikan', 'Nahimo sia nga pawikan', 2, true),
  ('b2000000-0000-4000-8000-000000000031', 'b1000000-0000-4000-8000-000000000008', 'He becomes a giant crab', 'Nahimo sia nga daku nga alimango', 3, false),
  ('b2000000-0000-4000-8000-000000000032', 'b1000000-0000-4000-8000-000000000008', 'He becomes a tree', 'Nahimo sia nga kahoy', 4, false),
  ('b2000000-0000-4000-8000-000000000033', 'b1000000-0000-4000-8000-000000000009', 'Inside a golden boat', 'Sa sulod sang bulawan nga sakayan', 1, false),
  ('b2000000-0000-4000-8000-000000000034', 'b1000000-0000-4000-8000-000000000009', 'Inside a bamboo tree', 'Sa sulod sang punu sang kawayan', 2, false),
  ('b2000000-0000-4000-8000-000000000035', 'b1000000-0000-4000-8000-000000000009', 'In an eggshell inside the heart of a lion', 'Sa sulod sang bagol sang itlog sa tagipusuon sang leon', 3, true),
  ('b2000000-0000-4000-8000-000000000036', 'b1000000-0000-4000-8000-000000000009', 'Inside an enchanted pillow', 'Sa sulod sang engkantado nga unlan', 4, false),
  ('b2000000-0000-4000-8000-000000000037', 'b1000000-0000-4000-8000-000000000010', 'Labaw Donggon''s mother', 'Ang iloy ni Labaw Donggon', 1, false),
  ('b2000000-0000-4000-8000-000000000038', 'b1000000-0000-4000-8000-000000000010', 'Humadapnon''s courtship partner', 'Ang kaparis sa pagpangaluyo ni Humadapnon', 2, true),
  ('b2000000-0000-4000-8000-000000000039', 'b1000000-0000-4000-8000-000000000010', 'Sinagnayan''s mother', 'Ang iloy ni Sinagnayan', 3, false),
  ('b2000000-0000-4000-8000-000000000040', 'b1000000-0000-4000-8000-000000000010', 'Laon Sina''s sister', 'Ang utod ni Laon Sina', 4, false),
  ('b2000000-0000-4000-8000-000000000041', 'b1000000-0000-4000-8000-000000000011', 'A mark of engagement represented by an heirloom boat', 'Isa ka tanda sang pagpangasawa nga ginasimbolo sang ginpanubli nga biday', 1, true),
  ('b2000000-0000-4000-8000-000000000042', 'b1000000-0000-4000-8000-000000000011', 'A ritual performed by Ginduluman', 'Isa ka ritual nga ginhimo ni Ginduluman', 2, false),
  ('b2000000-0000-4000-8000-000000000043', 'b1000000-0000-4000-8000-000000000011', 'A magical weapon', 'Isa ka engkantado nga armas', 3, false),
  ('b2000000-0000-4000-8000-000000000044', 'b1000000-0000-4000-8000-000000000011', 'A golden chamber', 'Isa ka bulawan nga kuwarto', 4, false),
  ('b2000000-0000-4000-8000-000000000045', 'b1000000-0000-4000-8000-000000000012', 'Humadapnon and Mali''s marriage is formally arranged', 'Pormal nga ginkasugtan ang kasal nanday Humadapnon kag Mali', 1, true),
  ('b2000000-0000-4000-8000-000000000046', 'b1000000-0000-4000-8000-000000000012', 'Matan-ayon enters the underworld', 'Nakasulod si Matan-ayon sa idalom sang duta', 2, false),
  ('b2000000-0000-4000-8000-000000000047', 'b1000000-0000-4000-8000-000000000012', 'Paiburong cuts the unusual bamboo', 'Gin-utod ni Paiburong ang indi ordinaryo nga kawayan', 3, false),
  ('b2000000-0000-4000-8000-000000000048', 'b1000000-0000-4000-8000-000000000012', 'Sinagnayan fights Balanakon', 'Nakig-away si Sinagnayan kay Balanakon', 4, false),
  ('b2000000-0000-4000-8000-000000000049', 'b1000000-0000-4000-8000-000000000013', 'She becomes a pawikan', 'Nahimo sia nga pawikan', 1, false),
  ('b2000000-0000-4000-8000-000000000050', 'b1000000-0000-4000-8000-000000000013', 'She is carried into the underworld', 'Gindala sia sa idalom sang duta', 2, false),
  ('b2000000-0000-4000-8000-000000000051', 'b1000000-0000-4000-8000-000000000013', 'She dies during the conflict and is later restored to life', 'Namatay sia sa tion sang inaway kag sa ulihi ginpabalik ang kabuhi', 3, true),
  ('b2000000-0000-4000-8000-000000000052', 'b1000000-0000-4000-8000-000000000013', 'She becomes a ritual specialist', 'Nahimo sia nga babaylan', 4, false),
  ('b2000000-0000-4000-8000-000000000053', 'b1000000-0000-4000-8000-000000000014', 'To protect Humadapnon from Sinagnayan', 'Para protektahan si Humadapnon gikan kay Sinagnayan', 1, false),
  ('b2000000-0000-4000-8000-000000000054', 'b1000000-0000-4000-8000-000000000014', 'To entice Mali outside her enclosure so Humadapnon can see her', 'Para ganyaton si Mali nga magguwa sa iya kuwarto para makita sia ni Humadapnon', 2, true),
  ('b2000000-0000-4000-8000-000000000055', 'b1000000-0000-4000-8000-000000000014', 'To open a passage into the underworld', 'Para mag-abli sang daan pakadto sa idalom sang duta', 3, false),
  ('b2000000-0000-4000-8000-000000000056', 'b1000000-0000-4000-8000-000000000014', 'To restore Matan-ayon''s health', 'Para iuli ang pag-ayo sang lawas ni Matan-ayon', 4, false),
  ('b2000000-0000-4000-8000-000000000057', 'b1000000-0000-4000-8000-000000000015', 'She is only a passive character in Humadapnon''s story', 'Isa lang sia ka pasibo nga karakter sa istorya ni Humadapnon', 1, false),
  ('b2000000-0000-4000-8000-000000000058', 'b1000000-0000-4000-8000-000000000015', 'She has no connection to ritual knowledge', 'Wala sia sang kaangtanan sa kinaagman sa ritual', 2, false),
  ('b2000000-0000-4000-8000-000000000059', 'b1000000-0000-4000-8000-000000000015', 'She uses deception and magic and is connected to the inheritance of ritual knowledge through her maternal family', 'Nagagamit sia sang pagpanglinlang kag salamangka kag may kaangtanan sa panublion sang kinaagman sa ritual paagi sa pamilya sang iya iloy', 3, true),
  ('b2000000-0000-4000-8000-000000000060', 'b1000000-0000-4000-8000-000000000015', 'She is the owner of the heirloom boat', 'Sia ang tag-iya sang ginpanubli nga biday', 4, false)
;

COMMIT;
