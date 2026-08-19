# M13 — Chapters 2–13 Content Expansion

**Milestone:** M13  
**Status:** Complete  
**Last updated:** 2026-08-15

## Objective

Establish a repeatable, source-grounded workflow for expanding Chapters 2–13 using the existing CMS and ChapterEngine — following the production pattern proven by Chapter 1 (M10–M12).

## Architecture

```
SOURCE (Tikum-Kadlum-Sugidanon-Source.docx)
  ↓
CONTENT MAP (docs/CHAPTERS_2_13_CONTENT_MAP.md)
  ↓
TypeScript definitions (lib/content/sugidanon/chapters/)
  ↓
Mock bootstrap / Supabase seed
  ↓
ChapterManagementRepository → ChapterRepository
  ↓
ChapterEngine → Learner
```

## What Was Implemented

### Content layer (`lib/content/sugidanon/`)

| File | Purpose |
|------|---------|
| `types.ts` | `ChapterContentDefinition` and related types |
| `character-registry.ts` | Character registration with name-based reuse |
| `build-chapter-content.ts` | Builds sections; all new content defaults to `draft` |
| `mock-bootstrap.ts` | Per-chapter mock initialization |
| `chapters/batch-1.ts` | Chapters 2–4 |
| `chapters/batch-2.ts` | Chapters 5–7 |
| `chapters/batch-3.ts` | Chapters 8–11 (Humadapnon volumes) |
| `chapters/index.ts` | `CHAPTERS_2_13` export and lookup helpers |

### Section structure (per chapter)

Where source content is sufficient:

1. **introduction** — educational framing; cites source document
2. **story** — one or more sections from source summary (not fabricated narrative)
3. **illustration** — empty media slot with documented candidates (no artwork)
4. **characters** — source-supported characters only
5. **learning_points** — draft, PENDING CLIENT APPROVAL
6. **completion** — chapter end message

Section structure varies only where source material warrants fewer sections (not forced identical).

### Mock repository wiring

`lib/data/mock/chapter-management-repository.ts` bootstraps Chapters 2–13 on first admin/learner access via `bootstrapSugidanonChapter()`.

### Supabase seed

- `supabase/seed-chapters-2-13.sql` — generated from TypeScript definitions
- `scripts/generate-chapters-2-13-seed.ts` — regeneration script
- Non-destructive: skips chapters that already have sections

### Character reuse

Mock bootstrap reuses existing character records when names match (e.g. Matan-ayon from Chapter 1 `tk-char-matan-ayon`). New characters receive `sg-char-{slug}` IDs.

**Supabase seed note:** SQL seed inserts per-chapter character rows for simplicity. Production should consolidate duplicates during client review.

## Content Rules Applied

- No invented story events, dialogue, or cultural facts
- Source summaries mapped without artificial expansion
- Introduction sections clearly label **EDUCATIONAL ADAPTATION**
- Learning points: `draft` + "PENDING CLIENT APPROVAL"
- All sections/chapters: `draft` review status (not auto-approved)
- Chapter 1 preserved unchanged

## Learner Visibility

`filterChapterForLearner()` hides all draft sections, learning points, and media. Chapters 2–13 are **CMS-ready** but **not learner-ready** until client approves and review status is updated.

Admin preview at `/admin/chapters/[chapterId]/preview` shows full draft structure.

## Batches Completed

| Batch | Chapters | Status |
|-------|----------|--------|
| Batch 1 | 2–4 (Amburukay, Derikaryong Pada, Balanakon) | Mapped + CMS wired |
| Batch 2 | 5–7 (Kalampay, Pahagunong, Sinagnayan) | Mapped + CMS wired |
| Batch 3 | 8–11 (Humadapnon volumes) | Mapped + CMS wired |
| Batch 4 | 12–13 (Alayaw, Nagbuhis) | Mapped + CMS wired |

## Not Implemented (Out of Scope)

- Post-assessment (M14+)
- Audio/animation production
- Illustration artwork generation
- New CMS architecture
- Chapter-specific renderers

## Testing

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run lint` | Pass |
| Admin opens Chapters 2–13 | Mock bootstrap populates sections |
| Metadata correct | Title, subtitle, summary from source |
| Characters associate | Character section links registry IDs |
| Learning points gated | Draft — hidden from learners |
| Media slots | Illustration sections present, no assets |
| ChapterEngine renders | Admin preview works; learner sees empty until approved |
| Chapter 1 preserved | Unchanged |
| No fabricated content | Summaries only from source document |

## Related Documentation

- `docs/CHAPTERS_2_13_CONTENT_MAP.md` — per-chapter source audit
- `docs/TIKUM_KADLUM_CONTENT_MAP.md` — full catalog overview
- `docs/DEVELOPMENT_STATUS.md` — milestone status
