import "server-only";

import { getRepositories } from "@/lib/data";
import { isAssessmentLearnerReady } from "@/lib/domain/assessment-availability";
import type {
  AssessmentSubmissionResult,
  PostAssessmentSession,
} from "@/types/assessment";

export async function getPostAssessmentSession(
  learnerId: string,
): Promise<PostAssessmentSession> {
  const assessment = await getRepositories().assessments.getAssessmentByType(
    "post",
  );

  if (!assessment) {
    return {
      assessment: null,
      questions: [],
      completedAttempt: null,
    };
  }

  const [questions, completedAttempt] = await Promise.all([
    getRepositories().assessments.getLearnerAssessmentQuestions(assessment.id),
    getRepositories().assessments.getCompletedAttempt(learnerId, assessment.id),
  ]);

  return {
    assessment,
    questions,
    completedAttempt,
  };
}

export async function submitPostAssessment(
  learnerId: string,
  answers: Record<string, string>,
): Promise<AssessmentSubmissionResult> {
  const assessment = await getRepositories().assessments.getAssessmentByType(
    "post",
  );

  if (!assessment) {
    throw new Error("Post-assessment is not available.");
  }

  const questions = await getRepositories().assessments.getLearnerAssessmentQuestions(
    assessment.id,
  );

  if (!isAssessmentLearnerReady(assessment, questions)) {
    throw new Error("Post-assessment is not available.");
  }

  if (questions.length === 0) {
    throw new Error("Post-assessment has no questions.");
  }

  const unanswered = questions.filter((question) => !answers[question.id]);
  if (unanswered.length > 0) {
    throw new Error(
      `Please answer all questions before submitting. ${unanswered.length} question(s) remain unanswered.`,
    );
  }

  const answerRows = questions.map((question) => ({
    questionId: question.id,
    selectedOptionId: answers[question.id] ?? null,
  }));

  for (const question of questions) {
    const selectedId = answers[question.id];
    const validOption = question.options.some((option) => option.id === selectedId);
    if (!validOption) {
      throw new Error("One or more selected answers are invalid.");
    }
  }

  return getRepositories().assessments.submitAssessmentAttempt({
    learnerId,
    assessmentId: assessment.id,
    answers: answerRows,
  });
}
