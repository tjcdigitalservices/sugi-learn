# Sugidanon — Chapter Management

**Version:** M5  
**Last updated:** 2026-08-15

Administrative chapter management for the 13 official Sugidanon chapters. This document covers behavior, data access, validation, and known limitations.

---

## Overview

M5 provides a CMS foundation for admins to manage:

- Chapter metadata (title, subtitle, summary, review status)
- Ordered chapter sections (all M1 section kinds)
- Chapter–character associations (existing records only)
- Chapter learning points (CRUD + reorder)

M5 does **not** implement media upload, learner chapter engine (M6), assessments, or full review workflow UI.

---

## Routes

| Route | Purpose |
|-------|---------|
| `/admin/chapters` | Chapter list with status, content state, section count, last updated |
| `/admin/chapters/[chapterId]` | Chapter editor (Overview, Sections, Characters, Learning points tabs) |
| `/admin/chapters/[chapterId]/preview` | Admin preview using existing `ChapterEngine` |

All routes require admin authentication (M3). Server actions call `requireAdmin()` before mutations.

---

## Chapter Metadata

Editable fields:

| Field | Notes |
|-------|-------|
| Title | Required; max 200 characters. Official seeded titles should not be replaced with unvalidated story content. |
| Subtitle | Optional short description |
| Summary | Optional overview; leave empty until client-approved summary exists |
| Review status | `draft`, `for_review`, `approved`, `needs_revision` |

Not editable in M5:

- Chapter number (fixed catalog order)
- Slug / domain id

---

## Section Types

Sections use the M1 discriminated union (`types/chapter.ts`) and map to `chapter_sections.kind`:

| UI group | Kinds | Editable fields |
|----------|-------|-----------------|
| Text | `introduction`, `story`, `cultural_context`, `activity` | Title, status, body content |
| Media | `illustration`, `audio`, `animation` | Title, status; transcript for audio; media placeholder (M11) |
| References | `characters`, `learning_points` | Title, status; checkbox references to chapter characters / learning points |
| Structure | `completion` | Title, status, completion message |

### Section ordering

- Persistent `sort_order` in `chapter_sections`
- Move up / move down controls (no drag-and-drop dependency)
- Two-phase reorder in Supabase to satisfy unique `(chapter_id, sort_order)` constraint
- After delete, remaining sections are renumbered contiguously

---

## Characters

- Admins can **associate existing** `characters` records with a chapter via `chapter_characters`
- Reorder associations with move up / down
- Remove associations
- **No character creation** in M5 — if the character table is empty, UI shows: “No characters have been added yet.”

---

## Learning Points

- CRUD on `learning_points` scoped to chapter
- Fields: optional title, required description, review status
- Reorder with move up / down
- Empty state: “No learning points have been added yet.”
- Do not invent official learning content — use approved sources only

---

## Status Workflow

Single review status enum across chapters, sections, and learning points:

```
draft → for_review → approved
                  ↘ needs_revision
```

Status changes persist to Supabase. No separate parallel status system.

---

## Data Access

### Repository

`ChapterManagementRepository` (`lib/data/types.ts`):

| Method | Purpose |
|--------|---------|
| `listChaptersForAdmin()` | List with `updatedAt`, `sectionCount` |
| `getChapterForAdmin(slug)` | Full chapter for editing |
| `updateChapterMetadata()` | Save chapter fields |
| `createSection()` / `updateSection()` / `deleteSection()` | Section CRUD |
| `reorderSections()` | Persist section order |
| `listAllCharacters()` | Global character list for association |
| `associateCharacter()` / `removeCharacterAssociation()` / `reorderChapterCharacters()` | Chapter–character links |
| `createLearningPoint()` / `updateLearningPoint()` / `deleteLearningPoint()` / `reorderLearningPoints()` | Learning point management |

Implementations:

- `SupabaseChapterManagementRepository` — production
- `MockChapterManagementRepository` — in-memory when Supabase env unset

Domain layer: `lib/domain/chapter-management.ts`  
Server actions: `lib/chapter-management/actions.ts`  
Validation: `lib/chapter-management/validation.ts`

### Database

Uses M2 schema — **no new migration required for M5**. RLS admin write policies from `0002_rls.sql` enforce authorization at the database layer.

Tables used: `chapters`, `chapter_sections`, `chapter_characters`, `section_characters`, `learning_points`, `section_learning_points`, `characters`.

---

## Validation

Server-side validation on all mutations:

- Required title fields
- Valid review status values
- Valid section kinds
- Non-empty learning point descriptions
- Reorder lists must contain all and only existing IDs (no duplicates)

Client-side: HTML `required` attributes and disabled save when metadata unchanged.

Errors return safe user-facing messages — raw Supabase errors are not exposed.

---

## Preview

`/admin/chapters/[chapterId]/preview` renders `ChapterEngine` with an admin banner. Shows current structure for editorial review; not the final learner experience (M6).

---

## Known Limitations

1. No media upload or asset assignment (M11+)
2. No character record creation UI (empty character table shows empty state)
3. Chapter number and slug are not editable
4. No bulk import/export
5. No audit log / activity feed for edits
6. Mock repository persists only in memory (dev without Supabase)
7. Learner-facing chapter engine not finalized (M6)

---

## Related Documentation

- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/AUTHENTICATION.md`
- `docs/DEVELOPMENT_STATUS.md`
