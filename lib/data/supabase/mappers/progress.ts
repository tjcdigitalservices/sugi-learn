import type { LearnerChapterProgressRow } from "@/types/database";
import type { ChapterProgressRecord, ChapterProgressStatus } from "@/types/progress";

export function mapChapterProgressRow(
  slug: string,
  row: Pick<
    LearnerChapterProgressRow,
    "started_at" | "completed_at" | "updated_at"
  >,
): ChapterProgressRecord {
  const status: ChapterProgressStatus = row.completed_at
    ? "completed"
    : "in_progress";

  return {
    chapterId: slug,
    status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  };
}

export function notStartedChapterProgress(chapterSlug: string): ChapterProgressRecord {
  return {
    chapterId: chapterSlug,
    status: "not_started",
    startedAt: null,
    completedAt: null,
    updatedAt: null,
  };
}
