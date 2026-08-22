# Sugidanon — Authentication

**Version:** M3  
**Last updated:** 2026-08-15

---

## Overview

Sugidanon uses **Supabase Auth** for credentials and **application profiles** (`public.profiles`) for roles.

```
Supabase Auth (credentials, sessions)
        ↓
public.profiles (role: learner | admin)
        ↓
Next.js middleware + server layouts (route authorization)
        ↓
PostgreSQL RLS (data authorization)
```

Application authorization does **not** replace RLS. Both layers are enforced.

---

## Supabase Auth Configuration

- **Learners:** Anonymous sign-in from the landing CTA (`signInAnonymously`), then First/Last name saved to `profiles.display_name`. No email/password for the main learner path. Requires **Anonymous Sign-Ins** enabled in Supabase Auth providers.
- **Administrators:** Email + password via `/login` only (`signInWithPassword`). Non-admin password accounts are rejected by the login form.
- **Registration:** Not implemented for public users — admin accounts are provisioned via Supabase Dashboard
- **Social login:** Not implemented
- **Password reset:** Not implemented (Pending Client Confirmation)

### Required environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server/scripts only — never expose to browser
```

---

## Session Handling

| Mechanism | Purpose |
|-----------|---------|
| `middleware.ts` | Refreshes Supabase session cookies on each request |
| `lib/supabase/middleware.ts` | `updateSession()` — calls `supabase.auth.getUser()` |
| `@supabase/ssr` cookie adapter | Persists session across refresh |
| Server layouts | `requireUser()` / `requireAdmin()` defense in depth |

### Session lifecycle

1. **Learner:** Landing “Start Your Pre-Test” → `signOut` + `signInAnonymously` → `/learn/onboarding` (name) → journey
2. **Admin:** `/login` form → `signInWithPassword` → `/admin`
3. Supabase sets auth cookies; middleware refreshes session on subsequent requests
4. Server components read user via `getSupabaseServerClient().auth.getUser()`
5. A new landing CTA (or “Start as a different learner”) clears the session and creates a new anonymous user

---

## User / Profile Relationship

| Store | Contents |
|-------|----------|
| `auth.users` | Email, password hash (Supabase-managed) |
| `public.profiles` | `role`, `display_name`, timestamps |

New auth users receive a profile via `handle_new_user()` trigger with **`role = learner`**.

If a profile is missing (edge case), `getCurrentProfile()` creates a learner profile on first server access (subject to RLS).

---

## Roles

| Role | Database value | Access |
|------|----------------|--------|
| **Learner** | `learner` | `/learn/*` |
| **Admin** | `admin` | `/admin/*` (shell routes) |

Additional roles can be added to the `user_role` enum in a future migration if required.

---

## Route Protection

### Public routes (no session required)

- `/`
- `/login`
- `/admin/login`
- `/unauthorized`

### Protected learner routes (authenticated)

- `/learn/*` → redirects to `/login?next=...` when unauthenticated

### Protected admin routes (authenticated + admin role)

- `/admin`, `/admin/chapters`, `/admin/content`, `/admin/media`, `/admin/assessments`, `/admin/review`, `/admin/analytics`
- Unauthenticated → `/admin/login?next=...`
- Authenticated learner → `/unauthorized`

### Implementation layers

1. **Middleware** (`lib/supabase/middleware.ts`) — primary gate; session refresh + redirects
2. **Server layouts** — `app/learn/layout.tsx` calls `requireUser()`; `app/admin/(shell)/layout.tsx` calls `requireAdmin()`

When Supabase env vars are unset, middleware and layouts skip auth (mock/dev fallback).

---

## Auth Helpers

| Function | Location | Purpose |
|----------|----------|---------|
| `getCurrentUser()` | `lib/auth/session.ts` | Auth user from session |
| `getCurrentProfile()` | `lib/auth/session.ts` | Application profile |
| `getCurrentAuth()` | `lib/auth/session.ts` | User + profile |
| `requireUser()` | `lib/auth/session.ts` | Redirect if unauthenticated |
| `requireAdmin()` | `lib/auth/session.ts` | Redirect if not admin |
| `signOutAction()` | `lib/auth/actions.ts` | Server action sign out |

---

## RLS Interaction

M2 RLS policies remain unchanged in M3. Authenticated users can now exercise them:

| Role | RLS behavior |
|------|--------------|
| **Anonymous** | Chapter catalog metadata only |
| **Learner** | Own profile/progress/attempts; approved content when published |
| **Admin** | Full content management via `is_admin()` |

---

## Admin Provisioning

**Never** assign admin via public UI or registration.

### Promote a user to admin (development)

Using Supabase SQL Editor or service role:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<auth-user-uuid>';
```

Or create users in Supabase Dashboard → Authentication, then promote.

### Create test users (local)

1. Supabase Dashboard → Authentication → Add user (email/password)
2. Run promotion SQL above for admin test accounts
3. Do **not** commit passwords or credentials

---

## Security Considerations

- Service-role client (`lib/supabase/service.ts`) imports `server-only` — must not be bundled client-side
- Login errors are generic ("Invalid email or password") — no credential enumeration
- No `ADMIN_PASSWORD` or alternative auth mechanisms
- Default new accounts: **learner**
- Admin login at `/admin/login` — learners are redirected to `/learn` or `/unauthorized`, not granted admin access

---

## Known Limitations

1. No password reset flow
2. No public self-registration
3. No social/OAuth providers
4. Role changes require service-role SQL or admin tooling (M4+)
5. Full RLS integration testing requires live Supabase + provisioned users

---

## Related Documentation

- `docs/DATABASE.md` — `profiles` table and RLS
- `docs/ARCHITECTURE.md` — overall architecture
- `supabase/migrations/0003_auth_profile_defaults.sql`
