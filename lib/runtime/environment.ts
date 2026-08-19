import { hasSupabaseConfig } from "@/lib/supabase/service";

/** Local development without Supabase — mock data and dev-only content allowed. */
export function isLocalMockDevelopment(): boolean {
  return process.env.NODE_ENV === "development" && !hasSupabaseConfig();
}

/** Staging/UAT/production with Supabase — client review environment. */
export function isConfiguredReviewEnvironment(): boolean {
  return hasSupabaseConfig();
}
