import "server-only";

import { getRepositories } from "@/lib/data";
import type {
  AdminAnalyticsSummary,
  AnalyticsFilters,
  AssessmentResultExportRow,
  ParticipationOverview,
} from "@/types/admin-analytics";

type LatestScore = { score: number; completedAt: number };

/**
 * Latest COMPLETED score per learner label and assessment type.
 * Rows without a score or without completedAt are ignored, so unfinished
 * attempts never produce a score.
 */
function buildLatestScoreMap(
  rows: AssessmentResultExportRow[],
): Map<string, LatestScore> {
  const latest = new Map<string, LatestScore>();

  for (const row of rows) {
    if (row.score === null || !row.completedAt) continue;

    const parsed = Date.parse(row.completedAt);
    if (Number.isNaN(parsed)) continue;

    const key = `${row.learnerLabel}::${row.assessmentType}`;
    const existing = latest.get(key);

    if (!existing || parsed >= existing.completedAt) {
      latest.set(key, { score: row.score, completedAt: parsed });
    }
  }

  return latest;
}

export async function getAdminAnalyticsSummary(
  filters: AnalyticsFilters = {},
): Promise<AdminAnalyticsSummary> {
  const summary =
    await getRepositories().adminAnalytics.getAnalyticsSummary(filters);

  const latestScores = buildLatestScoreMap(summary.exportData.assessmentResults);

  const learners = summary.learners.map((learner) => {
    const preFromExport =
      learner.preAssessmentStatus === "completed"
        ? (latestScores.get(`${learner.displayLabel}::pre`)?.score ?? null)
        : null;
    const postFromExport =
      learner.postAssessmentStatus === "completed"
        ? (latestScores.get(`${learner.displayLabel}::post`)?.score ?? null)
        : null;

    return {
      ...learner,
      preAssessmentScore:
        learner.preAssessmentStatus === "completed"
          ? (learner.preAssessmentScore ?? preFromExport)
          : null,
      postAssessmentScore:
        learner.postAssessmentStatus === "completed"
          ? (learner.postAssessmentScore ?? postFromExport)
          : null,
    };
  });

  return { ...summary, learners };
}

export async function getParticipationOverview(): Promise<ParticipationOverview> {
  const summary = await getAdminAnalyticsSummary();
  const { overview } = summary;

  return {
    totalLearners: overview.totalLearners,
    learnersStarted: overview.learnersStarted,
    preAssessmentAttempts: overview.preAssessmentAttempts,
    postAssessmentAttempts: overview.postAssessmentAttempts,
    totalCompletedChapterRecords: overview.totalCompletedChapterRecords,
  };
}
