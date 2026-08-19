import type { MediaRepository } from "@/lib/data/types";
import { mockMediaStore } from "@/lib/data/mock/media-store";
import type { MediaAsset } from "@/types/media";
import type {
  AdminMediaAssetDetail,
  AdminMediaAssetListItem,
  CreateMediaAssetInput,
  MediaListFilters,
  UpdateMediaAssetInput,
} from "@/types/media-management";

export class MockMediaRepository implements MediaRepository {
  async listMediaAssets(
    filters?: MediaListFilters,
  ): Promise<AdminMediaAssetListItem[]> {
    return mockMediaStore.list(filters);
  }

  async getMediaAsset(mediaId: string): Promise<AdminMediaAssetDetail | null> {
    return mockMediaStore.get(mediaId);
  }

  async countByKind(kind: MediaAsset["kind"]): Promise<number> {
    return mockMediaStore.countByKind(kind);
  }

  async createMediaAsset(
    input: CreateMediaAssetInput,
    storagePath: string | null,
  ): Promise<AdminMediaAssetDetail> {
    return mockMediaStore.create(input, storagePath);
  }

  async updateMediaAsset(
    mediaId: string,
    input: UpdateMediaAssetInput,
  ): Promise<AdminMediaAssetDetail> {
    return mockMediaStore.update(mediaId, input);
  }

  async deleteMediaAsset(mediaId: string): Promise<void> {
    mockMediaStore.delete(mediaId);
  }

  async assignMediaToSection(
    mediaId: string,
    chapterSlug: string,
    sectionId: string,
  ): Promise<AdminMediaAssetDetail> {
    return mockMediaStore.assignToSection(mediaId, chapterSlug, sectionId);
  }

  async unlinkMediaFromSection(mediaId: string): Promise<AdminMediaAssetDetail> {
    return mockMediaStore.unlinkFromSection(mediaId);
  }

  async listMediaForChapter(chapterSlug: string): Promise<MediaAsset[]> {
    return mockMediaStore
      .list({ chapterSlug })
      .map((item) => {
        const detail = mockMediaStore.get(item.id);
        return {
          id: item.id,
          kind: item.kind,
          storagePath: detail?.storagePath ?? null,
          altText: detail?.altText ?? null,
          caption: detail?.description ?? null,
          title: item.title,
          durationSeconds: detail?.durationSeconds ?? null,
          reviewStatus: item.reviewStatus,
        };
      });
  }
}
