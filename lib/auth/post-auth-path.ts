"use server";

import { ADMIN_HOME_ROUTE } from "@/lib/auth/routes";
import { getCurrentAuth } from "@/lib/auth/session";
import { resolveLearnerContinuePath } from "@/lib/learner/continue-path";
import { isAdminRole } from "@/types/auth";

/** Destination after learner/admin sign-in or account upgrade. */
export async function getPostAuthRedirectPath(): Promise<string> {
  const auth = await getCurrentAuth();

  if (!auth) {
    return "/";
  }

  if (isAdminRole(auth.profile.role)) {
    return ADMIN_HOME_ROUTE;
  }

  return resolveLearnerContinuePath(auth.profile.id, auth.profile.displayName);
}
