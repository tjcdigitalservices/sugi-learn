# M17 — Client Review Guide

**Audience:** Client reviewers, cultural advisors, and project stakeholders  
**Last updated:** 2026-08-15

This guide explains how to review Sugidanon during User Acceptance Testing (UAT). It focuses on what you can review and how to provide feedback — not technical implementation details.

---

## 1. Accessing the System

Sugidanon is a web application with two areas:

| Area | URL path | Who uses it |
|------|----------|-------------|
| **Learner experience** | `/login` → `/learn` | Test learners reviewing the student journey |
| **Administration (CMS)** | `/admin/login` → `/admin` | Client team reviewing and approving content |

Your project team will provide:

- The review site URL (staging / UAT environment)
- Admin login credentials
- Learner test account(s)

**Important:** The review environment requires Supabase authentication. It does not use developer mock data.

---

## 2. Logging In

### Learner review

1. Open the review site URL.
2. Go to **Login** (`/login`).
3. Enter the learner email and password provided by your team.
4. You will land on the **Learner Home** (`/learn`).

### Admin review

1. Go to **Admin Login** (`/admin/login`).
2. Enter the admin email and password provided by your team.
3. You will land on the **Admin Dashboard** (`/admin`).

If you cannot log in, contact your project team — do not share passwords in public channels.

---

## 3. Reviewing Chapters

**Admin path:** Dashboard → **Chapters** → select a chapter

For each of the 13 chapters you can inspect:

| Field | Where to find it |
|-------|------------------|
| Title & summary | Chapter metadata panel |
| Source / book reference | Subtitle and summary fields |
| Story sections | Section list — open each section |
| Characters | Characters panel |
| Learning points | Learning points panel |
| Illustration / audio / animation | Media sections + **Media** library |
| Review status | Badge on chapter, sections, and learning points |

### Review statuses

| Status | Meaning |
|--------|---------|
| **Draft** | Work in progress — not visible to learners |
| **For review** | Ready for client / cultural review |
| **Approved** | Published to learners (when section is approved) |
| **Needs revision** | Requires changes before approval |

**Learner rule:** Only **Approved** content appears in the learner experience.

### Review queue

**Admin path:** **Review** (`/admin/review`)

Shows all items marked **For review** or **Needs revision** across chapters, media, and assessments.

### Current content state

| Chapter | Learner visibility |
|---------|-------------------|
| **Chapter 1 — Tikum Kadlum** | Story sections can be approved for learner review after your team confirms seed/content setup |
| **Chapters 2–13** | Draft in CMS — visible in admin for review, **not** available to learners until approved |

Chapters without approved content show **Coming soon** on the learner chapter list.

---

## 4. Reviewing Media

**Admin path:** **Media** (`/admin/media`)

For each asset you can review:

- Preview (illustration, audio, or animation/video)
- Title, caption, and metadata
- Chapter association
- Section association (where assigned)
- Review status

Upload new assets here if your team has provided files. Do not replace source story text with media captions.

---

## 5. Reviewing Assessments

**Admin path:** **Assessments** (`/admin/assessments`)

Review both:

- **Pre-Assessment** (before chapters)
- **Post-Assessment** (after chapters)

For each assessment inspect:

- Title and instructions
- Questions and answer options
- Correct answer (admin view only — not shown to learners during the test)
- Review status per question
- Scoring (percentage based on correct answers)

**Note:** Official client assessment questions must be entered and approved here. Development test questions are **not** used in the UAT environment.

---

## 6. Reviewing the Learner Journey

Use a **learner test account** to walk through:

```
Login
  ↓
Pre-Assessment
  ↓
Learning Journey (Chapters)
  ↓
Post-Assessment
  ↓
Results
```

Also check:

- **Progress** (`/learn/progress`) — chapter completion status
- **Results** (`/learn/results`) — scores and pre/post comparison

If Pre-Assessment or Post-Assessment shows “not available yet,” questions may not be approved in the CMS.

---

## 7. Reviewing Analytics

**Admin path:** **Analytics** (`/admin/analytics`)

Neutral reporting only — no claims about learning effectiveness.

| Term | Meaning |
|------|---------|
| **Completion rate** | Share of learners who completed a chapter |
| **Average score** | Mean assessment score |
| **Score difference** | Change between pre- and post-assessment for paired learners |

CSV exports are available for progress, assessment results, and chapter completion.

---

## 8. Providing Feedback

Use **`docs/M17_UAT_TRACKER.md`** (or the shared copy your team maintains) to record feedback.

### Content correction (we can fix)

- Typos in titles, summaries, or names
- Incorrect character names vs. approved source
- Wrong chapter order or metadata
- Approved text that does not match supplied source

### Design revision (reasonable UI fixes)

- Navigation clarity
- Spacing, readability, mobile layout
- Button labels
- Accessibility issues (hard to tap, poor contrast)

### Client decision required

- Learning point wording (cultural interpretation)
- Which illustrations to approve
- Assessment question content
- Whether post-assessment requires all chapters complete

### Scope addition (not automatic)

Examples that require separate approval:

- Additional chapters beyond the agreed 13
- More than the agreed illustration or animation count
- New analytics reports
- New user roles or integrations
- Extensive narration production

**Please label these clearly as “new feature” or “scope addition”** so they are not confused with corrections.

---

## 9. Environment Setup (for project team)

Review environment checklist:

1. Set Supabase environment variables (see `.env.example`)
2. Run database migrations
3. Run seeds **in order:**
   - `supabase/seed.sql`
   - `supabase/seed-tikum-kadlum-chapter-1.sql`
   - `supabase/seed-tikum-kadlum-chapter-1-m12.sql` (optional)
   - `supabase/seed-chapters-2-13.sql`
4. **Do not run** deprecated `seed-dev-pre-assessment.sql` / `seed-dev-post-assessment.sql` — use `npm run db:seed-assessments` for the official bank
5. Create admin and learner accounts in Supabase Auth
6. Approve Chapter 1 sections for learner testing
7. Deploy with `npm run build`

---

## 10. What Learners Should Not See

The following are intentionally hidden from learners:

- Draft, For review, and Needs revision content
- Admin navigation from the learner header
- Development test assessments
- Internal architecture demo chapter
- Developer error details (generic messages shown instead)

---

## Questions?

Contact your Sugidanon project team with:

- Screenshot or page URL
- Account role used (admin or learner)
- Expected vs. actual behaviour
- Whether you consider it a **bug**, **content correction**, **design revision**, or **new scope**
