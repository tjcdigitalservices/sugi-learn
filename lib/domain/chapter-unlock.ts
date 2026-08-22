import type { ChapterJourneyItem } from "@/types/progress";

/**
 * Sequential unlock: after Pre-Test, Ch1 is open.
 * Chapter N unlocks when N-1 is completed.
 * When all chapters are completed, everything stays unlocked for replay.
 * Before Pre-Test, every chapter stays locked.
 */
export function isChapterUnlocked(
  chapter: Pick<ChapterJourneyItem, "number" | "id">,
  chapters: readonly Pick<
    ChapterJourneyItem,
    "number" | "id" | "completedAt" | "status"
  >[],
  options: {
    allChaptersCompleted: boolean;
    preAssessmentCompleted: boolean;
  },
): boolean {
  if (!options.preAssessmentCompleted) {
    return false;
  }

  if (options.allChaptersCompleted) {
    return true;
  }

  if (chapter.number <= 1) {
    return true;
  }

  const previous = chapters.find((item) => item.number === chapter.number - 1);
  if (!previous) {
    return false;
  }

  return previous.status === "completed" || Boolean(previous.completedAt);
}

export function withChapterUnlockState(
  chapters: ChapterJourneyItem[],
  preAssessmentCompleted: boolean,
): ChapterJourneyItem[] {
  const completedCount = chapters.filter(
    (chapter) => chapter.status === "completed",
  ).length;
  const allChaptersCompleted =
    chapters.length > 0 && completedCount === chapters.length;

  return chapters.map((chapter) => {
    const unlocked = isChapterUnlocked(chapter, chapters, {
      allChaptersCompleted,
      preAssessmentCompleted,
    });
    return {
      ...chapter,
      isUnlocked: unlocked,
      isLocked: !unlocked,
    };
  });
}
