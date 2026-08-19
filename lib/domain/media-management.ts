import { getRepositories } from "@/lib/data";
import type { MediaAsset } from "@/types/media";
import type {
  AdminMediaAssetDetail,
  AdminMediaAssetListItem,
  CreateMediaAssetInput,
  MediaListFilters,
  UpdateMediaAssetInput,
} from "@/types/media-management";

export async function listMediaAssetsForAdmin(
  filters?: MediaListFilters,
): Promise<AdminMediaAssetListItem[]> {
  return getRepositories().media.listMediaAssets(filters);
}

export async function getMediaAssetForAdmin(
  mediaId: string,
): Promise<AdminMediaAssetDetail | null> {
  return getRepositories().media.getMediaAsset(mediaId);
}

export async function countMediaByKind(
  kind: MediaAsset["kind"],
): Promise<number> {
  return getRepositories().media.countByKind(kind);
}

export async function createMediaAssetRecord(
  input: CreateMediaAssetInput,
  storagePath: string | null,
): Promise<AdminMediaAssetDetail> {
  return getRepositories().media.createMediaAsset(input, storagePath);
}

export async function updateMediaAssetRecord(
  mediaId: string,
  input: UpdateMediaAssetInput,
): Promise<AdminMediaAssetDetail> {
  return getRepositories().media.updateMediaAsset(mediaId, input);
}

export async function deleteMediaAssetRecord(mediaId: string): Promise<void> {
  return getRepositories().media.deleteMediaAsset(mediaId);
}

export async function assignMediaToSectionRecord(
  mediaId: string,
  chapterSlug: string,
  sectionId: string,
): Promise<AdminMediaAssetDetail> {
  return getRepositories().media.assignMediaToSection(
    mediaId,
    chapterSlug,
    sectionId,
  );
}

export async function unlinkMediaFromSectionRecord(
  mediaId: string,
): Promise<AdminMediaAssetDetail> {
  return getRepositories().media.unlinkMediaFromSection(mediaId);
}

export async function listMediaForChapter(
  chapterSlug: string,
): Promise<MediaAsset[]> {
  return getRepositories().media.listMediaForChapter(chapterSlug);
}
