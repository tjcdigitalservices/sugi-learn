# SugiLearn — Project Specification

**Version:** M1  
**Last updated:** 2026-08-15

---

## 1. Project Purpose

SugiLearn is a multimedia learning system for the **Panay Bukidnon Sugidanon** — presenting selected epic material as a structured, culturally reviewed learning experience.

---

## 2. Product Goals

- Learners complete a **pre-assessment**, progress through **13 multimedia chapters**, and complete a **post-assessment**
- Learners encounter **illustrations, audio, and selected animations** within chapters
- Learners view **results** and **learning analytics**
- Administrators **manage content, assessments, media, and review status**
- Administrators view **aggregate analytics**
- Content is **data-driven**, not hardcoded in application components

---

## 3. Target Users

| User | Description |
|------|-------------|
| **Learner** | Individual accessing the Sugidanon learning journey |
| **Administrator** | Content manager, cultural reviewer, or project staff |
| **Cultural reviewer** | Validates content before publication (workflow M18) |

Exact learner profile and access model: **Pending Client Confirmation**

---

## 4. Learner Flow

```
Home (/learn)
  ↓
Pre-Assessment (15 questions)
  ↓
Chapter Journey (Chapters 1–13)
  ↓
Post-Assessment (15 questions)
  ↓
Results
  ↓
Learning Analytics / Progress
```

---

## 5. Admin Flow

```
Admin Login
  ↓
Dashboard
  ├── Chapters
  ├── Content
  ├── Media (illustrations, audio, animations)
  ├── Assessments
  ├── Review Queue
  └── Analytics
```

---

## 6. Thirteen Chapters

Based on the 13 published Sugidanon volumes:

| # | Chapter |
|---|---------|
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

Detailed content for Chapters 2–13: **Pending Source Content** until client-approved materials are supplied.

---

## 7. Chapter Architecture

### Principle

One **Chapter Engine** renders all chapters from a shared data model.

```
Chapter Route → Chapter Engine → Chapter Data → Sections → Media
```

### Chapter record (conceptual)

- `id`, `number`, `title`, `subtitle`, `summary`, `status`
- `sections[]`, `characters[]`, `learningPoints[]`, `media[]`, `assessmentReferences[]`

### Section types (variable per chapter)

Introduction, story/content, characters, cultural/contextual information, illustration, audio, animation, learning points, activity, completion.

Not every chapter requires every type.

---

## 8. Content Architecture

- Content stored in **Supabase PostgreSQL** (M2+)
- Media files in **Supabase Storage** (M11+)
- Sections ordered by `sortOrder`
- All narrative content from **client-approved sources** only
- Chapter 1 (Tikum Kadlum) is the first vertical slice (M10)

---

## 9. Assessment Architecture

- **Pre-Assessment:** 15 questions (README)
- **Post-Assessment:** 15 questions (README)
- Questions stored as data with: `chapterId`, `assessmentType`, `prompt`, `options`, `correctAnswer`, `explanation`, `sourceReference`, `status`
- Attempts tracked per learner
- Results compare pre vs post

Scoring methodology and research metrics: **Pending Client Confirmation**

---

## 10. Multimedia Architecture

| Type | Scope |
|------|-------|
| 2D illustrations | Up to **20** across all chapters |
| 2D animations | Up to **3 simple scenes** across all chapters |
| Audio/narration | Where required |

Media attached to chapter sections via `mediaAssetId`. Exact per-chapter allocation: **Pending Client Confirmation**

---

## 11. Review / Approval Workflow

Statuses:

- **Draft**
- **For Review**
- **Approved**
- **Needs Revision**

Only **Approved** content is treated as validated for learners. Draft or unreviewed content must not be presented as culturally validated.

Cultural approval process details: **Pending Client Confirmation**

---

## 12. Analytics Architecture

### Learner
- Pre/post scores, learning gain, chapter completion

### Admin
- Aggregate learner metrics, question performance, completion rates

Exact metrics and research requirements: **Pending Client Confirmation**

---

## 13. Technology Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (Auth, PostgreSQL, Storage)
- Vercel

---

## 14. Routing Architecture

See `docs/ARCHITECTURE.md` for full route map.

**Learner:** `/learn/*`  
**Admin:** `/admin/*` (login at `/admin/login`)

---

## 15. Component Architecture

```
components/ui/        — shadcn primitives
components/shared/    — shared layout helpers
components/learner/   — learner shell
components/admin/     — admin shell
components/chapter/   — chapter engine
components/assessment/ — assessment UI (M8+)
```

---

## 16. Data-Access Architecture

```
UI → lib/domain/* → lib/data/* (repositories) → Supabase
```

Repository interfaces defined in M1; Supabase implementations in M2.

---

## 17. Current Project Scope

**Completed:** M0 (foundation), M1 (architecture)

**Not yet implemented:** Authentication, database schema, full chapter content, assessments, analytics, media uploads, cultural review UI, production visuals.

**Reference artifacts:**
- `reference/claude-prototype/` — functional UX reference
- Figma Make — secondary visual reference

---

## Pending Client Confirmation

Unresolved requirements (do not invent):

- **Exact learner profile** — age group, access model, registration requirements
- **Final learning objectives** — per chapter and overall
- **Final chapter content** — all narrative, character, cultural detail for 13 chapters
- **Final assessment methodology** — question types, difficulty, randomization
- **Assessment scoring requirements** — pass/fail, learning gain formula, retakes
- **Exact multimedia allocation** — which chapters receive illustrations, audio, animations
- **Narration requirements** — language, voice, length, recording source
- **Exact animation chapters** — which 3 scenes (max) and story moments
- **Cultural approval process** — reviewers, sign-off steps, escalation
- **Privacy / data requirements** — learner data retention, anonymity for research
- **Final analytics / research metrics** — what admin and researchers need to export
- **Figma vs prototype visual direction** — final brand and typography
- **Lesson complete screen** — separate route vs in-chapter completion section
- **Learner analytics location** — separate from results or combined view

---

## Content Policy

**Do not invent** story, cultural, historical, linguistic, ritual, or character details.

Use client-provided and source-approved materials. Mark gaps as `Pending Client Confirmation` or `Pending Cultural Validation`.

The Aswang Project summary is a **reference**, not a replacement for published epics.

---

## Related Documents

- `AGENTS.md`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/PROTOTYPE_REFERENCE.md`
- `docs/DEVELOPMENT_STATUS.md`
