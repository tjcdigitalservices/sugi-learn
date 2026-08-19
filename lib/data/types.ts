import type { AdminDashboardSummary } from "@/types/admin-dashboard";
import type { AdminAnalyticsRepository } from "@/lib/data/admin-analytics-types";
import type {
  Assessment,
  AssessmentAnswer,
  AssessmentAttemptSummary,
  AssessmentQuestion,
  AssessmentSubmissionResult,
  AssessmentType,
  CompletedAttemptReview,
  LearnerAssessmentQuestion,
  LearnerAttemptHistoryItem,
} from "@/types/assessment";
import type {
  Chapter,
  ChapterSection,
  ChapterSummary,
  Character,
  LearningPoint,
} from "@/types/chapter";
import type {
  AdminChapterListItem,
  CreateChapterInput,
  CreateLearningPointInput,
  CreateSectionInput,
  UpdateChapterMetadataInput,
  UpdateLearningPointInput,
  UpdateSectionInput,
} from "@/types/chapter-management";
import type {
  AdminAssessmentDetail,
  AdminAssessmentListItem,
  CreateQuestionInput,
  DeleteQuestionResult,
  UpdateAssessmentMetadataInput,
  UpdateQuestionInput,
} from "@/types/assessment-management";
import type {
  AdminMediaAssetDetail,
  AdminMediaAssetListItem,
  CreateMediaAssetInput,
  MediaListFilters,
  UpdateMediaAssetInput,
} from "@/types/media-management";
import type { MediaAsset } from "@/types/media";
import type {
  ChapterProgressRecord,
  LearnerProgress,
} from "@/types/progress";

/** Data-access contracts. Implementations swap in M2 (Supabase). */

export interface ChapterRepository {
  listChapters(): Promise<ChapterSummary[]>;
  getChapterById(chapterId: string): Promise<Chapter | null>;
}

export interface ChapterManagementRepository {
  listChaptersForAdmin(): Promise<AdminChapterListItem[]>;
  getChapterForAdmin(chapterId: string): Promise<Chapter | null>;
  updateChapterMetadata(
    chapterId: string,
    input: UpdateChapterMetadataInput,
  ): Promise<Chapter>;
  createSection(
    chapterId: string,
    input: CreateSectionInput,
  ): Promise<ChapterSection>;
  updateSection(
    chapterId: string,
    sectionId: string,
    input: UpdateSectionInput,
  ): Promise<ChapterSection>;
  deleteSection(chapterId: string, sectionId: string): Promise<void>;
  reorderSections(chapterId: string, sectionIds: string[]): Promise<void>;
  listAllCharacters(): Promise<Character[]>;
  associateCharacter(chapterId: string, characterId: string): Promise<void>;
  removeCharacterAssociation(
    chapterId: string,
    characterId: string,
  ): Promise<void>;
  reorderChapterCharacters(
    chapterId: string,
    characterIds: string[],
  ): Promise<void>;
  createLearningPoint(
    chapterId: string,
    input: CreateLearningPointInput,
  ): Promise<LearningPoint>;
  updateLearningPoint(
    chapterId: string,
    learningPointId: string,
    input: UpdateLearningPointInput,
  ): Promise<LearningPoint>;
  deleteLearningPoint(
    chapterId: string,
    learningPointId: string,
  ): Promise<void>;
  reorderLearningPoints(
    chapterId: string,
    learningPointIds: string[],
  ): Promise<void>;
  createChapter(input: CreateChapterInput): Promise<Chapter>;
  reorderChapters(orderedChapterSlugs: string[]): Promise<void>;
  setChapterActive(chapterId: string, isActive: boolean): Promise<Chapter>;
}

export interface AssessmentRepository {
  listAssessments(): Promise<Assessment[]>;
  getAssessmentByType(type: AssessmentType): Promise<Assessment | null>;
  getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestion[]>;
  getLearnerAssessmentQuestions(
    assessmentId: string,
  ): Promise<LearnerAssessmentQuestion[]>;
  getCompletedAttempt(
    learnerId: string,
    assessmentId: string,
  ): Promise<AssessmentAttemptSummary | null>;
  getAttemptById(
    learnerId: string,
    attemptId: string,
  ): Promise<AssessmentAttemptSummary | null>;
  /** Post-submit only — includes correct options and explanations. */
  getCompletedAttemptReview(
    learnerId: string,
    attemptId: string,
  ): Promise<CompletedAttemptReview | null>;
  listLearnerAttempts(learnerId: string): Promise<LearnerAttemptHistoryItem[]>;
  submitAssessmentAttempt(params: {
    learnerId: string;
    assessmentId: string;
    answers: AssessmentAnswer[];
  }): Promise<AssessmentSubmissionResult>;
  listAssessmentsForAdmin(): Promise<AdminAssessmentListItem[]>;
  getAssessmentForAdmin(assessmentId: string): Promise<AdminAssessmentDetail | null>;
  initializeDefaultAssessments(): Promise<AdminAssessmentListItem[]>;
  updateAssessmentMetadata(
    assessmentId: string,
    input: UpdateAssessmentMetadataInput,
  ): Promise<AdminAssessmentDetail>;
  createQuestion(
    assessmentId: string,
    input: CreateQuestionInput,
  ): Promise<AssessmentQuestion>;
  updateQuestion(
    assessmentId: string,
    questionId: string,
    input: UpdateQuestionInput,
  ): Promise<AssessmentQuestion>;
  deleteQuestion(
    assessmentId: string,
    questionId: string,
  ): Promise<DeleteQuestionResult>;
  reorderQuestions(assessmentId: string, questionIds: string[]): Promise<void>;
  questionHasLearnerAnswers(questionId: string): Promise<boolean>;
}

export interface ProgressRepository {
  getLearnerProgress(learnerId: string): Promise<LearnerProgress | null>;
  listChapterProgress(learnerId: string): Promise<ChapterProgressRecord[]>;
  getChapterProgress(
    learnerId: string,
    chapterSlug: string,
  ): Promise<ChapterProgressRecord | null>;
  startChapter(
    learnerId: string,
    chapterSlug: string,
  ): Promise<ChapterProgressRecord>;
  completeChapter(
    learnerId: string,
    chapterSlug: string,
  ): Promise<ChapterProgressRecord>;
}

export interface AdminDashboardRepository {
  getDashboardSummary(): Promise<AdminDashboardSummary>;
}

export type { AdminAnalyticsRepository };

export interface MediaRepository {
  listMediaAssets(filters?: MediaListFilters): Promise<AdminMediaAssetListItem[]>;
  getMediaAsset(mediaId: string): Promise<AdminMediaAssetDetail | null>;
  countByKind(kind: MediaAsset["kind"]): Promise<number>;
  createMediaAsset(
    input: CreateMediaAssetInput,
    storagePath: string | null,
  ): Promise<AdminMediaAssetDetail>;
  updateMediaAsset(
    mediaId: string,
    input: UpdateMediaAssetInput,
  ): Promise<AdminMediaAssetDetail>;
  deleteMediaAsset(mediaId: string): Promise<void>;
  assignMediaToSection(
    mediaId: string,
    chapterSlug: string,
    sectionId: string,
  ): Promise<AdminMediaAssetDetail>;
  unlinkMediaFromSection(mediaId: string): Promise<AdminMediaAssetDetail>;
  listMediaForChapter(chapterSlug: string): Promise<MediaAsset[]>;
}

export interface DataRepositories {
  chapters: ChapterRepository;
  chapterManagement: ChapterManagementRepository;
  assessments: AssessmentRepository;
  progress: ProgressRepository;
  adminDashboard: AdminDashboardRepository;
  adminAnalytics: AdminAnalyticsRepository;
  media: MediaRepository;
}
