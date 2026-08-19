import "server-only";

import { getChapterForEngine } from "@/lib/domain/chapters";

/**
 * Learners must have at least one approved animation section before
 * marking a chapter complete (learner UI is animation-only).
 */
export async function assertChapterCompletable(chapterSlug: string): Promise<void> {
  const chapter = await getChapterForEngine(chapterSlug);

  if (!chapter) {
    throw new Error("Chapter not found.");
  }

  const hasAnimation = chapter.sections.some(
    (section) => section.kind === "animation",
  );

  if (!hasAnimation) {
    throw new Error(
      "This chapter cannot be completed yet. An approved 2D animation is required before marking complete.",
    );
  }
}
