# Sugidanon — Prototype Reference Analysis

**Source:** `reference/claude-prototype/` (Claude-generated HTML/CSS/JS SPA)  
**Analysis date:** 2026-08-15  
**Milestone:** M1 — Application Architecture

This document analyzes the prototype as a **functional UX reference**. It is not production code and must not be converted line-for-line into Next.js.

---

## Prototype Overview

| Aspect | Detail |
|--------|--------|
| **Format** | Single-page app (`index.html` + `styles.css` + `app.js`) |
| **Persistence** | None — state resets on reload |
| **Auth** | Fake admin login (any credentials) |
| **Content** | Generic placeholders; no validated Sugidanon narrative |
| **Lesson model** | One demo lesson with 4 sections (not 13 chapters) |
| **Assessments** | 15 generic pre/post questions (hardcoded in JS) |

---

## Preserve

Concepts that should remain in the production system:

### Learner experience
- **Entry home** with journey overview (pre-assessment → chapters → post-assessment → results)
- **Linear learner flow** with progress indication across major steps
- **Pre-assessment** before chapter content (15 questions per README)
- **Multimedia chapter/lesson** with section navigation (sidebar or equivalent)
- **Section types:** text, illustration, audio, 2D animation
- **Interactive media controls** for audio and animation (play/pause/progress — M13/M14)
- **Chapter/lesson completion** screen before post-assessment
- **Post-assessment** after content
- **Results** with pre/post comparison and learning gain display
- **Learner analytics** (personal progress view)
- **Admin entry link** from learner area

### Admin experience
- **Separate admin shell** (sidebar navigation, distinct from learner UI)
- **Admin login** boundary (real auth in M3)
- **Dashboard** with KPI-style overview
- **Learning content management** (list, filter by review status)
- **Multimedia content editor** (sections, reorder, type tabs, learner preview)
- **Assessment management** (pre/post question banks)
- **Question editor** (prompt, choices, correct answer, explanation)
- **Content review queue** (Draft / For Review / Approved / Needs Revision)
- **Admin analytics** (aggregate learner metrics)

### Cross-cutting
- **Review status workflow** on content
- **Placeholder labeling** for unvalidated cultural content (`[Approved Illustration]`, etc.)
- **Content-driven rendering** — lesson sections driven by data arrays, not fixed HTML pages
- **Separation of learner and admin navigation**

---

## Rebuild

Functionality to retain but implement with proper Next.js architecture:

| Prototype pattern | Production approach |
|-------------------|---------------------|
| SPA screen toggling (`go("screen-id")`) | Next.js App Router routes + layouts |
| Inline `LESSON_SECTIONS` array | `Chapter` + `ChapterSection` types → Supabase (M2) |
| `renderLesson()` DOM manipulation | `ChapterEngine` + `SectionRenderer` React components |
| Hardcoded `PRE_QUESTIONS` / `POST_QUESTIONS` | `Assessment` + `AssessmentQuestion` data model (M8/M9) |
| `state.pre` / `state.post` in memory | `AssessmentAttempt` + progress in Supabase (M15/M16) |
| Admin sidebar injected via custom element | `AdminShell` layout + route groups |
| Content list mock arrays | Repository pattern → Supabase queries |
| CSS design system in `styles.css` | Tailwind + shadcn/ui (visual direction from Figma secondary) |
| Fake login form | Supabase Auth (M3) |
| Session-only scoring | Server-persisted attempts and analytics (M17) |
| Single demo lesson | 13 chapter records via one reusable engine |
| Prototype hero/marketing copy | Learner home — content from client, not copied verbatim |

---

## Do Not Carry Forward

Prototype-only details that must **not** become production requirements:

### Fake data & assumptions
- Sample learner names and scores (`LEARNERS_MOCK`, KPI values like "248 learners")
- Generic assessment question text and fixed correct-answer index
- Mock lesson titles ("Discovering the Sugidanon — Orientation Module") as final content
- Prototype body copy in `LESSON_SECTIONS` as validated narrative
- Sample admin content list entries and review notes
- Question performance percentages (`perf = [92,88,...]`)
- Fixed section count of 4 per lesson (production: variable sections per chapter)
- Single-lesson flow instead of 13-chapter journey
- "~5 minutes" duration claims
- Audio duration "1:24 / 3:52" and animation "1:48" as real timings

### Implementation details
- Custom `<admin-sidebar-slot>` elements
- Global mutable `state` object and `render()` dispatch
- `alert()` for prototype actions (approve, add section)
- Any-credentials admin login
- Inline styles in HTML attributes
- Duplicated SVG icons in HTML (use shared icon components)
- Terracotta/forest visual tokens copied without Figma/client sign-off

### Content policy violations to avoid
- Treating prototype placeholder text as culturally validated
- Using prototype question topics as approved assessment content
- Assuming every chapter has image + audio + animation (AGENTS.md: not every chapter has every media type)

---

## Mapping: Prototype Screens → Production Routes

| Prototype screen | Production route (M1 foundation) |
|------------------|----------------------------------|
| Home | `/learn` |
| Pre-Assessment | `/learn/assessment/pre` |
| Multimedia Lesson | `/learn/chapters/[chapterId]` |
| Lesson Complete | Section kind `completion` or dedicated route (M15) |
| Post-Assessment | `/learn/assessment/post` |
| Results | `/learn/results` |
| Learner Analytics | `/learn/progress` (or combined with results — Pending Client Confirmation) |
| Admin Login | `/admin/login` |
| Admin Dashboard | `/admin` |
| Content Management | `/admin/content` (+ `/admin/chapters`) |
| Multimedia Editor | `/admin/content` or `/admin/chapters/[chapterId]` (M5/M6) |
| Assessment Management | `/admin/assessments` |
| Question Editor | `/admin/assessments/[questionId]` (M9) |
| Content Review | `/admin/review` |
| Admin Analytics | `/admin/analytics` |

---

## Reference Priority Reminder

When prototype conflicts with `AGENTS.md`, `README.md`, or client requirements, **do not follow the prototype**.

Mark unresolved items as **Pending Client Confirmation**.
