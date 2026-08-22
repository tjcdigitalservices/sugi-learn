# Sugidanon — Architecture

**Version:** M15 (Analytics & Admin Reporting)  
**Last updated:** 2026-08-15

This document describes the production architecture for Sugidanon. It is written for human developers and AI coding agents.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│  UI (Next.js App Router + React components)             │
├─────────────────────────────────────────────────────────┤
│  Application / Domain Logic (lib/domain/*)              │
├─────────────────────────────────────────────────────────┤
│  Data Access Layer (lib/data/* — repository interfaces) │
├─────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL, Auth, Storage)                   │
└─────────────────────────────────────────────────────────┘
```

**Core principle:** Sugidanon is **content-driven**. One reusable **Chapter Engine** renders any chapter from data. No `Chapter1.tsx`, `Chapter2.tsx`, etc.

---

## Routing Architecture

### Public / site entry
| Route | Purpose |
|-------|---------|
| `/` | Site entry — links to learner and admin areas |

### Learner area (`/learn/*`)
| Route | Purpose | Milestone |
|-------|---------|-----------|
| `/learn` | Learner home with journey and progress | M7 |
| `/learn/assessment/pre` | Pre-assessment | M8 |
| `/learn/chapters` | Chapter journey list with progress states | M7 |
| `/learn/chapters/[chapterId]` | Chapter engine (learner) | M6 |
| `/learn/assessment/post` | Post-assessment | M14 |
| `/learn/results` | Results index (redirects to latest post attempt) | M14 |
| `/learn/results/[attemptId]` | Assessment results + pre/post comparison | M14 |
| `/learn/progress` | Learner progress summary | M7 |

**Layout:** `LearnerShell` — top navigation, learner-focused chrome.

### Admin area (`/admin/*`)
| Route | Purpose | Milestone |
|-------|---------|-----------|
| `/login` | Learner sign-in | M3 |
| `/admin/login` | Admin sign-in (no admin shell) | M3 |
| `/unauthorized` | Access denied for non-admin users | M3 |
| `/admin` | Dashboard | M4 |
| `/admin/chapters` | Chapter list + management entry | M5 |
| `/admin/chapters/[chapterId]` | Chapter editor (metadata, sections, characters, learning points) | M5 |
| `/admin/chapters/[chapterId]/preview` | Admin structure preview | M5 |
| `/admin/content` | Content management | M5/M6 |
| `/admin/media` | Media management | M11 |
| `/admin/assessments` | Assessment management | M9 |
| `/admin/review` | Review workflow | M18 |
| `/admin/analytics` | Admin analytics & reporting | M15 |

**Layout:** Route group `admin/(shell)` uses `AdminShell` (sidebar). Login is outside the shell.

---

## Learner Layout

- **Component:** `components/learner/learner-shell.tsx`
- **Behavior:** Horizontal nav, link to admin, main content area
- **Future:** Progress thread / step indicator (from prototype UX reference)

---

## Admin Layout

- **Components:** `components/admin/admin-shell.tsx`, `admin-shell-client.tsx`, `admin-sidebar.tsx`, `admin-header.tsx`, `admin-mobile-nav.tsx`, `admin-nav-links.tsx`
- **Behavior:** Responsive sidebar on desktop (lg+); mobile drawer navigation with sticky header
- **Navigation:** Dashboard, Chapters, Content, Media, Assessments, Review, Analytics — with active route indication and Lucide icons
- **Auth chrome:** User email label, Administrator role indication, sign-out, exit to learner site (M3)
- **Dashboard:** Server-rendered overview at `/admin` using `AdminDashboardRepository` (M4)

---

## Component Organization

```
components/
├── ui/           # shadcn/ui primitives (added as needed)
├── shared/       # PageHeader, PlaceholderPanel
├── learner/      # LearnerShell, progress UI, journey list
├── admin/        # AdminShell, dashboard, chapter management, nav
├── chapter/      # ChapterEngine, section renderers, learner layout, media
└── assessment/   # (M8+) Assessment UI components
```

**Rule:** Reuse components. Do not duplicate section rendering logic per chapter.

---

## Chapter Engine

See `docs/CHAPTER_ENGINE.md` for full M6 documentation.

### Data flow

```
/learn/chapters/[chapterId]
        ↓
getChapterForEngine(chapterId)    ← lib/domain/chapters.ts
getChapterNavigation(chapterId)    ← lib/domain/chapter-navigation.ts
        ↓
ChapterRepository.getChapterById  ← lib/data (Supabase or mock; RLS for learners)
        ↓
LearnerChapterLayout / Admin preview wrapper
        ↓
<ChapterEngine chapter={...} context="learner|preview" />
        ↓
<SectionRenderer /> → section-specific views
        ↓
<MediaRenderer /> (illustration / audio / animation)
```

### Shared vs wrapper concerns

| Layer | Learner | Admin preview |
|-------|---------|---------------|
| Engine | `ChapterEngine` | Same |
| Header/nav | `LearnerChapterLayout` + `ChapterNavigationBar` | Admin banner only |
| Data source | `getChapterForEngine()` (RLS-approved) | `getChapterForAdmin()` (all sections) |
| Completion | Interactive (local state) | Read-only |

### Section kinds (discriminated union)

Defined in `types/chapter.ts`:

- `introduction`, `story`, `cultural_context`, `activity` → text body
- `characters` → character references
- `illustration`, `audio`, `animation` → media asset references
- `learning_points` → learning point references
- `completion` → completion message

Sections are **ordered** by `sortOrder`. Not every chapter includes every kind.

### Architecture demo

`/learn/chapters/architecture-demo` renders placeholder sections for each media type using `ARCHITECTURE_DEMO_CHAPTER` — internal reference only, not learner content.

---

## Content Types

See `types/`:

| Module | Key types |
|--------|-----------|
| `types/chapter.ts` | `Chapter`, `ChapterSection`, `Character`, `LearningPoint` |
| `types/assessment.ts` | `Assessment`, `AssessmentQuestion`, `AssessmentAttempt`, `AssessmentResult` |
| `types/media.ts` | `MediaAsset`, `MediaKind` |
| `types/review.ts` | `ReviewStatus` |
| `types/progress.ts` | `LearnerProgress`, `ChapterProgress` |
| `types/admin-dashboard.ts` | `AdminDashboardSummary`, `ChapterStatusCounts` |
| `types/chapter-management.ts` | Admin chapter management inputs and list types |

---

## Assessment Architecture

- Assessments are **data-driven** (never hardcoded in UI)
- Two types: `pre` | `post` (15 questions each per README)
- Questions link to `chapterId`, `sourceReference`, `reviewStatus`
- Attempts and scoring persisted in M15/M16
- Scoring methodology: **Pending Client Confirmation**

---

## Content Production Architecture (M10–M13)

```
Source document (docs/sources/)
  ↓
Content map (docs/*_CONTENT_MAP.md)
  ↓
TypeScript definitions (lib/content/)
  ↓
Mock bootstrap / Supabase seed
  ↓
ChapterManagementRepository
  ↓
ChapterRepository → filterChapterForLearner()
  ↓
ChapterEngine
```

| Layer | Location | Scope |
|-------|----------|-------|
| Chapter 1 vertical slice | `lib/content/tikum-kadlum/` | Approved learner slice (M10–M12) |
| Chapters 2–13 expansion | `lib/content/sugidanon/chapters/` | Draft CMS-ready content (M13) |
| Shared builders | `lib/content/sugidanon/build-chapter-content.ts`, `character-registry.ts` | Section assembly, character reuse |
| Mock bootstrap | `lib/content/sugidanon/mock-bootstrap.ts` | Lazy init on first chapter access |
| Supabase seed | `supabase/seed-chapters-2-13.sql` | Generated via `scripts/generate-chapters-2-13-seed.ts` |

**Rules:** Do not invent story content. New M13 content defaults to `draft`. Only `approved` content is learner-visible via `filterChapterForLearner()`.

See `docs/M13_CONTENT_EXPANSION.md` and `docs/CHAPTERS_2_13_CONTENT_MAP.md`.

---

## Media Architecture

- Media stored separately (Supabase Storage in M11)
- Kinds: `illustration` | `audio` | `animation`
- Scoped limits: 20 illustrations, 3 animations (project-wide — subject to client confirmation)
- Sections reference media via `mediaAssetId`
- `MediaPlaceholder` used until real assets are integrated (M12–M14)

---

## Review / Approval States

```typescript
type ReviewStatus = "draft" | "for_review" | "approved" | "needs_revision"
```

- Only `approved` content is treated as validated for learners
- Draft content must not be presented as culturally validated
- Full workflow UI in M18

---

## Data-Access Boundary

### Repository interfaces (`lib/data/types.ts`)

- `ChapterRepository`
- `ChapterManagementRepository` — admin CRUD for chapters, sections, characters, learning points (M5)
- `AssessmentRepository` — learner attempts + admin CMS (M8/M9)
- `ProgressRepository` — learner chapter progress CRUD (M7)
- `AdminDashboardRepository` — aggregate counts for admin dashboard (M4)
- `AdminAnalyticsRepository` — learner progress and assessment analytics (M15)

### Factory (`lib/data/index.ts`)

- **M2:** `Supabase*Repository` when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- **Fallback:** `Mock*Repository` when Supabase is not configured (local dev without DB)

### Domain functions (`lib/domain/`)

- `listChapterSummaries()`, `getChapterForEngine()` — chapters
- `getChapterNavigation()` — prev/next chapter links (M6)
- `getLearnerJourneySummary()`, `ensureChapterStarted()`, `completeChapterProgress()` — learner progress (M7)
- `getPreAssessmentSession()`, `submitPreAssessment()` — pre-assessment (M8)
- `getPostAssessmentSession()`, `submitPostAssessment()` — post-assessment (M14)
- `getAssessmentResultsView()`, `getLatestPostAssessmentAttemptId()` — results (M14)
- `listAssessmentsForAdmin()`, `getAssessmentForAdmin()`, question CRUD — assessment CMS (M9)
- `listAssessments()`, `getAssessmentQuestions()` — assessments (admin/server)
- `getAdminDashboardSummary()` — admin dashboard metrics (M4)
- `getAdminAnalyticsSummary()`, `getParticipationOverview()` — admin analytics (M15)
- `listChaptersForAdmin()`, `getChapterForAdmin()`, section/character/learning-point mutations — chapter management (M5)

**Rule:** UI components and route pages call **domain functions**, not Supabase clients directly.

See `docs/DATABASE.md` for schema and repository mapping.

---

## State Management Approach

No global state library in M1. Planned approach:

| Concern | Approach |
|---------|----------|
| Auth | Supabase Auth + middleware session refresh + `requireUser()` / `requireAdmin()` |
| Server data | Async server components + domain layer |
| Client interactivity | React `useState` / `useReducer` for forms, media players |
| Progress / attempts | Supabase via `ProgressRepository` (M7 chapter progress); `AssessmentRepository` for pre-assessment attempts (M8) |
| Admin editing | Server actions + `ChapterManagementRepository` (M5); local form state in client components |
| Loading / error / empty | Route-level loading.tsx / error.tsx (as needed); `PlaceholderPanel` in M1 |

Add TanStack Query or similar only if a clear need emerges (e.g. heavy client polling).

---

## Supabase Integration (M2–M3)

1. PostgreSQL schema in `supabase/migrations/` — see `docs/DATABASE.md`
2. Supabase-backed repositories
3. Supabase Auth email/password sign-in (M3)
4. Middleware session handling + route protection (M3)
5. RLS policies on all application tables
6. Storage integration (M11) — see `docs/MEDIA_MANAGEMENT.md`

Existing clients: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/service.ts`, `lib/supabase/middleware.ts`

See `docs/AUTHENTICATION.md` for auth architecture.

---

## Important Architectural Decisions (M1)

| Decision | Rationale |
|----------|-----------|
| Single `[chapterId]` dynamic route | Content-driven; avoids 13 hardcoded pages |
| Discriminated union for sections | Type-safe rendering per section kind |
| Supabase repositories (M2) | Real persistence behind same interfaces |
| Repository pattern | Clean swap between Supabase and mock |
| Route group `admin/(shell)` | Login outside admin chrome |
| Mock repo + architecture demo chapter | Demonstrates engine without inventing story content |
| 13-chapter catalog in constants | Titles from AGENTS.md; content empty until client supply |
| Prototype preserved in `reference/` | Not imported into production bundle |
| ESLint ignores `reference/` | Reference artifact excluded from lint |

---

## Related Documentation

- `docs/Sugidanon_Project_Specification.md` — product specification
- `docs/PROTOTYPE_REFERENCE.md` — prototype analysis
- `docs/LEARNER_JOURNEY.md` — M7 learner home, progress, Continue Learning
- `docs/PRE_ASSESSMENT.md` — M8 pre-assessment engine, scoring, security
- `docs/ANALYTICS.md` — M15 admin analytics and reporting
- `docs/POST_ASSESSMENT.md` — M14 post-assessment and results
- `docs/ASSESSMENT_MANAGEMENT.md` — M9 admin assessment CMS
- `docs/TIKUM_KADLUM_CONTENT_MAP.md` — M10 13-chapter source map
- `docs/TIKUM_KADLUM_CHAPTER_1_SOURCE_MAP.md` — M10 Chapter 1 traceability
- `docs/M10_VERTICAL_SLICE.md` — M10 Tikum Kadlum vertical slice
- `docs/MEDIA_MANAGEMENT.md` — M11 admin media library and storage
- `docs/M12_CHAPTER_1_MULTIMEDIA.md` — M12 Chapter 1 multimedia integration
- `docs/M13_CONTENT_EXPANSION.md` — M13 Chapters 2–13 content expansion
- `docs/CHAPTERS_2_13_CONTENT_MAP.md` — M13 per-chapter source map
- `docs/CHAPTER_ENGINE.md` — M6 chapter engine architecture
- `docs/DEVELOPMENT_STATUS.md` — milestone progress
- `AGENTS.md` — agent development rules
