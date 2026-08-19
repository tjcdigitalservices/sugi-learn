import {
  ADMIN_HOME_ROUTE,
  UNAUTHORIZED_ROUTE,
} from "@/lib/auth/routes";
import {
  defaultLearnerPath,
  LEARNER_ONBOARDING_ROUTE,
  learnerNeedsOnboarding,
} from "@/lib/learner/onboarding";
import type { UserRole } from "@/types/database";

function isSafeInternalPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return false;
  }
  if (path.includes("://") || path.includes("\\")) {
    return false;
  }
  return true;
}

/** Resolve where to send a user after sign-in based on role and optional deep link. */
export function resolvePostLoginPath(
  role: UserRole | null,
  requestedNext: string,
  displayName?: string | null,
): string {
  if (requestedNext.startsWith(ADMIN_HOME_ROUTE) && role !== "admin") {
    return UNAUTHORIZED_ROUTE;
  }

  if (role === "admin" && requestedNext.startsWith(ADMIN_HOME_ROUTE)) {
    return ADMIN_HOME_ROUTE;
  }

  if (
    role === "learner" &&
    learnerNeedsOnboarding(displayName) &&
    !requestedNext.startsWith(LEARNER_ONBOARDING_ROUTE)
  ) {
    return LEARNER_ONBOARDING_ROUTE;
  }

  if (isSafeInternalPath(requestedNext)) {
    return requestedNext;
  }

  return role === "admin"
    ? ADMIN_HOME_ROUTE
    : defaultLearnerPath(displayName);
}

/** Default destination when no `next` query param is present. */
export function defaultPostLoginPath(
  role: UserRole | null,
  displayName?: string | null,
): string {
  return role === "admin" ? ADMIN_HOME_ROUTE : defaultLearnerPath(displayName);
}
