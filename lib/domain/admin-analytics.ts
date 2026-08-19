import "server-only";

import { getRepositories } from "@/lib/data";
import type {
  AdminAnalyticsSummary,
  AnalyticsFilters,
  ParticipationOverview,
} from "@/types/admin-analytics";

export async function getAdminAnalyticsSummary(
  filters: AnalyticsFilters = {},
): Promise<AdminAnalyticsSummary> {
  return getRepositories().adminAnalytics.getAnalyticsSummary(filters);
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
