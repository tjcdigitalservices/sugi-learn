# Pre-Assessment Engine (M8)

**Last updated:** 2026-08-15

This document describes the learner-facing pre-assessment at `/learn/assessment/pre`.

---

## Architecture

```
Supabase (assessments, questions, question_options, assessment_attempts, assessment_answers)
    ↓
AssessmentRepository (SupabaseAssessmentRepository | MockAssessmentRepository)
    ↓
Domain (getPreAssessmentSession, submitPreAssessment)
    ↓
Server action (submitPreAssessmentAction)
    ↓
AssessmentEngine (client UI — no database access)
    ↓
Learner
```

**Rule:** UI components never query Supabase directly. Correct answers never reach the browser before submission.

---

## Learner Flow

1. Authenticated learner opens `/learn/assessment/pre` (layout enforces auth when Supabase is configured).
2. Server loads pre-assessment metadata, learner-safe questions, and any completed attempt.
3. If no assessment or no questions → empty state.
4. If a completed attempt exists → completion/result view (no retake in M8 — see Attempt Handling).
5. Otherwise → `AssessmentEngine` presents questions one at a time with Previous / Next / Submit.
6. On submit → server validates, scores, persists attempt + answers, returns raw score.
7. Completion view shows score and **Begin Learning** / **Continue Learning** using existing M7 journey logic.

---

## Question Loading

| Layer | Method | Returns |
|-------|--------|---------|
| Repository | `getAssessmentByType('pre')` | Assessment metadata |
| Repository | `getLearnerAssessmentQuestions(assessmentId)` | Questions + options **without** `correctOptionId` |
| Repository (server only) | `getAssessmentQuestions(assessmentId)` | Full questions including correct option (scoring only) |

Learner-safe DTOs: `LearnerAssessmentQuestion`, `QuestionOption` in `types/assessment.ts`.

Mapping: `toLearnerAssessmentQuestions()` in `lib/assessment/scoring.ts`.

---

## Answer State

- Held in React state inside `AssessmentEngine` (`Record<questionId, optionId>`).
- Survives Previous/Next navigation within the session.
- Not persisted to the database on each click (no requirement for incremental save in M8).
- Changing an answer overwrites the prior selection for that question.

---

## Validation Before Submission

**Default (M8):** All questions must be answered before submission.

- **Unanswered questions allowed?** — **Pending Client Confirmation**
- Next button requires an answer for the current question.
- Submit validates all questions; missing answers show a clear message with count.

---

## Submission

`submitPreAssessmentAction` → `submitPreAssessment()` → `AssessmentRepository.submitAssessmentAttempt()`:

1. Reject if a completed attempt already exists for this learner + assessment.
2. Validate every question has a selected option belonging to that question.
3. Score server-side via `calculateRawScore()`.
4. Insert `assessment_attempts` row with `score` and `completed_at`.
5. Insert `assessment_answers` rows (one per question).
6. Return `AssessmentSubmissionResult`.

Duplicate submission in the same session is blocked by client `hasSubmitted` flag and server completed-attempt check.

---

## Scoring

Raw score only:

```
score = round((correctCount / totalQuestions) * 100)
```

- Stored in `assessment_attempts.score` (integer 0–100).
- Completion UI shows percentage and `correctCount of totalQuestions`.
- **Not implemented:** pass/fail, proficiency bands, learning gain, research interpretation — **Pending Client Confirmation**.

---

## Attempt Handling

| Requirement | M8 behavior | Status |
|-------------|-------------|--------|
| Maximum attempts | One completed attempt per learner per pre-assessment; subsequent visits show result | **Pending Client Confirmation** (retake policy) |
| Retakes / restart | Not allowed after completion | **Pending Client Confirmation** |
| In-progress attempts | Submission creates attempt with immediate `completed_at` (no separate draft attempt) | M8 simplification |
| Duplicate submit | Server rejects; client disables after success | Implemented |

---

## Security

### Correct answers

- `question_options.is_correct` is read only on the server inside `getAssessmentQuestions()`.
- `getLearnerAssessmentQuestions()` strips correctness before data crosses the server/client boundary.
- Scoring runs in repository/domain on the server after submission.

### Auth & RLS

- Learner routes use `requireUser()` when Supabase is configured (`app/learn/layout.tsx`).
- RLS (M2): learners read `review_status = 'approved'` assessments/questions/options; attempts/answers are own-row only.
- Service-role client is not used in learner UI.

---

## Empty & Error States

| Condition | UI |
|-----------|-----|
| No pre-assessment configured | "Pre-Assessment is not available yet." |
| Assessment exists, zero questions | "Pre-Assessment has no questions yet." |
| Load failure | `error.tsx` with friendly message (no raw DB errors) |
| Submit failure | Inline alert in engine |
| Already submitted | Server error message; completed attempt shown on reload |

---

## Development Test Data

Official Sugidanon questions are **not** invented in M8.

| Environment | Data source |
|-------------|-------------|
| No Supabase (mock) | 3 questions labeled `[DEVELOPMENT TEST]` in `MockAssessmentRepository` |
| Supabase local / remote | `npm run db:seed-assessments` (official bank) |

Do not present development questions as official content.

---

## Components

| File | Role |
|------|------|
| `components/assessment/assessment-engine.tsx` | Navigation, answer state, submit |
| `components/assessment/assessment-question-panel.tsx` | Single question UI |
| `components/assessment/assessment-completion.tsx` | Post-submit result |
| `components/assessment/assessment-empty-state.tsx` | Missing assessment/questions |
| `components/assessment/assessment-error-state.tsx` | Load errors |

---

## Pending Client Confirmation

- Passing score / grading bands
- Time limit
- Attempt limits and retake policy
- Whether unanswered questions may be submitted
- Question randomization / option shuffling
- Weighting per question
- Required score for continuing
- Assessment interpretation and research metrics
- Final official question set (15 questions per README — count comes from DB when supplied)
- Whether pre-assessment must precede chapter access

---

## Related

- `docs/ARCHITECTURE.md` — system overview
- `docs/DATABASE.md` — schema
- `docs/AUTHENTICATION.md` — learner auth
- `docs/LEARNER_JOURNEY.md` — Continue Learning after completion
- `reference/claude-prototype/` — UX reference only (not content source)
