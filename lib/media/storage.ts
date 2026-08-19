import "server-only";

import { MEDIA_STORAGE_BUCKET } from "@/lib/media/constants";
import { sanitizeFilename } from "@/lib/media/validation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { MediaKind } from "@/types/media";

export function buildStorageObjectPath(params: {
  chapterSlug: string;
  kind: MediaKind;
  assetId: string;
  filename: string;
}): string {
  const safeName = sanitizeFilename(params.filename);
  return `${MEDIA_STORAGE_BUCKET}/${params.chapterSlug}/${params.kind}/${params.assetId}/${safeName}`;
}

export async function uploadMediaFile(params: {
  storagePath: string;
  file: Buffer;
  contentType: string;
}): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const objectPath = params.storagePath.replace(/^media\//, "");

  const { error } = await supabase.storage
    .from(MEDIA_STORAGE_BUCKET)
    .upload(objectPath, params.file, {
      contentType: params.contentType,
      upsert: false,
    });

  if (error) {
    throw new Error("Unable to upload media file.");
  }
}

export async function deleteMediaFile(storagePath: string | null): Promise<void> {
  if (!storagePath?.trim()) {
    return;
  }

  const supabase = await getSupabaseServerClient();
  const objectPath = storagePath.replace(/^media\//, "");

  const { error } = await supabase.storage
    .from(MEDIA_STORAGE_BUCKET)
    .remove([objectPath]);

  if (error) {
    throw new Error("Unable to remove media file from storage.");
  }
}

export async function readUploadBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function buildMockStoragePath(params: {
  chapterSlug: string;
  kind: MediaKind;
  assetId: string;
  filename: string;
}): string {
  return buildStorageObjectPath(params);
}

/** Mock mode stores a data URL directly in storage_path for local dev. */
export async function buildMockDataUrl(file: File): Promise<string> {
  const buffer = await readUploadBuffer(file);
  const base64 = buffer.toString("base64");
  return `data:${file.type};base64,${base64}`;
}
