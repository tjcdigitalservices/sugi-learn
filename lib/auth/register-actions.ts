"use server";

import { getCurrentAuth } from "@/lib/auth/session";
import {
  createSupabaseServiceClient,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/service";

export type RegisterActionResult =
  | { success: true; displayName: string }
  | { success: false; error: string };

function mapAuthAdminError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("already") || lower.includes("registered") || lower.includes("exists")) {
    return "That email is already registered. Sign in instead.";
  }
  if (lower.includes("rate limit")) {
    return "Too many attempts. Please wait a few minutes, then try again or sign in.";
  }
  if (lower.includes("password")) {
    return message;
  }

  return message || "Unable to create your account. Please try again.";
}

function buildDisplayName(firstName: string, lastName: string): string | null {
  const first = firstName.trim();
  const last = lastName.trim();
  if (!first || !last) {
    return null;
  }
  if (first.length > 80 || last.length > 80) {
    return null;
  }
  return `${first} ${last}`.replace(/\s+/g, " ").trim();
}

async function ensureLearnerProfile(
  userId: string,
  displayName?: string | null,
): Promise<void> {
  const admin = createSupabaseServiceClient();
  const { error: upsertError } = await admin.from("profiles").upsert(
    {
      id: userId,
      role: "learner",
      ...(displayName ? { display_name: displayName } : {}),
    },
    { onConflict: "id" },
  );

  if (upsertError) {
    throw new Error("Unable to save your learner profile. Please try again.");
  }

  if (displayName) {
    const { error: updateError } = await admin
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", userId);

    if (updateError) {
      throw new Error("Unable to save your name. Please try again.");
    }
  }
}

async function assertPermanentEmailUser(userId: string, email: string) {
  const admin = createSupabaseServiceClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    throw new Error("Account was not saved correctly. Please try again.");
  }

  const user = data.user;
  const normalized = email.trim().toLowerCase();
  const hasEmailIdentity = (user.identities ?? []).some(
    (identity) => identity.provider === "email",
  );

  if (
    user.is_anonymous ||
    (user.email ?? "").toLowerCase() !== normalized ||
    !user.email_confirmed_at ||
    !hasEmailIdentity
  ) {
    throw new Error(
      "Account upgrade did not finish. Please try again in a moment.",
    );
  }
}

function validateRegisterInput(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): { email: string; password: string; displayName: string } | { error: string } {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const displayName = buildDisplayName(input.firstName, input.lastName);

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  if (!displayName) {
    if (!input.firstName.trim() || !input.lastName.trim()) {
      return { error: "First name and last name are required." };
    }
    return { error: "Each name must be 80 characters or fewer." };
  }

  return { email, password, displayName };
}

/**
 * Convert the current anonymous guest into a permanent email/password account
 * on the same auth user id (progress preserved). Uses the service role so we
 * can confirm email immediately — client updateUser cannot set a password on
 * an unverified anonymous user, which caused failed logins.
 */
export async function upgradeGuestAccountAction(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<RegisterActionResult> {
  const validated = validateRegisterInput(input);
  if ("error" in validated) {
    return { success: false, error: validated.error };
  }

  const { email, password, displayName } = validated;
  const auth = await getCurrentAuth();

  if (!auth) {
    return {
      success: false,
      error: "Start as a guest first, then save your progress.",
    };
  }

  if (!auth.user.isAnonymous) {
    return {
      success: false,
      error: "You already have an account. Sign in instead.",
    };
  }

  if (!hasSupabaseServiceConfig()) {
    return {
      success: false,
      error:
        "Account upgrade is not configured yet. Ask an administrator to set SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const admin = createSupabaseServiceClient();
  const { error } = await admin.auth.admin.updateUserById(auth.user.id, {
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return { success: false, error: mapAuthAdminError(error.message) };
  }

  try {
    await assertPermanentEmailUser(auth.user.id, email);
    await ensureLearnerProfile(auth.user.id, displayName);
  } catch (verifyError) {
    return {
      success: false,
      error:
        verifyError instanceof Error
          ? verifyError.message
          : "Account upgrade did not finish. Please try again.",
    };
  }

  return { success: true, displayName };
}

/**
 * Create a brand-new confirmed email/password learner (no guest session).
 * Avoids the email-confirmation wall that blocks immediate sign-in.
 */
export async function createLearnerAccountAction(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<RegisterActionResult> {
  const validated = validateRegisterInput(input);
  if ("error" in validated) {
    return { success: false, error: validated.error };
  }

  const { email, password, displayName } = validated;

  if (!hasSupabaseServiceConfig()) {
    return {
      success: false,
      error:
        "Account creation is not configured yet. Ask an administrator to set SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const admin = createSupabaseServiceClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    return {
      success: false,
      error: mapAuthAdminError(error?.message ?? ""),
    };
  }

  try {
    await assertPermanentEmailUser(data.user.id, email);
    await ensureLearnerProfile(data.user.id, displayName);
  } catch (verifyError) {
    return {
      success: false,
      error:
        verifyError instanceof Error
          ? verifyError.message
          : "Account was not saved correctly. Please try again.",
    };
  }

  return { success: true, displayName };
}
