import type { ChapterSummary } from "@/types/chapter";

export interface ChapterStatusCounts {
  total: number;
  withPublishedContent: number;
  pendingContent: number;
  approved: number;
  forReview: number;
  draft: number;
  needsRevision: number;
}

export interface AdminDashboardSummary {
  chapters: ChapterStatusCounts;
  chapterList: ChapterSummary[];
  mediaAssetCount: number;
  assessmentCount: number;
  questionCount: number;
  learnerCount: number;
}
