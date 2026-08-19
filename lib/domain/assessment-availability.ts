import "server-only";

import { isPublishedReviewStatus } from "@/types/review";

import type { Assessment, LearnerAssessmentQuestion } from "@/types/assessment";

export function isAssessmentLearnerReady(
  assessment: Assessment | null,
  questions: LearnerAssessmentQuestion[],
): boolean {
  if (!assessment || !isPublishedReviewStatus(assessment.reviewStatus)) {
    return false;
  }

  return questions.length > 0;
}
