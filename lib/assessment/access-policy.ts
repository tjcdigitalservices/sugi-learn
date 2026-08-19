/**
 * Assessment access policy — configurable gates for learner routes.
 * Defaults are permissive until the client confirms requirements.
 */
export const ASSESSMENT_ACCESS_POLICY = {
  /** PENDING CLIENT CONFIRMATION — when true, post-assessment requires all chapters completed. */
  postAssessmentRequiresAllChaptersCompleted: false,
  /** PENDING CLIENT CONFIRMATION — when true, post-assessment requires a completed pre-assessment. */
  postAssessmentRequiresPreAssessmentCompleted: false,
} as const;
