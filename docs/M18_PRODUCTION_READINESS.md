# M18 — Production Readiness Report

**Date:** 2026-08-15  
**Scope:** Production hardening and deployment preparation (M0–M17 complete)

---

## Executive Summary

Sugidanon has been prepared for production deployment with documented configuration, security hardening, additive performance indexes, and production-safe error handling. **Build and lint pass.** Live smoke testing on a deployed staging environment is **NOT VERIFIED** in this development session.

**Recommendation:** **NOT READY FOR PRODUCTION** until client content blockers are resolved and staging smoke test passes. Infrastructure and code are deployment-ready.

---

## Production Configuration

| Item | Status |
|------|--------|
| `next.config.ts` | Security headers, `poweredByHeader: false`, Supabase image remote patterns |
| `vercel.json` | Build/install commands documented |
| `.env.example` | Full production checklist |
| `lib/env/variables.ts` | Documented env var registry |
| Mock fallback in production | Blocked — middleware 503 + repository guard |
| Hardcoded localhost URLs | None in application source |
| Secrets in repository | None committed (`.gitignore` covers env files) |

---

## Environment Variables

### Public (client-safe)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key — RLS enforced |
| `NEXT_PUBLIC_SITE_URL` | Optional — Auth redirect documentation |

### Server-only

| Variable | Purpose |
|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Migrations, seeds, ops scripts only |

**Verified:** `createSupabaseServiceClient()` is in `server-only` module; not imported by client components. Browser client uses anon key only.

---

## Database

### Migrations (apply in order)

1. `0001_foundation.sql` — schema, indexes, triggers
2. `0002_rls.sql` — RLS policies
3. `0003_auth_profile_defaults.sql` — comments
4. `0003_media_storage.sql` — storage bucket
5. `0004_production_indexes.sql` — **M18** additive indexes

Existing migrations were **not modified**. New indexes use `IF NOT EXISTS`.

### Production data

See `docs/PRODUCTION_DEPLOYMENT.md` §4. Prefer `npm run db:seed-assessments` for the official question bank; do not use deprecated dev assessment seeds.

---

## RLS & Security

### Learners CAN

- Read approved content (sections, media, characters, learning points, assessments, questions)
- Read/write own progress (`profile_id = auth.uid()`)
- Create/update own assessment attempts and answers
- Read own attempt history

### Learners CANNOT

- Write chapters, sections, assessments, or questions
- Modify other learners' progress or attempts
- Access admin-only write paths (enforced by RLS + `requireAdmin()`)

### Admins CAN

- Full CMS write via `is_admin()` policies
- Read all learner progress and attempts (analytics)

### Application-layer defenses (M16/M17)

- Middleware auth on `/learn/*` and `/admin/*`
- `filterChapterForLearner()` on learner read path
- `isAssessmentLearnerReady()` on assessment pages
- CSV exports require admin
- Open redirect blocked on login `next` param

### Known storage limitation

Storage bucket is **public read**. URLs are opaque but directly accessible if path is known. Mitigation: UUID paths, no public asset listing, RLS on metadata.

### Live penetration test

**NOT VERIFIED** — RLS reviewed in migration source; `npm run db:verify` available for staging.

---

## Storage

| Policy | Rule |
|--------|------|
| `media_storage_select` | Public read on `media` bucket |
| `media_storage_admin_insert/update/delete` | Admin only |

Upload MIME types and 50MB limit configured in migration.

---

## Authentication

| Check | Status |
|-------|--------|
| Supabase Auth (email) | Implemented |
| Session refresh via SSR cookies | Implemented |
| Protected learner routes | Middleware |
| Protected admin routes | Middleware + layout |
| Unauthorized → `/unauthorized` | Implemented |
| Production without Supabase | 503 (fail-closed) |
| Dev mock auth | Disabled in production |
| Password reset | Supabase default (configure in dashboard) |

**Redirect URLs:** Must be configured in Supabase dashboard per deployment domain.

---

## Performance

### M18 changes

- Additive indexes on `assessment_attempts`, review status columns
- Prior M16 fix: batched `listLearnerAttempts` queries

### Existing optimizations

- Server Components for data loading
- Media: `loading="lazy"`, `preload="metadata"` on audio/video
- Analytics: parallel raw data load + pure aggregations

### Not changed

- No architecture rewrite
- No premature caching layer

---

## Error Handling

| Area | Production behavior |
|------|---------------------|
| Error boundaries (chapter, assessments) | Generic user message |
| Client error logging | Development only (`logClientError`) |
| Server actions | Safe error messages — no raw DB errors to client |
| Middleware misconfiguration | 503 plain text |
| Chapter load failure | 404 |

---

## Dependencies

Run: `npm audit --omit=dev` (see build log in M18 session).

Policy: No major dependency upgrades in M18 unless required for security.

Transitive vulnerabilities that cannot be safely upgraded without breaking Next.js 15 are documented in the audit output — review before production.

---

## Deployment

| Item | Status |
|------|--------|
| Vercel config | `vercel.json` ready |
| Build command | `npm run build` |
| Framework | Next.js 15 |
| Env vars documented | Yes |
| Auto-deploy to production | **Not performed** (per M18 scope) |

Full guide: **`docs/PRODUCTION_DEPLOYMENT.md`**

---

## Smoke Test

| Environment | Result |
|-------------|--------|
| Local production build | **PASS** (`npm run build`) |
| Deployed staging smoke test | **NOT VERIFIED** |
| Mobile production test | **NOT VERIFIED** |

Smoke test checklist in `docs/PRODUCTION_DEPLOYMENT.md` §7.

---

## Backup & Recovery

Documented in `docs/PRODUCTION_DEPLOYMENT.md` §8–9:

- Supabase automated backups / pg_dump
- Storage export
- Vercel deployment promote for rollback
- Forward-only database migrations on production

---

## Rollback

Documented — Vercel promote previous deployment; database forward-fix only; no destructive rollback executed.

---

## Production Blockers

| # | Blocker |
|---|---------|
| 1 | **PRODUCTION DOMAIN REQUIRED** — client domain not configured |
| 2 | Official pre/post assessment questions not loaded |
| 3 | Chapter 1 content must be approved in CMS before learner launch |
| 4 | Chapters 2–13 remain draft — intentional until client approval |
| 5 | Staging smoke test not executed in this session |
| 6 | Supabase production project + Vercel env vars must be provisioned by ops |

---

## Known Issues

| ID | Severity | Issue |
|----|----------|-------|
| M18-STR-001 | P2 | Public storage bucket — direct URL access if path known |
| M18-TST-001 | P1 | Live smoke test not verified |
| M18-CNT-001 | P1 | No official assessment content |
| M18-DOM-001 | P2 | Production domain not supplied |

---

## M18 Code Changes

1. `next.config.ts` — security headers, image patterns
2. `vercel.json` — deployment metadata
3. `supabase/migrations/0004_production_indexes.sql` — additive indexes
4. `lib/logging/log-client-error.ts` — dev-only client error logging
5. Error boundaries updated (pre/post/chapter)
6. `lib/data/index.ts` — production Supabase guard
7. `lib/env/variables.ts` — env documentation
8. `.env.example` — production checklist

---

## Final Recommendation

| Status | Detail |
|--------|--------|
| **Infrastructure & code** | Ready for staging deployment |
| **Production launch** | **NOT READY** until blockers resolved |

**Next milestone:** Deploy to **staging**, run smoke test checklist, load client-approved assessment content, approve Chapter 1 for learners, then production go-live after client sign-off.
