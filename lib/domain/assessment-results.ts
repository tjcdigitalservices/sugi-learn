import "server-only";

import { getRepositories } from "@/lib/data";
import {
  getCurrentLearnerDisplayName,
} from "@/lib/domain/learner-progress";
import type {
  AssessmentAttemptSummary,
  AssessmentResultsView,
  AssessmentScoreComparison,
  LearnerResultsDashboardView,
} from "@/types/assessment";

function buildScoreComparison(
  preAttempt: AssessmentAttemptSummary | null,
  postAttempt: AssessmentAttemptSummary,
): AssessmentScoreComparison | null {
  if (!preAttempt || preAttempt.correctCount === null || postAttempt.correctCount === null) {
    return {
      preAttempt,
      postAttempt,
      correctCountChange: null,
      percentagePointChange: null,
    };
  }

  const preScore = preAttempt.score ?? 0;
  const postScore = postAttempt.score ?? 0;

  return {
    preAttempt,
    postAttempt,
    correctCountChange: postAttempt.correctCount - preAttempt.correctCount,
    percentagePointChange: postScore - preScore,
  };
}

export async function getAssessmentResultsView(
  learnerId: string,
  attemptId: string,
): Promise<AssessmentResultsView | null> {
  const attempt = await getRepositories().assessments.getAttemptById(
    learnerId,
    attemptId,
  );

  if (!attempt) {
    return null;
  }

  const assessments = await getRepositories().assessments.listAssessments();
  const assessment = assessments.find((item) => item.id === attempt.assessmentId);
  const assessmentTitle = assessment?.title ?? "Assessment";

  let comparison: AssessmentScoreComparison | null = null;
  if (attempt.assessmentType === "post") {
    const preAssessment = assessments.find((item) => item.type === "pre");
    const preAttempt = preAssessment
      ? await getRepositories().assessments.getCompletedAttempt(
          learnerId,
          preAssessment.id,
        )
      : null;
    comparison = buildScoreComparison(preAttempt, attempt);
  }

  const history = await getRepositories().assessments.listLearnerAttempts(learnerId);

  return {
    attempt,
    assessmentTitle,
    comparison,
    history,
  };
}

export async function getLearnerResultsDashboard(
  learnerId: string,
  attemptId: string,
): Promise<LearnerResultsDashboardView | null> {
  const review = await getRepositories().assessments.getCompletedAttemptReview(
    learnerId,
    attemptId,
  );

  if (!review) {
    return null;
  }

  const { attempt, items } = review;
  const postTotal = attempt.totalQuestions;
  const postCorrect = attempt.correctCount ?? 0;
  const postScore = attempt.score ?? 0;

  let pre: LearnerResultsDashboardView["pre"] = null;
  let learningGainPercentagePoints: number | null = null;

  if (attempt.assessmentType === "post") {
    const preAssessment =
      await getRepositories().assessments.getAssessmentByType("pre");
    const preAttempt = preAssessment
      ? await getRepositories().assessments.getCompletedAttempt(
          learnerId,
          preAssessment.id,
        )
      : null;

    if (preAttempt && preAttempt.correctCount !== null) {
      pre = {
        correctCount: preAttempt.correctCount,
        total: preAttempt.totalQuestions,
        score: preAttempt.score ?? 0,
      };
      learningGainPercentagePoints = postScore - (preAttempt.score ?? 0);
    }
  }

  const learnerDisplayName = await getCurrentLearnerDisplayName();

  return {
    attemptId: attempt.id,
    learnerDisplayName,
    completedAt: attempt.completedAt,
    pre,
    post: {
      correctCount: postCorrect,
      total: postTotal,
      score: postScore,
    },
    learningGainPercentagePoints,
    questionOutcomes: items.map((item, index) => ({
      index: index + 1,
      questionId: item.questionId,
      isCorrect: item.isCorrect,
    })),
    incorrectReviews: items.filter((item) => !item.isCorrect),
  };
}

export async function getLatestPostAssessmentAttemptId(
  learnerId: string,
): Promise<string | null> {
  const postAssessment = await getRepositories().assessments.getAssessmentByType(
    "post",
  );
  if (!postAssessment) {
    return null;
  }

  const attempt = await getRepositories().assessments.getCompletedAttempt(
    learnerId,
    postAssessment.id,
  );
  return attempt?.id ?? null;
}
