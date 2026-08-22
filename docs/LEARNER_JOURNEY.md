# Sugidanon — Learner Journey & Progress

**Version:** M7  
**Last updated:** 2026-08-15

Documents the learner home, chapter journey, and persistent progress tracking.

---

## Journey Flow (M7)

```
Learner Login (/login)
        ↓
Learner Home (/learn)
        ↓
Chapter Journey (/learn/chapters)
        ↓
Chapter Reading (/learn/chapters/[chapterId])
        ↓
Persistent Progress (learner_chapter_progress)
```

Pre-Assessment, Post-Assessment, and Results are **not** part of M7.

---

## Progress States

| State | Meaning | Database signal |
|-------|---------|-----------------|
| `not_started` | No progress record | No row for learner + chapter |
| `in_progress` | Chapter opened, not completed | Row exists, `completed_at` is null |
| `completed` | Learner finished chapter | Row exists, `completed_at` set |

Status is derived from `learner_chapter_progress` — not stored redundantly elsewhere.

---

## Starting a Chapter

When a learner opens `/learn/chapters/[chapterId]`:

1. Route resolves learner ID via `getCurrentLearnerId()`
2. If no progress record exists, `ensureChapterStarted()` creates one (`IN PROGRESS`, `started_at`)
3. If progress exists (in progress or completed), existing state is preserved — **no reset**

Architecture demo chapter (`architecture-demo`) skips database persistence.

---

## Completing a Chapter

The M6 completion button now calls `completeChapterAction()`:

1. Server action requires authenticated learner (when Supabase configured)
2. `completeChapter()` sets `completed_at` on the progress row
3. Paths revalidated: `/learn`, `/learn/chapters`, `/learn/progress`, chapter page
4. UI shows success with links to next chapter and learner home

**Important:** Clicking Previous/Next navigation does **not** mark a chapter complete. Completion is explicit.

---

## Continue Learning Logic

`resolveContinueChapterId()` in `lib/domain/learner-progress.ts`:

1. **In-progress chapter** with most recent `updated_at` (if multiple)
2. Else **first not-started** chapter by catalog order
3. Else `null` (all completed)

Used on `/learn`, `/learn/chapters`, and `/learn/progress`.

---

## Overall Progress

Calculated at read time — **not persisted**:

```
completedCount / totalChapters
```

Example: 3 of 13 chapters completed → 23% progress bar.

---

## Revisiting Chapters

Completed chapters remain accessible. Opening a completed chapter:

- Does not reset progress
- Shows `Completed` status badge
- Completion section shows saved state (no re-submit required)

No sequential locking in M7.

---

## Learner Home (`/learn`)

- Welcome / display name (or generic greeting)
- Overall progress summary
- Continue Learning or Start Learning CTA
- Full chapter journey list with status badges
- All-chapters-completed message when applicable

---

## Progress Page (`/learn/progress`)

- Overall progress bar
- Continue Learning action
- Empty state for brand-new learners
- All-chapters-completed placeholder (assessments deferred to M8/M9)
- Full chapter status list

---

## Data Access

### Repository (`ProgressRepository`)

| Method | Purpose |
|--------|---------|
| `listChapterProgress(learnerId)` | All chapter progress records |
| `getChapterProgress(learnerId, slug)` | Single chapter progress |
| `startChapter(learnerId, slug)` | Create in-progress record (idempotent) |
| `completeChapter(learnerId, slug)` | Set `completed_at` |
| `getLearnerProgress(learnerId)` | Aggregate summary (legacy + assessments flags) |

Implementations: `SupabaseProgressRepository`, `MockProgressRepository`

### Domain (`lib/domain/learner-progress.ts`)

- `getLearnerJourneySummary()` — merges catalog + progress for UI
- `ensureChapterStarted()` — route-level chapter entry
- `completeChapterProgress()` — completion persistence
- `getCurrentLearnerId()` — auth-aware learner ID (`mock-learner` without Supabase)

### Server actions (`lib/progress/actions.ts`)

- `completeChapterAction(chapterSlug)` — authenticated completion with revalidation

---

## RLS

Uses existing `learner_chapter_progress` policies:

- Learners read/write **own** rows only (`profile_id = auth.uid()`)
- Admins can read all; delete admin-only
- No service-role client in learner progress path

Unique constraint `(profile_id, chapter_id)` prevents duplicate records.

---

## Chapter Engine Integration

Progress orchestration stays **outside** `ChapterEngine`:

- Route loads chapter + progress
- Passes `progressStatus`, `chapterCompleted`, `nextChapterId` to layout/engine
- Completion section calls server action — not repository from client directly

---

## Known Limitations

1. No section-level resume pointer (`current_section_id` unused in M7)
2. No pre/post assessment integration
3. No learner analytics dashboard
4. Mock progress is in-memory (resets on server restart)
5. Architecture demo excluded from persistence

---

## Related Documentation

- `docs/CHAPTER_ENGINE.md`
- `docs/AUTHENTICATION.md`
- `docs/DATABASE.md`
- `docs/ARCHITECTURE.md`
