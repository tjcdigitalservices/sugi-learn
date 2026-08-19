"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Clears any existing session and creates a new anonymous Auth user.
 * Requires Anonymous sign-ins enabled in the Supabase project.
 */
export async function startFreshGuestSession(): Promise<{ error: string | null }> {
  const supabase = createSupabaseBrowserClient();

  await supabase.auth.signOut({ scope: "local" });

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error || !data.user) {
    const message = error?.message ?? "Unable to start a learning session.";
    if (
      message.toLowerCase().includes("anonymous") ||
      message.toLowerCase().includes("disabled")
    ) {
      return {
        error:
          "Guest learning is not enabled yet. Ask an administrator to enable Anonymous sign-ins in Supabase Auth.",
      };
    }
    return { error: message };
  }

  // Ensure a learner profile exists (trigger usually creates it; upsert as fallback).
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      role: "learner",
      display_name: null,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    // Profile may already exist from the auth trigger — continue if so.
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!existing) {
      return {
        error: "Unable to prepare your learning profile. Please try again.",
      };
    }

    // Clear any leftover display name if reusing an unexpected row.
    await supabase
      .from("profiles")
      .update({ display_name: null })
      .eq("id", data.user.id);
  }

  return { error: null };
}
