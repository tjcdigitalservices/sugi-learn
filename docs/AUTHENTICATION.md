# Suguidanon — Authentication

**Version:** M3+ (learner accounts)  
**Last updated:** 2026-09-18

---

## Overview

Suguidanon uses **Supabase Auth** for credentials and **application profiles** (`public.profiles`) for roles.

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

## Learner access model (guest first)

1. **Guest start** — Landing CTA uses anonymous sign-in (`signInAnonymously`), then First/Last name on `/learn/onboarding`.
2. **Pre-assessment once** — Chapters stay locked until pre-assessment is completed for that learner id.
3. **Optional register** — `/register` upgrades a guest via service-role `auth.admin.updateUserById` (same auth user id → progress preserved, email confirmed immediately). New visitors without a guest session use `signUp`.
4. **Sign in** — `/login` accepts learners and admins. Learners resume via smart routing (skip pre-assessment if already completed).
5. **Save progress CTA** — Shown on learner home / header while the session is still anonymous.

Requires **Anonymous Sign-Ins**, **Email** provider, and **`SUPABASE_SERVICE_ROLE_KEY`** (server only) for guest → account upgrade.

### Administrators

- Email + password via `/login`
- Admin accounts are provisioned via Supabase Dashboard (never public registration)
- After sign-in, admins go to `/admin`

### Password reset

Not implemented (Pending Client Confirmation). Browsers may still offer to save passwords via standard autofill attributes.

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

1. **Learner (guest):** Landing CTA → `signOut` + `signInAnonymously` → `/learn/onboarding` → continue path (pre-assessment or `/learn`)
2. **Learner (register):** Guest `updateUser` or `signUp` → same continue path
3. **Learner (returning):** `/login` → `signInWithPassword` → continue path (chapters if pre done)
4. **Admin:** `/login` → `signInWithPassword` → `/admin`
5. “Start as a different learner” clears the session and creates a new anonymous user

Continue path: `lib/learner/continue-path.ts` → onboarding → pre-assessment (if needed) → `/learn`.

---

## User / Profile Relationship

| Store | Contents |
|-------|----------|
| `auth.users` | Email, password hash (Supabase-managed); anonymous until upgraded |
| `public.profiles` | `role`, `display_name`, timestamps |

New auth users receive a profile via `handle_new_user()` trigger with **`role = learner`**.

---

## Roles

| Role | Database value | Access |
|------|----------------|--------|
| **Learner** | `learner` | `/learn/*` |
| **Admin** | `admin` | `/admin/*` (shell routes) |

---

## Route Protection

### Public routes (no session required)

- `/`, `/author`, `/researchers`, `/login`, `/register`, `/unauthorized`
- `/about` redirects to `/author`

### Protected learner routes

- `/learn/*` → home when unauthenticated

### Protected admin routes

- `/admin/*` → `/login` or `/unauthorized` as appropriate

---

## Auth Helpers

| Function | Location | Purpose |
|----------|----------|---------|
| `getCurrentUser()` | `lib/auth/session.ts` | Auth user (`isAnonymous` included) |
| `getCurrentProfile()` | `lib/auth/session.ts` | Application profile |
| `requireUser()` / `requireAdmin()` | `lib/auth/session.ts` | Route guards |
| `resolveLearnerContinuePath()` | `lib/learner/continue-path.ts` | Post-auth learner destination |
| `getPostAuthRedirectPath()` | `lib/auth/post-auth-path.ts` | Server action for client forms |
| `signOutAction()` | `lib/auth/actions.ts` | Server action sign out |

---

## Admin Provisioning

**Never** assign admin via public registration.

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<auth-user-uuid>';
```

---

## Known Limitations

1. No password reset flow
2. Email confirmation behavior depends on Supabase project settings
3. Guest progress is lost if cookies are cleared before account upgrade
4. Role changes require service-role SQL or admin tooling

---

## Related Documentation

- `docs/DATABASE.md` — `profiles` table and RLS
- `docs/ARCHITECTURE.md` — overall architecture
- `supabase/migrations/0003_auth_profile_defaults.sql`
