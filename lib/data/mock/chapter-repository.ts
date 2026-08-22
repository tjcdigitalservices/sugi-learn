import { MockChapterManagementRepository } from "@/lib/data/mock/chapter-management-repository";
import type { ChapterRepository } from "@/lib/data/types";
import { ARCHITECTURE_DEMO_CHAPTER } from "@/lib/data/mock/architecture-demo-chapter";
import { filterChapterForLearner } from "@/lib/domain/chapter-publication";
import type { Chapter, ChapterSummary } from "@/types/chapter";

import type { AdminChapterListItem } from "@/types/chapter-management";

/**
 * M1 mock repository — uses shared in-memory state from chapter management in M5.
 */
export class MockChapterRepository implements ChapterRepository {
  constructor(
    private readonly managementRepo: MockChapterManagementRepository = new MockChapterManagementRepository(),
  ) {}

  async listChapters(): Promise<ChapterSummary[]> {
    const items = await this.managementRepo.listChaptersForAdmin();
    return items.map((item: AdminChapterListItem) => ({
      id: item.id,
      number: item.number,
      title: item.title,
      subtitle: item.subtitle,
      reviewStatus: item.reviewStatus,
      isActive: item.isActive,
      hasPublishedContent: item.hasPublishedContent,
      coverMediaAssetId: item.coverMediaAssetId,
      coverUrl: item.coverUrl,
    }));
  }

  async getChapterById(chapterId: string): Promise<Chapter | null> {
    if (chapterId === ARCHITECTURE_DEMO_CHAPTER.id) {
      return ARCHITECTURE_DEMO_CHAPTER;
    }

    const chapter = await this.managementRepo.getChapterForAdmin(chapterId);
    if (!chapter) {
      return null;
    }

    return filterChapterForLearner(chapter);
  }
}
