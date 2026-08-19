import type { AssessmentType } from "@/types/assessment";
import type { ReviewStatus } from "@/types/review";

export interface AdminAssessmentListItem {
  id: string;
  type: AssessmentType;
  title: string;
  instructions: string | null;
  questionCount: number;
  reviewStatus: ReviewStatus;
  updatedAt: string;
}

export type AdminAssessmentDetail = AdminAssessmentListItem;

export interface UpdateAssessmentMetadataInput {
  title: string;
  instructions: string | null;
  reviewStatus: ReviewStatus;
}

export interface QuestionOptionInput {
  id?: string;
  label: string;
  sortOrder: number;
  isCorrect: boolean;
}

export interface CreateQuestionInput {
  prompt: string;
  explanation?: string | null;
  sourceReference?: string | null;
  /** Chapter slug, or null for no association. */
  chapterId?: string | null;
  reviewStatus?: ReviewStatus;
  options: QuestionOptionInput[];
}

export type UpdateQuestionInput = CreateQuestionInput;

/** Hard-deleted when unused; retired (draft) when learner answers exist. */
export type DeleteQuestionOutcome = "deleted" | "retired";

export interface DeleteQuestionResult {
  outcome: DeleteQuestionOutcome;
}

export type AssessmentManagementActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
