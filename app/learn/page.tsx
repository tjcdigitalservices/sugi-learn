import Link from "next/link";

import { ChapterCoverGrid } from "@/components/learner/chapter-cover-grid";
import { ContinueLearningButton } from "@/components/learner/continue-learning-button";
import { OverallProgress } from "@/components/learner/overall-progress";
import { StartAsDifferentLearnerButton } from "@/components/learner/start-as-different-learner-button";
import { isAssessmentLearnerReady } from "@/lib/domain/assessment-availability";
import {
  getCurrentLearnerDisplayName,
  getCurrentLearnerId,
  getLearnerJourneySummary,
} from "@/lib/domain/learner-progress";
import { getPostAssessmentSession } from "@/lib/domain/post-assessment";
import { getPreAssessmentSession } from "@/lib/domain/pre-assessment";

export default async function LearnHomePage() {
  const learnerId = await getCurrentLearnerId();
  const [journey, displayName, preSession, postSession] = await Promise.all([
    getLearnerJourneySummary(learnerId),
    getCurrentLearnerDisplayName(),
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

  const greeting = displayName ? `Welcome back, ${displayName}` : "Welcome to Sugidanon";

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sl-gold">
          Learner Home
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-sl-navy sm:text-4xl">
          {greeting}
        </h1>
        <p className="max-w-2xl text-sm text-sl-ink-muted sm:text-base">
          Complete the Pre-Test, then watch the Sugidanon chapter animations in
          order. Finishing a video unlocks the next chapter. When all chapters
          are done, you can revisit any animation freely.
        </p>
        <StartAsDifferentLearnerButton />
      </header>

      <section className="sl-card p-6 sm:p-8">
        <OverallProgress
          completedCount={journey.completedCount}
          totalChapters={journey.totalChapters}
          inProgressCount={journey.inProgressCount}
        />

        <div className="mt-6 flex flex-wrap gap-3">
          {journey.allChaptersCompleted ? (
            postAvailable && !journey.postAssessmentCompleted ? (
              <Link href="/learn/assessment/post" className="sl-btn-gold">
                Take Post-Test
              </Link>
            ) : journey.postAssessmentCompleted ? (
              <Link href="/learn/results" className="sl-btn-gold">
                View Results
              </Link>
            ) : (
              <Link href="/learn/progress" className="sl-btn-gold">
                View progress
              </Link>
            )
          ) : journey.continueChapterId ? (
            <ContinueLearningButton chapterId={journey.continueChapterId} />
          ) : (
            <ContinueLearningButton
              chapterId={
                journey.chapters.find((chapter) => chapter.isUnlocked)?.id ??
                null
              }
              label="Start Learning"
            />
          )}
          {!journey.preAssessmentCompleted && preAvailable ? (
            <Link
              href="/learn/assessment/pre"
              className="inline-flex items-center justify-center rounded-full border border-[color:rgba(44,36,22,0.15)] px-5 py-3 text-sm font-medium text-sl-ink transition hover:bg-white"
            >
              Take Pre-Test
            </Link>
          ) : null}
          <Link
            href="/learn/chapters"
            className="inline-flex items-center justify-center rounded-full border border-[color:rgba(44,36,22,0.15)] px-5 py-3 text-sm font-medium text-sl-ink transition hover:bg-white"
          >
            View all chapters
          </Link>
        </div>
      </section>

      {journey.allChaptersCompleted ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-5 text-sm text-emerald-950">
          <p className="font-medium">All chapters completed</p>
          <p className="mt-1">
            {postAvailable ? (
              journey.postAssessmentCompleted ? (
                <>
                  You have completed the post-assessment.{" "}
                  <Link href="/learn/results" className="underline">
                    View your results
                  </Link>
                  .
                </>
              ) : (
                <>
                  Take the{" "}
                  <Link href="/learn/assessment/post" className="underline">
                    post-assessment
                  </Link>{" "}
                  to see your score comparison, or revisit any chapter at any time.
                </>
              )
            ) : (
              <>
                The post-assessment is not configured yet. Revisit chapters or
                check back later.
              </>
            )}
          </p>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Chapter journey</h2>
          <p className="text-sm text-muted-foreground">
            {journey.preAssessmentCompleted
              ? "Chapters unlock in order after you finish each animation. Once all are complete, every cover stays open for replay."
              : "Complete the Pre-Test to unlock Chapter 1 and begin the Sugidanon journey."}
          </p>
        </div>
        {journey.preAssessmentCompleted ? (
          <ChapterCoverGrid chapters={journey.chapters} />
        ) : (
          <div className="rounded-xl border border-dashed border-[color:rgba(44,36,22,0.2)] bg-white/50 px-6 py-10 text-center">
            <p className="text-sm text-sl-ink-muted">
              Chapter covers unlock after your Pre-Test.
            </p>
            {preAvailable ? (
              <Link href="/learn/assessment/pre" className="sl-btn-gold mt-4">
                Take Pre-Test
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
