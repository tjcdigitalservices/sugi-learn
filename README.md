# Sugidanon

A multimedia learning system for the Panay Bukidnon Sugidanon.

## Project Overview

Sugidanon is a responsive web-based learning platform presenting selected Sugidanon material as a structured multimedia learning experience.

### 13 Chapters

| # | Chapter |
|---|---|
| 1 | Tikum Kadlum |
| 2 | Amburukay |
| 3 | Derikaryong Pada |
| 4 | Balanakon |
| 5 | Kalampay |
| 6 | Pahagunong |
| 7 | Sinagnayan |
| 8 | Humadapnon: Tarangban |
| 9 | Humadapnon: Pagbalukat ka Biday |
| 10 | Humadapnon: Hungaw |
| 11 | Humadapnon: Ginlawan |
| 12 | Alayaw |
| 13 | Nagbuhis |

The four Humadapnon entries represent four volumes of the longer Humadapnon epic.

## Product Goal

Sugidanon should allow:
- learners to complete a pre-assessment
- learners to progress through 13 multimedia chapters
- learners to read/explore story content
- learners to encounter illustrations, audio, and selected animations
- learners to complete required activities
- learners to complete a post-assessment
- the system to display appropriate results
- administrators to manage content, assessments, media, and review status
- administrators to view learning analytics

## Core Principle

**Sugidanon is content-driven.**

The application should not depend on content being hardcoded into Next.js components.

    Database / Storage
          ↓
    Content Model
          ↓
    Reusable Chapter Engine
          ↓
    Learner UI

This allows development to continue before all final client content is available.

## Current Multimedia Scope

- Up to **20 custom 2D illustrations** across all 13 chapters
- Up to **3 simple 2D animated scenes** across all 13 chapters
- Audio/narration support where required

Exact allocation is subject to client confirmation.

## Learner Flow

    Home
      ↓
    Pre-Assessment
      ↓
    Chapter Journey
      ↓
    Chapter 1
      ↓
    Chapter 2
      ↓
    ...
      ↓
    Chapter 13
      ↓
    Post-Assessment
      ↓
    Results
      ↓
    Analytics

## Admin Flow

    Admin Login
       ↓
    Dashboard
       ↓
    ├── Chapters
    ├── Content
    ├── Illustrations
    ├── Audio
    ├── Animations
    ├── Assessments
    ├── Review Queue
    └── Analytics

## Content Status

Content should support:
- Draft
- For Review
- Approved
- Needs Revision

Only approved content should be treated as final/validated.

## Assessment

Current working structure:
- 15-question Pre-Assessment
- 15-question Post-Assessment

Questions should be stored as data and traceable to their source/chapter.

## Source and Content Policy

Client-provided source materials are the primary basis for Sugidanon content.

The Aswang Project's "Summary of the Sugidanon (Epics) of Central Panay" is also a project reference.

**Do not invent story, cultural, historical, linguistic, ritual, or character details.**

If the source does not establish something, mark it:

`Pending Client Confirmation`

Final approved client content takes precedence over AI-generated interpretation.

## Initial Development Strategy

The first complete vertical slice should be:

**Chapter 1 — Tikum Kadlum**

It should demonstrate:

    Database
      ↓
    Admin content management
      ↓
    Chapter content
      ↓
    Media
      ↓
    Learner chapter
      ↓
    Assessment
      ↓
    Progress
      ↓
    Analytics

Once this works, reuse the same chapter engine for Chapters 2–13.

## Recommended Technology

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Vercel

## Development Tools

Primary AI-assisted tools:
- Cursor
- Claude Code

Other free AI/tools may be used for illustration ideation, asset preparation, animation experimentation, content structuring, and testing.

AI tools must not be treated as authoritative sources for cultural content.

## Recommended Repository Structure

```text
/
├── app/
├── components/
├── hooks/
├── lib/
├── types/
├── public/
├── docs/
├── content/
├── tests/
├── AGENTS.md
└── README.md
```

Production content lives in Supabase. Client source documents:

- **`docs/sources/Tikum-Kadlum-Sugidanon-Source.docx`** — 13-chapter summaries (Chapter 1 vertical slice: M10)

See `docs/M10_VERTICAL_SLICE.md`, `docs/M12_CHAPTER_1_MULTIMEDIA.md`, and `docs/TIKUM_KADLUM_CONTENT_MAP.md`.

## Development Milestones

### M0 — Project Foundation
Repository, environment, dependencies, deployment foundation.

### M1 — Application Architecture
Routing, components, data/content architecture, authentication boundaries.

### M2 — Database & Data Model
Chapters, sections, media, assessments, progress, users, review states.

### M3 — Authentication & Roles
Admin and learner authentication/authorization.

### M4 — Admin Dashboard Shell
Admin navigation and dashboard foundation.

### M5 — Chapter Management
Create/edit/reorder/manage the 13 chapter records.

### M6 — Dynamic Chapter Engine
Reusable multimedia chapter renderer.

### M7 — Learner Home & Chapter Journey
13-chapter navigation, progress, completion.

### M8 — Pre-Assessment Engine
Data-driven assessment system.

### M9 — Assessment Management
Admin question/answer management.

### M10 — Tikum Kadlum Vertical Slice
Implement Chapter 1 using the supplied source.

### M11 — Multimedia Asset Management
Image/audio/video upload and assignment.

### M12 — Illustration Integration
Integrate approved 2D illustrations.

### M13 — Audio System
Narration/audio playback and integration.

### M14 — Animation Player
Support approved 2D animation assets.

### M15 — Chapter Completion & Progress
Resume, completion tracking, overall progress.

### M16 — Post-Assessment
Post-learning assessment and comparison.

### M17 — Results & Analytics
Learner results and admin analytics.

### M18 — Cultural Review Workflow
Draft/review/approved/revision states.

### M19 — Populate Chapters 2–13
Add client-approved content to the reusable chapter system.

### M20 — QA, Deployment & Acceptance
Responsive QA, functional QA, performance, security, deployment, and client acceptance.

## Working Agreement for AI Agents

Before modifying code:

1. Read `AGENTS.md`.
2. Read this README.
3. Inspect the existing implementation.
4. Identify the relevant milestone.
5. Make focused changes.
6. Run relevant checks/tests.
7. Report what changed and what remains.

Never rewrite the application wholesale unless explicitly requested.

## Current Status

**Milestone M19 (Production Launch & Final Handover) is complete.**

The implementation milestone sequence **M0–M19 is finished**. Handover documentation is in `docs/FINAL_HANDOVER.md`. Production deployment and client acceptance remain pending — see Launch Blockers in `docs/DEVELOPMENT_STATUS.md`.

Supabase Auth protects learner and admin routes in production. See `docs/AUTHENTICATION.md`, `docs/DATABASE.md`, and `docs/PRODUCTION_DEPLOYMENT.md`.

## Local Development

```bash
npm install
cp .env.example .env.local   # optional until Supabase is configured (M2+)
npm run dev
```

Other scripts: `npm run build`, `npm run lint`, `npm start`.

## Ownership and Licensing

Project-specific ownership, content rights, licensing, and deliverables are governed by the signed client agreement and are not defined by this README.
