# Post-Assessment & Results (M14)

**Last updated:** 2026-08-15

This document describes the learner-facing post-assessment at `/learn/assessment/post` and results at `/learn/results/[attemptId]`.

---

## Architecture

```
Supabase (assessments, questions, assessment_attempts, assessment_answers)
    ↓
AssessmentRepository (shared with M8 pre-assessment)
    ↓
Domain (getPostAssessmentSession, submitPostAssessment, getLearnerResultsDashboard)
    ↓
Server action (submitPostAssessmentAction)
    ↓
AssessmentEngine (shared with M8 — submitAction prop)
    ↓
Learning Results / Question Review / PDF report
    ↓
Learner
```

**Rule:** Reuses the M8 assessment engine and repository. No second assessment system.

---

## Learner Flow

```
Pre-Assessment → 13 Chapter Learning → Post-Assessment → Results
```

1. Authenticated learner opens `/learn/assessment/post`.
2. Server loads post-assessment metadata, learner-safe questions, and any completed attempt.
3. Optional access gates (disabled by default — see Access Policy).
4. If no approved assessment or no approved questions → empty state.
5. If a completed attempt exists → completion view with link to results.
6. Otherwise → `AssessmentEngine` with `submitPostAssessmentAction`.
7. On submit → server validates, scores, persists attempt + answers.
8. Completion view links to `/learn/results/[attemptId]`.
9. Results page shows Learning Results (score cards, question grid), Question Review, and Print/Share PDF.

---

## Access Policy

Configured in `lib/assessment/access-policy.ts`:

| Flag | Default | Status |
|------|---------|--------|
| `postAssessmentRequiresAllChaptersCompleted` | `false` | PENDING CLIENT CONFIRMATION |
| `postAssessmentRequiresPreAssessmentCompleted` | `false` | PENDING CLIENT CONFIRMATION |

When a flag is `true`, learners see a blocked state instead of the assessment.

Post-assessment is only shown as **available** on learner home when:
- Assessment `review_status = approved`
- At least one approved question exists

---

## Scoring

Same as M8 (`lib/assessment/scoring.ts`):

```
score = round((correctCount / totalQuestions) * 100)
```

Stored in `assessment_attempts.score`. Learning Results show:
- Pre-Test / Post-Test / Learning Gain cards (percentage-point change when pre exists)
- Per-question correct/incorrect grid
- Question Review for incorrect answers (your answer, correct answer, explanation)
- Print PDF / Share PDF report preview

**Not implemented:** pass/fail, mastery, or research-grade learning-gain interpretation beyond percentage-point difference.

---

## Pre/Post Score Comparison

When viewing a post-assessment result and a completed pre-assessment exists:

| Field | Calculation |
|-------|-------------|
| Pre-Assessment | Most recent completed pre attempt |
| Post-Assessment | Current post attempt |
| Change in score (questions) | post correctCount − pre correctCount |
| Change in score (percentage) | post score − pre score |

Uses learner-facing labels: **Pre-Test**, **Post-Test**, **Learning Gain** (post score − pre score, in percentage points).

If no pre-assessment attempt exists, the Pre-Test and Learning Gain cards show “—”.

---

## Attempt Handling

| Requirement | M14 behavior | Status |
|-------------|--------------|--------|
| Maximum attempts | One completed attempt per learner per assessment (same as M8) | PENDING CLIENT CONFIRMATION |
| Comparison attempt | Most recent completed attempt per type | Documented default |
| Retakes | Server rejects duplicate submission | PENDING CLIENT CONFIRMATION |
| History | Simple list when multiple attempts exist in data | Basic support |

---

## Routes

| Route | Purpose |
|-------|---------|
| `/learn/assessment/post` | Post-assessment engine |
| `/learn/results` | Redirects to latest post result or empty state |
| `/learn/results/[attemptId]` | Learning Results dashboard (scores, Q-grid, print/share) |
| `/learn/results/[attemptId]/review` | Question Review (incorrect answers + explanations) |

---

## Security

- Auth required when Supabase configured (`app/learn/layout.tsx`)
- RLS: learners read approved content; own attempts/answers only
- `getAttemptById` / `getCompletedAttemptReview` verify `profile_id` matches current learner
- Correct answers are never sent to the browser on live pre/post engines
- After completion, review payloads include correct options + explanations for that learner’s attempt only
- Results not exposed for other learners' attempts

---

## Approval

Only `review_status = approved` assessments and questions are learner-visible (RLS + `isAssessmentLearnerReady()`).

Draft / for_review / needs_revision content does not appear to learners.

---

## Development Test Data

| Environment | Source |
|-------------|--------|
| Mock (no Supabase) | 3 `[DEVELOPMENT TEST]` post questions in `MockAssessmentRepository` |
| Supabase local / remote | `npm run db:seed-assessments` (official bank) |

Do not present development questions as official content.

---

## Components

| File | Role |
|------|------|
| `components/assessment/assessment-engine.tsx` | Shared engine (`submitAction` prop) |
| `components/learner/results/learning-results-dashboard.tsx` | Heritage Learning Results UI |
| `components/learner/results/question-review-panel.tsx` | Incorrect-answer review carousel |
| `components/learner/results/learner-assessment-report.tsx` | Printable PDF report layout |
| `components/learner/results/results-report-actions.tsx` | Print preview + Share/download PDF |
| `components/assessment/assessment-access-blocked-state.tsx` | Configurable gate messaging |
| `components/assessment/assessment-empty-state.tsx` | Missing assessment/questions |

Domain: `getLearnerResultsDashboard()` joins completed answers with correct options and `questions.explanation`.

---

## Pending Client Confirmation

- Must all chapters be completed before post-assessment?
- Must pre-assessment be completed before post-assessment?
- Retake policy
- Which attempt is used for official comparison
- Pass/fail thresholds
- Official post-assessment question set (15 questions per README)
- Research reporting requirements

---

## Related

- `docs/PRE_ASSESSMENT.md` — M8 pre-assessment
- `docs/ASSESSMENT_MANAGEMENT.md` — M9 admin CMS
- `docs/ARCHITECTURE.md` — system overview
- `docs/DEVELOPMENT_STATUS.md` — milestone status
