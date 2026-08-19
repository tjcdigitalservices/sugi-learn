import { CHAPTERS_BATCH_1 } from "@/lib/content/sugidanon/chapters/batch-1";
import { CHAPTERS_BATCH_2 } from "@/lib/content/sugidanon/chapters/batch-2";
import { CHAPTERS_BATCH_3 } from "@/lib/content/sugidanon/chapters/batch-3";
import { CHAPTERS_BATCH_4 } from "@/lib/content/sugidanon/chapters/batch-4";
import type { ChapterContentDefinition } from "@/lib/content/sugidanon/types";

export const CHAPTERS_2_13: ChapterContentDefinition[] = [
  ...CHAPTERS_BATCH_1,
  ...CHAPTERS_BATCH_2,
  ...CHAPTERS_BATCH_3,
  ...CHAPTERS_BATCH_4,
];

export function getChapterContentDefinition(
  chapterId: string,
): ChapterContentDefinition | undefined {
  return CHAPTERS_2_13.find((chapter) => chapter.id === chapterId);
}

export function getChapterContentDefinitionByNumber(
  number: number,
): ChapterContentDefinition | undefined {
  return CHAPTERS_2_13.find((chapter) => chapter.number === number);
}
