import type {
  AdminAnalyticsSummary,
  AnalyticsFilters,
  AssessmentAnalyticsMetrics,
  AssessmentParticipationStatus,
  ParticipationOverview,
} from "@/types/admin-analytics";

import type {
  AnalyticsAttemptRecord,
  AnalyticsProgressRecord,
  AnalyticsRawData,
} from "@/lib/analytics/raw-data";

function parseDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isWithinDateRange(
  value: string | null,
  dateFrom?: string,
  dateTo?: string,
): boolean {
  const date = parseDate(value);
  if (!date) {
    return false;
  }

  const from = parseDate(dateFrom);
  const to = parseDate(dateTo);

  if (from && date < from) {
    return false;
  }
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (date > end) {
      return false;
    }
  }

  return true;
}

function applyFilters(
  raw: AnalyticsRawData,
  filters: AnalyticsFilters,
): AnalyticsRawData {
  let progress = raw.progress;
  let attempts = raw.attempts;
  let answers = raw.answers;
  let questions = raw.questions;

  if (filters.chapterId) {
    progress = progress.filter((row) => row.chapterId === filters.chapterId);
  }

  if (filters.dateFrom || filters.dateTo) {
    progress = progress.filter((row) =>
      isWithinDateRange(row.updatedAt, filters.dateFrom, filters.dateTo),
    );
    attempts = attempts.filter((row) =>
      isWithinDateRange(row.completedAt, filters.dateFrom, filters.dateTo),
    );
  }

  if (filters.assessmentType && filters.assessmentType !== "all") {
    attempts = attempts.filter(
      (row) => row.assessmentType === filters.assessmentType,
    );
    questions = questions.filter(
      (row) => row.assessmentType === filters.assessmentType,
    );
  }

  const attemptIds = new Set(attempts.map((attempt) => attempt.id));
  answers = answers.filter((answer) => attemptIds.has(answer.attemptId));

  return {
    ...raw,
    progress,
    attempts,
    answers,
    questions,
  };
}

function learnerLabel(id: string, displayName: string | null): string {
  // Guest sessions store First+Last on profiles.display_name (no email).
  if (displayName?.trim()) {
    return displayName.trim();
  }
  return `Learner ${id.slice(0, 8)}`;
}

function completedAttempts(attempts: AnalyticsAttemptRecord[]): AnalyticsAttemptRecord[] {
  return attempts.filter(
    (attempt) => attempt.completedAt !== null && attempt.score !== null,
  );
}

function averageScore(attempts: AnalyticsAttemptRecord[]): number | null {
  const scores = completedAttempts(attempts)
    .map((attempt) => attempt.score)
    .filter((score): score is number => score !== null);

  if (scores.length === 0) {
    return null;
  }

  const total = scores.reduce((sum, score) => sum + score, 0);
  return Math.round((total / scores.length) * 10) / 10;
}

function buildAssessmentMetrics(
  type: "pre" | "post",
  raw: AnalyticsRawData,
): AssessmentAnalyticsMetrics {
  const assessmentAttempts = raw.attempts.filter(
    (attempt) => attempt.assessmentType === type,
  );
  const completed = completedAttempts(assessmentAttempts);
  const scores = completed
    .map((attempt) => attempt.score)
    .filter((score): score is number => score !== null);

  const title =
    completed[0]?.assessmentTitle ??
    assessmentAttempts[0]?.assessmentTitle ??
    (type === "pre" ? "Pre-Assessment" : "Post-Assessment");

  return {
    assessmentType: type,
    assessmentTitle: title,
    totalAttempts: assessmentAttempts.length,
    completedAttempts: completed.length,
    averageScore: averageScore(assessmentAttempts),
    highestScore: scores.length ? Math.max(...scores) : null,
    lowestScore: scores.length ? Math.min(...scores) : null,
  };
}

function buildComparison(
  raw: AnalyticsRawData,
): AdminAnalyticsSummary["assessments"]["comparison"] {
  const preByLearner = new Map<string, number>();
  const postByLearner = new Map<string, number>();

  const sortedAttempts = [...completedAttempts(raw.attempts)].sort((left, right) => {
    const leftTime = parseDate(left.completedAt)?.getTime() ?? 0;
    const rightTime = parseDate(right.completedAt)?.getTime() ?? 0;
    return rightTime - leftTime;
  });

  for (const attempt of sortedAttempts) {
    if (attempt.score === null) {
      continue;
    }
    if (attempt.assessmentType === "pre" && !preByLearner.has(attempt.learnerId)) {
      preByLearner.set(attempt.learnerId, attempt.score);
    }
    if (attempt.assessmentType === "post" && !postByLearner.has(attempt.learnerId)) {
      postByLearner.set(attempt.learnerId, attempt.score);
    }
  }

  let pairedCount = 0;
  let preOnlyCount = 0;
  let postOnlyCount = 0;
  const pairedDifferences: number[] = [];

  for (const [learnerId, preScore] of preByLearner) {
    const postScore = postByLearner.get(learnerId);
    if (postScore !== undefined) {
      pairedCount += 1;
      pairedDifferences.push(postScore - preScore);
    } else {
      preOnlyCount += 1;
    }
  }

  for (const learnerId of postByLearner.keys()) {
    if (!preByLearner.has(learnerId)) {
      postOnlyCount += 1;
    }
  }

  const preAverage = averageScore(
    raw.attempts.filter((attempt) => attempt.assessmentType === "pre"),
  );
  const postAverage = averageScore(
    raw.attempts.filter((attempt) => attempt.assessmentType === "post"),
  );

  const scoreDifference =
    pairedDifferences.length > 0
      ? Math.round(
          (pairedDifferences.reduce((sum, value) => sum + value, 0) /
            pairedDifferences.length) *
            10,
        ) / 10
      : null;

  return {
    preAverageScore: preAverage,
    postAverageScore: postAverage,
    scoreDifference,
    pairedLearnerCount: pairedCount,
    preOnlyCount,
    postOnlyCount,
  };
}

function buildQuestionAnalytics(raw: AnalyticsRawData) {
  const answersByQuestion = new Map<
    string,
    { correct: number; total: number }
  >();

  for (const answer of raw.answers) {
    const current = answersByQuestion.get(answer.questionId) ?? {
      correct: 0,
      total: 0,
    };
    current.total += 1;
    if (answer.isCorrect) {
      current.correct += 1;
    }
    answersByQuestion.set(answer.questionId, current);
  }

  return raw.questions.map((question) => {
    const stats = answersByQuestion.get(question.id) ?? {
      correct: 0,
      total: 0,
    };
    const incorrect = stats.total - stats.correct;

    return {
      questionId: question.id,
      assessmentType: question.assessmentType,
      assessmentTitle: question.assessmentTitle,
      prompt: question.prompt,
      responseCount: stats.total,
      correctCount: stats.correct,
      incorrectCount: incorrect,
      correctPercentage:
        stats.total > 0
          ? Math.round((stats.correct / stats.total) * 1000) / 10
          : null,
    };
  });
}

function buildDropOffs(
  chapters: AnalyticsRawData["chapters"],
  progress: AnalyticsProgressRecord[],
): AdminAnalyticsSummary["dropOffs"] {
  const completedByChapter = new Map<string, number>();

  for (const chapter of chapters) {
    const completedLearners = new Set(
      progress
        .filter(
          (row) => row.chapterId === chapter.id && row.completedAt !== null,
        )
        .map((row) => row.learnerId),
    );
    completedByChapter.set(chapter.id, completedLearners.size);
  }

  const insights: AdminAnalyticsSummary["dropOffs"] = [];

  for (let index = 1; index < chapters.length; index += 1) {
    const current = chapters[index];
    const previous = chapters[index - 1];
    const currentCount = completedByChapter.get(current.id) ?? 0;
    const previousCount = completedByChapter.get(previous.id) ?? 0;

    if (previousCount > 0 && currentCount < previousCount) {
      insights.push({
        chapterId: current.id,
        chapterNumber: current.number,
        title: current.title,
        completedLearners: currentCount,
        previousChapterCompletedLearners: previousCount,
        message: `Chapter ${current.number} (${current.title}) has fewer completed learners (${currentCount}) than Chapter ${previous.number} (${previous.title}) (${previousCount}).`,
      });
    }
  }

  return insights;
}

export function buildParticipationOverview(
  raw: AnalyticsRawData,
): ParticipationOverview {
  const learnersStarted = new Set(raw.progress.map((row) => row.learnerId)).size;
  const preAttempts = completedAttempts(
    raw.attempts.filter((attempt) => attempt.assessmentType === "pre"),
  ).length;
  const postAttempts = completedAttempts(
    raw.attempts.filter((attempt) => attempt.assessmentType === "post"),
  ).length;

  return {
    totalLearners: raw.learners.length,
    learnersStarted,
    preAssessmentAttempts: preAttempts,
    postAssessmentAttempts: postAttempts,
    totalCompletedChapterRecords: raw.progress.filter(
      (row) => row.completedAt !== null,
    ).length,
  };
}

export function buildAnalyticsSummary(
  raw: AnalyticsRawData,
  filters: AnalyticsFilters = {},
): AdminAnalyticsSummary {
  const filtered = applyFilters(raw, filters);
  const catalogChapters = [...filtered.chapters].sort(
    (a, b) => a.number - b.number,
  );
  const totalChapters = catalogChapters.length;

  const startedByChapter = new Map<string, Set<string>>();
  const completedByChapter = new Map<string, Set<string>>();

  for (const row of filtered.progress) {
    if (!startedByChapter.has(row.chapterId)) {
      startedByChapter.set(row.chapterId, new Set());
    }
    startedByChapter.get(row.chapterId)!.add(row.learnerId);

    if (row.completedAt) {
      if (!completedByChapter.has(row.chapterId)) {
        completedByChapter.set(row.chapterId, new Set());
      }
      completedByChapter.get(row.chapterId)!.add(row.learnerId);
    }
  }

  const chapters: AdminAnalyticsSummary["chapters"] = catalogChapters.map(
    (chapter) => {
      const started = startedByChapter.get(chapter.id)?.size ?? 0;
      const completed = completedByChapter.get(chapter.id)?.size ?? 0;

      return {
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        title: chapter.title,
        startedLearners: started,
        completedLearners: completed,
        completionRate:
          started > 0 ? Math.round((completed / started) * 1000) / 10 : null,
      };
    },
  );

  const learnerMap = new Map(
    filtered.learners.map((learner) => [learner.id, learner]),
  );

  const progressByLearner = new Map<string, AnalyticsProgressRecord[]>();
  for (const row of filtered.progress) {
    const list = progressByLearner.get(row.learnerId) ?? [];
    list.push(row);
    progressByLearner.set(row.learnerId, list);
  }

  const preCompletedLearners = new Set(
    completedAttempts(
      filtered.attempts.filter((attempt) => attempt.assessmentType === "pre"),
    ).map((attempt) => attempt.learnerId),
  );
  const postCompletedLearners = new Set(
    completedAttempts(
      filtered.attempts.filter((attempt) => attempt.assessmentType === "post"),
    ).map((attempt) => attempt.learnerId),
  );

  const learnerIds = new Set<string>([
    ...filtered.learners.map((learner) => learner.id),
    ...filtered.progress.map((row) => row.learnerId),
    ...filtered.attempts.map((attempt) => attempt.learnerId),
  ]);

  const learners: AdminAnalyticsSummary["learners"] = [...learnerIds]
    .map((learnerId) => {
      const profile = learnerMap.get(learnerId);
      const rows = progressByLearner.get(learnerId) ?? [];
      const chaptersCompleted = rows.filter((row) => row.completedAt).length;
      const inProgress = rows
        .filter((row) => !row.completedAt)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

      const currentChapterSlug = inProgress[0]?.chapterSlug ?? null;
      const currentChapter = currentChapterSlug
        ? catalogChapters.find((chapter) => chapter.slug === currentChapterSlug)
        : null;

      return {
        learnerId,
        displayLabel: learnerLabel(learnerId, profile?.displayName ?? null),
        chaptersCompleted,
        totalChapters,
        progressPercentage:
          totalChapters > 0
            ? Math.round((chaptersCompleted / totalChapters) * 1000) / 10
            : null,
        currentChapterTitle: currentChapter?.title ?? null,
        preAssessmentStatus: (preCompletedLearners.has(learnerId)
          ? "completed"
          : "not_started") as AssessmentParticipationStatus,
        postAssessmentStatus: (postCompletedLearners.has(learnerId)
          ? "completed"
          : "not_started") as AssessmentParticipationStatus,
      };
    })
    .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));

  const learnersCompletedAll =
    totalChapters > 0
      ? learners.filter((learner) => learner.chaptersCompleted >= totalChapters)
          .length
      : 0;

  const preMetrics = buildAssessmentMetrics("pre", filtered);
  const postMetrics = buildAssessmentMetrics("post", filtered);

  const overview: AdminAnalyticsSummary["overview"] = {
    totalLearners: filtered.learners.length,
    learnersStarted: new Set(filtered.progress.map((row) => row.learnerId)).size,
    learnersCompletedAllChapters: learnersCompletedAll,
    totalChapters,
    totalCompletedChapterRecords: filtered.progress.filter(
      (row) => row.completedAt !== null,
    ).length,
    preAssessmentAttempts: preMetrics.completedAttempts,
    postAssessmentAttempts: postMetrics.completedAttempts,
  };

  const hasActivityData =
    filtered.progress.length > 0 || completedAttempts(filtered.attempts).length > 0;

  const assessmentResults: AdminAnalyticsSummary["exportData"]["assessmentResults"] =
    completedAttempts(filtered.attempts).map((attempt) => ({
      learnerLabel: learnerLabel(
        attempt.learnerId,
        learnerMap.get(attempt.learnerId)?.displayName ?? null,
      ),
      assessmentTitle: attempt.assessmentTitle,
      assessmentType: attempt.assessmentType,
      score: attempt.score,
      completedAt: attempt.completedAt,
    }));

  return {
    overview,
    chapters,
    learners,
    assessments: {
      pre: preMetrics.completedAttempts > 0 || preMetrics.totalAttempts > 0 ? preMetrics : null,
      post:
        postMetrics.completedAttempts > 0 || postMetrics.totalAttempts > 0
          ? postMetrics
          : null,
      comparison:
        preMetrics.completedAttempts > 0 || postMetrics.completedAttempts > 0
          ? buildComparison(filtered)
          : null,
    },
    questions: buildQuestionAnalytics(filtered),
    dropOffs: buildDropOffs(catalogChapters, filtered.progress),
    exportData: { assessmentResults },
    hasActivityData,
    filters,
  };
}
