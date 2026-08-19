import type { MediaAssetRow } from "@/types/database";
import type { MediaAsset } from "@/types/media";
import type {
  AdminMediaAssetDetail,
  AdminMediaAssetListItem,
  MediaReferenceInfo,
} from "@/types/media-management";
import type { ReviewStatus } from "@/types/review";

function mapReviewStatus(status: string): ReviewStatus {
  return status as ReviewStatus;
}

export function mapMediaAsset(row: MediaAssetRow): MediaAsset {
  return {
    id: row.id,
    kind: row.kind,
    storagePath: row.storage_path,
    altText: row.alt_text,
    caption: row.caption,
    durationSeconds: row.duration_seconds,
    reviewStatus: mapReviewStatus(row.review_status),
    title: row.title,
  };
}

interface MediaRowContext {
  chapterSlug?: string | null;
  chapterTitle?: string | null;
  sectionTitle?: string | null;
  isReferenced?: boolean;
  referenceSummary?: string | null;
}

export function mapAdminMediaListItem(
  row: MediaAssetRow,
  context: MediaRowContext = {},
): AdminMediaAssetListItem {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    chapterSlug: context.chapterSlug ?? null,
    chapterTitle: context.chapterTitle ?? null,
    sectionTitle: context.sectionTitle ?? null,
    reviewStatus: mapReviewStatus(row.review_status),
    hasFile: Boolean(row.storage_path?.trim()),
    updatedAt: row.updated_at,
  };
}

export function mapAdminMediaDetail(
  row: MediaAssetRow,
  context: MediaRowContext = {},
): AdminMediaAssetDetail {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    description: row.caption,
    altText: row.alt_text,
    storagePath: row.storage_path,
    chapterSlug: context.chapterSlug ?? null,
    chapterTitle: context.chapterTitle ?? null,
    sectionId: row.section_id,
    sectionTitle: context.sectionTitle ?? null,
    sourceReference: row.source_reference ?? null,
    durationSeconds: row.duration_seconds,
    reviewStatus: mapReviewStatus(row.review_status),
    isReferenced: context.isReferenced ?? false,
    referenceSummary: context.referenceSummary ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function buildReferenceInfo(params: {
  sectionTitle?: string | null;
  characterNames?: string[];
}): MediaReferenceInfo {
  const parts: string[] = [];

  if (params.sectionTitle) {
    parts.push(`Section: ${params.sectionTitle}`);
  }

  if (params.characterNames?.length) {
    parts.push(`Characters: ${params.characterNames.join(", ")}`);
  }

  return {
    isReferenced: parts.length > 0,
    summary: parts.length > 0 ? parts.join(" · ") : null,
  };
}
