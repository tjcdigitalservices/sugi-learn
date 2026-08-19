import "server-only";

/**
 * Documented environment variables for SugiLearn production deployments.
 * Values are never logged by this module.
 */

/** Browser-safe Supabase project URL. */
export const PUBLIC_SUPABASE_URL = "NEXT_PUBLIC_SUPABASE_URL";

/** Browser-safe Supabase anon key (RLS enforced). */
export const PUBLIC_SUPABASE_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

/**
 * Server-only Supabase service role key.
 * Used by migration/seed scripts and server-side admin operations only.
 * NEVER expose to client bundles.
 */
export const SERVER_SUPABASE_SERVICE_ROLE_KEY = "SUPABASE_SERVICE_ROLE_KEY";

/** Optional public site URL for auth redirect documentation (Supabase dashboard). */
export const PUBLIC_SITE_URL = "NEXT_PUBLIC_SITE_URL";

export interface EnvRequirement {
  name: string;
  scope: "public" | "server";
  required: boolean;
  description: string;
}

export const PRODUCTION_ENV_REQUIREMENTS: EnvRequirement[] = [
  {
    name: PUBLIC_SUPABASE_URL,
    scope: "public",
    required: true,
    description: "Supabase project URL",
  },
  {
    name: PUBLIC_SUPABASE_ANON_KEY,
    scope: "public",
    required: true,
    description: "Supabase anon key for browser and server user-scoped clients",
  },
  {
    name: SERVER_SUPABASE_SERVICE_ROLE_KEY,
    scope: "server",
    required: true,
    description: "Service role key for migrations, seeds, and server scripts only",
  },
  {
    name: PUBLIC_SITE_URL,
    scope: "public",
    required: false,
    description: "Production site URL for Supabase Auth redirect allow-list documentation",
  },
];
