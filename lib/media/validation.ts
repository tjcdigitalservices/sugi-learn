import {
  MEDIA_ACCEPTED_TYPES,
  MEDIA_MAX_FILE_BYTES,
  MEDIA_SCOPE_LIMITS,
} from "@/lib/media/constants";
import type {
  CreateMediaAssetInput,
  UpdateMediaAssetInput,
} from "@/types/media-management";
import type { MediaKind } from "@/types/media";
import { REVIEW_STATUSES } from "@/types/review";

function isReviewStatus(value: string): value is (typeof REVIEW_STATUSES)[number] {
  return REVIEW_STATUSES.includes(value as (typeof REVIEW_STATUSES)[number]);
}

export function validateMediaKind(kind: string): kind is MediaKind {
  return kind === "illustration" || kind === "audio" || kind === "animation";
}

export function validateCreateMediaMetadata(
  input: CreateMediaAssetInput,
): string | null {
  if (!input.title?.trim()) {
    return "Title is required.";
  }

  if (!validateMediaKind(input.kind)) {
    return "Invalid media type.";
  }

  if (input.reviewStatus && !isReviewStatus(input.reviewStatus)) {
    return "Invalid review status.";
  }

  if (input.kind === "illustration" && !input.altText?.trim()) {
    return "Alt text is required for illustrations.";
  }

  return null;
}

export function validateUpdateMediaMetadata(
  input: UpdateMediaAssetInput,
  kind: MediaKind,
  options?: { hasUploadedFile?: boolean },
): string | null {
  if (input.title !== undefined && !input.title.trim()) {
    return "Title cannot be empty.";
  }

  if (input.reviewStatus && !isReviewStatus(input.reviewStatus)) {
    return "Invalid review status.";
  }

  if (
    input.reviewStatus === "approved" &&
    options?.hasUploadedFile === false
  ) {
    return "Cannot approve a media asset without an uploaded file. Upload a file first.";
  }

  if (
    kind === "illustration" &&
    input.altText !== undefined &&
    !input.altText?.trim()
  ) {
    return "Alt text is required for illustrations.";
  }

  if (
    input.durationSeconds !== undefined &&
    input.durationSeconds !== null &&
    input.durationSeconds < 0
  ) {
    return "Duration must be zero or greater.";
  }

  return null;
}

export function validateMediaFile(
  kind: MediaKind,
  file: File,
): string | null {
  return validateMediaFileMeta(kind, {
    name: file.name,
    type: file.type,
    size: file.size,
  });
}

export function validateMediaFileMeta(
  kind: MediaKind,
  file: { name: string; type: string; size: number },
): string | null {
  const allowed = MEDIA_ACCEPTED_TYPES[kind];
  if (!allowed.includes(file.type)) {
    return `Unsupported file type. Allowed: ${allowed.join(", ")}`;
  }

  const maxBytes = MEDIA_MAX_FILE_BYTES[kind];
  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return `File is too large. Maximum size is ${maxMb} MB.`;
  }

  if (!file.name.trim()) {
    return "Filename is required.";
  }

  return null;
}

export function validateScopeLimit(
  kind: MediaKind,
  currentCount: number,
): string | null {
  const limit = MEDIA_SCOPE_LIMITS[kind];
  if (limit !== null && currentCount >= limit) {
    return `Project scope limit reached (${limit} ${kind} assets). Client confirmation required before adding more.`;
  }
  return null;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}
