import "server-only";

import { getCurrentAuth, requireUser } from "@/lib/auth/session";
import { assertChapterCompletable } from "@/lib/domain/chapter-completion";
import { withChapterUnlockState } from "@/lib/domain/chapter-unlock";
import { getRepositories } from "@/lib/data";
import { listChapterSummaries } from "@/lib/domain/chapters";
import { filterChaptersForLearnerJourney } from "@/lib/domain/chapter-visibility";
import { hasSupabaseConfig } from "@/lib/supabase/service";
import type {
  ChapterJourneyItem,
  ChapterProgressRecord,
  ChapterProgressStatus,
  LearnerJourneySummary,
} from "@/types/progress";
import type { ChapterSummary } from "@/types/chapter";

export const MOCK_LEARNER_ID = "mock-learner";

export async function getCurrentLearnerId(): Promise<string> {
  if (!hasSupabaseConfig()) {
    return MOCK_LEARNER_ID;
  }

  const auth = await requireUser();
  return auth.profile.id;
}

export async function getCurrentLearnerDisplayName(): Promise<string | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const auth = await getCurrentAuth();
  return auth?.profile.displayName ?? auth?.user.email ?? null;
}

function resolveStatus(
  chapterId: string,
  recordsByChapter: Map<string, ChapterProgressRecord>,
): ChapterProgressStatus {
  const record = recordsByChapter.get(chapterId);
  return record?.status ?? "not_started";
}

export function buildChapterJourneyItems(
  chapters: ChapterSummary[],
  records: ChapterProgressRecord[],
  preAssessmentCompleted = false,
): ChapterJourneyItem[] {
  const recordsByChapter = new Map(
    records.map((record) => [record.chapterId, record]),
  );

  const baseItems: ChapterJourneyItem[] = chapters.map((chapter) => {
    const record = recordsByChapter.get(chapter.id);
    return {
      id: chapter.id,
      number: chapter.number,
      title: chapter.title,
      subtitle: chapter.subtitle,
      hasPublishedContent: chapter.hasPublishedContent,
      status: resolveStatus(chapter.id, recordsByChapter),
      startedAt: record?.startedAt ?? null,
      completedAt: record?.completedAt ?? null,
      updatedAt: record?.updatedAt ?? null,
      coverUrl: chapter.coverUrl,
      isUnlocked: false,
      isLocked: true,
    };
  });

  return withChapterUnlockState(baseItems, preAssessmentCompleted);
}

export function resolveContinueChapterId(
  chapters: ChapterJourneyItem[],
): string | null {
  const catalogChapters = chapters.filter((chapter) => chapter.number > 0);
  if (catalogChapters.length === 0) {
    return null;
  }

  const unlockedIncomplete = catalogChapters.filter(
    (chapter) =>
      chapter.isUnlocked &&
      chapter.status !== "completed" &&
      chapter.hasPublishedContent,
  );

  const inProgress = unlockedIncomplete
    .filter((chapter) => chapter.status === "in_progress")
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));

  if (inProgress.length > 0) {
    return inProgress[0].id;
  }

  const notStarted = unlockedIncomplete.find(
    (chapter) => chapter.status === "not_started",
  );
  if (notStarted) {
    return notStarted.id;
  }

  return null;
}

export async function getLearnerJourneySummary(
  learnerId: string,
): Promise<LearnerJourneySummary> {
  const [chapters, records, aggregate, preAssessment, postAssessment] =
    await Promise.all([
      listChapterSummaries(),
      getRepositories().progress.listChapterProgress(learnerId),
      getRepositories().progress.getLearnerProgress(learnerId),
      getRepositories().assessments.getAssessmentByType("pre"),
      getRepositories().assessments.getAssessmentByType("post"),
    ]);

  const [preAttempt, postAttempt] = await Promise.all([
    preAssessment
      ? getRepositories().assessments.getCompletedAttempt(
          learnerId,
          preAssessment.id,
        )
      : Promise.resolve(null),
    postAssessment
      ? getRepositories().assessments.getCompletedAttempt(
          learnerId,
          postAssessment.id,
        )
      : Promise.resolve(null),
  ]);

  const catalogChapters = filterChaptersForLearnerJourney(chapters, records);
  const preAssessmentCompleted = Boolean(preAttempt);
  const journeyItems = buildChapterJourneyItems(
    catalogChapters,
    records,
    preAssessmentCompleted,
  );
  const completedCount = journeyItems.filter(
    (chapter) => chapter.status === "completed",
  ).length;

  return {
    learnerId,
    chapters: journeyItems,
    completedCount,
    totalChapters: journeyItems.length,
    inProgressCount: journeyItems.filter(
      (chapter) => chapter.status === "in_progress",
    ).length,
    continueChapterId: resolveContinueChapterId(journeyItems),
    allChaptersCompleted:
      journeyItems.length > 0 && completedCount === journeyItems.length,
    preAssessmentCompleted,
    postAssessmentCompleted: Boolean(postAttempt),
    lastActivityAt: aggregate?.lastActivityAt ?? null,
  };
}

export async function ensureChapterStarted(
  learnerId: string,
  chapterSlug: string,
): Promise<ChapterProgressRecord> {
  if (chapterSlug === "architecture-demo") {
    return {
      chapterId: chapterSlug,
      status: "in_progress",
      startedAt: new Date().toISOString(),
      completedAt: null,
      updatedAt: new Date().toISOString(),
    };
  }

  return getRepositories().progress.startChapter(learnerId, chapterSlug);
}

export async function completeChapterProgress(
  learnerId: string,
  chapterSlug: string,
): Promise<ChapterProgressRecord> {
  if (chapterSlug === "architecture-demo") {
    const timestamp = new Date().toISOString();
    return {
      chapterId: chapterSlug,
      status: "completed",
      startedAt: timestamp,
      completedAt: timestamp,
      updatedAt: timestamp,
    };
  }

  await assertChapterCompletable(chapterSlug);

  return getRepositories().progress.completeChapter(learnerId, chapterSlug);
}

export async function getChapterProgressForLearner(
  learnerId: string,
  chapterSlug: string,
): Promise<ChapterProgressRecord | null> {
  if (chapterSlug === "architecture-demo") {
    return null;
  }

  return getRepositories().progress.getChapterProgress(learnerId, chapterSlug);
}
