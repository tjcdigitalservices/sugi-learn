# Sugidanon — Production Deployment Guide

**Last updated:** 2026-08-15 (M18)

This guide describes how to deploy Sugidanon to a production or staging environment.

**Architecture:**

```
User → Vercel → Next.js → Supabase (PostgreSQL + Auth + Storage)
```

---

## Prerequisites

- [Vercel](https://vercel.com) account linked to the repository
- [Supabase](https://supabase.com) production project
- Node.js 20+ locally (for migrations/seeds)
- Supabase CLI (`supabase`) for database operations

---

## 1. Environment Variables

### Public (safe for browser bundles)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key — RLS enforced |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Production URL for Auth redirect documentation |

### Server-only (Vercel: Production environment)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (ops) | Migrations, seeds, server scripts — **never** prefix with `NEXT_PUBLIC_` |

**Never commit** `.env`, `.env.local`, or real credentials to git.

Copy `.env.example` to `.env.local` for local development only.

---

## 2. Supabase Project Setup

### 2.1 Create project

1. Create a new Supabase project (separate from development recommended).
2. Note the project URL and API keys from **Settings → API**.

### 2.2 Auth URL configuration

In **Authentication → URL Configuration**:

| Setting | Value |
|---------|-------|
| Site URL | `https://your-production-domain.example` |
| Redirect URLs | `https://your-production-domain.example/**` |
| | `https://your-staging-domain.example/**` (if using preview) |
| | `http://localhost:3000/**` (local dev only) |

**PRODUCTION DOMAIN REQUIRED** — if no domain has been provided by the client, configure staging on the Vercel default URL first, then update when the custom domain is ready.

### 2.3 Email auth (administrators)

Enable Email provider under **Authentication → Providers**. Create **administrator** accounts via Supabase dashboard or controlled invite flow. Learners do **not** use email/password — they start as anonymous guests from the landing CTA.

### 2.3.1 Anonymous auth (learners)

Enable **Anonymous sign-ins** under **Authentication → Providers → Anonymous**:

1. Open the Supabase dashboard for the project.
2. Go to **Authentication → Providers**.
3. Enable **Anonymous Sign-Ins**.

Without this setting, `signInAnonymously()` fails and the landing “Start Your Pre-Test” button cannot create a guest session. Each guest click creates a new Auth user + `profiles` row (`role = learner`); the name form writes `display_name` for analytics.

### 2.4 Promote admin users

New users default to `learner`. Promote admins via SQL (service role):

```sql
UPDATE public.profiles SET role = 'admin' WHERE id = '<auth-user-uuid>';
```

Do not expose service-role credentials to the Next.js client.

---

## 3. Database Migrations

Apply migrations in order to a **fresh** or existing database:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Migration files (`supabase/migrations/`):

| File | Purpose |
|------|---------|
| `0001_foundation.sql` | Schema, enums, tables, indexes, triggers |
| `0002_rls.sql` | Row Level Security policies |
| `0003_auth_profile_defaults.sql` | Profile documentation |
| `0004_media_storage.sql` | Storage bucket + policies |
| `0005_production_indexes.sql` | Production query indexes (M18) |
| `0006_chapter_active_flag.sql` | Chapter archive flag `is_active` (M18.5) |

Verify locally or on staging:

```bash
npm run db:verify    # requires .env.local with Supabase vars
```

---

## 4. Production Data Initialization

### What comes from where

| Data | Source | Production action |
|------|--------|-------------------|
| 13 chapter titles | `supabase/seed.sql` | Run once (auto via `supabase db seed` for titles only) |
| Chapter 1 content | `seed-tikum-kadlum-chapter-1.sql` | Run manually after migrations |
| Chapter 1 illustration metadata | `seed-tikum-kadlum-chapter-1-m12.sql` | Optional |
| Chapters 2–13 summaries | `seed-chapters-2-13.sql` | Run manually — draft content for admin review |
| Characters, learning points | Included in chapter seeds | Review/approve in CMS |
| Assessments | Official seed + Admin CMS | Run `npm run db:seed-assessments`, then edit/approve in `/admin/assessments` |
| Media files | Supabase Storage | Upload via `/admin/media` |
| Learner progress | Runtime | Created by learners |
| Assessment attempts | Runtime | Created by learners |

### Recommended seed order (production/staging)

```bash
# After migrations
psql $DATABASE_URL -f supabase/seed.sql
psql $DATABASE_URL -f supabase/seed-tikum-kadlum-chapter-1.sql
psql $DATABASE_URL -f supabase/seed-tikum-kadlum-chapter-1-m12.sql   # optional
psql $DATABASE_URL -f supabase/seed-chapters-2-13.sql
# Official pre/post assessment bank (15 questions each)
npm run db:seed-assessments
# or:
# psql $DATABASE_URL -f supabase/seed-official-pre-assessment.sql
# psql $DATABASE_URL -f supabase/seed-official-post-assessment.sql
```

### Do NOT run on production

- `supabase/seed-dev-pre-assessment.sql` (deprecated redirect only)
- `supabase/seed-dev-post-assessment.sql` (deprecated redirect only)

### Post-seed CMS steps

1. Upload illustration/audio/video assets via Admin → Media
2. Approve Chapter 1 sections for learner visibility
3. Review / edit official pre/post questions in Admin → Assessments (add, edit, delete, reorder as needed)
4. Review learning points — remove `PENDING CLIENT APPROVAL` prefixes before approving

---

## 5. Supabase Storage

Migration `0004_media_storage.sql` creates a public `media` bucket.

| Operation | Who |
|-----------|-----|
| Read objects | Public (opaque URLs — not listed in app) |
| Upload / update / delete | Admin only (`is_admin()` policy) |

Media **visibility to learners** is governed by `media_assets.review_status = 'approved'` in PostgreSQL RLS. Direct storage URLs are accessible if known — use non-guessable paths (UUID-based uploads).

---

## 6. Vercel Deployment

### 6.1 Connect repository

1. Import the Git repository in Vercel.
2. Framework preset: **Next.js** (auto-detected).
3. Build command: `npm run build`
4. Install command: `npm install`

`vercel.json` in the repository documents the build settings.

### 6.2 Environment variables on Vercel

Set for **Production** (and Preview for staging):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional for runtime — needed for operational scripts)

### 6.3 Deploy

```bash
git push origin main   # or deploy via Vercel dashboard
```

Do not deploy without Supabase env vars — middleware returns **503** in production.

### 6.4 Custom domain

**PRODUCTION DOMAIN REQUIRED** if client has not supplied one.

When ready:

1. Add domain in Vercel → Settings → Domains
2. Configure DNS per Vercel instructions
3. Update Supabase Auth Site URL and Redirect URLs
4. Set `NEXT_PUBLIC_SITE_URL` on Vercel

---

## 7. Smoke Testing

After deployment to staging or production, verify:

| # | Test |
|---|------|
| 1 | Landing page loads |
| 2 | Learner login / logout |
| 3 | Learner home |
| 4 | Pre-Assessment (if approved questions exist) |
| 5 | Chapter 1 (approved content) |
| 6 | Chapter 2 (blocked / coming soon if draft) |
| 7 | Progress page |
| 8 | Post-Assessment |
| 9 | Results |
| 10 | Admin login |
| 11 | Admin dashboard |
| 12 | Chapter CMS |
| 13 | Media library |
| 14 | Assessment CMS |
| 15 | Analytics |

Also test on mobile, tablet, and desktop viewports.

---

## 8. Backup & Recovery

### Database

- **Backup:** Supabase Pro includes automated daily backups. Enable Point-in-Time Recovery if available.
- **Manual backup:** `pg_dump` via Supabase connection string before major changes.
- **Restore:** Supabase dashboard restore or `psql` import to a new project — update Vercel env vars to point to restored project.

### Media (Storage)

- **Backup:** Periodically export bucket contents via Supabase Storage API or dashboard.
- **Restore:** Re-upload to `media` bucket; verify `media_assets.storage_path` references match.

### Environment variables

- Store Vercel env vars in a secure password manager.
- Export from Vercel → Settings → Environment Variables before major changes.

### Deployment rollback

- **Vercel:** Deployments → select previous deployment → **Promote to Production**.
- **Database:** Do not rollback migrations destructively — forward-fix with new migrations.
- **Media:** Restore from backup; do not delete production bucket contents without backup.

---

## 9. Rollback Procedure

1. **Application:** Promote previous Vercel deployment (instant).
2. **Database schema:** Apply corrective forward migration — avoid `db reset` on production.
3. **Content:** Restore from pg_dump if data corruption occurred.
4. **Media:** Re-upload from backup.
5. **Auth:** Supabase Auth users persist independently — no rollback needed for app deploys.

---

## 10. Operational Scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Push migrations |
| `npm run db:verify` | Schema + RLS checks |
| `npm run auth:verify` | Auth security checks |

---

## Related Documentation

- `docs/M18_PRODUCTION_READINESS.md` — security and readiness audit
- `docs/M17_CLIENT_REVIEW_GUIDE.md` — client UAT guide
- `docs/AUTHENTICATION.md` — auth architecture
- `docs/DATABASE.md` — schema reference
