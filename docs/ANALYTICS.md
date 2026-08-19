# Admin Analytics & Reporting (M15)

**Last updated:** 2026-08-15

This document describes the admin analytics workspace at `/admin/analytics`.

---

## Architecture

```
Authoritative tables (profiles, learner_chapter_progress, assessment_attempts, assessment_answers, chapters, assessments, questions, question_options)
    ↓
AdminAnalyticsRepository (Supabase | Mock)
    ↓
Raw data load (parallel queries)
    ↓
Aggregation layer (lib/analytics/aggregations.ts)
    ↓
Domain (getAdminAnalyticsSummary, getParticipationOverview)
    ↓
Admin UI (/admin/analytics) + CSV exports
```

**Rule:** Metrics are calculated from persisted records. No fabricated demo data. No analytics cache in M15.

---

## Data Sources

| Metric area | Primary tables |
|-------------|----------------|
| Learners | `profiles` (`role = learner`) |
| Chapter progress | `learner_chapter_progress` |
| Assessment scores | `assessment_attempts` (completed only) |
| Question performance | `assessment_answers` + `question_options.is_correct` |
| Chapter catalog | `chapters` |

---

## Metrics & Calculation Rules

### Overview

| Metric | Calculation |
|--------|-------------|
| Total learners | Count of learner profiles |
| Learners started | Distinct learners with any progress row |
| Completed all chapters | Learners with completed count ≥ total catalog chapters |
| Completed chapter records | Progress rows where `completed_at IS NOT NULL` |
| Pre/Post attempts | Completed attempts (`completed_at` set, score present) |

### Chapter analytics

| Metric | Calculation |
|--------|-------------|
| Started learners | Distinct learners with progress row for chapter |
| Completed learners | Distinct learners with `completed_at` for chapter |
| Completion rate | `completed / started` — **null** when started = 0 |

### Assessment analytics

Only **completed attempts** are included in score metrics.

| Metric | Calculation |
|--------|-------------|
| Average score | Mean of `assessment_attempts.score` |
| Highest / lowest | Min/max of completed scores |

### Pre/Post score comparison

| Metric | Calculation |
|--------|-------------|
| Pre/Post average | Mean score per assessment type |
| Score difference | Post average − pre average (percentage points), or mean paired difference when pairs exist |
| Paired learners | Learners with both completed pre and post |
| Pre-only / Post-only | Learners with only one assessment type completed |

Missing assessments are **not** treated as zero.

### Question performance

| Metric | Calculation |
|--------|-------------|
| Responses | Count of answers for completed attempts |
| Correct | Answer where `selected_option_id` matches a correct option |
| Correct % | `correct / responses` — null when responses = 0 |

### Drop-off observations

Neutral comparison: if chapter N has fewer completed learners than chapter N−1, an observation is recorded. No causal interpretation.

---

## Exclusions

- Incomplete attempts (`completed_at IS NULL`) excluded from score metrics
- Answers only loaded for completed attempts
- Admin profiles excluded from learner counts
- Zero denominators return **No data** (not 0%)

---

## Filters

Supported via query parameters on `/admin/analytics`:

| Filter | Applies to |
|--------|------------|
| `assessmentType` | Attempts, questions |
| `chapterId` | Progress rows |
| `dateFrom` / `dateTo` | Progress `updated_at`, attempt `completed_at` |

---

## Exports (CSV)

Admin-only server actions:

| Export | Fields |
|--------|--------|
| Learner progress | learner, chapters completed, progress %, current chapter, pre/post status |
| Assessment results | learner, assessment, type, score, completed_at |
| Chapter completion | chapter number, title, started, completed, completion rate |

Exports include headers even when data is empty.

---

## Privacy

- Learner display uses `display_name` when available; otherwise `Learner {id-prefix}`
- No passwords, tokens, or unnecessary internal IDs in UI
- Analytics routes are admin-only (`requireAdmin` + admin shell layout)
- RLS allows admin read of cohort data under authenticated admin session

---

## Research Boundary

The system shows **data**, not **interpretation**.

Allowed: average score, completion rate, score difference, participation counts.

Not claimed automatically: learning effectiveness, mastery, statistical significance, causal improvement.

UI copy uses neutral terms: **Score comparison**, **Change in score**, **Completion rate**.

---

## Dashboard Integration

`/admin` includes a lightweight **Learner participation** summary from `getParticipationOverview()` — avoids duplicating the full analytics query on every dashboard load pattern (single overview call).

---

## Known Limitations

1. No materialized views or caching — large cohorts may require future SQL aggregation/RPC
2. Mock mode aggregates from in-memory stores (empty until real mock activity occurs)
3. Section-level completion percentage not tracked (schema field `current_section_id` unused)
4. Average completion timing not included (insufficient reliable timestamp pairing in M15)
5. No cohort segmentation beyond filters

---

## Pending Client/Research Confirmation

- Official research reporting methodology
- Cohort definitions for comparison
- Anonymization requirements for exports
- Which attempt to use when retakes are allowed
- Statistical tests or significance reporting

---

## Related

- `docs/POST_ASSESSMENT.md` — learner results
- `docs/PRE_ASSESSMENT.md` — pre-assessment
- `docs/ARCHITECTURE.md` — system overview
- `docs/DEVELOPMENT_STATUS.md` — milestone status
