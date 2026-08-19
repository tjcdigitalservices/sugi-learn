# SugiLearn — Final Handover

**Date:** 2026-08-15  
**Milestone:** M19 — Production Launch & Final Handover  
**Status:** Handover documentation complete — **production deployment pending client/ops provisioning**

---

## Project

**SugiLearn** is a multimedia learning web application for the Panay Bukidnon Sugidanon. It presents 13 chapters with pre/post assessments, learner progress tracking, and an administrator content management system.

Implementation milestones **M0 through M18** are complete. M19 completes the handover package.

---

## Production

| Item | Value |
|------|-------|
| **Production URL** | **PRODUCTION DOMAIN REQUIRED** — not yet configured |
| **Sign in** | `{PRODUCTION_URL}/login` |
| **Hosting** | Vercel (Next.js 15) |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |

**No passwords, API keys, or secrets appear in this document.** Credentials are managed in Vercel and Supabase dashboards only.

### Deployment status (M19)

Production deployment was **not executed** in the M19 development session because critical blockers remain (see [Launch Blockers](#launch-blockers)). The application code and deployment runbook are ready; ops must provision infrastructure and deploy per `docs/PRODUCTION_DEPLOYMENT.md`.

---

## Architecture

```
User (browser)
    ↓
Vercel — Next.js 15 App Router
    ↓
Supabase
    ├── PostgreSQL (content, progress, assessments)
    ├── Authentication (email/password)
    └── Storage (illustrations, audio, animation/video)
```

- **Learner UI:** `/learn/*` — chapter engine, assessments, progress, results
- **Admin CMS:** `/admin/*` — chapters, media, assessments, analytics, review queue
- **Security:** Supabase RLS + middleware route protection + server-side admin guards

Full architecture: `docs/ARCHITECTURE.md`

---

## Deployment

1. Link repository to Vercel
2. Set environment variables (see `.env.example`)
3. Run Supabase migrations (`supabase db push`)
4. Run production seeds (see `docs/PRODUCTION_DEPLOYMENT.md` §4)
5. Create admin and learner accounts in Supabase Auth
6. Approve Chapter 1 content in CMS
7. Deploy via Vercel

Detailed runbook: **`docs/PRODUCTION_DEPLOYMENT.md`**

Configuration files: `vercel.json`, `next.config.ts`, `.env.example`

---

## Database

| Item | Detail |
|------|--------|
| Migrations | `supabase/migrations/` (0001–0004) |
| Auto seed | `supabase/seed.sql` (13 chapter titles) |
| Chapter 1 | `seed-tikum-kadlum-chapter-1.sql` (+ optional M12 media metadata) |
| Chapters 2–13 | `seed-chapters-2-13.sql` (draft summaries) |
| RLS | Enabled on all learner/admin tables (`0002_rls.sql`) |
| Maintenance | `npm run db:migrate`, `npm run db:verify` |

Schema reference: `docs/DATABASE.md`

**Do not run** dev assessment seeds on production.

---

## Authentication

- **Provider:** Supabase Auth (email/password)
- **Roles:** `learner` (default), `admin` (promoted via SQL or controlled ops)
- **Learner routes:** Middleware requires authenticated session
- **Admin routes:** Middleware requires `profiles.role = admin`
- **Redirect URLs:** Must be configured in Supabase dashboard for production domain

Reference: `docs/AUTHENTICATION.md`

---

## Media

- **Storage bucket:** `media` (public read; admin-only write)
- **Types:** Illustration (JPEG/PNG/WebP/GIF), audio (MP3/WAV/OGG), animation/video (MP4/WebM)
- **Management:** Admin → Media (`/admin/media`)
- **Learner visibility:** Only assets with `review_status = approved` in PostgreSQL

Reference: `docs/MEDIA_MANAGEMENT.md`

---

## Content

Administrators manage content via **Admin → Chapters** (`/admin/chapters`):

- Chapter metadata (title, summary, review status)
- Sections (story, introduction, media, characters, learning points, completion)
- Characters and learning points
- Review statuses: Draft, For review, Approved, Needs revision

**Review queue:** Admin → Review (`/admin/review`)

Only **Approved** content is visible to learners.

Admin guide: **`docs/ADMIN_USER_GUIDE.md`**

---

## Assessments

- **Pre-Assessment:** `/learn/assessment/pre` — before chapters
- **Post-Assessment:** `/learn/assessment/post` — after chapters (policy configurable)
- **Management:** Admin → Assessments (`/admin/assessments`)
- **Scoring:** Percentage based on correct answers; results at `/learn/results`

Official client questions must be entered and approved in CMS. Dev test questions must not be used in production.

Reference: `docs/POST_ASSESSMENT.md`, `docs/PRE_ASSESSMENT.md`

---

## Analytics

- **Dashboard:** Admin → Analytics (`/admin/analytics`)
- **Metrics:** Learner counts, chapter completion, assessment scores, pre/post score difference
- **Exports:** CSV (learner progress, assessment results, chapter completion)
- **Terminology:** Neutral — no learning-effectiveness claims

Reference: `docs/ANALYTICS.md`

---

## Backup & Recovery

| Asset | Approach |
|-------|----------|
| Database | Supabase automated backups; manual `pg_dump` before major changes |
| Media | Export Supabase Storage bucket periodically |
| Env vars | Secure store / Vercel env export |
| Rollback | Vercel → promote previous deployment |

Full procedures: `docs/PRODUCTION_DEPLOYMENT.md` §8–9

---

## Known Limitations

1. **PRODUCTION DOMAIN REQUIRED** — not yet configured
2. Chapters 2–13 are draft in seed data — not learner-visible until approved
3. Official pre/post assessment questions not loaded — client must supply
4. Chapter 1 learning points marked PENDING CLIENT APPROVAL
5. Illustration artwork requires client asset upload
6. Public storage URLs are accessible if path is known (opaque paths mitigate)
7. Live production smoke test not yet executed
8. Transitive npm audit advisories in Next.js 15 dependencies (documented M18)

---

## Future Enhancements

Classified separately from delivered scope — **not implemented**:

| Item | Classification |
|------|----------------|
| Additional chapters beyond 13 | FUTURE ENHANCEMENT |
| Illustrations beyond agreed cap (~20) | FUTURE ENHANCEMENT |
| Animations beyond agreed cap (~3) | FUTURE ENHANCEMENT |
| Extended research analytics / statistical reporting | FUTURE ENHANCEMENT |
| Full cultural review workflow automation | FUTURE ENHANCEMENT |
| Narration production at scale | FUTURE ENHANCEMENT |
| Native mobile apps | FUTURE ENHANCEMENT |

See `docs/M17_UAT_TRACKER.md` scope additions table.

---

## Launch Blockers

| # | Blocker | Owner |
|---|---------|-------|
| 1 | Production domain and DNS | Client / ops |
| 2 | Supabase production project + env vars on Vercel | Ops |
| 3 | Production deployment execution | Ops |
| 4 | Official assessment content loaded and approved | Client |
| 5 | Chapter 1 sections approved for learners | Client |
| 6 | Production smoke test pass | Ops / QA |
| 7 | Client acceptance checklist signed | Client |

---

## Handover Document Index

| Document | Audience |
|----------|----------|
| `docs/FINAL_HANDOVER.md` | Project team / ops (this document) |
| `docs/ADMIN_USER_GUIDE.md` | Administrators |
| `docs/LEARNER_USER_GUIDE.md` | Learners |
| `docs/FINAL_CONTENT_STATUS.md` | Client / content team |
| `docs/CLIENT_ACCEPTANCE_CHECKLIST.md` | Client sign-off |
| `docs/PRODUCTION_DEPLOYMENT.md` | Ops / deployment |
| `docs/M18_PRODUCTION_READINESS.md` | Security / readiness audit |
| `docs/M17_CLIENT_REVIEW_GUIDE.md` | UAT reviewers |
| `docs/M16_QA_REPORT.md` | QA history |
| `docs/DEVELOPMENT_STATUS.md` | Milestone completion record |

---

## Support Contacts

Configure before go-live:

- **Technical / deployment:** [Ops contact — to be assigned]
- **Content / cultural review:** [Client contact — to be assigned]
- **Supabase project owner:** [To be assigned]
- **Vercel project owner:** [To be assigned]
