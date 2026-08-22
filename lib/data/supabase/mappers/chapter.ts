import type {
  Chapter,
  ChapterSection,
  ChapterSummary,
  Character,
  LearningPoint,
} from "@/types/chapter";
import type {
  ChapterRow,
  ChapterSectionRow,
  CharacterRow,
  LearningPointRow,
  MediaAssetRow,
} from "@/types/database";
import type { MediaAsset } from "@/types/media";
import type { ReviewStatus } from "@/types/review";
import { isPublishedReviewStatus } from "@/types/review";
import { resolveChapterCoverUrl } from "@/lib/chapter/cover";

function mapReviewStatus(status: string): ReviewStatus {
  return status as ReviewStatus;
}

export function mapChapterSummary(
  row: ChapterRow,
  approvedSectionCount: number,
  coverStoragePath: string | null = null,
): ChapterSummary {
  const coverMediaAssetId = row.cover_media_asset_id ?? null;
  return {
    id: row.slug,
    number: row.chapter_number,
    title: row.title,
    subtitle: row.subtitle,
    reviewStatus: mapReviewStatus(row.review_status),
    isActive: row.is_active ?? true,
    hasPublishedContent: approvedSectionCount > 0,
    coverMediaAssetId,
    coverUrl: resolveChapterCoverUrl({
      chapterNumber: row.chapter_number,
      chapterSlug: row.slug,
      coverStoragePath: coverMediaAssetId ? coverStoragePath : null,
    }),
  };
}

export function mapMediaAsset(row: MediaAssetRow): MediaAsset {
  return {
    id: row.id,
    kind: row.kind,
    storagePath: row.storage_path,
    altText: row.alt_text,
    caption: row.caption,
    title: row.title,
    durationSeconds: row.duration_seconds,
    reviewStatus: mapReviewStatus(row.review_status),
  };
}

export function mapCharacter(row: CharacterRow): Character {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    mediaAssetId: row.media_asset_id,
    reviewStatus: mapReviewStatus(row.review_status),
  };
}

export function mapLearningPoint(row: LearningPointRow): LearningPoint {
  return {
    id: row.id,
    title: row.title,
    text: row.description,
    reviewStatus: mapReviewStatus(row.review_status),
  };
}

interface SectionMappingContext {
  sectionCharacterIds: Map<string, string[]>;
  sectionLearningPointIds: Map<string, string[]>;
}

export function mapChapterSection(
  row: ChapterSectionRow,
  context: SectionMappingContext,
): ChapterSection {
  const base = {
    id: row.id,
    kind: row.kind,
    title: row.title,
    sortOrder: row.sort_order,
    reviewStatus: mapReviewStatus(row.review_status),
  };

  switch (row.kind) {
    case "introduction":
    case "story":
    case "cultural_context":
    case "activity":
      return {
        ...base,
        kind: row.kind,
        body: row.body_text ?? "",
      };
    case "characters":
      return {
        ...base,
        kind: "characters",
        characterIds: context.sectionCharacterIds.get(row.id) ?? [],
      };
    case "illustration":
      return {
        ...base,
        kind: "illustration",
        mediaAssetId: row.media_asset_id ?? "",
      };
    case "audio":
      return {
        ...base,
        kind: "audio",
        mediaAssetId: row.media_asset_id ?? "",
        transcript: row.transcript,
      };
    case "animation":
      return {
        ...base,
        kind: "animation",
        mediaAssetId: row.media_asset_id ?? "",
      };
    case "learning_points":
      return {
        ...base,
        kind: "learning_points",
        learningPointIds: context.sectionLearningPointIds.get(row.id) ?? [],
      };
    case "completion":
      return {
        ...base,
        kind: "completion",
        message: row.completion_message,
      };
    default: {
      const exhaustive: never = row.kind;
      throw new Error(`Unsupported section kind: ${exhaustive}`);
    }
  }
}

export function mapChapterRecord(params: {
  chapter: ChapterRow;
  sections: ChapterSectionRow[];
  media: MediaAssetRow[];
  characters: CharacterRow[];
  learningPoints: LearningPointRow[];
  sectionCharacterIds: Map<string, string[]>;
  sectionLearningPointIds: Map<string, string[]>;
  coverStoragePath?: string | null;
}): Chapter {
  const approvedSectionCount = params.sections.filter((section) =>
    isPublishedReviewStatus(mapReviewStatus(section.review_status)),
  ).length;

  const coverId = params.chapter.cover_media_asset_id ?? null;
  const coverFromMedia =
    coverId != null
      ? (params.media.find((asset) => asset.id === coverId)?.storage_path ??
        params.coverStoragePath ??
        null)
      : null;

  const summary = mapChapterSummary(
    params.chapter,
    approvedSectionCount,
    coverFromMedia,
  );
  const context: SectionMappingContext = {
    sectionCharacterIds: params.sectionCharacterIds,
    sectionLearningPointIds: params.sectionLearningPointIds,
  };

  return {
    ...summary,
    summary: params.chapter.summary,
    sections: params.sections.map((section) =>
      mapChapterSection(section, context),
    ),
    characters: params.characters.map(mapCharacter),
    learningPoints: params.learningPoints.map(mapLearningPoint),
    media: params.media.map(mapMediaAsset),
    assessmentReferences: [],
  };
}
