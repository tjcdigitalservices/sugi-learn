import type { ProgressRepository } from "@/lib/data/types";
import type { ChapterProgressRecord } from "@/types/progress";

const progressStore = new Map<string, ChapterProgressRecord>();

export function exportMockProgressForAnalytics(): Array<{
  learnerId: string;
  chapterSlug: string;
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
}> {
  const rows: Array<{
    learnerId: string;
    chapterSlug: string;
    startedAt: string;
    completedAt: string | null;
    updatedAt: string;
  }> = [];

  for (const [key, record] of progressStore.entries()) {
    const separator = key.indexOf(":");
    if (separator === -1) {
      continue;
    }
    rows.push({
      learnerId: key.slice(0, separator),
      chapterSlug: key.slice(separator + 1),
      startedAt: record.startedAt ?? record.updatedAt ?? new Date().toISOString(),
      completedAt: record.completedAt,
      updatedAt: record.updatedAt ?? new Date().toISOString(),
    });
  }

  return rows;
}

function storageKey(learnerId: string, chapterSlug: string): string {
  return `${learnerId}:${chapterSlug}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export class MockProgressRepository implements ProgressRepository {
  async listChapterProgress(learnerId: string): Promise<ChapterProgressRecord[]> {
    const prefix = `${learnerId}:`;
    return [...progressStore.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .map(([, value]) => value);
  }

  async getChapterProgress(
    learnerId: string,
    chapterSlug: string,
  ): Promise<ChapterProgressRecord | null> {
    return progressStore.get(storageKey(learnerId, chapterSlug)) ?? null;
  }

  async startChapter(
    learnerId: string,
    chapterSlug: string,
  ): Promise<ChapterProgressRecord> {
    const key = storageKey(learnerId, chapterSlug);
    const existing = progressStore.get(key);
    if (existing) {
      return existing;
    }

    const timestamp = nowIso();
    const record: ChapterProgressRecord = {
      chapterId: chapterSlug,
      status: "in_progress",
      startedAt: timestamp,
      completedAt: null,
      updatedAt: timestamp,
    };
    progressStore.set(key, record);
    return record;
  }

  async completeChapter(
    learnerId: string,
    chapterSlug: string,
  ): Promise<ChapterProgressRecord> {
    const key = storageKey(learnerId, chapterSlug);
    let record = progressStore.get(key);
    if (!record) {
      record = await this.startChapter(learnerId, chapterSlug);
    }

    const completed: ChapterProgressRecord = {
      ...record,
      status: "completed",
      completedAt: nowIso(),
      updatedAt: nowIso(),
    };
    progressStore.set(key, completed);
    return completed;
  }

  async getLearnerProgress(learnerId: string) {
    const records = await this.listChapterProgress(learnerId);
    if (!records.length) {
      return null;
    }

    const completedChapterIds = records
      .filter((record) => record.status === "completed")
      .map((record) => record.chapterId);

    const inProgress = records
      .filter((record) => record.status === "in_progress")
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));

    const lastActivity = records
      .map((record) => record.updatedAt)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null;

    return {
      learnerId,
      completedChapterIds,
      currentChapterId: inProgress[0]?.chapterId ?? null,
      preAssessmentCompleted: false,
      postAssessmentCompleted: false,
      lastActivityAt: lastActivity,
    };
  }
}
