import type {
  ChapterSection,
  LearningPoint,
} from "@/types/chapter";
import type { ReviewStatus } from "@/types/review";

import {
  getCharacterId,
  registerChapterCharacters,
} from "@/lib/content/sugidanon/character-registry";
import type { ChapterContentDefinition } from "@/lib/content/sugidanon/types";
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

function introductionBody(definition: ChapterContentDefinition): string {
  return `This chapter presents an educational summary adapted from the client-provided source document ${definition.metadata.title}: ${definition.metadata.subtitle} (${definition.metadata.authors}).

This material is a source-based summary for learning purposes. It is not the complete published epic text.

Source reference: docs/sources/Tikum-Kadlum-Sugidanon-Source.docx`;
}

export function buildChapterContent(
  definition: ChapterContentDefinition,
  characterRegistry: Character[],
): BuiltChapterContent {
  const characterOrder = registerChapterCharacters(
    characterRegistry,
    definition.characters,
    DEFAULT_SECTION_STATUS,
  );

  const learningPoints: LearningPoint[] = definition.learningPoints.map(
    (point, index) => ({
      id: `${definition.id}-lp-${index + 1}`,
      title: point.title,
      text: point.description,
      reviewStatus: "draft" as ReviewStatus,
    }),
  );

  const sections: ChapterSection[] = [];
  let sortOrder = 0;

  sections.push({
    id: `${definition.id}-section-intro`,
    kind: "introduction",
    title: "Chapter Introduction",
    sortOrder: sortOrder++,
    reviewStatus: DEFAULT_SECTION_STATUS,
    body: introductionBody(definition),
  });

  for (const story of definition.storySections) {
    sections.push({
      id: `${definition.id}-section-story-${sortOrder}`,
      kind: "story",
      title: story.title,
      sortOrder: sortOrder++,
      reviewStatus: DEFAULT_SECTION_STATUS,
      body: story.body,
    });
  }

  if (definition.illustration) {
    sections.push({
      id: `${definition.id}-section-illustration`,
      kind: "illustration",
      title: definition.illustration.title,
      sortOrder: sortOrder++,
      reviewStatus: DEFAULT_SECTION_STATUS,
      mediaAssetId: "",
    });
  }

  sections.push({
    id: `${definition.id}-section-characters`,
    kind: "characters",
    title: "Characters in This Chapter",
    sortOrder: sortOrder++,
    reviewStatus: DEFAULT_SECTION_STATUS,
    characterIds: characterOrder,
  });

  if (learningPoints.length > 0) {
    sections.push({
      id: `${definition.id}-section-learning-points`,
      kind: "learning_points",
      title: "Learning Points",
      sortOrder: sortOrder++,
      reviewStatus: "draft",
      learningPointIds: learningPoints.map((point) => point.id),
    });
  }

  sections.push({
    id: `${definition.id}-section-completion`,
    kind: "completion",
    title: "Chapter Complete",
    sortOrder: sortOrder++,
    reviewStatus: DEFAULT_SECTION_STATUS,
    message: definition.completionMessage,
  });

  return {
    title: definition.metadata.title,
    subtitle: definition.metadata.subtitle,
    summary: definition.metadata.summary,
    reviewStatus: definition.metadata.reviewStatus,
    sections,
    characterOrder,
    learningPoints,
  };
}

export function getCharacterIdsForSlugs(slugs: string[]): string[] {
  return slugs.map((slug) => getCharacterId(slug));
}
