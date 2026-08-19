/**
 * Chapter 1 media metadata — M12 integration layer.
 * Source boundary: docs/TIKUM_KADLUM_CHAPTER_1_SOURCE_MAP.md
 *
 * No illustration artwork is stored here. Records describe CMS/media-library
 * assets and their approval state. Client-approved artwork is uploaded separately.
 */

import type { MediaKind } from "@/types/media";
import type { ReviewStatus } from "@/types/review";

export interface Chapter1MediaRecord {
  id: string;
  kind: MediaKind;
  title: string;
  altText: string;
  caption: string | null;
  sourceReference: string;
  reviewStatus: ReviewStatus;
  /** Illustration section title this asset maps to */
  sectionTitle: string;
}

/** Primary Chapter 1 illustration slot — scene candidate from source map */
export const TIKUM_KADLUM_ILLUSTRATION_BAMBOO: Chapter1MediaRecord = {
  id: "d1000001-0001-4001-8001-000000000001",
  kind: "illustration",
  title: "Tikum Kadlum — The Unusual Bamboo",
  altText:
    "PENDING CLIENT APPROVAL — Alt text for the approved illustration of the unusual bamboo scene.",
  caption:
    "Scene candidate: Tikum Kadlum draws attention to the unusual bamboo tree (source summary).",
  sourceReference: "docs/TIKUM_KADLUM_CHAPTER_1_SOURCE_MAP.md",
  reviewStatus: "draft",
  sectionTitle: "Illustration: The Unusual Bamboo",
};

export const TIKUM_KADLUM_CHAPTER_1_MEDIA: readonly Chapter1MediaRecord[] = [
  TIKUM_KADLUM_ILLUSTRATION_BAMBOO,
];

/** M12 audit summary — no approved learner-visible media assets yet */
export const TIKUM_KADLUM_MEDIA_AUDIT = {
  illustrationCount: TIKUM_KADLUM_CHAPTER_1_MEDIA.filter(
    (item) => item.kind === "illustration",
  ).length,
  audioCount: 0,
  animationCount: 0,
  approvedCount: TIKUM_KADLUM_CHAPTER_1_MEDIA.filter(
    (item) => item.reviewStatus === "approved",
  ).length,
  draftCount: TIKUM_KADLUM_CHAPTER_1_MEDIA.filter(
    (item) => item.reviewStatus === "draft",
  ).length,
} as const;
