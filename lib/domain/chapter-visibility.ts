import type { ChapterSummary } from "@/types/chapter";
import type { ChapterProgressRecord } from "@/types/progress";

/** Chapters visible in learner navigation (active, or retained when learner has progress). */
export function filterChaptersForLearnerJourney(
  chapters: ChapterSummary[],
  progressRecords: ChapterProgressRecord[] = [],
): ChapterSummary[] {
  const progressChapterIds = new Set(
    progressRecords.map((record) => record.chapterId),
  );

  return chapters.filter(
    (chapter) =>
      chapter.number > 0 &&
      (chapter.isActive !== false || progressChapterIds.has(chapter.id)),
  );
}

/** Published chapters available for prev/next navigation. */
export function filterChaptersForLearnerNavigation(
  chapters: ChapterSummary[],
): ChapterSummary[] {
  return chapters.filter(
    (chapter) =>
      chapter.number > 0 &&
      chapter.isActive !== false &&
      chapter.hasPublishedContent,
  );
}
