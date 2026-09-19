/**
 * Assessment access policy — gates for learner assessment routes.
 */
export const ASSESSMENT_ACCESS_POLICY = {
  /** Post-assessment requires all published chapters completed. */
  postAssessmentRequiresAllChaptersCompleted: true,
  /** Post-assessment requires a completed pre-assessment. */
  postAssessmentRequiresPreAssessmentCompleted: true,
} as const;
