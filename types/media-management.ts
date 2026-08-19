import type { MediaKind } from "@/types/media";
import type { ReviewStatus } from "@/types/review";

export interface AdminMediaAssetListItem {
  id: string;
  kind: MediaKind;
  title: string | null;
  chapterSlug: string | null;
  chapterTitle: string | null;
  sectionTitle: string | null;
  reviewStatus: ReviewStatus;
  hasFile: boolean;
  updatedAt: string;
}

export interface AdminMediaAssetDetail {
  id: string;
  kind: MediaKind;
  title: string | null;
  description: string | null;
  altText: string | null;
  storagePath: string | null;
  chapterSlug: string | null;
  chapterTitle: string | null;
  sectionId: string | null;
  sectionTitle: string | null;
  sourceReference: string | null;
  durationSeconds: number | null;
  reviewStatus: ReviewStatus;
  isReferenced: boolean;
  referenceSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaListFilters {
  query?: string;
  kind?: MediaKind | "all";
  reviewStatus?: ReviewStatus | "all";
  chapterSlug?: string | "all";
}

export interface CreateMediaAssetInput {
  id?: string;
  kind: MediaKind;
  title: string;
  description?: string | null;
  altText?: string | null;
  chapterSlug?: string | null;
  sectionId?: string | null;
  sourceReference?: string | null;
  reviewStatus?: ReviewStatus;
}

export interface UpdateMediaAssetInput {
  title?: string;
  description?: string | null;
  altText?: string | null;
  chapterSlug?: string | null;
  sectionId?: string | null;
  sourceReference?: string | null;
  durationSeconds?: number | null;
  reviewStatus?: ReviewStatus;
}

export interface MediaReferenceInfo {
  isReferenced: boolean;
  summary: string | null;
}

export type MediaManagementActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
