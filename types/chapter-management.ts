import type { ChapterSectionKind, ChapterSummary } from "@/types/chapter";
import type { ReviewStatus } from "@/types/review";

export interface AdminChapterListItem extends ChapterSummary {
  updatedAt: string;
  sectionCount: number;
  dbId: string;
}

export interface CreateChapterInput {
  title: string;
  subtitle?: string | null;
  summary?: string | null;
}

export interface UpdateChapterMetadataInput {
  title: string;
  subtitle: string | null;
  summary: string | null;
  reviewStatus: ReviewStatus;
}

export interface CreateSectionInput {
  kind: ChapterSectionKind;
  title: string;
  reviewStatus?: ReviewStatus;
  body?: string;
  transcript?: string | null;
  completionMessage?: string | null;
  characterIds?: string[];
  learningPointIds?: string[];
}

export interface UpdateSectionInput {
  title?: string;
  reviewStatus?: ReviewStatus;
  body?: string;
  transcript?: string | null;
  completionMessage?: string | null;
  characterIds?: string[];
  learningPointIds?: string[];
  mediaAssetId?: string | null;
}

export interface CreateLearningPointInput {
  title?: string | null;
  description: string;
  reviewStatus?: ReviewStatus;
}

export interface UpdateLearningPointInput {
  title?: string | null;
  description?: string;
  reviewStatus?: ReviewStatus;
}

export type ChapterManagementActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
