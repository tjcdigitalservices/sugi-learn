import "server-only";

import { getRepositories } from "@/lib/data";
import type {
  AdminAnalyticsSummary,
  AnalyticsFilters,
  AssessmentResultExportRow,
  ParticipationOverview,
} from "@/types/admin-analytics";

type LatestScore = { score: number; completedAt: number };

/** Latest completed score per learner label and assessment type. */
function buildLatestScoreMap(
  rows: AssessmentResultExportRow[],
): Map<string, LatestScore> {
  const latest = new Map<string, LatestScore>();

  for (const row of rows) {
    if (row.score === null) continue;

    const key = `${row.learnerLabel}::${row.assessmentType}`;
    const parsed = row.completedAt ? Date.parse(row.completedAt) : 0;
    const time = Number.isNaN(parsed) ? 0 : parsed;
    const existing = latest.get(key);

    if (!existing || time >= existing.completedAt) {
      latest.set(key, { score: row.score, completedAt: time });
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

  const learners = summary.learners.map((learner) => ({
    ...learner,
    preAssessmentScore:
      learner.preAssessmentScore ??
      latestScores.get(`${learner.displayLabel}::pre`)?.score ??
      null,
    postAssessmentScore:
      learner.postAssessmentScore ??
      latestScores.get(`${learner.displayLabel}::post`)?.score ??
      null,
  }));

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
