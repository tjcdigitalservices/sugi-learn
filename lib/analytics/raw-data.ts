import type { AssessmentType } from "@/types/assessment";

export interface AnalyticsChapterRecord {
  id: string;
  slug: string;
  number: number;
  title: string;
}

export interface AnalyticsLearnerRecord {
  id: string;
  displayName: string | null;
}

export interface AnalyticsProgressRecord {
  learnerId: string;
  chapterId: string;
  chapterSlug: string;
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface AnalyticsAttemptRecord {
  id: string;
  learnerId: string;
  assessmentId: string;
  assessmentType: AssessmentType;
  assessmentTitle: string;
  score: number | null;
  completedAt: string | null;
}

export interface AnalyticsAnswerRecord {
  attemptId: string;
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
}

export interface AnalyticsQuestionRecord {
  id: string;
  assessmentId: string;
  assessmentType: AssessmentType;
  assessmentTitle: string;
  prompt: string;
}

export interface AnalyticsRawData {
  chapters: AnalyticsChapterRecord[];
  learners: AnalyticsLearnerRecord[];
  progress: AnalyticsProgressRecord[];
  attempts: AnalyticsAttemptRecord[];
  answers: AnalyticsAnswerRecord[];
  questions: AnalyticsQuestionRecord[];
}
