"use server";

import { getChapterForEngine } from "@/lib/domain/chapters";
import type { Chapter } from "@/types/chapter";

/**
 * Prefetch a chapter for storybook page-turn presentation only.
 * Reuses getChapterForEngine — does not alter progress or unlock rules.
 */
export async function prefetchChapterForStorybook(
  chapterSlug: string,
): Promise<Chapter | null> {
  try {
    return await getChapterForEngine(chapterSlug);
  } catch {
    return null;
  }
}
