-- DEVELOPMENT PLACEHOLDER — superseded by official content.
-- Do not run this file on staging/production.
--
-- For local or production assessment content, run instead:
--   node --env-file=.env.local scripts/seed-official-assessments.mjs
--   # or
--   psql $DATABASE_URL -f supabase/seed-official-pre-assessment.sql
--   psql $DATABASE_URL -f supabase/seed-official-post-assessment.sql
--
-- Source of truth: lib/assessment/official-question-bank.json
-- Regenerate SQL: node scripts/generate-official-assessment-seeds.mjs

\echo 'DEPRECATED: use seed-official-post-assessment.sql / scripts/seed-official-assessments.mjs'
