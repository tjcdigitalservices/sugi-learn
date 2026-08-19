import {
  TIKUM_KADLUM_CHAPTER_METADATA,
  TIKUM_KADLUM_CHARACTERS,
  TIKUM_KADLUM_LEARNING_POINTS,
  TIKUM_KADLUM_SECTIONS,
} from "@/lib/content/tikum-kadlum/chapter-1";
import { TIKUM_KADLUM_ILLUSTRATION_BAMBOO } from "@/lib/content/tikum-kadlum/chapter-1-media";
import { mockMediaStore } from "@/lib/data/mock/media-store";
import type {
  ChapterSection,
  Character,
  LearningPoint,
} from "@/types/chapter";
import type { ReviewStatus } from "@/types/review";

export const TIKUM_KADLUM_ID = "tikum-kadlum";

let initialized = false;

const characterIds = new Map<string, string>();

export function getTikumKadlumCharacterId(slug: string): string {
  if (!characterIds.has(slug)) {
    characterIds.set(slug, `tk-char-${slug}`);
  }
  return characterIds.get(slug)!;
}

export interface TikumKadlumMockBootstrap {
  title: string;
  subtitle: string | null;
  summary: string | null;
  reviewStatus: ReviewStatus;
  sections: ChapterSection[];
  characters: Character[];
  characterOrder: string[];
  learningPoints: LearningPoint[];
}

export function buildTikumKadlumMockBootstrap(): TikumKadlumMockBootstrap {
  registerTikumKadlumMediaAssets();

  const characters: Character[] = TIKUM_KADLUM_CHARACTERS.map((entry) => ({
    id: getTikumKadlumCharacterId(entry.slug),
    name: entry.name,
    description: entry.description,
    mediaAssetId: null,
    reviewStatus: "approved",
  }));

  const learningPoints: LearningPoint[] = TIKUM_KADLUM_LEARNING_POINTS.map(
    (point, index) => ({
      id: `tk-lp-${index + 1}`,
      title: point.title,
      text: point.description,
      reviewStatus: "draft" as ReviewStatus,
    }),
  );

  const sections: ChapterSection[] = TIKUM_KADLUM_SECTIONS.map((section, index) => {
    const base = {
      id: `tk-section-${index + 1}`,
      kind: section.kind,
      title: section.title,
      sortOrder: index,
      reviewStatus: section.reviewStatus,
    };

    switch (section.kind) {
      case "introduction":
      case "story":
        return {
          ...base,
          kind: section.kind,
          body: "body" in section ? section.body : "",
        };
      case "characters":
        return {
          ...base,
          kind: "characters",
          characterIds: characters.map((character) => character.id),
        };
      case "illustration":
        return {
          ...base,
          kind: "illustration",
          mediaAssetId: TIKUM_KADLUM_ILLUSTRATION_BAMBOO.id,
        };
      case "learning_points":
        return {
          ...base,
          kind: "learning_points",
          learningPointIds: learningPoints.map((point) => point.id),
        };
      case "completion":
        return {
          ...base,
          kind: "completion",
          message: section.message,
        };
      default: {
        const exhaustive: never = section;
        throw new Error(`Unsupported section: ${exhaustive}`);
      }
    }
  });

  const illustrationSection = sections.find(
    (section) => section.kind === "illustration",
  );
  if (illustrationSection) {
    mockMediaStore.assignToSection(
      TIKUM_KADLUM_ILLUSTRATION_BAMBOO.id,
      TIKUM_KADLUM_ID,
      illustrationSection.id,
    );
  }

  return {
    title: TIKUM_KADLUM_CHAPTER_METADATA.title,
    subtitle: TIKUM_KADLUM_CHAPTER_METADATA.subtitle,
    summary: TIKUM_KADLUM_CHAPTER_METADATA.summary,
    reviewStatus: TIKUM_KADLUM_CHAPTER_METADATA.reviewStatus,
    sections,
    characters,
    characterOrder: characters.map((character) => character.id),
    learningPoints,
  };
}

export function isTikumKadlumChapter1Initialized(): boolean {
  return initialized;
}

export function markTikumKadlumChapter1Initialized(): void {
  initialized = true;
}

export function registerTikumKadlumCharacters(registry: Character[]): void {
  const bootstrap = buildTikumKadlumMockBootstrap();
  for (const character of bootstrap.characters) {
    if (!registry.some((item) => item.id === character.id)) {
      registry.push(character);
    }
  }
}

function registerTikumKadlumMediaAssets(): void {
  if (mockMediaStore.get(TIKUM_KADLUM_ILLUSTRATION_BAMBOO.id)) {
    return;
  }

  const record = TIKUM_KADLUM_ILLUSTRATION_BAMBOO;
  mockMediaStore.create(
    {
      id: record.id,
      kind: record.kind,
      title: record.title,
      description: record.caption,
      altText: record.altText,
      chapterSlug: TIKUM_KADLUM_ID,
      sourceReference: record.sourceReference,
      reviewStatus: record.reviewStatus,
    },
    null,
  );
}
