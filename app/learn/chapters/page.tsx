import { redirect } from "next/navigation";

import { ChapterCoverGrid } from "@/components/learner/chapter-cover-grid";
import { ContinueLearningButton } from "@/components/learner/continue-learning-button";
import { OverallProgress } from "@/components/learner/overall-progress";
import { PageHeader } from "@/components/shared/page-header";
import {
  getCurrentLearnerId,
  getLearnerJourneySummary,
} from "@/lib/domain/learner-progress";

export default async function ChaptersPage() {
  const learnerId = await getCurrentLearnerId();
  const journey = await getLearnerJourneySummary(learnerId);

  if (!journey.preAssessmentCompleted) {
    redirect("/learn/assessment/pre");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <PageHeader
        title="Sugidanon (Epics) of Panay"
        description="Watch each chapter’s 2D animation. Finish a video to unlock the next chapter."
      />

      <OverallProgress
        completedCount={journey.completedCount}
        totalChapters={journey.totalChapters}
        inProgressCount={journey.inProgressCount}
      />

      <div className="flex flex-wrap gap-3">
        {journey.continueChapterId ? (
          <ContinueLearningButton chapterId={journey.continueChapterId} />
        ) : journey.allChaptersCompleted ? null : (
          <ContinueLearningButton
            chapterId={
              journey.chapters.find((chapter) => chapter.isUnlocked)?.id ?? null
            }
            label="Start Learning"
          />
        )}
      </div>

      <ChapterCoverGrid chapters={journey.chapters} />
    </div>
  );
}
