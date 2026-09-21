import Link from "next/link";
import { redirect } from "next/navigation";

import { AssessmentEmptyState } from "@/components/assessment/assessment-empty-state";
import { isPostAssessmentUnlocked } from "@/lib/assessment/post-access";
import { getLatestPostAssessmentAttemptId } from "@/lib/domain/assessment-results";
import { getCurrentLearnerId } from "@/lib/domain/learner-progress";

export default async function ResultsIndexPage() {
  const learnerId = await getCurrentLearnerId();
  const latestAttemptId = await getLatestPostAssessmentAttemptId(learnerId);

  if (latestAttemptId) {
    redirect(`/learn/results/${latestAttemptId}`);
  }

  const postUnlocked = await isPostAssessmentUnlocked(learnerId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AssessmentEmptyState
        title="No results available yet"
        description={
          postUnlocked
            ? "Complete the post-assessment to view your results and score comparison."
            : "Finish every chapter, then take the Post-Test to unlock your results."
        }
      />
      <div className="flex justify-center">
        {postUnlocked ? (
          <Link
            href="/learn/assessment/post"
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Go to Post-Assessment
          </Link>
        ) : (
          <Link
            href="/learn"
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to Learner Home
          </Link>
        )}
      </div>
    </div>
  );
}
