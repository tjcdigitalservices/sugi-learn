import { buildChapterContent } from "@/lib/content/sugidanon/build-chapter-content";
import {
  CHAPTERS_2_13,
  getChapterContentDefinition,
} from "@/lib/content/sugidanon/chapters/index";
import type { Character } from "@/types/chapter";

const initializedChapters = new Set<string>();

export function isSugidanonChapterInitialized(chapterId: string): boolean {
  return initializedChapters.has(chapterId);
}

export function markSugidanonChapterInitialized(chapterId: string): void {
  initializedChapters.add(chapterId);
}

export function isSugidanonExpansionChapter(chapterId: string): boolean {
  return CHAPTERS_2_13.some((chapter) => chapter.id === chapterId);
}

export function bootstrapSugidanonChapter(
  chapterId: string,
  characterRegistry: Character[],
): ReturnType<typeof buildChapterContent> | null {
  const definition = getChapterContentDefinition(chapterId);
  if (!definition) {
    return null;
  }

  return buildChapterContent(definition, characterRegistry);
}

export function registerAllSugidanonCharacters(
  characterRegistry: Character[],
): void {
  for (const definition of CHAPTERS_2_13) {
    buildChapterContent(definition, characterRegistry);
  }
}

export function resetSugidanonBootstrapForTests(): void {
  initializedChapters.clear();
}
