import { AssessmentEmptyState } from "@/components/assessment/assessment-empty-state";
import { AssessmentEngine } from "@/components/assessment/assessment-engine";
import { submitPreAssessmentAction } from "@/lib/assessment/actions";
import { isAssessmentLearnerReady } from "@/lib/domain/assessment-availability";
import { getCurrentLearnerId } from "@/lib/domain/learner-progress";
import { getPreAssessmentSession } from "@/lib/domain/pre-assessment";

export default async function PreAssessmentPage() {
  const learnerId = await getCurrentLearnerId();

  let session;
  try {
    session = await getPreAssessmentSession(learnerId);
  } catch {
    throw new Error("Unable to load pre-assessment.");
  }

  if (!session.assessment) {
    return <AssessmentEmptyState />;
  }

  if (!isAssessmentLearnerReady(session.assessment, session.questions)) {
    return (
      <AssessmentEmptyState
        title="Pre-Assessment has no approved questions yet."
        description="The pre-assessment is configured but no approved questions are available. Check back later."
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AssessmentEngine
        assessment={session.assessment}
        questions={session.questions}
        continueHref="/learn/chapters"
        continueLabel="View Chapters"
        initialCompletedAttempt={session.completedAttempt}
        submitAction={submitPreAssessmentAction}
      />
    </div>
  );
}
