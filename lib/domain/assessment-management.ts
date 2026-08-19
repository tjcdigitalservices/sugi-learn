import { getRepositories } from "@/lib/data";
import type { AssessmentQuestion } from "@/types/assessment";
import type {
  AdminAssessmentDetail,
  AdminAssessmentListItem,
  CreateQuestionInput,
  DeleteQuestionResult,
  UpdateAssessmentMetadataInput,
  UpdateQuestionInput,
} from "@/types/assessment-management";

export async function listAssessmentsForAdmin(): Promise<AdminAssessmentListItem[]> {
  return getRepositories().assessments.listAssessmentsForAdmin();
}

export async function getAssessmentForAdmin(
  assessmentId: string,
): Promise<AdminAssessmentDetail | null> {
  return getRepositories().assessments.getAssessmentForAdmin(assessmentId);
}

export async function initializeDefaultAssessments(): Promise<AdminAssessmentListItem[]> {
  return getRepositories().assessments.initializeDefaultAssessments();
}

export async function updateAssessmentMetadata(
  assessmentId: string,
  input: UpdateAssessmentMetadataInput,
): Promise<AdminAssessmentDetail> {
  return getRepositories().assessments.updateAssessmentMetadata(
    assessmentId,
    input,
  );
}

export async function createQuestion(
  assessmentId: string,
  input: CreateQuestionInput,
): Promise<AssessmentQuestion> {
  return getRepositories().assessments.createQuestion(assessmentId, input);
}

export async function updateQuestion(
  assessmentId: string,
  questionId: string,
  input: UpdateQuestionInput,
): Promise<AssessmentQuestion> {
  return getRepositories().assessments.updateQuestion(
    assessmentId,
    questionId,
    input,
  );
}

export async function deleteQuestion(
  assessmentId: string,
  questionId: string,
): Promise<DeleteQuestionResult> {
  return getRepositories().assessments.deleteQuestion(assessmentId, questionId);
}

export async function reorderQuestions(
  assessmentId: string,
  questionIds: string[],
): Promise<void> {
  return getRepositories().assessments.reorderQuestions(assessmentId, questionIds);
}

export async function questionHasLearnerAnswers(
  questionId: string,
): Promise<boolean> {
  return getRepositories().assessments.questionHasLearnerAnswers(questionId);
}

export async function getAssessmentQuestionsForAdmin(
  assessmentId: string,
): Promise<AssessmentQuestion[]> {
  return getRepositories().assessments.getAssessmentQuestions(assessmentId);
}
