import { LEARNER_HOME_ROUTE } from "@/lib/auth/routes";

export const LEARNER_ONBOARDING_ROUTE = "/learn/onboarding";

export function learnerNeedsOnboarding(
  displayName: string | null | undefined,
): boolean {
  return !displayName?.trim();
}

/** Default learner destination after login, considering onboarding. */
export function defaultLearnerPath(displayName: string | null | undefined): string {
  if (learnerNeedsOnboarding(displayName)) {
    return LEARNER_ONBOARDING_ROUTE;
  }
  return LEARNER_HOME_ROUTE;
}
