/** Status of a learner's progress on a single chapter. */
export type ChapterProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

/** Persisted chapter progress for one learner/chapter pair. */
export interface ChapterProgressRecord {
  chapterId: string;
  status: ChapterProgressStatus;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string | null;
}

/** Learner progress across chapters and assessments. */
export interface LearnerProgress {
  learnerId: string;
  completedChapterIds: string[];
  currentChapterId: string | null;
  preAssessmentCompleted: boolean;
  postAssessmentCompleted: boolean;
  lastActivityAt: string | null;
}

/** Chapter catalog entry merged with learner progress for journey UI. */
export interface ChapterJourneyItem {
  id: string;
  number: number;
  title: string;
  subtitle: string | null;
  hasPublishedContent: boolean;
  status: ChapterProgressStatus;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string | null;
}

/** Aggregated learner journey for home and progress pages. */
export interface LearnerJourneySummary {
  learnerId: string;
  chapters: ChapterJourneyItem[];
  completedCount: number;
  totalChapters: number;
  inProgressCount: number;
  continueChapterId: string | null;
  allChaptersCompleted: boolean;
  preAssessmentCompleted: boolean;
  postAssessmentCompleted: boolean;
  lastActivityAt: string | null;
}

/** @deprecated Use ChapterProgressRecord — kept for internal mapping. */
export interface ChapterProgress {
  chapterId: string;
  completedSectionIds: string[];
  isComplete: boolean;
  completedAt: string | null;
}
