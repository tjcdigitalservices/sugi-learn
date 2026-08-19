# M18.5 — Dynamic Chapter Scalability Audit

**Date:** 2026-08-15  
**Status:** Complete  
**Scope:** Verify SugiLearn treats the 13 Sugidanon stories as initial content, not a system limit.

---

## Executive Summary

SugiLearn is **dynamically scalable** for admin-managed chapters. The initial 13 chapters remain seeded content; admins can create, reorder, publish, and archive additional chapters without developer intervention. Core learner flows (journey, navigation, progress, analytics) derive chapter counts from the database at runtime.

---

## Audit Method

1. Read architecture and chapter-management documentation.
2. Searched codebase for hardcoded limits (`13`, `LIMIT 13`, `.slice(..., 13)`, `length === 13`, fixed catalog usage in production paths).
3. Inspected database constraints, admin CRUD, learner navigation, progress, analytics, media, assessments, seeds, and routes.
4. Applied migration `0006_chapter_active_flag.sql` to linked Supabase.
5. Ran Chapter 14 create → publish → archive → cleanup integration test on linked database.
6. Ran `npm run lint` and `npm run build`.

---

## Hardcoded Assumptions Found

| Location | Issue | Severity | Resolution |
|----------|-------|----------|------------|
| `components/admin/media-management/media-library.tsx` | Used `CHAPTER_CATALOG` (13 fixed entries) for chapter filter dropdown | **Blocker** | Fixed — loads chapters from DB via `listChaptersForAdmin()` |
| Admin chapter list | No create/reorder/archive API or UI | **Blocker** | Added `createChapter`, `reorderChapters`, `setChapterActive` + admin UI |
| Archive semantics | No safe way to hide chapter from journey without deleting data | **Gap** | Added `chapters.is_active` column + learner visibility filters |
| `lib/constants/chapters.ts` | `CHAPTER_CATALOG` with 13 entries | **Acceptable** | Initial content/bootstrap only; not used in production learner or admin list paths |
| `lib/data/mock/chapter-management-repository.ts` | Bootstraps from `CHAPTER_CATALOG` | **Acceptable (dev)** | Mock dev parity; supports dynamic chapters via `dynamicChapterMeta` |
| `lib/data/mock/media-store.ts` | Title lookup via `CHAPTER_CATALOG` | **Low (mock only)** | Does not affect Supabase production path |
| `app/admin/(shell)/chapters/page.tsx` | Copy mentioned "13 chapters" | **Cosmetic** | Updated to dynamic active count |
| `app/learn/page.tsx`, `app/learn/chapters/page.tsx` | Static "13 chapters" copy | **Cosmetic** | Updated to `{journey.totalChapters}` |
| Handover/user guides (`ADMIN_USER_GUIDE.md`, `LEARNER_USER_GUIDE.md`, etc.) | Reference 13 chapters | **Documentation drift** | Not updated in M18.5 — see Remaining Limitations |
| `supabase/seed.sql`, `seed-chapters-2-13.sql` | Seed 13 initial titles/content | **Acceptable** | Initial content set, not a runtime cap |
| `docs/CHAPTER_ENGINE.md`, `docs/LEARNER_JOURNEY.md` | Example text "Chapter 3 of 13" | **Documentation drift** | Examples only; runtime uses dynamic `total` |

### Not Found (Verified Clean)

- No `LIMIT 13`, `.slice(..., 13)`, or `length === 13` in application code
- No hardcoded chapter ID routes beyond dynamic `[chapterId]`
- No analytics aggregations capped at 13
- No assessment auto-generation when chapters are added
- No database CHECK constraint limiting chapter count to 13

---

## Fixes Made

### Database

**Migration:** `supabase/migrations/0006_chapter_active_flag.sql`

- Adds `is_active BOOLEAN NOT NULL DEFAULT true` on `chapters`
- Partial index on active chapters
- Archive = `is_active = false`; progress and analytics records preserved

### Types & Data Layer

- `ChapterSummary.isActive`, `ChapterRow.is_active` in types and mappers
- `CreateChapterInput`, `AdminChapterListItem.dbId`
- `ChapterManagementRepository`: `createChapter`, `reorderChapters`, `setChapterActive`
- Supabase implementation with temp-offset reorder (`applyChapterNumberOrder`)

### Domain

- `lib/domain/chapter-visibility.ts` — learner journey and navigation filters
- `lib/domain/learner-progress.ts` — uses journey filter (archived hidden unless learner has progress)
- `lib/domain/chapter-navigation.ts` — uses navigation filter (active + published only)

### Admin UI

- `CreateChapterPanel` — create new chapters from `/admin/chapters`
- `ChapterListTable` — reorder (↑/↓), archive/restore
- Media library — chapter filter from DB, not catalog

### Server Actions

- `createChapterAction`, `reorderChaptersAction`, `setChapterActiveAction`

### Build Fixes (M18.5)

- Missing imports in `media-library.tsx` (`MEDIA_KIND_LABELS`, `REVIEW_STATUS_OPTIONS`)
- `ARCHITECTURE_DEMO_CHAPTER.isActive`
- `ReviewStatus` import in mock chapter-management repository

---

## Chapter 14 Test Result

**Environment:** Linked Supabase (`herrcizsvggswyaankcf`)  
**Migration 0006:** Applied via `supabase db push`

| Step | Action | Result |
|------|--------|--------|
| 1 | Insert chapter 14 (`m185-test-chapter-14`) with approved introduction section | **PASS** — total chapters = 14 |
| 2 | Set `is_active = false` (archive) | **PASS** — excluded from active published journey count |
| 3 | Verify section row preserved on archived chapter | **PASS** — 1 section retained |
| 4 | Cleanup (move to temp number, delete sections + chapter) | **PASS** — 13 chapters remain |

**Reorder:** Verified via `applyChapterNumberOrder` implementation (temp-offset two-phase update) used by admin `reorderChaptersAction`. Admin UI exposes up/down controls on `/admin/chapters`.

**Learner visibility rules:**

- **Journey list:** Active chapters OR chapters where learner has existing progress (even if archived)
- **Prev/Next navigation:** Active chapters with at least one approved section only
- **Assessments:** Unchanged — no auto-created questions when chapters are added

---

## Database Changes

| Change | File | Production action |
|--------|------|-------------------|
| `chapters.is_active` column | `0006_chapter_active_flag.sql` | Run `supabase db push` |

No changes to chapter count constraints. Existing `chapter_number UNIQUE` supports any positive integer sequence; reorder uses temp-offset pattern to avoid collisions.

---

## Learner Behavior

| Scenario | Behavior |
|----------|----------|
| New chapter created (draft) | Visible in admin; not in learner journey until sections approved |
| New chapter published | Appears at end of journey (or reordered position) |
| Chapter reordered | Learner journey and prev/next follow `chapter_number` order |
| Chapter archived | Hidden from new learners; learners with existing progress still see it |
| Progress on archived chapter | Preserved in `chapter_progress`; not deleted |
| Analytics on archived chapter | Historical records preserved |
| Chapter 13 no longer "final" | Last chapter = highest-numbered active published chapter |

---

## Remaining Limitations

1. **Handover/user guides** still say "13 chapters" — update when client communications are refreshed.
2. **`CHAPTER_CATALOG`** remains for mock bootstrap and initial seed reference — not a runtime cap.
3. **Mock media store** title lookup uses catalog — dev-only.
4. **Chapter number gaps** after archive — archived chapters retain their number; reorder is admin responsibility.
5. **No bulk import UI** — admins create chapters one at a time (acceptable for M18.5 scope).
6. **Assessments** remain independently managed — adding a chapter does not create assessment content (by design).

---

## Build & Lint

```
npm run lint  — PASS
npm run build — PASS
```

---

## Confirmation

**SugiLearn now treats the current 13 chapters as content, not as a system limit.**

Admins can manage additional chapters without developer intervention via `/admin/chapters` (create, edit, reorder, archive). The learner journey, progress tracking, and analytics operate on dynamic chapter counts from the database.

**STOP — M18.5 complete. No M20 work included.**
