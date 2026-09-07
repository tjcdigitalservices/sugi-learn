import type { ChapterJourneyItem } from "@/types/progress";

/**
 * Sequential unlock: after Pre-Test, Ch1 is open.
 * Chapter N unlocks when N-1 is completed.
 * Chapters without published (approved) content stay locked.
 * When all *published* chapters are completed, those stay unlocked for replay.
 * Before Pre-Test, every chapter stays locked.
 */
export function isChapterUnlocked(
  chapter: Pick<ChapterJourneyItem, "number" | "id" | "hasPublishedContent">,
  chapters: readonly Pick<
    ChapterJourneyItem,
    "number" | "id" | "completedAt" | "status" | "hasPublishedContent"
  >[],
  options: {
    allPublishedChaptersCompleted: boolean;
    preAssessmentCompleted: boolean;
  },
): boolean {
  if (!options.preAssessmentCompleted) {
    return false;
  }

  if (!chapter.hasPublishedContent) {
    return false;
  }

  if (options.allPublishedChaptersCompleted) {
    return true;
  }

  if (chapter.number <= 1) {
    return true;
  }

  // Walk back through unpublished gaps so Ch15 can unlock after Ch13
  // when Ch14 is still "coming soon".
  let previousNumber = chapter.number - 1;
  while (previousNumber >= 1) {
    const previous = chapters.find((item) => item.number === previousNumber);
    if (!previous) {
      return false;
    }
    if (previous.hasPublishedContent) {
      return previous.status === "completed" || Boolean(previous.completedAt);
    }
    previousNumber -= 1;
  }

  return true;
}

export function withChapterUnlockState(
  chapters: ChapterJourneyItem[],
  preAssessmentCompleted: boolean,
): ChapterJourneyItem[] {
  const publishedChapters = chapters.filter(
    (chapter) => chapter.hasPublishedContent,
  );
  const completedPublishedCount = publishedChapters.filter(
    (chapter) => chapter.status === "completed",
  ).length;
  const allPublishedChaptersCompleted =
    publishedChapters.length > 0 &&
    completedPublishedCount === publishedChapters.length;

  return chapters.map((chapter) => {
    const unlocked = isChapterUnlocked(chapter, chapters, {
      allPublishedChaptersCompleted,
      preAssessmentCompleted,
    });
    return {
      ...chapter,
      isUnlocked: unlocked,
      isLocked: !unlocked,
    };
  });
}
