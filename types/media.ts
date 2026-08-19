import type { ReviewStatus } from "@/types/review";

/** Supported media kinds within project scope (see AGENTS.md). */
export const MEDIA_KINDS = ["illustration", "audio", "animation"] as const;

export type MediaKind = (typeof MEDIA_KINDS)[number];

/** Reference to a stored media asset (Supabase Storage in M11+). */
export interface MediaAsset {
  id: string;
  kind: MediaKind;
  /** Storage path or public URL once uploaded. */
  storagePath: string | null;
  altText: string | null;
  caption: string | null;
  title: string | null;
  durationSeconds: number | null;
  reviewStatus: ReviewStatus;
}
