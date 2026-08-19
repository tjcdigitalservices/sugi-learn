import { notFound } from "next/navigation";

import { LearningResultsDashboard } from "@/components/learner/results/learning-results-dashboard";
import { getLearnerResultsDashboard } from "@/lib/domain/assessment-results";
import { getCurrentLearnerId } from "@/lib/domain/learner-progress";

interface ResultsAttemptPageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function ResultsAttemptPage({
  params,
}: ResultsAttemptPageProps) {
  const { attemptId } = await params;
  const learnerId = await getCurrentLearnerId();

  let view;
  try {
    view = await getLearnerResultsDashboard(learnerId, attemptId);
  } catch {
    throw new Error("Unable to load results.");
  }

  if (!view) {
    notFound();
  }

  return <LearningResultsDashboard view={view} />;
}
