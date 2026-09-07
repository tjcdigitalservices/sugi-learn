import type {
  ChapterSection,
  LearningPoint,
} from "@/types/chapter";
import type { ReviewStatus } from "@/types/review";

import {
  getCharacterId,
  registerChapterCharacters,
} from "@/lib/content/suguidanon/character-registry";
import type { ChapterContentDefinition } from "@/lib/content/suguidanon/types";
import type { Character } from "@/types/chapter";

const DEFAULT_SECTION_STATUS: ReviewStatus = "draft";

export interface BuiltChapterContent {
  title: string;
  subtitle: string | null;
  summary: string | null;
  reviewStatus: ReviewStatus;
  sections: ChapterSection[];
  characterOrder: string[];
  learningPoints: LearningPoint[];
}

/**
 * Default chapter structure: Animation / Video.
 * Characters and other kinds can be added later in admin.
 */
export function buildChapterContent(
  definition: ChapterContentDefinition,
  characterRegistry: Character[],
): BuiltChapterContent {
  const characterOrder = registerChapterCharacters(
    characterRegistry,
    definition.characters,
    DEFAULT_SECTION_STATUS,
  );

  const sections: ChapterSection[] = [
    {
      id: `${definition.id}-section-animation`,
      kind: "animation",
      title: "Animation / Video",
      sortOrder: 0,
      reviewStatus: DEFAULT_SECTION_STATUS,
      mediaAssetId: "",
    },
  ];

  return {
    title: definition.metadata.title,
    subtitle: definition.metadata.subtitle,
    summary: definition.metadata.summary,
    reviewStatus: definition.metadata.reviewStatus,
    sections,
    characterOrder,
    // Learning points are no longer part of the chapter product surface.
    learningPoints: [],
  };
}

export function getCharacterIdsForSlugs(slugs: string[]): string[] {
  return slugs.map((slug) => getCharacterId(slug));
}
