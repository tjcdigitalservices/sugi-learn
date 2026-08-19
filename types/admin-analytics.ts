export interface AnalyticsFilters {
  assessmentType?: "pre" | "post" | "all";
  chapterId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AnalyticsOverviewMetrics {
  totalLearners: number;
  learnersStarted: number;
  learnersCompletedAllChapters: number;
  totalChapters: number;
  totalCompletedChapterRecords: number;
  preAssessmentAttempts: number;
  postAssessmentAttempts: number;
}

export interface ParticipationOverview {
  totalLearners: number;
  learnersStarted: number;
  preAssessmentAttempts: number;
  postAssessmentAttempts: number;
  totalCompletedChapterRecords: number;
}

export interface ChapterAnalyticsRow {
  chapterId: string;
  chapterNumber: number;
  title: string;
  startedLearners: number;
  completedLearners: number;
  /** Null when no learners have started this chapter. */
  completionRate: number | null;
}

export type AssessmentParticipationStatus = "not_started" | "completed";

export interface LearnerProgressRow {
  learnerId: string;
  displayLabel: string;
  chaptersCompleted: number;
  totalChapters: number;
  /** Null when totalChapters is zero. */
  progressPercentage: number | null;
  currentChapterTitle: string | null;
  preAssessmentStatus: AssessmentParticipationStatus;
  postAssessmentStatus: AssessmentParticipationStatus;
}

export interface AssessmentAnalyticsMetrics {
  assessmentType: "pre" | "post";
  assessmentTitle: string;
  totalAttempts: number;
  completedAttempts: number;
  /** Null when no completed attempts. */
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
}

export interface PrePostComparisonMetrics {
  preAverageScore: number | null;
  postAverageScore: number | null;
  /** Post average minus pre average (percentage points). Null when insufficient paired data. */
  scoreDifference: number | null;
  pairedLearnerCount: number;
  preOnlyCount: number;
  postOnlyCount: number;
}

export interface QuestionAnalyticsRow {
  questionId: string;
  assessmentType: "pre" | "post";
  assessmentTitle: string;
  prompt: string;
  responseCount: number;
  correctCount: number;
  incorrectCount: number;
  /** Null when responseCount is zero. */
  correctPercentage: number | null;
}

export interface DropOffInsight {
  chapterId: string;
  chapterNumber: number;
  title: string;
  completedLearners: number;
  previousChapterCompletedLearners: number;
  message: string;
}

export interface AssessmentResultExportRow {
  learnerLabel: string;
  assessmentTitle: string;
  assessmentType: "pre" | "post";
  score: number | null;
  completedAt: string | null;
}

export interface AdminAnalyticsSummary {
  overview: AnalyticsOverviewMetrics;
  chapters: ChapterAnalyticsRow[];
  learners: LearnerProgressRow[];
  assessments: {
    pre: AssessmentAnalyticsMetrics | null;
    post: AssessmentAnalyticsMetrics | null;
    comparison: PrePostComparisonMetrics | null;
  };
  questions: QuestionAnalyticsRow[];
  dropOffs: DropOffInsight[];
  exportData: {
    assessmentResults: AssessmentResultExportRow[];
  };
  /** True when any learner activity exists in the dataset. */
  hasActivityData: boolean;
  filters: AnalyticsFilters;
}
