import { randomUUID } from "node:crypto";

import type { MediaAsset } from "@/types/media";
import type {
  AdminMediaAssetDetail,
  AdminMediaAssetListItem,
  CreateMediaAssetInput,
  MediaListFilters,
  UpdateMediaAssetInput,
} from "@/types/media-management";
import type { ReviewStatus } from "@/types/review";

import { CHAPTER_CATALOG } from "@/lib/constants/chapters";

interface MutableMediaAsset {
  id: string;
  kind: MediaAsset["kind"];
  title: string | null;
  description: string | null;
  altText: string | null;
  storagePath: string | null;
  chapterSlug: string | null;
  sectionId: string | null;
  sourceReference: string | null;
  durationSeconds: number | null;
  reviewStatus: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

const mediaAssets = new Map<string, MutableMediaAsset>();

/** Section ID → media asset ID for reference tracking. */
const sectionMediaLinks = new Map<string, string>();

export function getMockMediaAssets(): MediaAsset[] {
  return Array.from(mediaAssets.values()).map((asset) => ({
    id: asset.id,
    kind: asset.kind,
    storagePath: asset.storagePath,
    altText: asset.altText,
    caption: asset.description,
    title: asset.title,
    durationSeconds: asset.durationSeconds,
    reviewStatus: asset.reviewStatus,
  }));
}

export function getMockMediaAssetsForChapter(chapterSlug: string): MediaAsset[] {
  return getMockMediaAssets().filter(
    (asset) =>
      mediaAssets.get(asset.id)?.chapterSlug === chapterSlug ||
      mediaAssets.get(asset.id)?.sectionId !== null,
  );
}

export function getMockMediaAssetById(mediaId: string): MediaAsset | undefined {
  const asset = mediaAssets.get(mediaId);
  if (!asset) {
    return undefined;
  }

  return {
    id: asset.id,
    kind: asset.kind,
    storagePath: asset.storagePath,
    altText: asset.altText,
    caption: asset.description,
    title: asset.title,
    durationSeconds: asset.durationSeconds,
    reviewStatus: asset.reviewStatus,
  };
}

export function setMockSectionMediaLink(
  sectionId: string,
  mediaAssetId: string | null,
): void {
  if (!mediaAssetId) {
    sectionMediaLinks.delete(sectionId);
    return;
  }
  sectionMediaLinks.set(sectionId, mediaAssetId);
}

export function getMockSectionMediaLink(sectionId: string): string | null {
  return sectionMediaLinks.get(sectionId) ?? null;
}

function chapterTitleForSlug(slug: string | null): string | null {
  if (!slug) {
    return null;
  }
  return CHAPTER_CATALOG.find((chapter) => chapter.id === slug)?.title ?? null;
}

function matchesFilters(asset: MutableMediaAsset, filters?: MediaListFilters): boolean {
  if (!filters) {
    return true;
  }

  if (filters.kind && filters.kind !== "all" && asset.kind !== filters.kind) {
    return false;
  }

  if (
    filters.reviewStatus &&
    filters.reviewStatus !== "all" &&
    asset.reviewStatus !== filters.reviewStatus
  ) {
    return false;
  }

  if (
    filters.chapterSlug &&
    filters.chapterSlug !== "all" &&
    asset.chapterSlug !== filters.chapterSlug
  ) {
    return false;
  }

  if (filters.query?.trim()) {
    const query = filters.query.trim().toLowerCase();
    const haystack = [
      asset.title,
      asset.description,
      asset.sourceReference,
      asset.chapterSlug,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) {
      return false;
    }
  }

  return true;
}

function buildReferenceSummary(asset: MutableMediaAsset): string | null {
  const parts: string[] = [];
  if (asset.sectionId) {
    parts.push(`Linked to section ${asset.sectionId}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

function toListItem(asset: MutableMediaAsset): AdminMediaAssetListItem {
  return {
    id: asset.id,
    kind: asset.kind,
    title: asset.title,
    chapterSlug: asset.chapterSlug,
    chapterTitle: chapterTitleForSlug(asset.chapterSlug),
    sectionTitle: asset.sectionId ? "Linked section" : null,
    reviewStatus: asset.reviewStatus,
    hasFile: Boolean(asset.storagePath?.trim()),
    updatedAt: asset.updatedAt,
  };
}

function toDetail(asset: MutableMediaAsset): AdminMediaAssetDetail {
  const referenceSummary = buildReferenceSummary(asset);
  return {
    id: asset.id,
    kind: asset.kind,
    title: asset.title,
    description: asset.description,
    altText: asset.altText,
    storagePath: asset.storagePath,
    chapterSlug: asset.chapterSlug,
    chapterTitle: chapterTitleForSlug(asset.chapterSlug),
    sectionId: asset.sectionId,
    sectionTitle: asset.sectionId ? "Linked section" : null,
    sourceReference: asset.sourceReference,
    durationSeconds: asset.durationSeconds,
    reviewStatus: asset.reviewStatus,
    isReferenced: Boolean(asset.sectionId),
    referenceSummary,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
}

export const mockMediaStore = {
  list(filters?: MediaListFilters): AdminMediaAssetListItem[] {
    return Array.from(mediaAssets.values())
      .filter((asset) => matchesFilters(asset, filters))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(toListItem);
  },

  get(mediaId: string): AdminMediaAssetDetail | null {
    const asset = mediaAssets.get(mediaId);
    return asset ? toDetail(asset) : null;
  },

  countByKind(kind: MediaAsset["kind"]): number {
    return Array.from(mediaAssets.values()).filter((asset) => asset.kind === kind)
      .length;
  },

  create(
    input: CreateMediaAssetInput,
    storagePath: string | null,
  ): AdminMediaAssetDetail {
    const now = new Date().toISOString();
    const asset: MutableMediaAsset = {
      id: input.id ?? randomUUID(),
      kind: input.kind,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      altText: input.altText?.trim() || null,
      storagePath,
      chapterSlug: input.chapterSlug ?? null,
      sectionId: input.sectionId ?? null,
      sourceReference: input.sourceReference?.trim() || null,
      durationSeconds: null,
      reviewStatus: input.reviewStatus ?? "draft",
      createdAt: now,
      updatedAt: now,
    };

    mediaAssets.set(asset.id, asset);

    if (asset.sectionId) {
      sectionMediaLinks.set(asset.sectionId, asset.id);
    }

    return toDetail(asset);
  },

  update(mediaId: string, input: UpdateMediaAssetInput): AdminMediaAssetDetail {
    const asset = mediaAssets.get(mediaId);
    if (!asset) {
      throw new Error("Media asset not found.");
    }

    if (input.title !== undefined) {
      asset.title = input.title.trim();
    }
    if (input.description !== undefined) {
      asset.description = input.description?.trim() || null;
    }
    if (input.altText !== undefined) {
      asset.altText = input.altText?.trim() || null;
    }
    if (input.chapterSlug !== undefined) {
      asset.chapterSlug = input.chapterSlug;
    }
    if (input.sectionId !== undefined) {
      if (asset.sectionId) {
        sectionMediaLinks.delete(asset.sectionId);
      }
      asset.sectionId = input.sectionId;
      if (asset.sectionId) {
        sectionMediaLinks.set(asset.sectionId, asset.id);
      }
    }
    if (input.sourceReference !== undefined) {
      asset.sourceReference = input.sourceReference?.trim() || null;
    }
    if (input.durationSeconds !== undefined) {
      asset.durationSeconds = input.durationSeconds;
    }
    if (input.reviewStatus !== undefined) {
      asset.reviewStatus = input.reviewStatus;
    }

    asset.updatedAt = new Date().toISOString();
    return toDetail(asset);
  },

  delete(mediaId: string): void {
    const asset = mediaAssets.get(mediaId);
    if (!asset) {
      throw new Error("Media asset not found.");
    }

    if (asset.sectionId) {
      throw new Error(
        "This asset is linked to a chapter section. Unlink it before deleting.",
      );
    }

    mediaAssets.delete(mediaId);
  },

  assignToSection(
    mediaId: string,
    chapterSlug: string,
    sectionId: string,
  ): AdminMediaAssetDetail {
    const asset = mediaAssets.get(mediaId);
    if (!asset) {
      throw new Error("Media asset not found.");
    }

    if (asset.sectionId && asset.sectionId !== sectionId) {
      sectionMediaLinks.delete(asset.sectionId);
    }

    asset.chapterSlug = chapterSlug;
    asset.sectionId = sectionId;
    asset.updatedAt = new Date().toISOString();
    sectionMediaLinks.set(sectionId, mediaId);

    return toDetail(asset);
  },

  unlinkFromSection(mediaId: string): AdminMediaAssetDetail {
    const asset = mediaAssets.get(mediaId);
    if (!asset) {
      throw new Error("Media asset not found.");
    }

    if (asset.sectionId) {
      sectionMediaLinks.delete(asset.sectionId);
      asset.sectionId = null;
      asset.updatedAt = new Date().toISOString();
    }

    return toDetail(asset);
  },
};

export function resetMockMediaStoreForTests(): void {
  mediaAssets.clear();
  sectionMediaLinks.clear();
}
