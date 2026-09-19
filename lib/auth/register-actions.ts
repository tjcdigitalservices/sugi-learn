"use server";

import { getCurrentAuth } from "@/lib/auth/session";
import {
  createSupabaseServiceClient,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/service";

export type RegisterActionResult =
  | { success: true }
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

async function ensureLearnerProfile(userId: string): Promise<void> {
  const admin = createSupabaseServiceClient();
  await admin.from("profiles").upsert(
    {
      id: userId,
      role: "learner",
    },
    { onConflict: "id" },
  );
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

/**
 * Convert the current anonymous guest into a permanent email/password account
 * on the same auth user id (progress preserved). Uses the service role so we
 * can confirm email immediately — client updateUser cannot set a password on
 * an unverified anonymous user, which caused failed logins.
 */
export async function upgradeGuestAccountAction(input: {
  email: string;
  password: string;
}): Promise<RegisterActionResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters.",
    };
  }

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
    await ensureLearnerProfile(auth.user.id);
  } catch (verifyError) {
    return {
      success: false,
      error:
        verifyError instanceof Error
          ? verifyError.message
          : "Account upgrade did not finish. Please try again.",
    };
  }

  return { success: true };
}

/**
 * Create a brand-new confirmed email/password learner (no guest session).
 * Avoids the email-confirmation wall that blocks immediate sign-in.
 */
export async function createLearnerAccountAction(input: {
  email: string;
  password: string;
}): Promise<RegisterActionResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters.",
    };
  }

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
    await ensureLearnerProfile(data.user.id);
  } catch (verifyError) {
    return {
      success: false,
      error:
        verifyError instanceof Error
          ? verifyError.message
          : "Account was not saved correctly. Please try again.",
    };
  }

  return { success: true };
}

/** Used by login to distinguish missing accounts from wrong passwords. */
export async function emailHasPermanentAccountAction(
  email: string,
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !hasSupabaseServiceConfig()) {
    return false;
  }

  try {
    const admin = createSupabaseServiceClient();
    let page = 1;

    while (page <= 10) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage: 200,
      });

      if (error) {
        return false;
      }

      const users = data.users ?? [];
      const match = users.find(
        (user) =>
          (user.email ?? "").toLowerCase() === normalized &&
          !user.is_anonymous,
      );

      if (match) {
        return true;
      }

      if (users.length < 200) {
        break;
      }

      page += 1;
    }

    return false;
  } catch {
    return false;
  }
}
