import { MockAdminAnalyticsRepository } from "@/lib/data/mock/admin-analytics-repository";
import { MockAdminDashboardRepository } from "@/lib/data/mock/admin-dashboard-repository";
import { MockAssessmentRepository } from "@/lib/data/mock/assessment-repository";
import { MockChapterManagementRepository } from "@/lib/data/mock/chapter-management-repository";
import { MockChapterRepository } from "@/lib/data/mock/chapter-repository";
import { MockMediaRepository } from "@/lib/data/mock/media-repository";
import { MockProgressRepository } from "@/lib/data/mock/progress-repository";
import { SupabaseAdminAnalyticsRepository } from "@/lib/data/supabase/admin-analytics-repository";
import { SupabaseAdminDashboardRepository } from "@/lib/data/supabase/admin-dashboard-repository";
import { SupabaseAssessmentRepository } from "@/lib/data/supabase/assessment-repository";
import { SupabaseChapterManagementRepository } from "@/lib/data/supabase/chapter-management-repository";
import { SupabaseChapterRepository } from "@/lib/data/supabase/chapter-repository";
import { SupabaseMediaRepository } from "@/lib/data/supabase/media-repository";
import { SupabaseProgressRepository } from "@/lib/data/supabase/progress-repository";
import type { DataRepositories } from "@/lib/data/types";
import { hasSupabaseConfig } from "@/lib/supabase/service";

let repositories: DataRepositories | null = null;

/**
 * Returns the active data-access layer.
 * Uses Supabase when public env vars are configured; otherwise falls back to mocks.
 */
export function getRepositories(): DataRepositories {
  if (!repositories) {
    if (hasSupabaseConfig()) {
      repositories = {
        chapters: new SupabaseChapterRepository(),
        chapterManagement: new SupabaseChapterManagementRepository(),
        assessments: new SupabaseAssessmentRepository(),
        progress: new SupabaseProgressRepository(),
        adminDashboard: new SupabaseAdminDashboardRepository(),
        adminAnalytics: new SupabaseAdminAnalyticsRepository(),
        media: new SupabaseMediaRepository(),
      };
    } else {
      const mockChapterManagement = new MockChapterManagementRepository();
      repositories = {
        chapters: new MockChapterRepository(mockChapterManagement),
        chapterManagement: mockChapterManagement,
        assessments: new MockAssessmentRepository(),
        progress: new MockProgressRepository(),
        adminDashboard: new MockAdminDashboardRepository(),
        adminAnalytics: new MockAdminAnalyticsRepository(),
        media: new MockMediaRepository(),
      };
    }
  }

  return repositories;
}

/** Test helper — reset singleton between test runs. */
export function resetRepositoriesForTests(): void {
  repositories = null;
}
