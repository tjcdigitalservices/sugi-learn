import { resolveMediaUrl } from "@/lib/media/resolve-media-url";

/** Static cover path under /public for seeded chapter covers. */
export function getDefaultChapterCoverPath(
  chapterNumber: number,
  chapterSlug: string,
): string {
  const padded = String(chapterNumber).padStart(2, "0");
  return `/chapter-covers/${padded}-${chapterSlug}.png`;
}

/** Prefer uploaded media URL; fall back to seeded public cover path. */
export function resolveChapterCoverUrl(params: {
  chapterNumber: number;
  chapterSlug: string;
  coverStoragePath: string | null | undefined;
}): string {
  const fromMedia = resolveMediaUrl(params.coverStoragePath ?? null);
  if (fromMedia) {
    return fromMedia;
  }
  return getDefaultChapterCoverPath(params.chapterNumber, params.chapterSlug);
}
