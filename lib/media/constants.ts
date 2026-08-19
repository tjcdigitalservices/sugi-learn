import type { MediaKind } from "@/types/media";

export const MEDIA_STORAGE_BUCKET = "media";

export const MEDIA_KIND_LABELS: Record<MediaKind, string> = {
  illustration: "Illustration",
  audio: "Audio",
  animation: "Animation / Video",
};

export const MEDIA_ACCEPTED_TYPES: Record<MediaKind, string[]> = {
  illustration: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  audio: ["audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg"],
  animation: ["video/mp4", "video/webm"],
};

export const MEDIA_MAX_FILE_BYTES: Record<MediaKind, number> = {
  illustration: 10 * 1024 * 1024,
  audio: 25 * 1024 * 1024,
  animation: 200 * 1024 * 1024,
};

export const MEDIA_ACCEPT_ATTRIBUTE: Record<MediaKind, string> = {
  illustration: MEDIA_ACCEPTED_TYPES.illustration.join(","),
  audio: MEDIA_ACCEPTED_TYPES.audio.join(","),
  animation: MEDIA_ACCEPTED_TYPES.animation.join(","),
};

/** Soft project scope limits (AGENTS.md). */
export const MEDIA_SCOPE_LIMITS: Record<MediaKind, number | null> = {
  illustration: 20,
  audio: null,
  animation: 3,
};
