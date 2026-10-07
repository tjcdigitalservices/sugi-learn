# Suguidanon — Panel Presentation UI → Code Map

**Audience:** Client panel presenters and technical walkthrough facilitators  
**Purpose:** Point from what appears on screen to the exact files (and footprint IDs) in the codebase  
**Last updated:** 2026-10-07

---

## How to use this guide during the panel

1. Open the live app (or staging URL) on the screen you are explaining.
2. Find that screen in the tables below.
3. Open the listed file in the repo (or IDE).
4. Search for the **footprint ID** (example: `PANEL-B03`) — comments in code are marked the same way.
5. Speak to the **UI element**, then the **file**, then the **footprint** so reviewers can follow along.

### Footprint convention

| Pattern | Meaning |
|---------|---------|
| `PANEL-P##` | Public / marketing surfaces |
| `PANEL-A##` | Auth (learner + admin login) |
| `PANEL-L##` | Learner journey (home, assessments, results) |
| `PANEL-B##` | Storybook chapter experience (the open book) |
| `PANEL-M##` | Admin / CMS surfaces |

In code you will see comments like:

```ts
/** PANEL-B03 — Open-book left page: title + About this chapter */
```

or

```tsx
{/* PANEL-B03 — Open-book left page: title + About this chapter */}
```

---

## Architecture in one slide

```
Browser URL (app/.../page.tsx)
        ↓
Layout / shell (learner-shell or admin-shell)
        ↓
Feature UI components (components/...)
        ↓
Domain / data (lib/domain/...)  ← editable content from database when configured
```

**Rule for the panel:** UI structure is in components; chapter wording, media, and questions are content (admin-editable), not hard-coded chapter pages.

---

## 1. Public site

| Footprint | What you see on screen | URL | Route file | Main UI code |
|-----------|------------------------|-----|------------|--------------|
| **PANEL-P01** | Landing page nav + brand | `/` | `app/page.tsx` | Brand: `components/brand/heritage-wave.tsx` |
| **PANEL-P02** | Cinematic landing hero + CTAs | `/` | `app/page.tsx` | `components/landing/landing-hero.tsx` + `landing-hero.css` |
| **PANEL-P03** | About / author biography | `/author` | `app/author/page.tsx` | `components/about/about-page.tsx` |
| **PANEL-P04** | Researchers grid | `/researchers` | `app/researchers/page.tsx` | `components/researchers/researchers-page.tsx` |
| **PANEL-P05** | Single researcher profile | `/researchers/[slug]` | `app/researchers/[slug]/page.tsx` | Same route + brand mark |

**Talking point:** Landing art is the image at `public/images/landing-hero.png`; motion layers live in CSS, not in the PNG.

---

## 2. Authentication

| Footprint | What you see | URL | Route file | Main UI code |
|-----------|--------------|-----|------------|--------------|
| **PANEL-A01** | Learner sign-in | `/login` | `app/login/page.tsx` | `components/auth/heritage-auth-shell.tsx`, `login-form.tsx` (`variant="learner"`) |
| **PANEL-A02** | Learner registration | `/register` | `app/register/page.tsx` | `register-form.tsx` |
| **PANEL-A03** | Admin sign-in (separate from learner) | `/admin/login` | `app/admin/login/page.tsx` | Same shell + `login-form.tsx` (`variant="admin"`) |

**Talking point:** Learner and admin logins are separate routes so learners are not directed into the CMS.

---

## 3. Learner journey (outside the book)

| Footprint | What you see | URL | Route file | Main UI code |
|-----------|--------------|-----|------------|--------------|
| **PANEL-L01** | Learner home (greeting, progress, cover grid) | `/learn` | `app/learn/page.tsx` | `components/learner/chapter-cover-grid.tsx`, `overall-progress.tsx`, `continue-learning-button.tsx` |
| **PANEL-L02** | Display-name onboarding | `/learn/onboarding` | `app/learn/onboarding/page.tsx` | `learner-onboarding-form.tsx` |
| **PANEL-L03** | Learner top navigation (Home, Pre-Test, Chapters, …) | most `/learn/*` | `app/learn/layout.tsx` | `components/learner/learner-shell.tsx` → `learner-header.tsx` |
| **PANEL-L04** | Pre-Assessment (15 questions) | `/learn/assessment/pre` | `app/learn/assessment/pre/page.tsx` | `components/assessment/assessment-engine.tsx` |
| **PANEL-L05** | Chapters index + cover grid | `/learn/chapters` | `app/learn/chapters/page.tsx` | Cover grid + character representation notice |
| **PANEL-L06** | Progress page | `/learn/progress` | `app/learn/progress/page.tsx` | `chapter-journey-list.tsx` |
| **PANEL-L07** | Post-Assessment | `/learn/assessment/post` | `app/learn/assessment/post/page.tsx` | `assessment-engine.tsx` + access gate |
| **PANEL-L08** | Results dashboard | `/learn/results/[attemptId]` | `app/learn/results/[attemptId]/page.tsx` | `components/learner/results/learning-results-dashboard.tsx` |
| **PANEL-L09** | Question review | `/learn/results/[attemptId]/review` | `.../review/page.tsx` | `question-review-panel.tsx` |

**Talking point:** On an open chapter book URL (`/learn/chapters/[chapterId]`), the learner header is hidden on purpose — immersive storybook mode (`PANEL-B01`).

---

## 4. Storybook chapter (primary demo surface)

**URL:** `/learn/chapters/[chapterId]`  
**Admin same UX:** `/admin/chapters/[chapterId]/preview`

### Stack (top → bottom)

| Layer | File | Role |
|-------|------|------|
| Route | `app/learn/chapters/[chapterId]/page.tsx` | Loads chapter, gates on pre-test / lock, starts progress |
| Learner shell | `components/learner/learner-shell.tsx` | Full-viewport book frame, no header |
| Layout orchestration | `components/chapter/learner-chapter-layout.tsx` | Chrome (“All chapters”, “Chapter N of 13”), open/complete, chapter turns |
| Experience | `components/chapter/storybook/storybook-chapter-experience.tsx` | Cover ↔ open state machine |
| Cover | `components/chapter/storybook/storybook-cover.tsx` | Closed book face |
| Open spread | `components/chapter/storybook/storybook-spread.tsx` | Left text page + right media page |
| Styles | `components/chapter/storybook/storybook-book.css` | Book size, chrome, page, spine, nav buttons |
| Page-turn (between chapters) | `storybook-transition-provider.tsx`, `storybook-page-turn.tsx` | Hold overlay while next chapter loads |

### On-screen elements → footprints

| Footprint | What you see on the book | File to open | What to say |
|-----------|--------------------------|--------------|-------------|
| **PANEL-B01** | Immersive cream viewport (no top learner nav) | `learner-shell.tsx` | Chapter reading is a full-screen book, not a dashboard |
| **PANEL-B02** | “← All chapters” and “Chapter N of 13” | `learner-chapter-layout.tsx` (`renderBookChrome`) | Navigation chrome sits on the book, not in a site header |
| **PANEL-B03** | Closed cover (art, title) | `storybook-cover.tsx` | Clicking the cover opens the book |
| **PANEL-B04** | Cover → open animation | `storybook-chapter-experience.tsx` | Phases: `cover` → `opening` → `open` |
| **PANEL-B05** | Left page: **chapter title + subtitle** | `storybook-spread.tsx` (`textPage`) | Title comes from chapter data (CMS), not a hard-coded page |
| **PANEL-B06** | “About this chapter” + summary text | `storybook-spread.tsx` + `chapter-summary-expandable.tsx` | Summary can scroll on short screens; title stays visible |
| **PANEL-B07** | Character representation short notice | `storybook-spread.tsx` (notice hook) | Editable site notice — cultural disclaimer line |
| **PANEL-B08** | Right page: video / animation / illustration | `storybook-spread.tsx` (`videoPage`, `renderRightMedia`) | Media is assigned in Admin → Media / chapter sections |
| **PANEL-B09** | Previous / Continue / Next Page buttons | `storybook-spread.tsx` (page nav) | Completing required media enables continue; last chapter can go to Post-Test |
| **PANEL-B10** | Book sizing, margins, chrome clearance | `storybook-book.css` | Visual system for paper, spine, and responsive height |
| **PANEL-B11** | Chapter-to-chapter page turn | `storybook-transition-provider.tsx` | Smooth transition while next chapter content loads |

**Content note for the panel:** Do not invent cultural details live. Titles, summaries, and media shown are source-/admin-backed. Unapproved content stays draft and does not appear for learners.

---

## 5. Admin / CMS

| Footprint | What you see | URL | Route file | Main UI code |
|-----------|--------------|-----|------------|--------------|
| **PANEL-M01** | Admin shell + sidebar | `/admin/*` | `app/admin/(shell)/layout.tsx` | `components/admin/admin-shell.tsx`, `admin-sidebar.tsx`, `nav-config.ts` |
| **PANEL-M02** | Dashboard metrics | `/admin` | `app/admin/(shell)/page.tsx` | `components/admin/dashboard/*` |
| **PANEL-M03** | Chapter list + create | `/admin/chapters` | `.../chapters/page.tsx` | `chapter-list-table.tsx`, `create-chapter-panel.tsx` |
| **PANEL-M04** | Chapter editor (metadata, sections, characters) | `/admin/chapters/[chapterId]` | `.../[chapterId]/page.tsx` | `chapter-management-editor.tsx` |
| **PANEL-M05** | Learner preview of a chapter | `/admin/chapters/[chapterId]/preview` | `.../preview/page.tsx` | Same storybook stack as learner (`PANEL-B*`) |
| **PANEL-M06** | Media library (upload, filter, bulk select) | `/admin/media` | `.../media/page.tsx` | `media-library.tsx`, `media-list-table.tsx` |
| **PANEL-M07** | Single media asset editor | `/admin/media/[mediaId]` | `.../media/[mediaId]/page.tsx` | `media-detail-editor.tsx` |
| **PANEL-M08** | Assessments list | `/admin/assessments` | `.../assessments/page.tsx` | `assessment-list-table.tsx` |
| **PANEL-M09** | Assessment question editor | `/admin/assessments/[assessmentId]` | `.../[assessmentId]/page.tsx` | `assessment-management-editor.tsx` |
| **PANEL-M10** | Review queue | `/admin/review` | `.../review/page.tsx` | `content-review-queue-panel.tsx` |
| **PANEL-M11** | Analytics workspace | `/admin/analytics` | `.../analytics/page.tsx` | `analytics-workspace.tsx` |
| **PANEL-M12** | Settings (site notices, author about) | `/admin/settings` | `.../settings/page.tsx` | Notice forms under `components/admin/` |

**Talking point:** Approving media (and linked sections) is what makes animations/illustrations appear for learners — draft content stays hidden.

---

## 6. Suggested panel walkthrough order (15–20 min)

| Step | Show this | Footprints | Minutes |
|------|-----------|------------|---------|
| 1 | Landing hero | P01–P02 | 2 |
| 2 | Learner login → home | A01, L01, L03 | 2 |
| 3 | Pre-Assessment (brief) | L04 | 2 |
| 4 | Chapters index → open Chapter 1 | L05, B01–B04 | 3 |
| 5 | Open book: title, about, video | B05–B09 | 4 |
| 6 | Admin: chapter editor + media library | M04, M06 | 3 |
| 7 | Admin preview matches learner book | M05 + B* | 2 |

---

## 7. Quick search cheat sheet

From the project root, find any footprint:

```bash
rg "PANEL-B05" .
rg "PANEL-" components app --glob "*.{tsx,ts,css}"
```

In Cursor / VS Code: **Cmd/Ctrl+Shift+F** → search `PANEL-B05`.

---

## 8. Related docs (not for live reading)

| Doc | Use |
|-----|-----|
| `docs/M17_CLIENT_REVIEW_GUIDE.md` | UAT / review process for stakeholders |
| `docs/LEARNER_USER_GUIDE.md` | Learner how-to |
| `docs/ADMIN_USER_GUIDE.md` | Admin how-to |
| `docs/ARCHITECTURE.md` | Deeper technical architecture |
| `AGENTS.md` | Development rules (content must stay editable / source-backed) |

---

## 9. Spelling reminder for presenters

- Product / epic name in speech and slides: **Suguidanon**
- Code paths and package names: `suguidanon`
- Do not say or write “Sugidanon”
