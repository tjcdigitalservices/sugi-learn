# SugiLearn — Project Audit

**Audit date:** 2026-08-15  
**Milestone:** M0 — Project Foundation

---

## Current State

| Item | Finding |
|------|---------|
| **Framework** | None — documentation-only repository |
| **Language** | None (no application source code) |
| **Package manager** | None configured |
| **Git repository** | Not initialized at audit time |
| **Application code** | Not present |
| **Interactive HTML prototype** | Referenced in README/AGENTS.md but **not present in this repository** |
| **Documentation** | `README.md`, `AGENTS.md` |
| **Specification** | `docs/SugiLearn_Project_Specification.md` referenced in AGENTS.md but not yet present |

### Files present at audit (pre-M0)

```
sugi-learn/
├── AGENTS.md
└── README.md
```

---

## Existing Architecture

There is **no application architecture** in the repository yet. The project exists as planning and agent-guidance documentation only.

The **intended** production architecture (from `AGENTS.md` and `README.md`) is:

```
Admin/content data
      ↓
Database / storage (Supabase)
      ↓
Reusable chapter engine
      ↓
Learner experience
```

Target stack: Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase (Auth, PostgreSQL, Storage), Vercel.

---

## Existing Dependencies

None. No `package.json` existed at audit time.

---

## Existing Routes / Pages

None.

---

## Existing Components

None.

---

## Existing Styles

None.

---

## Existing Data Structures

None in code. Conceptual entities are documented in `AGENTS.md`:

- users, chapters, chapter_sections, characters, media_assets
- assessments, questions, question_options
- learner_progress, assessment_attempts, review_items

---

## Existing Prototype Functionality

README and AGENTS.md state that an **interactive HTML prototype** exists, but it was **not found inside this repository** during the audit (no HTML, CSS, or JavaScript application files).

**Implication:** If a prototype exists elsewhere (local files, client deliverable, or another branch), it should be imported into `public/prototype/` or `content/prototype/` in a future step so UI/interaction work can be referenced during migration. M0 does not assume access to that artifact.

---

## Existing Environment Variables

None. No `.env`, `.env.example`, or `.env.local` at audit time.

---

## Existing Build Commands

None.

---

## Problems / Risks

1. **Greenfield gap** — Documentation describes a prototype and production app, but the repo contains only docs. M0 must scaffold the foundation without inventing features.
2. **Missing prototype in repo** — Risk of losing reference UI if an external prototype is not archived here before M1+.
3. **No git history** — Version control should be initialized early for traceability.
4. **Cultural content rule** — Any future content must not be invented; only approved sources (e.g. Tikum Kadlum document) may be used.
5. **Scope creep** — Milestones M1–M20 must not be started during M0.

---

## Recommended Migration Approach

Because there is **no in-repo prototype or prior Next.js app**, migration is **greenfield scaffolding**, not a stack migration:

1. **Preserve** `AGENTS.md` and `README.md` (update README only where factual state changes).
2. **Initialize** Next.js (App Router) + TypeScript + Tailwind + ESLint in the existing directory.
3. **Prepare** shadcn/ui foundation (config + utilities only; no feature UI).
4. **Add** minimal Supabase client utility (no schema, no auth flows).
5. **Archive prototype later** — When the HTML prototype is available, place it under `public/prototype/` or document its location; extract patterns into React components during M6–M7, not M0.
6. **Do not** hardcode 13 chapter pages or assessment UI in M0.

---

## What Should Be Preserved

- `AGENTS.md` — non-negotiable development rules and architecture direction
- `README.md` — product overview (update status sections only)
- Future client source materials (not in repo yet)
- Any external HTML prototype (import when available; do not delete)

---

## What Should Eventually Be Replaced

- Static/hardcoded content in any external HTML prototype → data-driven Supabase-backed content (M2+)
- Prototype-only navigation and mock data → authenticated learner/admin flows (M3+)
- Placeholder home page from M0 → real learner home (M7)

---

## M0 Implementation Plan

| Task | Action |
|------|--------|
| 1. Audit | This document |
| 2. Dev environment | `create-next-app` with TypeScript, Tailwind, ESLint, App Router, `@/*` alias |
| 3. Environment | `.env.example` with Supabase placeholders; gitignore secrets |
| 4. Git hygiene | `.gitignore` for `.env*`, `node_modules`, `.next`, `dist`, `build` |
| 5. Structure | `app/`, `components/`, `lib/`, `hooks/`, `types/`, `public/`, `docs/` |
| 6. Config | Review `tsconfig`, `next.config`, `tailwind`, ESLint, path aliases |
| 7. UI foundation | shadcn/ui init (CSS variables, `lib/utils.ts`); minimal placeholder home |
| 8. Supabase prep | `lib/supabase/client.ts` + `server.ts` stubs; `@supabase/supabase-js` dependency |
| 9. Vercel readiness | Verify `npm run build` succeeds |
| 10. Documentation | `docs/DEVELOPMENT_STATUS.md`; README status update |

**Explicitly out of scope for M0:** auth, database schema, dashboards, chapter engine, assessments, analytics, media systems.
