"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { getCurrentLearnerId } from "@/lib/domain/learner-progress";
import { submitPostAssessment } from "@/lib/domain/post-assessment";
import { submitPreAssessment } from "@/lib/domain/pre-assessment";
import { hasSupabaseConfig } from "@/lib/supabase/service";
import type { AssessmentSubmissionResult } from "@/types/assessment";

export type AssessmentActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function revalidateAssessmentPaths() {
  revalidatePath("/learn");
  revalidatePath("/learn/assessment/pre");
  revalidatePath("/learn/assessment/post");
  revalidatePath("/learn/progress");
  revalidatePath("/learn/results");
}

async function submitAssessmentAction(
  submitFn: (
    learnerId: string,
    answers: Record<string, string>,
  ) => Promise<AssessmentSubmissionResult>,
  answers: Record<string, string>,
  alreadySubmittedMessage: string,
): Promise<AssessmentActionResult<AssessmentSubmissionResult>> {
  if (hasSupabaseConfig()) {
    await requireUser();
  }

  try {
    const learnerId = await getCurrentLearnerId();
    const result = await submitFn(learnerId, answers);
    revalidateAssessmentPaths();
    revalidatePath(`/learn/results/${result.attemptId}`);
    return { success: true, data: result };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit assessment. Please try again.";

    if (message.includes("already been submitted")) {
      return {
        success: false,
        error: alreadySubmittedMessage,
      };
    }

    return {
      success: false,
      error: message,
    };
  }
}

export async function submitPreAssessmentAction(
  answers: Record<string, string>,
): Promise<AssessmentActionResult<AssessmentSubmissionResult>> {
  return submitAssessmentAction(
    submitPreAssessment,
    answers,
    "You have already completed this pre-assessment.",
  );
}

export async function submitPostAssessmentAction(
  answers: Record<string, string>,
): Promise<AssessmentActionResult<AssessmentSubmissionResult>> {
  return submitAssessmentAction(
    submitPostAssessment,
    answers,
    "You have already completed this post-assessment.",
  );
}
