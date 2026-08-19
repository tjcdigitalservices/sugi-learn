import { MockChapterManagementRepository } from "@/lib/data/mock/chapter-management-repository";
import { mockMediaStore } from "@/lib/data/mock/media-store";
import type { AdminDashboardRepository } from "@/lib/data/types";
import type { AdminDashboardSummary } from "@/types/admin-dashboard";
import type { ReviewStatus } from "@/types/review";

function countByStatus(
  chapters: readonly { reviewStatus: ReviewStatus; hasPublishedContent: boolean }[],
) {
  return {
    total: chapters.length,
    withPublishedContent: chapters.filter((c) => c.hasPublishedContent).length,
    pendingContent: chapters.filter((c) => !c.hasPublishedContent).length,
    approved: chapters.filter((c) => c.reviewStatus === "approved").length,
    forReview: chapters.filter((c) => c.reviewStatus === "for_review").length,
    draft: chapters.filter((c) => c.reviewStatus === "draft").length,
    needsRevision: chapters.filter((c) => c.reviewStatus === "needs_revision")
      .length,
  };
}

export class MockAdminDashboardRepository implements AdminDashboardRepository {
  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    const managementRepo = new MockChapterManagementRepository();
    const chapterList = await managementRepo.listChaptersForAdmin();

    return {
      chapters: countByStatus(chapterList),
      chapterList,
      mediaAssetCount: mockMediaStore.list().length,
      assessmentCount: 0,
      questionCount: 0,
      learnerCount: 0,
    };
  }
}
