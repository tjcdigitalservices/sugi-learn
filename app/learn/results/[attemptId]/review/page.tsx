import { notFound } from "next/navigation";

import { QuestionReviewPanel } from "@/components/learner/results/question-review-panel";
import { getLearnerResultsDashboard } from "@/lib/domain/assessment-results";
import { getCurrentLearnerId } from "@/lib/domain/learner-progress";

interface ResultsReviewPageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function ResultsReviewPage({
  params,
}: ResultsReviewPageProps) {
  const { attemptId } = await params;
  const learnerId = await getCurrentLearnerId();

  let view;
  try {
    view = await getLearnerResultsDashboard(learnerId, attemptId);
  } catch {
    throw new Error("Unable to load question review.");
  }

  if (!view) {
    notFound();
  }

  return (
    <QuestionReviewPanel
      attemptId={view.attemptId}
      incorrectReviews={view.incorrectReviews}
    />
  );
}
