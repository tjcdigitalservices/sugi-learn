import { AssessmentAccessBlockedState } from "@/components/assessment/assessment-access-blocked-state";
import { AssessmentEmptyState } from "@/components/assessment/assessment-empty-state";
import { AssessmentEngine } from "@/components/assessment/assessment-engine";
import { ASSESSMENT_ACCESS_POLICY } from "@/lib/assessment/access-policy";
import { submitPostAssessmentAction } from "@/lib/assessment/actions";
import { isAssessmentLearnerReady } from "@/lib/domain/assessment-availability";
import {
  getCurrentLearnerId,
  getLearnerJourneySummary,
} from "@/lib/domain/learner-progress";
import { getPostAssessmentSession } from "@/lib/domain/post-assessment";

export default async function PostAssessmentPage() {
  const learnerId = await getCurrentLearnerId();

  let session;
  try {
    session = await getPostAssessmentSession(learnerId);
  } catch {
    throw new Error("Unable to load post-assessment.");
  }

  const journey = await getLearnerJourneySummary(learnerId);

  if (
    ASSESSMENT_ACCESS_POLICY.postAssessmentRequiresAllChaptersCompleted &&
    !journey.allChaptersCompleted
  ) {
    return (
      <AssessmentAccessBlockedState
        title="Post-Assessment is not available yet"
        description="Complete all chapters before taking the post-assessment. This requirement is Pending Client Confirmation and may change."
      />
    );
  }

  if (
    ASSESSMENT_ACCESS_POLICY.postAssessmentRequiresPreAssessmentCompleted &&
    !journey.preAssessmentCompleted
  ) {
    return (
      <AssessmentAccessBlockedState
        title="Pre-Assessment required"
        description="Complete the pre-assessment before taking the post-assessment. This requirement is Pending Client Confirmation and may change."
      />
    );
  }

  if (!session.assessment) {
    return (
      <AssessmentEmptyState
        title="Post-Assessment is not available yet."
        description="An approved post-assessment has not been configured. Check back later or contact your instructor."
      />
    );
  }

  if (!isAssessmentLearnerReady(session.assessment, session.questions)) {
    return (
      <AssessmentEmptyState
        title="Post-Assessment has no approved questions yet."
        description="The post-assessment is configured but no approved questions are available. Check back later."
      />
    );
  }

  const continueHref = session.completedAttempt
    ? `/learn/results/${session.completedAttempt.id}`
    : "/learn/results";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AssessmentEngine
        assessment={session.assessment}
        questions={session.questions}
        continueHref={continueHref}
        continueLabel="View Results"
        initialCompletedAttempt={session.completedAttempt}
        submitAction={submitPostAssessmentAction}
      />
    </div>
  );
}
