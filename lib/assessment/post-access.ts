import "server-only";

import { ASSESSMENT_ACCESS_POLICY } from "@/lib/assessment/access-policy";
import { getLearnerJourneySummary } from "@/lib/domain/learner-progress";

/** Whether the learner may open/submit the post-assessment. */
export async function isPostAssessmentUnlocked(
  learnerId: string,
): Promise<boolean> {
  const journey = await getLearnerJourneySummary(learnerId);

  if (
    ASSESSMENT_ACCESS_POLICY.postAssessmentRequiresPreAssessmentCompleted &&
    !journey.preAssessmentCompleted
  ) {
    return false;
  }

  if (
    ASSESSMENT_ACCESS_POLICY.postAssessmentRequiresAllChaptersCompleted &&
    !journey.allChaptersCompleted
  ) {
    return false;
  }

  return true;
}

/** Throws if the learner may not submit the post-assessment. */
export async function assertPostAssessmentAccess(
  learnerId: string,
): Promise<void> {
  const journey = await getLearnerJourneySummary(learnerId);

  if (
    ASSESSMENT_ACCESS_POLICY.postAssessmentRequiresPreAssessmentCompleted &&
    !journey.preAssessmentCompleted
  ) {
    throw new Error(
      "Complete the pre-assessment before taking the post-assessment.",
    );
  }

  if (
    ASSESSMENT_ACCESS_POLICY.postAssessmentRequiresAllChaptersCompleted &&
    !journey.allChaptersCompleted
  ) {
    throw new Error("Complete all chapters before taking the post-assessment.");
  }
}
