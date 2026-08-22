# Sugidanon — Database

**Version:** M2  
**Last updated:** 2026-08-15

PostgreSQL schema for Sugidanon, managed via Supabase migrations in `supabase/migrations/`.

---

## Overview

| Layer | Location |
|-------|----------|
| SQL migrations | `supabase/migrations/` |
| Seed data | `supabase/seed.sql` |
| TypeScript DB types | `types/database.ts` |
| Domain mappers | `lib/data/supabase/mappers/` |
| Repositories | `lib/data/supabase/` |

---

## Enums

| Enum | Values |
|------|--------|
| `review_status` | `draft`, `for_review`, `approved`, `needs_revision` |
| `user_role` | `learner`, `admin` |
| `section_kind` | `introduction`, `story`, `characters`, `cultural_context`, `illustration`, `audio`, `animation`, `learning_points`, `activity`, `completion` |
| `media_kind` | `illustration`, `audio`, `animation` |
| `assessment_type` | `pre`, `post` |

---

## Tables

### `profiles`
Application profile linked to `auth.users`. No credentials stored in PostgreSQL.

| Column | Purpose |
|--------|---------|
| `id` | PK, FK → `auth.users.id` |
| `role` | `learner` or `admin` |
| `display_name` | Optional display name |

Auto-created on auth signup via `handle_new_user()` trigger.

### `chapters`
Canonical 13-chapter catalog.

| Column | Purpose |
|--------|---------|
| `slug` | URL/domain id (unique), e.g. `tikum-kadlum` |
| `chapter_number` | Order (unique) |
| `title` | Official chapter title |
| `subtitle`, `summary` | Optional metadata (not seeded) |
| `review_status` | Content workflow state |

### `chapter_sections`
Ordered sections within a chapter. Maps to M1 `ChapterSection` discriminated union.

| Column | Purpose |
|--------|---------|
| `kind` | Section type enum |
| `sort_order` | Display order (unique per chapter) |
| `body_text` | Text sections |
| `transcript` | Audio sections |
| `completion_message` | Completion sections |
| `media_asset_id` | Illustration/audio/animation sections |
| `review_status` | Per-section approval |

### `characters`
Reusable character records (not duplicated per chapter).

### `chapter_characters`
Many-to-many: which characters appear in which chapters.

### `section_characters`
Characters referenced by a `characters`-kind section.

### `learning_points`
Learning points owned by a chapter.

### `section_learning_points`
Learning points referenced by a `learning_points`-kind section.

### `media_assets`
Metadata for illustrations, audio, and animations. Files live in Supabase Storage (M11+).

| Column | Purpose |
|--------|---------|
| `storage_path` | Storage object path (nullable until upload) |
| `duration_seconds` | Audio/animation duration |
| `chapter_id`, `section_id` | Optional associations |

### `assessments`
Pre- and post-assessment definitions (`type` is unique).

### `questions`
Assessment questions with source references.

### `question_options`
Normalized answer choices with `is_correct` flag.

### `learner_chapter_progress`
Per-learner, per-chapter progress.

| Column | Purpose |
|--------|---------|
| `current_section_id` | Resume pointer |
| `completed_at` | Null until chapter complete |

Completion percentage is derived from section completion (M15), not stored redundantly.

### `assessment_attempts`
Learner assessment sessions with optional `score` on completion.

### `assessment_answers`
Individual answers within an attempt.

---

## Relationships

```
auth.users ──1:1── profiles

chapters ──1:N── chapter_sections
chapters ──1:N── learning_points
chapters ──1:N── media_assets
chapters ──M:N── characters (via chapter_characters)

chapter_sections ──M:N── characters (via section_characters)
chapter_sections ──M:N── learning_points (via section_learning_points)
chapter_sections ──N:1── media_assets (optional)

assessments ──1:N── questions ──1:N── question_options

profiles ──1:N── learner_chapter_progress ──N:1── chapters
profiles ──1:N── assessment_attempts ──1:N── assessment_answers
```

---

## RLS Strategy

| Audience | Access |
|----------|--------|
| **Anonymous** | Read chapter catalog metadata (`chapters` table only) |
| **Authenticated learner** | Read approved sections/media/characters/questions; read/write own progress and attempts |
| **Admin** (`profiles.role = 'admin'`) | Full CRUD on content, assessments, media metadata |

Helper functions:
- `public.is_admin()` — checks admin role
- `public.is_authenticated_user()` — checks session

### M3 limitation
Authentication UI and role assignment are not implemented yet. Until M3:
- Learner content (sections, media) requires an authenticated session
- Admin policies require `profiles.role = 'admin'` tied to `auth.uid()`
- Server-side verification scripts use the **service role** (bypasses RLS) — never expose this key to the client

---

## Indexes

- `chapters.review_status`
- `chapter_sections(chapter_id)`, `(chapter_id, sort_order)`
- `questions(assessment_id)`, `questions(chapter_id)`
- `question_options(question_id)`
- `learner_chapter_progress(profile_id)`
- `assessment_attempts(profile_id)`, `(assessment_id)`
- `media_assets(chapter_id)`, `(section_id)`

---

## Seed Data

`supabase/seed.sql` seeds **only**:

- 13 official chapter titles and numbers
- `review_status = draft` for all chapters

**Not seeded:** summaries, sections, characters, learning points, questions, assessments, media, or analytics.

---

## Migration Workflow

### Prerequisites
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Supabase project (local or hosted)

### Local development

```bash
# Start local Supabase (Docker required)
supabase start

# Apply migrations + seed
supabase db reset

# Or push migrations to linked remote project
supabase db push
```

### Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server/scripts only)

### Verification

```bash
npm run db:verify
npm run db:repository-test
```

### Migration files

| File | Purpose |
|------|---------|
| `0001_foundation.sql` | Enums, tables, indexes, triggers |
| `0002_rls.sql` | Row Level Security policies |
| `0003_auth_profile_defaults.sql` | Auth/profile documentation comments (M3) |

---

## Repository Mapping

| Interface | Implementation | Tables used |
|-----------|----------------|-------------|
| `ChapterRepository` | `SupabaseChapterRepository` | `chapters`, `chapter_sections`, `media_assets`, `characters`, `chapter_characters`, `learning_points`, junction tables |
| `ChapterManagementRepository` | `SupabaseChapterManagementRepository` | Same tables; admin write operations (M5) |
| `AssessmentRepository` | `SupabaseAssessmentRepository` | `assessments`, `questions`, `question_options` |
| `ProgressRepository` | `SupabaseProgressRepository` | `learner_chapter_progress`, `assessment_attempts` (M7 chapter progress) |

Factory: `lib/data/index.ts` — uses Supabase when public env vars are set; falls back to mocks otherwise.

Domain `id` for chapters is the database `slug` column.

Special case: `architecture-demo` chapter remains an in-memory M1 demo (not in database).

---

## Type Generation

When connected to a Supabase project, regenerate types:

```bash
supabase gen types typescript --local > types/database.generated.ts
```

M2 maintains hand-written types in `types/database.ts` aligned with migrations.

---

## Related Documentation

- `docs/ARCHITECTURE.md`
- `docs/Sugidanon_Project_Specification.md`
