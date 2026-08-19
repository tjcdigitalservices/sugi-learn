import { buildAnalyticsSummary } from "@/lib/analytics/aggregations";
import type { AdminAnalyticsRepository } from "@/lib/data/admin-analytics-types";
import { MockChapterManagementRepository } from "@/lib/data/mock/chapter-management-repository";
import {
  exportMockAttemptAnswersForAnalytics,
  exportMockAttemptsForAnalytics,
  exportMockQuestionsForAnalytics,
} from "@/lib/data/mock/assessment-repository";
import { exportMockProgressForAnalytics } from "@/lib/data/mock/progress-repository";
import type { AnalyticsFilters } from "@/types/admin-analytics";

export class MockAdminAnalyticsRepository implements AdminAnalyticsRepository {
  async getAnalyticsSummary(filters: AnalyticsFilters = {}) {
    const progress = exportMockProgressForAnalytics();
    const attempts = exportMockAttemptsForAnalytics();
    const managementRepo = new MockChapterManagementRepository();
    const chapterList = await managementRepo.listChaptersForAdmin();

    const learnerIds = new Set<string>([
      ...progress.map((row) => row.learnerId),
      ...attempts.map((attempt) => attempt.learnerId),
    ]);

    const raw = {
      chapters: chapterList
        .filter((chapter) => chapter.number > 0)
        .map((chapter) => ({
          id: chapter.id,
          slug: chapter.id,
          number: chapter.number,
          title: chapter.title,
        })),
      learners: [...learnerIds].map((id) => ({
        id,
        displayName: id === "mock-learner" ? "Mock Learner" : null,
      })),
      progress: progress.map((row) => ({
        learnerId: row.learnerId,
        chapterId: row.chapterSlug,
        chapterSlug: row.chapterSlug,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        updatedAt: row.updatedAt,
      })),
      attempts,
      answers: exportMockAttemptAnswersForAnalytics(),
      questions: exportMockQuestionsForAnalytics(),
    };

    return buildAnalyticsSummary(raw, filters);
  }
}
