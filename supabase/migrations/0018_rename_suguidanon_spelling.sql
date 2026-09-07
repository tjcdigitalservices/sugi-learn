-- Correct product spelling: Sugidanon → Suguidanon

UPDATE public.site_notices
SET
  body = replace(body, 'Sugidanon', 'Suguidanon'),
  short_text = replace(short_text, 'Sugidanon', 'Suguidanon'),
  title = replace(title, 'Sugidanon', 'Suguidanon')
WHERE body LIKE '%Sugidanon%'
   OR short_text LIKE '%Sugidanon%'
   OR title LIKE '%Sugidanon%';

UPDATE public.chapters
SET
  title = replace(title, 'Sugidanon', 'Suguidanon'),
  subtitle = CASE
    WHEN subtitle IS NULL THEN NULL
    ELSE replace(subtitle, 'Sugidanon', 'Suguidanon')
  END,
  summary = CASE
    WHEN summary IS NULL THEN NULL
    ELSE replace(summary, 'Sugidanon', 'Suguidanon')
  END
WHERE title LIKE '%Sugidanon%'
   OR coalesce(subtitle, '') LIKE '%Sugidanon%'
   OR coalesce(summary, '') LIKE '%Sugidanon%';

UPDATE public.chapter_sections
SET
  title = replace(title, 'Sugidanon', 'Suguidanon'),
  body_text = CASE
    WHEN body_text IS NULL THEN NULL
    ELSE replace(body_text, 'Sugidanon', 'Suguidanon')
  END,
  transcript = CASE
    WHEN transcript IS NULL THEN NULL
    ELSE replace(transcript, 'Sugidanon', 'Suguidanon')
  END,
  completion_message = CASE
    WHEN completion_message IS NULL THEN NULL
    ELSE replace(completion_message, 'Sugidanon', 'Suguidanon')
  END
WHERE title LIKE '%Sugidanon%'
   OR coalesce(body_text, '') LIKE '%Sugidanon%'
   OR coalesce(transcript, '') LIKE '%Sugidanon%'
   OR coalesce(completion_message, '') LIKE '%Sugidanon%';

UPDATE public.assessments
SET
  title = replace(title, 'Sugidanon', 'Suguidanon'),
  instructions = CASE
    WHEN instructions IS NULL THEN NULL
    ELSE replace(instructions, 'Sugidanon', 'Suguidanon')
  END
WHERE title LIKE '%Sugidanon%'
   OR coalesce(instructions, '') LIKE '%Sugidanon%';

UPDATE public.questions
SET
  prompt = replace(prompt, 'Sugidanon', 'Suguidanon'),
  explanation = CASE
    WHEN explanation IS NULL THEN NULL
    ELSE replace(explanation, 'Sugidanon', 'Suguidanon')
  END,
  source_reference = CASE
    WHEN source_reference IS NULL THEN NULL
    ELSE replace(source_reference, 'Sugidanon', 'Suguidanon')
  END
WHERE prompt LIKE '%Sugidanon%'
   OR coalesce(explanation, '') LIKE '%Sugidanon%'
   OR coalesce(source_reference, '') LIKE '%Sugidanon%';

UPDATE public.question_options
SET
  label = replace(label, 'Sugidanon', 'Suguidanon'),
  explanation = CASE
    WHEN explanation IS NULL THEN NULL
    ELSE replace(explanation, 'Sugidanon', 'Suguidanon')
  END
WHERE label LIKE '%Sugidanon%'
   OR coalesce(explanation, '') LIKE '%Sugidanon%';

UPDATE public.learning_points
SET
  title = CASE
    WHEN title IS NULL THEN NULL
    ELSE replace(title, 'Sugidanon', 'Suguidanon')
  END,
  description = replace(description, 'Sugidanon', 'Suguidanon')
WHERE coalesce(title, '') LIKE '%Sugidanon%'
   OR description LIKE '%Sugidanon%';
