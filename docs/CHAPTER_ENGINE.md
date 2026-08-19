# SugiLearn — Chapter Engine

**Version:** M6  
**Last updated:** 2026-08-15

The Chapter Engine is SugiLearn's data-driven renderer for all 13 chapters through a single route and component tree.

---

## M6 Audit (M1/M5 Baseline)

| Area | Finding |
|------|---------|
| **ChapterEngine** | Already implemented as a reusable renderer — retained and refined, not rebuilt |
| **SectionRenderer** | Delegated to section types but used generic markup and prototype-style placeholder copy — refactored into dedicated section components |
| **MediaPlaceholder** | Admin-era stub only — replaced by `MediaRenderer` with URL resolution and typed empty states |
| **PageHeader** | Generic shared header — replaced for chapters by learner-specific `ChapterHeader` |
| **Admin preview** | Already used `ChapterEngine` — continues to reuse shared engine with `context="preview"` |
| **Learner route** | Loaded via `getChapterForEngine()` but used `PlaceholderPanel` for empty chapters — now uses engine empty states |
| **Section order** | Sorted in domain layer — preserved; engine re-sorts defensively |
| **Data access** | Already repository-based — unchanged; no Supabase in components |

### Reuse decisions

- **Shared:** `ChapterEngine`, `SectionRenderer` (router), section view components, `MediaRenderer`
- **Learner-specific:** `LearnerChapterLayout`, `ChapterNavigationBar`, interactive completion button
- **Preview-specific:** Admin banner wrapper only; engine receives `context="preview"` (non-interactive completion)

---

## Architecture

```
Supabase (RLS-filtered for learners)
        ↓
ChapterRepository.getChapterById()
        ↓
getChapterForEngine()          ← lib/domain/chapters.ts
        ↓
LearnerChapterLayout / Admin preview wrapper
        ↓
ChapterEngine
        ↓
SectionRenderer → section-specific views
        ↓
MediaRenderer (when applicable)
```

**Core principle:** One engine, one route pattern (`/learn/chapters/[chapterId]`), no per-chapter pages.

---

## Data Flow

### Learner route

1. `/learn/chapters/[chapterId]/page.tsx` calls `getChapterForEngine(chapterId)`
2. Domain function loads chapter via `ChapterRepository` and sorts sections by `sortOrder`
3. `getChapterNavigation(chapterId)` loads prev/next from chapter catalog
4. `LearnerChapterLayout` composes header, engine, and navigation
5. `ChapterEngine` maps sections to `SectionRenderer`

### Admin preview

1. `/admin/chapters/[chapterId]/preview` calls `getChapterForAdmin()` (all sections, admin RLS)
2. Admin banner wrapper + `ChapterEngine` with `context="preview"`

### Security

- Learner routes require authentication (M3 middleware + layout)
- Learner repository reads use anon/authenticated Supabase client — RLS returns approved content only
- No service-role client in rendering path
- Admin preview is admin-authenticated only

---

## ChapterEngine API

```tsx
<ChapterEngine
  chapter={chapter}
  showHeader={true}      // false when wrapper provides ChapterHeader
  context="learner"      // "learner" | "preview"
/>
```

| Prop | Default | Purpose |
|------|---------|---------|
| `chapter` | required | Full domain `Chapter` object |
| `showHeader` | `true` | Toggle built-in `ChapterHeader` |
| `context` | `"learner"` | Affects empty states and completion interactivity |

---

## Section Renderers

| Kind | Component | Behavior |
|------|-----------|----------|
| `introduction`, `story`, `cultural_context`, `activity` | `TextSectionView` | Title + paragraph text (plain text, `\n` preserved) |
| `illustration` | `IllustrationSectionView` | Title + `MediaRenderer` |
| `audio` | `AudioSectionView` | Title + audio player + optional transcript |
| `animation` | `AnimationSectionView` | Title + video player |
| `characters` | `CharactersSectionView` | Referenced characters or empty state |
| `learning_points` | `LearningPointsSectionView` | Referenced points with title/description |
| `completion` | `CompletionSectionView` | Completion message; learner gets finish button |
| Unknown | fallback | Safe unsupported-type message |

Sections render in persisted `sortOrder` — never sorted by type or title.

---

## Media Behavior

`MediaRenderer` + `resolveMediaUrl()`:

| Condition | Result |
|-----------|--------|
| No linked asset | Type-specific empty message |
| Asset exists, no `storagePath` | Empty message + optional caption |
| Absolute URL in `storagePath` | Render `<img>`, `<audio>`, or `<video>` |
| Relative storage path + Supabase URL env | Construct public storage URL (M11 foundation) |

Empty messages:

- Illustration: “Illustration not available yet.”
- Audio: “Audio not available yet.”
- Animation: “Animation not available yet.”

No fabricated media is rendered.

---

## Learner Chrome

### ChapterHeader

- Chapter position (e.g. “Chapter 3 of 13”)
- Title, subtitle, summary (when present)

### ChapterNavigationBar

- Previous / Next links from database chapter order
- First chapter: previous disabled with message
- Last chapter: next disabled with message

### Completion (M6 foundation)

- Interactive “I've finished this chapter” button on completion sections (learner only)
- **Non-persistent** — local React state only; M7 adds progress tracking

---

## Empty & Error States

| Scenario | Handling |
|----------|----------|
| Invalid chapter ID | `notFound()` |
| Database failure | Route `error.tsx` with retry |
| No sections | `ChapterEmptyState` — “This chapter is being prepared…” |
| Missing media | `MediaRenderer` empty message |
| Missing characters | “Character information not available yet.” |
| Missing learning points | “Learning points are not available yet.” |
| Empty text body | “Content for this section is not available yet.” |
| Unknown section kind | Unsupported type message |

No raw database errors are shown to learners.

---

## Loading

`app/learn/chapters/[chapterId]/loading.tsx` — skeleton for chapter header and section blocks.

---

## Accessibility

- Semantic `<header>`, `<article>`, `<section>`, `<nav>`, `<figure>`
- Heading hierarchy: chapter `h1`, section `h2`, character/point `h3`
- Keyboard-focusable navigation links and completion button
- Native `<audio>` / `<video>` controls
- Image `alt` from asset metadata or caption fallback
- `role="status"` on empty states and completion confirmation

---

## Component Map

```
components/chapter/
├── chapter-engine.tsx
├── chapter-header.tsx
├── chapter-empty-state.tsx
├── chapter-navigation.tsx
├── learner-chapter-layout.tsx
├── section-renderer.tsx
├── media-renderer.tsx
└── sections/
    ├── text-section.tsx
    ├── illustration-section.tsx
    ├── audio-section.tsx
    ├── animation-section.tsx
    ├── characters-section.tsx
    ├── learning-points-section.tsx
    ├── completion-section.tsx
    └── section-empty-state.tsx
```

---

## Known Limitations

1. No persistent learner progress (M7)
2. No pre/post assessment transitions from chapter nav (M7+)
3. Full Supabase Storage upload pipeline not implemented (M11+)
4. Learners only see RLS-approved sections; draft content visible in admin preview only
5. Plain text sections only — no Markdown/HTML rendering unless content model adds it
6. Architecture demo chapter (`architecture-demo`) bypasses standard navigation

---

## Related Documentation

- `docs/ARCHITECTURE.md`
- `docs/CHAPTER_MANAGEMENT.md`
- `docs/PROTOTYPE_REFERENCE.md`
- `docs/DEVELOPMENT_STATUS.md`
