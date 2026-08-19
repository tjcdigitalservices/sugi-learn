import type { AdminAnalyticsSummary, AnalyticsFilters } from "@/types/admin-analytics";

export interface AdminAnalyticsRepository {
  getAnalyticsSummary(filters?: AnalyticsFilters): Promise<AdminAnalyticsSummary>;
}
