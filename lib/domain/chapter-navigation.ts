import { listChapterSummaries } from "@/lib/domain/chapters";
import { filterChaptersForLearnerJourney } from "@/lib/domain/chapter-visibility";
import type { ChapterSummary } from "@/types/chapter";

export interface ChapterNavigation {
  current: ChapterSummary;
  previous: ChapterSummary | null;
  next: ChapterSummary | null;
  position: number;
  total: number;
}

/**
 * Prev/next and "Chapter N of M" use the full active journey catalog
 * (typically all 13 chapters), not only chapters with published content.
 */
export async function getChapterNavigation(
  chapterId: string,
): Promise<ChapterNavigation | null> {
  const allChapters = await listChapterSummaries();
  const chapters = filterChaptersForLearnerJourney(allChapters).sort(
    (a, b) => a.number - b.number,
  );
  const index = chapters.findIndex((chapter) => chapter.id === chapterId);

  if (index === -1) {
    return null;
  }

  const current = chapters[index];

  return {
    current,
    previous: index > 0 ? chapters[index - 1] : null,
    next: index < chapters.length - 1 ? chapters[index + 1] : null,
    position: current.number > 0 ? current.number : index + 1,
    total: chapters.length,
  };
}
