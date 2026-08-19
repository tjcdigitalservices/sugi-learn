import { getRepositories } from "@/lib/data";
import { filterChapterForLearner } from "@/lib/domain/chapter-publication";
import type { Chapter, ChapterSummary } from "@/types/chapter";

export async function listChapterSummaries(): Promise<ChapterSummary[]> {
  return getRepositories().chapters.listChapters();
}

export async function getChapterById(
  chapterId: string,
): Promise<Chapter | null> {
  return getRepositories().chapters.getChapterById(chapterId);
}

export async function getChapterForEngine(
  chapterId: string,
): Promise<Chapter | null> {
  const chapter = await getChapterById(chapterId);

  if (!chapter) {
    return null;
  }

  const sorted = {
    ...chapter,
    sections: [...chapter.sections].sort((a, b) => a.sortOrder - b.sortOrder),
  };

  return filterChapterForLearner(sorted);
}
