import "server-only";

import { LEARNER_HOME_ROUTE } from "@/lib/auth/routes";
import {
  LEARNER_ONBOARDING_ROUTE,
  learnerNeedsOnboarding,
} from "@/lib/learner/onboarding";
import { getLearnerJourneySummary } from "@/lib/domain/learner-progress";

/**
 * Where a learner should land after auth/onboarding:
 * name → pre-assessment (once) → continue learning.
 */
export async function resolveLearnerContinuePath(
  learnerId: string,
  displayName: string | null | undefined,
): Promise<string> {
  if (learnerNeedsOnboarding(displayName)) {
    return LEARNER_ONBOARDING_ROUTE;
  }

  const journey = await getLearnerJourneySummary(learnerId);

  if (!journey.preAssessmentCompleted) {
    return "/learn/assessment/pre";
  }

  return LEARNER_HOME_ROUTE;
}
