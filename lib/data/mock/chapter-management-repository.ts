import { randomUUID } from "node:crypto";

import { CHAPTER_CATALOG } from "@/lib/constants/chapters";
import {
  bootstrapSugidanonChapter,
  isSugidanonChapterInitialized,
  isSugidanonExpansionChapter,
  markSugidanonChapterInitialized,
} from "@/lib/content/sugidanon/mock-bootstrap";
import {
  buildTikumKadlumMockBootstrap,
  isTikumKadlumChapter1Initialized,
  markTikumKadlumChapter1Initialized,
  registerTikumKadlumCharacters,
  TIKUM_KADLUM_ID,
} from "@/lib/content/tikum-kadlum/mock-bootstrap";
import {
  getMockMediaAssets,
  mockMediaStore,
  setMockSectionMediaLink,
} from "@/lib/data/mock/media-store";
import type { ChapterManagementRepository } from "@/lib/data/types";
import type {
  Chapter,
  ChapterSection,
  Character,
  LearningPoint,
} from "@/types/chapter";
import type {
  AdminChapterListItem,
  CreateChapterInput,
  CreateLearningPointInput,
  CreateSectionInput,
  UpdateChapterMetadataInput,
  UpdateLearningPointInput,
  UpdateSectionInput,
} from "@/types/chapter-management";
import type { ReviewStatus } from "@/types/review";
import {
  ensureUniqueChapterSlug,
  slugifyChapterTitle,
} from "@/lib/chapter-management/slug";

interface MutableChapterState {
  title: string;
  subtitle: string | null;
  reviewStatus: ReviewStatus;
  summary: string | null;
  sections: ChapterSection[];
  characterOrder: string[];
  learningPoints: LearningPoint[];
  updatedAt: string;
}

const chapterState = new Map<string, MutableChapterState>();
const allCharacters: Character[] = [];
const dynamicChapterMeta = new Map<
  string,
  { number: number; isActive: boolean; dbId: string }
>();

function getKnownChapterIds(): string[] {
  return [
    ...CHAPTER_CATALOG.map((chapter) => chapter.id),
    ...dynamicChapterMeta.keys(),
  ];
}

function getCatalogEntry(chapterId: string) {
  const catalog = CHAPTER_CATALOG.find((chapter) => chapter.id === chapterId);
  if (catalog) {
    return catalog;
  }
  if (dynamicChapterMeta.has(chapterId)) {
    const state = chapterState.get(chapterId);
    const meta = dynamicChapterMeta.get(chapterId)!;
    return {
      id: chapterId,
      number: meta.number,
      title: state?.title ?? chapterId,
      subtitle: state?.subtitle ?? null,
      reviewStatus: state?.reviewStatus ?? ("draft" as ReviewStatus),
      isActive: meta.isActive,
      hasPublishedContent: false,
    };
  }
  throw new Error("Chapter not found.");
}

function ensureChapterState(chapterId: string): MutableChapterState {
  getCatalogEntry(chapterId);

  if (chapterId === TIKUM_KADLUM_ID && !isTikumKadlumChapter1Initialized()) {
    registerTikumKadlumCharacters(allCharacters);
    const bootstrap = buildTikumKadlumMockBootstrap();
    chapterState.set(TIKUM_KADLUM_ID, {
      title: bootstrap.title,
      subtitle: bootstrap.subtitle,
      reviewStatus: bootstrap.reviewStatus,
      summary: bootstrap.summary,
      sections: bootstrap.sections,
      characterOrder: bootstrap.characterOrder,
      learningPoints: bootstrap.learningPoints,
      updatedAt: new Date().toISOString(),
    });
    markTikumKadlumChapter1Initialized();
  }

  if (
    isSugidanonExpansionChapter(chapterId) &&
    !isSugidanonChapterInitialized(chapterId)
  ) {
    const bootstrap = bootstrapSugidanonChapter(chapterId, allCharacters);
    if (bootstrap) {
      chapterState.set(chapterId, {
        title: bootstrap.title,
        subtitle: bootstrap.subtitle,
        reviewStatus: bootstrap.reviewStatus,
        summary: bootstrap.summary,
        sections: bootstrap.sections,
        characterOrder: bootstrap.characterOrder,
        learningPoints: bootstrap.learningPoints,
        updatedAt: new Date().toISOString(),
      });
      markSugidanonChapterInitialized(chapterId);
    }
  }

  if (!chapterState.has(chapterId)) {
    const catalog = getCatalogEntry(chapterId);
    chapterState.set(chapterId, {
      title: catalog.title,
      subtitle: catalog.subtitle,
      reviewStatus: catalog.reviewStatus,
      summary: null,
      sections: [],
      characterOrder: [],
      learningPoints: [],
      updatedAt: new Date().toISOString(),
    });
  }

  return chapterState.get(chapterId)!;
}

function buildChapterRecord(chapterId: string): Chapter {
  const catalog = getCatalogEntry(chapterId);
  const state = ensureChapterState(chapterId);
  const approvedSectionCount = state.sections.filter(
    (section) => section.reviewStatus === "approved",
  ).length;

  return {
    id: catalog.id,
    number: catalog.number,
    title: state.title,
    subtitle: state.subtitle,
    reviewStatus: state.reviewStatus,
    isActive: dynamicChapterMeta.get(chapterId)?.isActive ?? catalog.isActive ?? true,
    hasPublishedContent: approvedSectionCount > 0,
    summary: state.summary,
    sections: [...state.sections].sort((a, b) => a.sortOrder - b.sortOrder),
    characters: state.characterOrder
      .map((id) => allCharacters.find((character) => character.id === id))
      .filter((character): character is Character => Boolean(character)),
    learningPoints: [...state.learningPoints],
    media: getMockMediaAssets().filter(
      (asset) =>
        mockMediaStoreGetChapterSlug(asset.id) === chapterId ||
        state.sections.some(
          (section) =>
            "mediaAssetId" in section &&
            section.mediaAssetId === asset.id,
        ),
    ),
    assessmentReferences: [],
  };
}

function mockMediaStoreGetChapterSlug(mediaId: string): string | null {
  const detail = mockMediaStore.get(mediaId);
  return detail?.chapterSlug ?? null;
}

function createSectionFromInput(
  sortOrder: number,
  input: CreateSectionInput,
): ChapterSection {
  const base = {
    id: randomUUID(),
    kind: input.kind,
    title: input.title.trim(),
    sortOrder,
    reviewStatus: (input.reviewStatus ?? "draft") as ReviewStatus,
  };

  switch (input.kind) {
    case "introduction":
    case "story":
    case "cultural_context":
    case "activity":
      return { ...base, kind: input.kind, body: input.body ?? "" };
    case "characters":
      return {
        ...base,
        kind: "characters",
        characterIds: input.characterIds ?? [],
      };
    case "illustration":
      return { ...base, kind: "illustration", mediaAssetId: "" };
    case "audio":
      return {
        ...base,
        kind: "audio",
        mediaAssetId: "",
        transcript: input.transcript ?? null,
      };
    case "animation":
      return { ...base, kind: "animation", mediaAssetId: "" };
    case "learning_points":
      return {
        ...base,
        kind: "learning_points",
        learningPointIds: input.learningPointIds ?? [],
      };
    case "completion":
      return {
        ...base,
        kind: "completion",
        message: input.completionMessage ?? null,
      };
    default: {
      const exhaustive: never = input.kind;
      throw new Error(`Unsupported section kind: ${exhaustive}`);
    }
  }
}

function applySectionUpdate(
  section: ChapterSection,
  input: UpdateSectionInput,
): ChapterSection {
  const next = {
    ...section,
    title: input.title !== undefined ? input.title.trim() : section.title,
    reviewStatus:
      input.reviewStatus !== undefined ? input.reviewStatus : section.reviewStatus,
  };

  switch (section.kind) {
    case "introduction":
    case "story":
    case "cultural_context":
    case "activity":
      return {
        ...next,
        kind: section.kind,
        body: input.body !== undefined ? input.body : section.body,
      };
    case "audio":
      return {
        ...next,
        kind: "audio",
        mediaAssetId:
          input.mediaAssetId !== undefined
            ? input.mediaAssetId ?? ""
            : section.mediaAssetId,
        transcript:
          input.transcript !== undefined ? input.transcript : section.transcript,
      };
    case "characters":
      return {
        ...next,
        kind: "characters",
        characterIds:
          input.characterIds !== undefined
            ? input.characterIds
            : section.characterIds,
      };
    case "learning_points":
      return {
        ...next,
        kind: "learning_points",
        learningPointIds:
          input.learningPointIds !== undefined
            ? input.learningPointIds
            : section.learningPointIds,
      };
    case "completion":
      return {
        ...next,
        kind: "completion",
        message:
          input.completionMessage !== undefined
            ? input.completionMessage
            : section.message,
      };
    case "illustration":
      return {
        ...next,
        kind: "illustration",
        mediaAssetId:
          input.mediaAssetId !== undefined
            ? input.mediaAssetId ?? ""
            : section.mediaAssetId,
      };
    case "animation":
      return {
        ...next,
        kind: "animation",
        mediaAssetId:
          input.mediaAssetId !== undefined
            ? input.mediaAssetId ?? ""
            : section.mediaAssetId,
      };
    default: {
      const exhaustive: never = section;
      throw new Error(`Unsupported section: ${String(exhaustive)}`);
    }
  }
}

export class MockChapterManagementRepository
  implements ChapterManagementRepository
{
  async listChaptersForAdmin(): Promise<AdminChapterListItem[]> {
    const entries = getKnownChapterIds().map((chapterId) => getCatalogEntry(chapterId));

    return entries
      .sort((a, b) => a.number - b.number)
      .map((chapter) => {
        const state = ensureChapterState(chapter.id);
        const approvedSectionCount = state.sections.filter(
          (section) => section.reviewStatus === "approved",
        ).length;
        const meta = dynamicChapterMeta.get(chapter.id);

        return {
          id: chapter.id,
          number: chapter.number,
          title: state.title,
          subtitle: state.subtitle,
          reviewStatus: state.reviewStatus,
          isActive: meta?.isActive ?? chapter.isActive ?? true,
          hasPublishedContent: approvedSectionCount > 0,
          updatedAt: state.updatedAt,
          sectionCount: state.sections.length,
          dbId: meta?.dbId ?? chapter.id,
        };
      });
  }

  async getChapterForAdmin(chapterId: string): Promise<Chapter | null> {
    if (!getKnownChapterIds().includes(chapterId)) {
      return null;
    }
    return buildChapterRecord(chapterId);
  }

  async updateChapterMetadata(
    chapterId: string,
    input: UpdateChapterMetadataInput,
  ): Promise<Chapter> {
    const state = ensureChapterState(chapterId);
    state.title = input.title.trim();
    state.subtitle = input.subtitle;
    state.summary = input.summary;
    state.reviewStatus = input.reviewStatus;
    state.updatedAt = new Date().toISOString();
    return buildChapterRecord(chapterId);
  }

  async createSection(
    chapterId: string,
    input: CreateSectionInput,
  ): Promise<ChapterSection> {
    const state = ensureChapterState(chapterId);
    const section = createSectionFromInput(state.sections.length, input);
    state.sections.push(section);
    state.updatedAt = new Date().toISOString();
    return section;
  }

  async updateSection(
    chapterId: string,
    sectionId: string,
    input: UpdateSectionInput,
  ): Promise<ChapterSection> {
    const state = ensureChapterState(chapterId);
    const index = state.sections.findIndex((section) => section.id === sectionId);
    if (index === -1) {
      throw new Error("Section not found.");
    }

    const updated = applySectionUpdate(state.sections[index], input);
    state.sections[index] = updated;
    if (
      (updated.kind === "illustration" ||
        updated.kind === "audio" ||
        updated.kind === "animation") &&
      input.mediaAssetId !== undefined
    ) {
      setMockSectionMediaLink(sectionId, input.mediaAssetId || null);
      if (input.mediaAssetId) {
        mockMediaStore.assignToSection(
          input.mediaAssetId,
          chapterId,
          sectionId,
        );
      }
    }
    state.updatedAt = new Date().toISOString();
    return updated;
  }

  async deleteSection(chapterId: string, sectionId: string): Promise<void> {
    const state = ensureChapterState(chapterId);
    state.sections = state.sections
      .filter((section) => section.id !== sectionId)
      .map((section, index) => ({ ...section, sortOrder: index }));
    state.updatedAt = new Date().toISOString();
  }

  async reorderSections(chapterId: string, sectionIds: string[]): Promise<void> {
    const state = ensureChapterState(chapterId);
    const map = new Map(state.sections.map((section) => [section.id, section]));
    state.sections = sectionIds.map((id, index) => {
      const section = map.get(id);
      if (!section) {
        throw new Error("Invalid section order.");
      }
      return { ...section, sortOrder: index };
    });
    state.updatedAt = new Date().toISOString();
  }

  async listAllCharacters(): Promise<Character[]> {
    return [...allCharacters];
  }

  async associateCharacter(
    chapterId: string,
    characterId: string,
  ): Promise<void> {
    const state = ensureChapterState(chapterId);
    const character = allCharacters.find((item) => item.id === characterId);
    if (!character) {
      throw new Error("Character not found.");
    }
    if (!state.characterOrder.includes(characterId)) {
      state.characterOrder.push(characterId);
      state.updatedAt = new Date().toISOString();
    }
  }

  async removeCharacterAssociation(
    chapterId: string,
    characterId: string,
  ): Promise<void> {
    const state = ensureChapterState(chapterId);
    state.characterOrder = state.characterOrder.filter((id) => id !== characterId);
    state.updatedAt = new Date().toISOString();
  }

  async reorderChapterCharacters(
    chapterId: string,
    characterIds: string[],
  ): Promise<void> {
    const state = ensureChapterState(chapterId);
    if (characterIds.length !== state.characterOrder.length) {
      throw new Error("Invalid character order.");
    }
    state.characterOrder = characterIds;
    state.updatedAt = new Date().toISOString();
  }

  async createLearningPoint(
    chapterId: string,
    input: CreateLearningPointInput,
  ): Promise<LearningPoint> {
    const state = ensureChapterState(chapterId);
    const point: LearningPoint = {
      id: randomUUID(),
      title: input.title?.trim() || null,
      text: input.description.trim(),
      reviewStatus: input.reviewStatus ?? "draft",
    };
    state.learningPoints.push(point);
    state.updatedAt = new Date().toISOString();
    return point;
  }

  async updateLearningPoint(
    chapterId: string,
    learningPointId: string,
    input: UpdateLearningPointInput,
  ): Promise<LearningPoint> {
    const state = ensureChapterState(chapterId);
    const index = state.learningPoints.findIndex(
      (point) => point.id === learningPointId,
    );
    if (index === -1) {
      throw new Error("Learning point not found.");
    }

    const current = state.learningPoints[index];
    const updated: LearningPoint = {
      ...current,
      title: input.title !== undefined ? input.title?.trim() || null : current.title,
      text:
        input.description !== undefined
          ? input.description.trim()
          : current.text,
      reviewStatus:
        input.reviewStatus !== undefined
          ? input.reviewStatus
          : current.reviewStatus,
    };
    state.learningPoints[index] = updated;
    state.updatedAt = new Date().toISOString();
    return updated;
  }

  async deleteLearningPoint(
    chapterId: string,
    learningPointId: string,
  ): Promise<void> {
    const state = ensureChapterState(chapterId);
    state.learningPoints = state.learningPoints.filter(
      (point) => point.id !== learningPointId,
    );
    state.updatedAt = new Date().toISOString();
  }

  async reorderLearningPoints(
    chapterId: string,
    learningPointIds: string[],
  ): Promise<void> {
    const state = ensureChapterState(chapterId);
    const map = new Map(
      state.learningPoints.map((point) => [point.id, point]),
    );
    state.learningPoints = learningPointIds.map((id) => {
      const point = map.get(id);
      if (!point) {
        throw new Error("Invalid learning point order.");
      }
      return point;
    });
    state.updatedAt = new Date().toISOString();
  }

  async createChapter(input: CreateChapterInput): Promise<Chapter> {
    const title = input.title.trim();
    if (!title) {
      throw new Error("Chapter title is required.");
    }

    const slugs = new Set(getKnownChapterIds());
    const slug = ensureUniqueChapterSlug(slugifyChapterTitle(title), slugs);
    const maxNumber = Math.max(
      0,
      ...getKnownChapterIds().map((id) => getCatalogEntry(id).number),
    );

    dynamicChapterMeta.set(slug, {
      number: maxNumber + 1,
      isActive: true,
      dbId: randomUUID(),
    });

    chapterState.set(slug, {
      title,
      subtitle: input.subtitle?.trim() || null,
      reviewStatus: "draft",
      summary: input.summary?.trim() || null,
      sections: [],
      characterOrder: [],
      learningPoints: [],
      updatedAt: new Date().toISOString(),
    });

    return buildChapterRecord(slug);
  }

  async reorderChapters(orderedChapterSlugs: string[]): Promise<void> {
    const known = getKnownChapterIds();
    if (
      orderedChapterSlugs.length !== known.length ||
      orderedChapterSlugs.some((slug) => !known.includes(slug))
    ) {
      throw new Error("Invalid chapter order.");
    }

    orderedChapterSlugs.forEach((slug, index) => {
      const meta = dynamicChapterMeta.get(slug);
      if (meta) {
        dynamicChapterMeta.set(slug, { ...meta, number: index + 1 });
      }
    });
  }

  async setChapterActive(
    chapterId: string,
    isActive: boolean,
  ): Promise<Chapter> {
    const meta = dynamicChapterMeta.get(chapterId);
    if (meta) {
      dynamicChapterMeta.set(chapterId, { ...meta, isActive });
    } else if (!CHAPTER_CATALOG.some((chapter) => chapter.id === chapterId)) {
      throw new Error("Chapter not found.");
    }

    return buildChapterRecord(chapterId);
  }
}
