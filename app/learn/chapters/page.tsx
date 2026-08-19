import { ChapterJourneyList } from "@/components/learner/chapter-journey-list";
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

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title={`${journey.totalChapters} Chapter${journey.totalChapters === 1 ? "" : "s"}`}
        description="Your progress is saved as you go."
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
            chapterId={journey.chapters[0]?.id ?? null}
            label="Start Learning"
          />
        )}
      </div>

      <ChapterJourneyList
        chapters={journey.chapters}
        continueChapterId={journey.continueChapterId}
      />
    </div>
  );
}
