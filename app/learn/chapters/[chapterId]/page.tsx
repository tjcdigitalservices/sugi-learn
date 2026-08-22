import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AssessmentAccessBlockedState } from "@/components/assessment/assessment-access-blocked-state";
import { ChapterEngine } from "@/components/chapter/chapter-engine";
import { LearnerChapterLayout } from "@/components/chapter/learner-chapter-layout";
import { ARCHITECTURE_DEMO_CHAPTER } from "@/lib/data/mock/architecture-demo-chapter";
import { getChapterNavigation } from "@/lib/domain/chapter-navigation";
import { getChapterForEngine, listChapterSummaries } from "@/lib/domain/chapters";
import {
  ensureChapterStarted,
  getChapterProgressForLearner,
  getCurrentLearnerId,
  getLearnerJourneySummary,
} from "@/lib/domain/learner-progress";
import type { ChapterProgressStatus } from "@/types/progress";

interface ChapterPageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { chapterId } = await params;

  if (chapterId === ARCHITECTURE_DEMO_CHAPTER.id) {
    notFound();
  }

  const learnerId = await getCurrentLearnerId();
  const journey = await getLearnerJourneySummary(learnerId);

  if (!journey.preAssessmentCompleted) {
    redirect("/learn/assessment/pre");
  }

  const journeyChapter = journey.chapters.find((item) => item.id === chapterId);
  if (journeyChapter?.isLocked) {
    redirect("/learn/chapters");
  }

  let chapter;
  try {
    chapter = await getChapterForEngine(chapterId);
  } catch {
    notFound();
  }

  if (!chapter) {
    notFound();
  }

  const summaries = await listChapterSummaries();
  const summary = summaries.find((item) => item.id === chapterId);

  if (
    chapter.number > 0 &&
    (!summary?.hasPublishedContent || chapter.sections.length === 0)
  ) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/learn/chapters"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← All chapters
        </Link>
        <AssessmentAccessBlockedState
          title="This chapter is not available yet"
          description="Approved content for this chapter has not been published. Check back later or continue with available chapters."
        />
      </div>
    );
  }

  const navigation = await getChapterNavigation(chapterId);

  let progressStatus: ChapterProgressStatus = "not_started";

  if (chapter.number > 0) {
    try {
      const existing = await getChapterProgressForLearner(learnerId, chapterId);
      if (existing) {
        progressStatus = existing.status;
      } else {
        const started = await ensureChapterStarted(learnerId, chapterId);
        progressStatus = started.status;
      }
    } catch (error) {
      console.error("Chapter progress sync failed:", error);
      progressStatus = "not_started";
    }
  }

  if (chapter.number === 0 || !navigation) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/learn/chapters"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← All chapters
        </Link>
        <ChapterEngine chapter={chapter} context="learner" />
      </div>
    );
  }

  return (
    <LearnerChapterLayout
      chapter={chapter}
      navigation={navigation}
      progressStatus={progressStatus}
    />
  );
}
