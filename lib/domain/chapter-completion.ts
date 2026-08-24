import "server-only";

import { getChapterForEngine } from "@/lib/domain/chapters";

/**
 * Learners can complete a chapter when it has at least one approved section
 * (same filtered chapter payload used by the Chapter Engine).
 */
export async function assertChapterCompletable(chapterSlug: string): Promise<void> {
  const chapter = await getChapterForEngine(chapterSlug);

  if (!chapter) {
    throw new Error("Chapter not found.");
  }

  if (chapter.sections.length === 0) {
    throw new Error(
      "This chapter cannot be completed yet. Approved content has not been published.",
    );
  }
}
