-- Official Sugidanon Post-Assessment content (client PDF question bank).
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
  'Measure understanding after completing the Sugidanon learning experience. Choose the best answer for each question. 1 point per question.',
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
    ('c1000000-0000-4000-8000-000000000001'::uuid, 'Why did Paiburong''s cutting of the unusual bamboo create a conflict?', 'Ngaa man ang pag-utod ni Paiburong sa indi ordinaryo nga kawayan nagtuga sang banggianay?', 1),
    ('c1000000-0000-4000-8000-000000000002'::uuid, 'What was unusual about Amburukay''s treatment of Matan-ayon and Saranggaon?', 'Ano ang indi ordinaryo sa pagtratar ni Amburukay kanday Matan-ayon kag Saranggaon?', 2),
    ('c1000000-0000-4000-8000-000000000003'::uuid, 'What does the story of Amburukay demonstrate about Labaw Donggon''s actions?', 'Ano ang ginapakita sang istorya ni Amburukay nahanungod sa mga ginhimo ni Labaw Donggon?', 3),
    ('c1000000-0000-4000-8000-000000000004'::uuid, 'In Derikaryong Pada, why was recovering the heirloom sailboat important?', 'Sa Derikaryong Pada, ngaa man importante ang pagbawi sang ginpanubli nga biday?', 4),
    ('c1000000-0000-4000-8000-000000000005'::uuid, 'What does the conflict involving Balanakon demonstrate?', 'Ano ang ginapakita sang banggianay nahanungod kay Balanakon?', 5),
    ('c1000000-0000-4000-8000-000000000006'::uuid, 'Why was Matan-ayon carried toward the underworld in Kalampay?', 'Ngaa man gindala si Matan-ayon pakadto sa idalom sang duta sa Kalampay?', 6),
    ('c1000000-0000-4000-8000-000000000007'::uuid, 'What does Labaw Donggon''s experience with Masangladon show?', 'Ano ang ginapakita sang naagihan ni Labaw Donggon kay Masangladon?', 7),
    ('c1000000-0000-4000-8000-000000000008'::uuid, 'How did Matan-ayon respond when Pahagunong became involved in the conflict?', 'Paano nagdesisyon si Matan-ayon sang nag-entra si Pahagunong sa banggianay?', 8),
    ('c1000000-0000-4000-8000-000000000009'::uuid, 'How was Sinagnayan ultimately defeated?', 'Paano napierde sa ulihi si Sinagnayan?', 9),
    ('c1000000-0000-4000-8000-000000000010'::uuid, 'Which statement best describes Mali/Nagmalitong Yawa?', 'Diin nga pahayag ang labing maayo nga nagahulagway kay Mali/Nagmalitong Yawa?', 10),
    ('c1000000-0000-4000-8000-000000000011'::uuid, 'What does the tuos represent in Pagbalukat ka Biday?', 'Ano ang ginarepresentar sang "tuos" sa Pagbalukat ka Biday?', 11),
    ('c1000000-0000-4000-8000-000000000012'::uuid, 'What is the significance of the Hungaw story?', 'Ano ang kahulugan sang istorya sang Hungaw?', 12),
    ('c1000000-0000-4000-8000-000000000013'::uuid, 'What important idea is presented through Mali''s death and restoration in Ginlawan?', 'Ano ang importante nga ideya nga ginaatubang paagi sa kamatayon kag pagbalik sang kabuhi ni Mali sa Ginlawan?', 13),
    ('c1000000-0000-4000-8000-000000000014'::uuid, 'Why did Laon Sina recommend planting an alayaw tree?', 'Ngaa man naglaygay si Laon Sina sang pagtanum sang kahoy nga alayaw?', 14),
    ('c1000000-0000-4000-8000-000000000015'::uuid, 'What does Nagbuhis reveal about Mali''s role and the transmission of knowledge?', 'Ano ang ginapahayag ni Nagbuhis nahanungod kay Mali kag sa pagpasa sang kinaagman?', 15)
) AS v(id, prompt, prompt_hiligaynon, sort_order)
CROSS JOIN public.assessments a
WHERE a.type = 'post';

INSERT INTO public.question_options (id, question_id, label, label_hiligaynon, sort_order, is_correct)
VALUES
  ('c2000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'The bamboo belonged to his brother', 'Ang kawayan iya sang iya utod', 1, false),
  ('c2000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'The bamboo was a sacred object owned by Makabagting and Amburukay', 'Ang kawayan isa ka sagrado nga gamit nanday Makabagting kag Amburukay', 2, true),
  ('c2000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 'The bamboo contained a hidden treasure', 'May tago nga manggad ang kawayan', 3, false),
  ('c2000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 'The bamboo was needed to build a boat', 'Ginakinahanglan ang kawayan para maghimo sang biday', 4, false),
  ('c2000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000002', 'She imprisoned them in the underworld', 'Ginpriso niya sila sa idalom sang duta', 1, false),
  ('c2000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000002', 'She raised them as her own daughters in a golden chamber as binukot', 'Ginpadaku niya sila pareho sang iya kaugalingon nga mga babaye nga anak sa isa ka bulawan nga kuwarto bilang binukot', 2, true),
  ('c2000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000002', 'She sent them to Labaw Donggon', 'Ginpadala niya sila kay Labaw Donggon', 3, false),
  ('c2000000-0000-4000-8000-000000000008', 'c1000000-0000-4000-8000-000000000002', 'She trained them to become warriors', 'Gin-giyahan niya sila para maging mga bagani', 4, false),
  ('c2000000-0000-4000-8000-000000000009', 'c1000000-0000-4000-8000-000000000003', 'Taking what one wants can create obligations and consequences', 'Ang pagkuha sang luyag sang isa ka tawo makatuga sang obligasyon kag kahinatnan', 1, true),
  ('c2000000-0000-4000-8000-000000000010', 'c1000000-0000-4000-8000-000000000003', 'Physical strength always solves conflicts', 'Ang pisikal nga kusog pirme nga nagasolbar sang banggianay', 2, false),
  ('c2000000-0000-4000-8000-000000000011', 'c1000000-0000-4000-8000-000000000003', 'Marriage is unrelated to family obligations', 'Ang kasal wala sang labot sa obligasyon sa pamilya', 3, false),
  ('c2000000-0000-4000-8000-000000000012', 'c1000000-0000-4000-8000-000000000003', 'Magical objects have no importance', 'Ang mga engkantado nga gamit wala sang importansya', 4, false),
  ('c2000000-0000-4000-8000-000000000013', 'c1000000-0000-4000-8000-000000000004', 'It was needed to enter the underworld', 'Kinahanglan ini para makasulod sa idalom sang duta', 1, false),
  ('c2000000-0000-4000-8000-000000000014', 'c1000000-0000-4000-8000-000000000004', 'It was the condition through which a suitor could prove his right to marry Matan-ayon', 'Ini ang kondisyon diin ang isa ka nagapangasawa makapamatuod sang iya katungod nga makasal kay Matan-ayon', 2, true),
  ('c2000000-0000-4000-8000-000000000015', 'c1000000-0000-4000-8000-000000000004', 'It belonged to Sinagnayan', 'Iya ini ni Sinagnayan', 3, false),
  ('c2000000-0000-4000-8000-000000000016', 'c1000000-0000-4000-8000-000000000004', 'It was used during a ritual ceremony', 'Gingamit ini sa tion sang selebrasyon sang ritual', 4, false),
  ('c2000000-0000-4000-8000-000000000017', 'c1000000-0000-4000-8000-000000000005', 'Every conflict can be solved through greater physical strength', 'Ang tagsa ka banggianay masolbar paagi sa mas daku nga pisikal nga kusog', 1, false),
  ('c2000000-0000-4000-8000-000000000018', 'c1000000-0000-4000-8000-000000000005', 'Extraordinary power makes negotiation unnecessary', 'Ang pinasahi nga gahum nagahimo sa negosasyon nga indi na kinahanglan', 2, false),
  ('c2000000-0000-4000-8000-000000000019', 'c1000000-0000-4000-8000-000000000005', 'Some conflicts require an authoritative intermediary rather than force alone', 'Ang pila ka banggianay nagakinahanglan sang may awtoridad nga tagpatunga sa baylo nga kusog lang', 3, true),
  ('c2000000-0000-4000-8000-000000000020', 'c1000000-0000-4000-8000-000000000005', 'Rivalries are always resolved through marriage', 'Ang mga pag-agaway pirme nga nagatapos sa kasal', 4, false),
  ('c2000000-0000-4000-8000-000000000021', 'c1000000-0000-4000-8000-000000000006', 'She intentionally travelled there to meet Masangladon', 'Hungod sia nga naglakbay didto para makigkita kay Masangladon', 1, false),
  ('c2000000-0000-4000-8000-000000000022', 'c1000000-0000-4000-8000-000000000006', 'She unknowingly entered the transformed crab-island while gathering fruit', 'Wala sia nakahibalo nga nakasulod sia sa nagbaylo nga alimango-isla samtang nagatipon sang bunga sang kahoy', 2, true),
  ('c2000000-0000-4000-8000-000000000023', 'c1000000-0000-4000-8000-000000000006', 'Labaw Donggon sent her there', 'Ginpadala sia didto ni Labaw Donggon', 3, false),
  ('c2000000-0000-4000-8000-000000000024', 'c1000000-0000-4000-8000-000000000006', 'She was searching for Sinagnayan', 'Nagapangita sia kay Sinagnayan', 4, false),
  ('c2000000-0000-4000-8000-000000000025', 'c1000000-0000-4000-8000-000000000007', 'Even a powerful hero may need to respect other jurisdictions and powers', 'Bisan ang gamhanan nga bagani kinahanglan magrespeto sa iban nga sakop kag gahum', 1, true),
  ('c2000000-0000-4000-8000-000000000026', 'c1000000-0000-4000-8000-000000000007', 'Heroes always win through combat', 'Ang mga bagani pirme nagadaog sa away', 2, false),
  ('c2000000-0000-4000-8000-000000000027', 'c1000000-0000-4000-8000-000000000007', 'The underworld has no rules', 'Ang idalom sang duta wala sang mga kaangtanan nga kasugtanan', 3, false),
  ('c2000000-0000-4000-8000-000000000028', 'c1000000-0000-4000-8000-000000000007', 'Matan-ayon can resolve every conflict herself', 'Masolbar ni Matan-ayon ang tagsa ka banggianay sa iya kaugalingon', 4, false),
  ('c2000000-0000-4000-8000-000000000029', 'c1000000-0000-4000-8000-000000000008', 'She remained passive and waited for Labaw Donggon', 'Nagpabilin sia nga pasibo kag naghulat kay Labaw Donggon', 1, false),
  ('c2000000-0000-4000-8000-000000000030', 'c1000000-0000-4000-8000-000000000008', 'She transformed herself into a man and entered the conflict', 'Ginbaylo niya ang iya kaugalingon nga maging lalaki kag nag-entra sa banggianay', 2, true),
  ('c2000000-0000-4000-8000-000000000031', 'c1000000-0000-4000-8000-000000000008', 'She escaped into the underworld', 'Nagpalagyo sia pakadto sa idalom sang duta', 3, false),
  ('c2000000-0000-4000-8000-000000000032', 'c1000000-0000-4000-8000-000000000008', 'She asked Sinagnayan for help', 'Nangayo sia sang bulig kay Sinagnayan', 4, false),
  ('c2000000-0000-4000-8000-000000000033', 'c1000000-0000-4000-8000-000000000009', 'Labaw Donggon defeated him through strength alone', 'Gin-pierde sia ni Labaw Donggon paagi sa kusog lang', 1, false),
  ('c2000000-0000-4000-8000-000000000034', 'c1000000-0000-4000-8000-000000000009', 'Matan-ayon defeated him with magic', 'Gin-pierde sia ni Matan-ayon paagi sa salamangka', 2, false),
  ('c2000000-0000-4000-8000-000000000035', 'c1000000-0000-4000-8000-000000000009', 'Knowledge about his hidden life-force, disguise, cooperation, and strategy made his defeat possible', 'Ang kinaagman nahanungod sa iya tago nga kabuhi, pagpakunokuno, pagbuligay, kag taktika ang nakapahimo sang iya kapierdihan', 3, true),
  ('c2000000-0000-4000-8000-000000000036', 'c1000000-0000-4000-8000-000000000009', 'Balanakon defeated him', 'Gin-pierde sia ni Balanakon', 4, false),
  ('c2000000-0000-4000-8000-000000000037', 'c1000000-0000-4000-8000-000000000010', 'She is mainly a passive character waiting for Humadapnon', 'Sia isa sa mga una nga pasibo nga karakter nga nagahulat kay Humadapnon', 1, false),
  ('c2000000-0000-4000-8000-000000000038', 'c1000000-0000-4000-8000-000000000010', 'She actively uses disguise, ritual, magic, strategy, and rescue throughout the story', 'Aktibo sia nga nagagamit sang pagpakunokuno, ritual, salamangka, taktika, kag pagluwas sa bilog nga istorya', 2, true),
  ('c2000000-0000-4000-8000-000000000039', 'c1000000-0000-4000-8000-000000000010', 'She appears only during the wedding', 'Nagaguwa lang sia sa tion sang kasal', 3, false),
  ('c2000000-0000-4000-8000-000000000040', 'c1000000-0000-4000-8000-000000000010', 'She is primarily an antagonist to Humadapnon', 'Sia ang una nga kaaway ni Humadapnon', 4, false),
  ('c2000000-0000-4000-8000-000000000041', 'c1000000-0000-4000-8000-000000000011', 'A punishment for breaking a promise', 'Isa ka silot sa paglapas sang promisa', 1, false),
  ('c2000000-0000-4000-8000-000000000042', 'c1000000-0000-4000-8000-000000000011', 'A mark of engagement represented by an heirloom boat', 'Tanda sang pagpangasawa nga ginasimbolo sang ginpanubli nga biday', 2, true),
  ('c2000000-0000-4000-8000-000000000043', 'c1000000-0000-4000-8000-000000000011', 'A weapon used by Paglambuhan', 'Armas nga gin-gamit ni Paglambuhan', 3, false),
  ('c2000000-0000-4000-8000-000000000044', 'c1000000-0000-4000-8000-000000000011', 'A ceremony for entering the underworld', 'Isa ka selebrasyon sa pagsulod sa idalom sang duta', 4, false),
  ('c2000000-0000-4000-8000-000000000045', 'c1000000-0000-4000-8000-000000000012', 'It focuses on a formal marriage involving extended families, hospitality, and social relationships', 'Nagatutok ini sa pormal nga kasal nga nagasakup sang bilog nga pamilya, pag-asikaso sang bisita, kag relasyon sa katilingban', 1, true),
  ('c2000000-0000-4000-8000-000000000046', 'c1000000-0000-4000-8000-000000000012', 'It explains how Tikum Kadlum was born', 'Nagasaysay ini kun paano ginbun-ag si Tikum Kadlum', 2, false),
  ('c2000000-0000-4000-8000-000000000047', 'c1000000-0000-4000-8000-000000000012', 'It describes Matan-ayon''s journey into the underworld', 'Nagahulagway ini sang paglakbay ni Matan-ayon sa idalom sang duta', 3, false),
  ('c2000000-0000-4000-8000-000000000048', 'c1000000-0000-4000-8000-000000000012', 'It focuses on Balanakon''s powers', 'Nagatutok ini sa mga gahum ni Balanakon', 4, false),
  ('c2000000-0000-4000-8000-000000000049', 'c1000000-0000-4000-8000-000000000013', 'Supernatural powers always guarantee a happy ending', 'Ang engkantado nga gahum pirme nagapasalig sang malipayon nga katapusan', 1, false),
  ('c2000000-0000-4000-8000-000000000050', 'c1000000-0000-4000-8000-000000000013', 'Honour, loyalty, justice, and marital obligations can have consequences even after supernatural rescue', 'Ang dungog, katutom, hustisya, kag obligasyon sa pag-asawahay may mga kahinatnan bisan sa ulihi sang engkantado nga pagluwas', 2, true),
  ('c2000000-0000-4000-8000-000000000051', 'c1000000-0000-4000-8000-000000000013', 'Marriage eliminates all conflict', 'Ang kasal nagadula sang tanan nga banggianay', 3, false),
  ('c2000000-0000-4000-8000-000000000052', 'c1000000-0000-4000-8000-000000000013', 'Humadapnon''s actions have no consequences', 'Ang mga ginhimo ni Humadapnon wala sang kahinatnan', 4, false),
  ('c2000000-0000-4000-8000-000000000053', 'c1000000-0000-4000-8000-000000000014', 'To protect Mali''s family', 'Para protektahan ang pamilya ni Mali', 1, false),
  ('c2000000-0000-4000-8000-000000000054', 'c1000000-0000-4000-8000-000000000014', 'To provide food for Humadapnon', 'Para maghatag sang pagkaon kay Humadapnon', 2, false),
  ('c2000000-0000-4000-8000-000000000055', 'c1000000-0000-4000-8000-000000000014', 'To entice Mali out of her enclosure so Humadapnon could see her', 'Para ganyaton si Mali nga magguwa sa iya kuwarto para makita sia ni Humadapnon', 3, true),
  ('c2000000-0000-4000-8000-000000000056', 'c1000000-0000-4000-8000-000000000014', 'To open a passage to the underworld', 'Para mag-abli sang daan pakadto sa idalom sang duta', 4, false),
  ('c2000000-0000-4000-8000-000000000057', 'c1000000-0000-4000-8000-000000000015', 'Mali is excluded completely from ritual knowledge', 'Si Mali lubos nga ginpahigad gikan sa kinaagman sa ritual', 1, false),
  ('c2000000-0000-4000-8000-000000000058', 'c1000000-0000-4000-8000-000000000015', 'Mali is connected to the inheritance of ritual knowledge and authority through her maternal family', 'Si Mali may kaangtanan sa panublion sang kinaagman sa ritual kag awtoridad paagi sa pamilya sang iya iloy', 2, true),
  ('c2000000-0000-4000-8000-000000000059', 'c1000000-0000-4000-8000-000000000015', 'Only Humadapnon can possess supernatural knowledge', 'Si Humadapnon lang ang makapanag-iya sang engkantado nga kinaagman', 3, false),
  ('c2000000-0000-4000-8000-000000000060', 'c1000000-0000-4000-8000-000000000015', 'Ritual knowledge is unrelated to family', 'Ang kinaagman sa ritual wala sang labot sa pamilya', 4, false)
;

COMMIT;
