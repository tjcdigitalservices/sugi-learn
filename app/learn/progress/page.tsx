import Link from "next/link";

import { ChapterJourneyList } from "@/components/learner/chapter-journey-list";
import { ContinueLearningButton } from "@/components/learner/continue-learning-button";
import { OverallProgress } from "@/components/learner/overall-progress";
import { PageHeader } from "@/components/shared/page-header";
import { isAssessmentLearnerReady } from "@/lib/domain/assessment-availability";
import {
  getCurrentLearnerId,
  getLearnerJourneySummary,
} from "@/lib/domain/learner-progress";
import { getPostAssessmentSession } from "@/lib/domain/post-assessment";
import { getPreAssessmentSession } from "@/lib/domain/pre-assessment";

export default async function ProgressPage() {
  const learnerId = await getCurrentLearnerId();
  const [journey, preSession, postSession] = await Promise.all([
    getLearnerJourneySummary(learnerId),
    getPreAssessmentSession(learnerId),
    getPostAssessmentSession(learnerId),
  ]);

  const preAvailable = isAssessmentLearnerReady(
    preSession.assessment,
    preSession.questions,
  );
  const postAvailable = isAssessmentLearnerReady(
    postSession.assessment,
    postSession.questions,
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        eyebrow="Progress"
        title="Learning Progress"
        description="Your chapter completion status across the Sugidanon journey."
      />

      <section className="rounded-lg border bg-card p-6">
        <OverallProgress
          completedCount={journey.completedCount}
          totalChapters={journey.totalChapters}
          inProgressCount={journey.inProgressCount}
        />

        <div className="mt-6 flex flex-wrap gap-3">
          {journey.allChaptersCompleted ? (
            postAvailable && !journey.postAssessmentCompleted ? (
              <Link
                href="/learn/assessment/post"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Take Post-Assessment
              </Link>
            ) : journey.postAssessmentCompleted ? (
              <Link
                href="/learn/results"
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View Results
              </Link>
            ) : (
              <Link
                href="/learn/chapters"
                className="inline-flex items-center justify-center rounded-md border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Review chapters
              </Link>
            )
          ) : (
            <ContinueLearningButton
              chapterId={
                journey.continueChapterId ?? journey.chapters[0]?.id ?? null
              }
              label={
                journey.continueChapterId ? "Continue Learning" : "Start Learning"
              }
            />
          )}
        </div>
      </section>

      {journey.completedCount === 0 && journey.inProgressCount === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-8 text-center">
          <p className="text-sm font-medium">No chapters started yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Begin with the first chapter to start tracking your progress.
          </p>
        </div>
      ) : null}

      <section className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Assessments</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border bg-muted/20 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pre-Assessment
            </dt>
            <dd className="mt-2 text-sm font-medium">
              {journey.preAssessmentCompleted
                ? "Completed"
                : preAvailable
                  ? "Available"
                  : "Not configured"}
            </dd>
            {!journey.preAssessmentCompleted && preAvailable ? (
              <Link
                href="/learn/assessment/pre"
                className="mt-3 inline-flex text-sm font-medium underline underline-offset-4"
              >
                Take pre-assessment
              </Link>
            ) : null}
          </div>
          <div className="rounded-md border bg-muted/20 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Post-Assessment
            </dt>
            <dd className="mt-2 text-sm font-medium">
              {journey.postAssessmentCompleted
                ? "Completed"
                : postAvailable
                  ? "Available"
                  : "Not configured"}
            </dd>
            {journey.postAssessmentCompleted ? (
              <Link
                href="/learn/results"
                className="mt-3 inline-flex text-sm font-medium underline underline-offset-4"
              >
                View results
              </Link>
            ) : postAvailable ? (
              <Link
                href="/learn/assessment/post"
                className="mt-3 inline-flex text-sm font-medium underline underline-offset-4"
              >
                Take post-assessment
              </Link>
            ) : null}
          </div>
        </dl>
      </section>

      {journey.allChaptersCompleted ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-5 text-sm text-emerald-950">
          <p className="font-medium">All chapters completed</p>
          <p className="mt-1">
            {postAvailable
              ? journey.postAssessmentCompleted
                ? "Review your results or revisit any chapter."
                : "Take the post-assessment when you are ready."
              : "Post-assessment questions are not configured yet."}
          </p>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Chapter status</h2>
        <ChapterJourneyList
          chapters={journey.chapters}
          continueChapterId={journey.continueChapterId}
        />
      </section>
    </div>
  );
}
