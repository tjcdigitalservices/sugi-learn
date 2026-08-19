import "server-only";

import { redirect } from "next/navigation";

import {
  AUTH_LOGIN_ROUTE,
  UNAUTHORIZED_ROUTE,
} from "@/lib/auth/routes";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/service";
import type { AppProfile, AuthSessionUser, CurrentAuth } from "@/types/auth";
import { isAdminRole } from "@/types/auth";
import type { UserRole } from "@/types/database";

function mapProfile(row: {
  id: string;
  role: UserRole;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}): AppProfile {
  return {
    id: row.id,
    role: row.role,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCurrentUser(): Promise<AuthSessionUser | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
  };
}

export async function getCurrentProfile(): Promise<AppProfile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load user profile.");
  }

  if (profile) {
    return mapProfile(profile);
  }

  const { data: createdProfile, error: createError } = await supabase
    .from("profiles")
    .insert({ id: user.id, role: "learner" })
    .select("id, role, display_name, created_at, updated_at")
    .single();

  if (createdProfile) {
    return mapProfile(createdProfile);
  }

  // Race: auth trigger may have created the profile between select and insert.
  if (createError) {
    const { data: racedProfile } = await supabase
      .from("profiles")
      .select("id, role, display_name, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (racedProfile) {
      return mapProfile(racedProfile);
    }
  }

  return null;
}

export async function getCurrentAuth(): Promise<CurrentAuth | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  return { user, profile };
}

export async function requireUser(nextPath = "/"): Promise<CurrentAuth> {
  if (!hasSupabaseConfig()) {
    if (process.env.NODE_ENV === "production") {
      redirect(nextPath);
    }

    return {
      user: { id: "local-dev-learner", email: "learner@local" },
      profile: {
        id: "local-dev-learner",
        role: "learner",
        displayName: "Local Dev Learner",
        createdAt: new Date(0).toISOString(),
        updatedAt: new Date(0).toISOString(),
      },
    };
  }

  const auth = await getCurrentAuth();

  if (!auth) {
    redirect(nextPath);
  }

  return auth;
}

export async function requireAdmin(): Promise<CurrentAuth> {
  if (!hasSupabaseConfig()) {
    if (process.env.NODE_ENV === "production") {
      redirect(AUTH_LOGIN_ROUTE);
    }

    return {
      user: { id: "local-dev-admin", email: "admin@local" },
      profile: {
        id: "local-dev-admin",
        role: "admin",
        displayName: "Local Dev Admin",
        createdAt: new Date(0).toISOString(),
        updatedAt: new Date(0).toISOString(),
      },
    };
  }

  const auth = await getCurrentAuth();

  if (!auth) {
    redirect(AUTH_LOGIN_ROUTE);
  }

  if (!isAdminRole(auth.profile.role)) {
    redirect(UNAUTHORIZED_ROUTE);
  }

  return auth;
}
