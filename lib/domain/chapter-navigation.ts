import { listChapterSummaries } from "@/lib/domain/chapters";
import { filterChaptersForLearnerNavigation } from "@/lib/domain/chapter-visibility";
import type { ChapterSummary } from "@/types/chapter";

export interface ChapterNavigation {
  current: ChapterSummary;
  previous: ChapterSummary | null;
  next: ChapterSummary | null;
  position: number;
  total: number;
}

export async function getChapterNavigation(
  chapterId: string,
): Promise<ChapterNavigation | null> {
  const allChapters = await listChapterSummaries();
  const chapters = filterChaptersForLearnerNavigation(allChapters);
  const index = chapters.findIndex((chapter) => chapter.id === chapterId);

  if (index === -1) {
    return null;
  }

  return {
    current: chapters[index],
    previous: index > 0 ? chapters[index - 1] : null,
    next: index < chapters.length - 1 ? chapters[index + 1] : null,
    position: index + 1,
    total: chapters.length,
  };
}
