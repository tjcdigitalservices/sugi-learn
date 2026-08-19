# Assessment Management (M9)

**Last updated:** 2026-08-19

Administrative CMS for pre- and post-assessment content. Admins manage assessment metadata, questions, options, ordering, and review status without changing application code.

Official question content is seeded from the client PDF bank (`lib/assessment/official-question-bank.json`) and remains fully editable in Admin afterward.

---

## Overview

M9 provides:

- Assessment list at `/admin/assessments`
- Assessment editor at `/admin/assessments/[assessmentId]`
- Admin preview at `/admin/assessments/[assessmentId]/preview`
- CRUD for questions and options via extended `AssessmentRepository`
- Shared `AssessmentEngine` for learner and admin preview
- Official 15+15 pre/post seed (client PDF) applied via `scripts/seed-official-assessments.mjs`

Ongoing edits (add / edit / delete / reorder) happen in Admin CMS — content is **not** hardcoded to chapters, lessons, or animations.

---

## Routes

| Route | Purpose |
|-------|---------|
| `/admin/assessments` | List pre/post assessments with counts and status |
| `/admin/assessments/[assessmentId]` | Metadata + question management workspace |
| `/admin/assessments/[assessmentId]/preview` | Admin preview using `AssessmentEngine` |

All routes require admin authentication (M3). Server actions call `requireAdmin()` before mutations.

---

## Assessment Metadata

Editable fields:

| Field | Notes |
|-------|-------|
| Title | Required |
| Instructions | Optional learner-facing text |
| Review status | `draft`, `for_review`, `approved`, `needs_revision` |

Not editable:

- Assessment type (`pre` / `post`) — fixed by schema (`assessment_type` UNIQUE)

New assessments are created via **Initialize Pre/Post Assessments** when records do not yet exist in Supabase.

---

## Question Management

Admins can:

- View ordered question list
- Add question (starts as **Draft** with placeholder options)
- Edit question text, explanation, source reference, chapter association, status
- Add / edit / delete / reorder options
- Mark exactly one correct answer
- Move questions up / down (persisted `sort_order`)
- Delete questions (hard delete when unused; **retire** to Draft when learner answers exist)

Question count is determined by the database — not hardcoded to 15. Official seed loads 15 per assessment as a starting bank; admins may add or remove freely.

---

## Answer Options

- Minimum 2 options per question (validation)
- Exactly one option marked correct
- Options saved atomically with the question (replace-on-save in repository)
- Correct answers remain server-side for learners (`getLearnerAssessmentQuestions` strips correctness)

---

## Chapter Association

Optional `chapter_id` FK maps to the 13 official chapter records.

- UI uses chapter slug (domain id)
- Repository converts slug ↔ UUID for Supabase
- Empty selection = no chapter association

Do not invent official chapter associations — enter when client supplies them.

---

## Source Reference

Optional `source_reference` field for traceability to approved learning material.

Admins enter the actual reference when provided. Do not invent references.

---

## Review Status

Single enum across assessments and questions:

```
draft → for_review → approved
                  ↘ needs_revision
```

- New questions default to **Draft**
- Learners only see **Approved** content (RLS)

---

## Official question seed

Source of truth: [`lib/assessment/official-question-bank.json`](../lib/assessment/official-question-bank.json)

| Artifact | Purpose |
|----------|---------|
| `scripts/seed-official-assessments.mjs` | Apply bank via service role (preferred) |
| `supabase/seed-official-pre-assessment.sql` | SQL equivalent for `psql` |
| `supabase/seed-official-post-assessment.sql` | SQL equivalent for `psql` |
| `scripts/generate-official-assessment-seeds.mjs` | Regenerate SQL from JSON |

```bash
# Preferred (uses .env.local service role)
npm run db:seed-assessments

# Or with psql
psql $DATABASE_URL -f supabase/seed-official-pre-assessment.sql
psql $DATABASE_URL -f supabase/seed-official-post-assessment.sql
```

Do **not** run deprecated `seed-dev-*-assessment.sql` files — they only print a redirect message.

Seeds set assessment + question `review_status = approved`, leave `chapter_id` null, and store correct answers only in `question_options.is_correct` (hidden from learners).

---

## Delete Behavior

| Case | Behavior |
|------|----------|
| Question with learner `assessment_answers` | **Retired** — `review_status` set to `draft` (hidden from learners via RLS); row kept for history |
| Question without learner answers | Hard delete with confirmation UI |
| Options | Replaced on question save; cascade delete when question deleted |

No soft-delete column in M2 schema. Retiring via Draft preserves historical attempt integrity.

---

## Admin Preview

`/admin/assessments/[assessmentId]/preview` reuses `AssessmentEngine` with `mode="preview"`:

- Same navigation and question display as learner flow
- Correct answers visible to authorized admins
- No submission or scoring
- Does not affect learner-facing security model

---

## Security

- `requireAdmin()` on all mutations
- RLS: admin write policies on assessments, questions, options (M2)
- Learners cannot modify assessment content
- Service-role client not used in admin UI
- Learner routes continue using `getLearnerAssessmentQuestions()` without correct answers

---

## Repository Extensions

Extended `AssessmentRepository` (not a duplicate system):

| Method | Purpose |
|--------|---------|
| `listAssessmentsForAdmin()` | List with instructions, updatedAt |
| `getAssessmentForAdmin(id)` | Single assessment detail |
| `initializeDefaultAssessments()` | Create pre/post draft records if missing |
| `updateAssessmentMetadata()` | Title, instructions, status |
| `createQuestion()` | New question + options |
| `updateQuestion()` | Update question + replace options |
| `deleteQuestion()` | Hard delete or retire-to-draft when answers exist |
| `reorderQuestions()` | Persist sort order |
| `questionHasLearnerAnswers()` | Delete guard |

Domain: `lib/domain/assessment-management.ts`  
Actions: `lib/assessment-management/actions.ts`  
Validation: `lib/assessment-management/validation.ts`

---

## Database

No new migrations in M9. Uses existing M2 tables:

- `assessments`
- `questions`
- `question_options`

---

## Known Limitations

1. No bulk CSV import/export UI (official PDF bank is seeded via script/SQL; ongoing edits in Admin)
2. No drag-and-drop reordering (move up/down only)
3. No separate option-level review status
4. Mock repository stores admin edits in memory only

---

## Pending Client Confirmation

- Whether chapter association should be required for certain question types
- Whether assessment-level approval alone is sufficient vs per-question approval for learners

---

## Related

- `docs/PRE_ASSESSMENT.md` — M8 learner engine
- `docs/CHAPTER_MANAGEMENT.md` — parallel CMS patterns (M5)
- `docs/AUTHENTICATION.md` — admin authorization
- `docs/PRODUCTION_DEPLOYMENT.md` — seed order for deploy