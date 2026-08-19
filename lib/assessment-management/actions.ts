"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import {
  validateAssessmentMetadata,
  validateCreateQuestion,
  validateOrderedQuestionIds,
  validateUpdateQuestion,
} from "@/lib/assessment-management/validation";
import {
  createQuestion,
  deleteQuestion,
  getAssessmentForAdmin,
  initializeDefaultAssessments,
  listAssessmentsForAdmin,
  reorderQuestions,
  updateAssessmentMetadata,
  updateQuestion,
} from "@/lib/domain/assessment-management";
import type { AssessmentQuestion } from "@/types/assessment";
import type {
  AdminAssessmentDetail,
  AssessmentManagementActionResult,
  CreateQuestionInput,
  DeleteQuestionResult,
  UpdateAssessmentMetadataInput,
  UpdateQuestionInput,
} from "@/types/assessment-management";

function adminPaths(assessmentId: string) {
  return [
    `/admin/assessments/${assessmentId}`,
    "/admin/assessments",
    "/admin",
  ] as const;
}

function revalidateAssessment(assessmentId: string) {
  for (const path of adminPaths(assessmentId)) {
    revalidatePath(path);
  }
  revalidatePath("/learn/assessment/pre");
  revalidatePath("/learn/assessment/post");
}

function safeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    const message = error.message;
    if (
      message.includes("Unable to") ||
      message.includes("not found") ||
      message.includes("Invalid") ||
      message.includes("cannot be deleted") ||
      message.includes("required")
    ) {
      return message;
    }
  }
  return "Something went wrong. Please try again.";
}

export async function initializeAssessmentsAction(): Promise<
  AssessmentManagementActionResult<AdminAssessmentDetail[]>
> {
  await requireAdmin();

  try {
    const assessments = await initializeDefaultAssessments();
    revalidatePath("/admin/assessments");
    return { success: true, data: assessments };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function saveAssessmentMetadataAction(
  assessmentId: string,
  input: UpdateAssessmentMetadataInput,
): Promise<AssessmentManagementActionResult<AdminAssessmentDetail>> {
  await requireAdmin();

  const validationError = validateAssessmentMetadata(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const assessment = await updateAssessmentMetadata(assessmentId, input);
    revalidateAssessment(assessmentId);
    return { success: true, data: assessment };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function createQuestionAction(
  assessmentId: string,
  input: CreateQuestionInput,
): Promise<AssessmentManagementActionResult<AssessmentQuestion>> {
  await requireAdmin();

  const validationError = validateCreateQuestion(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const question = await createQuestion(assessmentId, input);
    revalidateAssessment(assessmentId);
    return { success: true, data: question };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function saveQuestionAction(
  assessmentId: string,
  questionId: string,
  input: UpdateQuestionInput,
): Promise<AssessmentManagementActionResult<AssessmentQuestion>> {
  await requireAdmin();

  const validationError = validateUpdateQuestion(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const question = await updateQuestion(assessmentId, questionId, input);
    revalidateAssessment(assessmentId);
    return { success: true, data: question };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function deleteQuestionAction(
  assessmentId: string,
  questionId: string,
): Promise<AssessmentManagementActionResult<DeleteQuestionResult>> {
  await requireAdmin();

  try {
    const result = await deleteQuestion(assessmentId, questionId);
    revalidateAssessment(assessmentId);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function reorderQuestionsAction(
  assessmentId: string,
  questionIds: string[],
): Promise<AssessmentManagementActionResult> {
  await requireAdmin();

  const validationError = validateOrderedQuestionIds(questionIds);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    await reorderQuestions(assessmentId, questionIds);
    revalidateAssessment(assessmentId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function loadAssessmentsForAdminAction(): Promise<
  AssessmentManagementActionResult<AdminAssessmentDetail[]>
> {
  await requireAdmin();

  try {
    const assessments = await listAssessmentsForAdmin();
    return { success: true, data: assessments };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function loadAssessmentForAdminAction(
  assessmentId: string,
): Promise<AssessmentManagementActionResult<AdminAssessmentDetail>> {
  await requireAdmin();

  try {
    const assessment = await getAssessmentForAdmin(assessmentId);
    if (!assessment) {
      return { success: false, error: "Assessment not found." };
    }
    return { success: true, data: assessment };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}
