import type { ReviewStatus } from "@/types/review";

export const ASSESSMENT_TYPES = ["pre", "post"] as const;

export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

export interface QuestionOption {
  id: string;
  label: string;
  sortOrder: number;
}

/** Learner-facing question — correct answers are never included. */
export interface LearnerAssessmentQuestion {
  id: string;
  prompt: string;
  options: QuestionOption[];
  sortOrder: number;
}

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  assessmentType: AssessmentType;
  chapterId: string | null;
  prompt: string;
  options: QuestionOption[];
  /** Server-side only — not sent to the browser. */
  correctOptionId: string;
  explanation: string | null;
  sourceReference: string | null;
  reviewStatus: ReviewStatus;
  sortOrder: number;
}

export interface Assessment {
  id: string;
  type: AssessmentType;
  title: string;
  /** Confirmed working structure: 15 questions (README). */
  questionCount: number;
  reviewStatus: ReviewStatus;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  assessmentType: AssessmentType;
  learnerId: string;
  answers: AssessmentAnswer[];
  score: number | null;
  completedAt: string | null;
}

export interface AssessmentAnswer {
  questionId: string;
  selectedOptionId: string | null;
}

export interface AssessmentResult {
  assessmentType: AssessmentType;
  preScore: number | null;
  postScore: number | null;
  /** Scoring methodology — Pending Client Confirmation. */
  learningGain: number | null;
}

export interface AssessmentAttemptSummary {
  id: string;
  assessmentId: string;
  assessmentType: AssessmentType;
  score: number | null;
  completedAt: string | null;
  totalQuestions: number;
  correctCount: number | null;
}

export interface AssessmentSubmissionResult {
  attemptId: string;
  assessmentType: AssessmentType;
  score: number;
  totalQuestions: number;
  correctCount: number;
  completedAt: string;
}

export interface PreAssessmentSession {
  assessment: Assessment | null;
  questions: LearnerAssessmentQuestion[];
  completedAttempt: AssessmentAttemptSummary | null;
}

export interface PostAssessmentSession {
  assessment: Assessment | null;
  questions: LearnerAssessmentQuestion[];
  completedAttempt: AssessmentAttemptSummary | null;
}

/** Neutral pre/post score comparison — not a research interpretation. */
export interface AssessmentScoreComparison {
  preAttempt: AssessmentAttemptSummary | null;
  postAttempt: AssessmentAttemptSummary;
  /** Difference in correct answers (post − pre), when pre exists. */
  correctCountChange: number | null;
  /** Difference in percentage points (post − pre), when pre exists. */
  percentagePointChange: number | null;
}

export interface LearnerAttemptHistoryItem {
  attemptId: string;
  assessmentType: AssessmentType;
  assessmentTitle: string;
  score: number | null;
  correctCount: number | null;
  totalQuestions: number;
  completedAt: string | null;
}

export interface AssessmentResultsView {
  attempt: AssessmentAttemptSummary;
  assessmentTitle: string;
  comparison: AssessmentScoreComparison | null;
  history: LearnerAttemptHistoryItem[];
}

/** Post-submit question review — correct answers only exposed after completion. */
export interface AttemptQuestionReviewItem {
  questionId: string;
  sortOrder: number;
  prompt: string;
  selectedOptionId: string | null;
  selectedLabel: string | null;
  correctOptionId: string;
  correctLabel: string;
  isCorrect: boolean;
  explanation: string | null;
}

export interface QuestionOutcomeSummary {
  index: number;
  questionId: string;
  isCorrect: boolean;
}

export interface ResultsScoreSummary {
  correctCount: number;
  total: number;
  score: number;
}

/** Heritage Learning Results dashboard (post-assessment). */
export interface LearnerResultsDashboardView {
  attemptId: string;
  learnerDisplayName: string | null;
  completedAt: string | null;
  pre: ResultsScoreSummary | null;
  post: ResultsScoreSummary;
  learningGainPercentagePoints: number | null;
  questionOutcomes: QuestionOutcomeSummary[];
  incorrectReviews: AttemptQuestionReviewItem[];
}

export interface CompletedAttemptReview {
  attempt: AssessmentAttemptSummary;
  items: AttemptQuestionReviewItem[];
}
