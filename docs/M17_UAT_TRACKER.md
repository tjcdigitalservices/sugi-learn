# M17 — UAT Tracker

**Last updated:** 2026-08-15  
**Purpose:** Track client UAT feedback, corrections, and scope requests during M17.

---

## How to Use This Document

| Classification | Meaning |
|----------------|---------|
| **BUG** | Something is broken or incorrect against agreed requirements |
| **CONTENT CORRECTION** | Typo, wrong name, or source-backed fix |
| **DESIGN REVISION** | UI/UX improvement within current scope |
| **SCOPE ADDITION** | New feature or expanded deliverable — **not implemented automatically** |
| **CLIENT DECISION REQUIRED** | Blocked until client confirms policy or content |

**Priority:** P0 Critical · P1 High · P2 Medium · P3 Low

---

## Pre-UAT Fixes (M17 — Development)

| ID | Area | Description | Priority | Classification | Status | Client Comment | Resolution |
|----|------|-------------|----------|----------------|--------|----------------|------------|
| M17-001 | Auth | Production without Supabase returns 503 | P0 | BUG | Fixed (M16) | — | Middleware fail-closed |
| M17-002 | Publication | Learner chapter filter centralized | P1 | BUG | Fixed (M16) | — | `filterChapterForLearner` in engine path |
| M17-003 | Progress | Completion without approved story content | P2 | BUG | Fixed | — | `assertChapterCompletable()` guard |
| M17-004 | Learner UI | Admin link visible to learners | P2 | DESIGN REVISION | Fixed | — | Removed from learner header |
| M17-005 | Learner UI | No mobile navigation menu | P2 | DESIGN REVISION | Fixed | — | Mobile drawer added |
| M17-006 | Admin | Review page was placeholder | P2 | DESIGN REVISION | Fixed | — | Review queue at `/admin/review` |
| M17-007 | Admin | Content nav pointed to placeholder | P3 | DESIGN REVISION | Fixed | — | Redirects to `/admin/chapters` |
| M17-008 | Assessments | Dev mock questions in review env | P1 | BUG | Fixed | — | Mock dev content gated to local dev only |
| M17-009 | Seeds | Dev assessment SQL on UAT | P1 | BUG | Documented | — | Warnings added; excluded from guide |
| M17-010 | Labels | Inconsistent review status labels | P3 | DESIGN REVISION | Fixed | — | Shared labels in `types/review.ts` |

---

## Client UAT Feedback (fill during review)

| ID | Area | Description | Priority | Classification | Status | Client Comment | Resolution |
|----|------|-------------|----------|----------------|--------|----------------|------------|
| UAT-001 | | | | | Open | | |
| UAT-002 | | | | | Open | | |
| UAT-003 | | | | | Open | | |

---

## Scope Additions (do not implement without approval)

| ID | Requested Feature | Current Scope | Estimated Impact | Dependency | Reason Outside Scope |
|----|-------------------|---------------|------------------|------------|----------------------|
| SCOPE-001 | Full cultural review workflow (M18) | Per-entity status in CMS + review queue | Medium | Client approval policy | Planned separate milestone |
| SCOPE-002 | Official pre/post assessment questions | CMS supports questions; no client content loaded | High | Client / research team | Content not supplied |
| SCOPE-003 | Chapters 2–13 learner publication | CMS-ready draft content exists | High | Client approval per chapter | Intentionally draft until approved |
| SCOPE-004 | Additional illustrations beyond agreed 20 | M12 integration supports assigned assets | High | Art production | Scope cap in project spec |
| SCOPE-005 | Additional animations beyond agreed 3 | Animation player exists | High | Animation production | Scope cap in project spec |
| SCOPE-006 | Extended analytics / research reporting | Neutral admin analytics (M15) | Medium | Research methodology | Pending client/research confirmation |

---

## Content Items Pending Client Approval

| Item | Location | Status |
|------|----------|--------|
| Chapter 1 learning points | Admin → Chapters → Tikum Kadlum | Draft / PENDING CLIENT APPROVAL |
| Chapters 2–13 story summaries | Admin → Chapters | Draft — admin review only |
| Chapters 2–13 learning points | Seed content | PENDING CLIENT APPROVAL |
| Illustration artwork | Admin → Media | Awaiting client assets |
| Pre-Assessment questions | Admin → Assessments | Not configured for UAT |
| Post-Assessment questions | Admin → Assessments | Not configured for UAT |
| Completion messages (Ch 2–13) | Chapter CMS | Generic placeholder — review |

---

## Tests Not Yet Verified (requires live UAT session)

- Full browser login/logout for admin and learner
- Media upload and preview on staging
- Complete learner journey with Supabase accounts
- Manual analytics metric verification
- Responsive pass at 375 / 768 / 1440 px in browser
- Full keyboard / screen-reader audit

---

## Sign-off Checklist

- [ ] Supabase review environment configured
- [ ] Admin account created for client
- [ ] Learner test account(s) created
- [ ] Chapter 1 approved sections verified in learner view
- [ ] Dev assessment seeds **not** applied
- [ ] Client review guide shared
- [ ] UAT feedback rows populated
- [ ] Scope additions reviewed with client
