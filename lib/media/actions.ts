"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import {
  assignMediaToSectionRecord,
  countMediaByKind,
  createMediaAssetRecord,
  deleteMediaAssetRecord,
  getMediaAssetForAdmin,
  listMediaAssetsForAdmin,
  unlinkMediaFromSectionRecord,
  updateMediaAssetRecord,
} from "@/lib/domain/media-management";
import {
  buildMockDataUrl,
  buildStorageObjectPath,
  readUploadBuffer,
  uploadMediaFile,
} from "@/lib/media/storage";
import {
  validateCreateMediaMetadata,
  validateMediaFile,
  validateMediaFileMeta,
  validateMediaKind,
  validateScopeLimit,
  validateUpdateMediaMetadata,
} from "@/lib/media/validation";
import { MEDIA_STORAGE_BUCKET } from "@/lib/media/constants";
import {
  createSupabaseServiceClient,
  hasSupabaseConfig,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/service";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminMediaAssetDetail,
  AdminMediaAssetListItem,
  CreateMediaAssetInput,
  MediaListFilters,
  MediaManagementActionResult,
  UpdateMediaAssetInput,
} from "@/types/media-management";
import type { MediaKind } from "@/types/media";
import { randomUUID } from "node:crypto";

export type PreparedMediaUpload = {
  assetId: string;
  storagePath: string;
  objectPath: string;
  token: string;
  signedUrl: string;
};

function toMediaListItem(detail: AdminMediaAssetDetail): AdminMediaAssetListItem {
  return {
    id: detail.id,
    kind: detail.kind,
    title: detail.title,
    chapterSlug: detail.chapterSlug,
    chapterTitle: detail.chapterTitle,
    sectionTitle: detail.sectionTitle,
    reviewStatus: detail.reviewStatus,
    hasFile: Boolean(detail.storagePath?.trim()),
    updatedAt: detail.updatedAt,
  };
}

function revalidateMediaPaths(mediaId?: string) {
  revalidatePath("/admin/media");
  revalidatePath("/admin");
  if (mediaId) {
    revalidatePath(`/admin/media/${mediaId}`);
  }
}

function safeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    const message = error.message;
    if (
      message.includes("Unable to") ||
      message.includes("not found") ||
      message.includes("Invalid") ||
      message.includes("Cannot approve") ||
      message.includes("Media type") ||
      message.includes("required") ||
      message.includes("Unsupported") ||
      message.includes("linked") ||
      message.includes("limit")
    ) {
      return message;
    }
  }
  return "Something went wrong. Please try again.";
}

export async function listMediaAssetsAction(
  filters?: MediaListFilters,
) {
  await requireAdmin();

  try {
    const items = await listMediaAssetsForAdmin(filters);
    return { success: true as const, data: items };
  } catch (error) {
    return { success: false as const, error: safeError(error) };
  }
}

export async function uploadMediaAssetAction(
  formData: FormData,
): Promise<MediaManagementActionResult<AdminMediaAssetListItem>> {
  await requireAdmin();

  const kindValue = String(formData.get("kind") ?? "");
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const altText = String(formData.get("altText") ?? "");
  const chapterSlug = String(formData.get("chapterSlug") ?? "") || null;
  const sectionId = String(formData.get("sectionId") ?? "") || null;
  const sourceReference = String(formData.get("sourceReference") ?? "") || null;
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { success: false, error: "A media file is required." };
  }

  if (!validateMediaKind(kindValue)) {
    return { success: false, error: "Invalid media type." };
  }

  const input: CreateMediaAssetInput = {
    kind: kindValue,
    title,
    description: description || null,
    altText: altText || null,
    chapterSlug,
    sectionId,
    sourceReference,
    reviewStatus: "draft",
  };

  const metadataError = validateCreateMediaMetadata(input);
  if (metadataError) {
    return { success: false, error: metadataError };
  }

  const fileError = validateMediaFile(kindValue, file);
  if (fileError) {
    return { success: false, error: fileError };
  }

  // Large files must use prepare + direct storage upload (avoids Next.js multipart limits).
  if (file.size > 4 * 1024 * 1024 && hasSupabaseConfig()) {
    return {
      success: false,
      error:
        "This file is too large for form upload. Please try again — the uploader should use direct storage.",
    };
  }

  try {
    const currentCount = await countMediaByKind(kindValue);
    const scopeError = validateScopeLimit(kindValue, currentCount);
    if (scopeError) {
      return { success: false, error: scopeError };
    }

    const assetId = randomUUID();
    const chapterSlugForPath = chapterSlug ?? "unassigned";
    let storagePath: string | null = null;

    if (hasSupabaseConfig()) {
      storagePath = buildStorageObjectPath({
        chapterSlug: chapterSlugForPath,
        kind: kindValue,
        assetId,
        filename: file.name,
      });
      const buffer = await readUploadBuffer(file);
      await uploadMediaFile({
        storagePath,
        file: buffer,
        contentType: file.type,
      });
    } else {
      storagePath = await buildMockDataUrl(file);
    }

    const created = await createMediaAssetRecord(
      { ...input, id: assetId, reviewStatus: "draft" },
      storagePath,
    );

    revalidateMediaPaths(created.id);
    return { success: true, data: toMediaListItem(created) };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

/** Prepare a signed upload URL so large files go straight to Supabase Storage. */
export async function prepareMediaUploadAction(input: {
  kind: string;
  title: string;
  description?: string;
  altText?: string;
  chapterSlug?: string;
  sectionId?: string;
  sourceReference?: string;
  filename: string;
  contentType: string;
  fileSize: number;
}): Promise<MediaManagementActionResult<PreparedMediaUpload>> {
  await requireAdmin();

  if (!hasSupabaseConfig()) {
    return {
      success: false,
      error: "Direct uploads require Supabase configuration.",
    };
  }

  if (!validateMediaKind(input.kind)) {
    return { success: false, error: "Invalid media type." };
  }

  const kind = input.kind as MediaKind;
  const metadata: CreateMediaAssetInput = {
    kind,
    title: input.title,
    description: input.description || null,
    altText: input.altText || null,
    chapterSlug: input.chapterSlug || null,
    sectionId: input.sectionId || null,
    sourceReference: input.sourceReference || null,
    reviewStatus: "draft",
  };

  const metadataError = validateCreateMediaMetadata(metadata);
  if (metadataError) {
    return { success: false, error: metadataError };
  }

  const fileError = validateMediaFileMeta(kind, {
    name: input.filename,
    type: input.contentType,
    size: input.fileSize,
  });
  if (fileError) {
    return { success: false, error: fileError };
  }

  try {
    const currentCount = await countMediaByKind(kind);
    const scopeError = validateScopeLimit(kind, currentCount);
    if (scopeError) {
      return { success: false, error: scopeError };
    }

    const assetId = randomUUID();
    const storagePath = buildStorageObjectPath({
      chapterSlug: input.chapterSlug?.trim() || "unassigned",
      kind,
      assetId,
      filename: input.filename,
    });
    const objectPath = storagePath.replace(/^media\//, "");

    const supabase = hasSupabaseServiceConfig()
      ? createSupabaseServiceClient()
      : await getSupabaseServerClient();
    const { data, error } = await supabase.storage
      .from(MEDIA_STORAGE_BUCKET)
      .createSignedUploadUrl(objectPath);

    if (error || !data) {
      return {
        success: false,
        error: "Unable to prepare media upload. Please try again.",
      };
    }

    return {
      success: true,
      data: {
        assetId,
        storagePath,
        objectPath,
        token: data.token,
        signedUrl: data.signedUrl,
      },
    };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

/** Create the media_assets row after a successful direct storage upload. */
export async function finalizeMediaUploadAction(input: {
  assetId: string;
  storagePath: string;
  kind: string;
  title: string;
  description?: string;
  altText?: string;
  chapterSlug?: string;
  sectionId?: string;
  sourceReference?: string;
}): Promise<MediaManagementActionResult<AdminMediaAssetListItem>> {
  await requireAdmin();

  if (!validateMediaKind(input.kind)) {
    return { success: false, error: "Invalid media type." };
  }

  const metadata: CreateMediaAssetInput = {
    id: input.assetId,
    kind: input.kind,
    title: input.title,
    description: input.description || null,
    altText: input.altText || null,
    chapterSlug: input.chapterSlug || null,
    sectionId: input.sectionId || null,
    sourceReference: input.sourceReference || null,
    reviewStatus: "draft",
  };

  const metadataError = validateCreateMediaMetadata(metadata);
  if (metadataError) {
    return { success: false, error: metadataError };
  }

  if (!input.storagePath?.trim() || !input.assetId?.trim()) {
    return { success: false, error: "Upload session is incomplete." };
  }

  try {
    const created = await createMediaAssetRecord(metadata, input.storagePath);
    revalidateMediaPaths(created.id);
    return { success: true, data: toMediaListItem(created) };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function saveMediaAssetAction(
  mediaId: string,
  input: UpdateMediaAssetInput,
): Promise<MediaManagementActionResult<AdminMediaAssetDetail>> {
  await requireAdmin();

  try {
    const existing = await getMediaAssetForAdmin(mediaId);
    if (!existing) {
      return { success: false, error: "Media asset not found." };
    }

    const validationError = validateUpdateMediaMetadata(input, existing.kind, {
      hasUploadedFile: Boolean(existing.storagePath?.trim()),
    });
    if (validationError) {
      return { success: false, error: validationError };
    }

    const updated = await updateMediaAssetRecord(mediaId, input);
    revalidateMediaPaths(mediaId);
    if (updated.chapterSlug) {
      revalidatePath(`/admin/chapters/${updated.chapterSlug}`);
      revalidatePath(`/learn/chapters/${updated.chapterSlug}`);
    }
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function assignMediaToSectionAction(
  mediaId: string,
  chapterSlug: string,
  sectionId: string,
): Promise<MediaManagementActionResult<AdminMediaAssetDetail>> {
  await requireAdmin();

  try {
    const updated = await assignMediaToSectionRecord(
      mediaId,
      chapterSlug,
      sectionId,
    );
    revalidateMediaPaths(mediaId);
    revalidatePath(`/admin/chapters/${chapterSlug}`);
    revalidatePath(`/admin/chapters/${chapterSlug}/preview`);
    revalidatePath(`/learn/chapters/${chapterSlug}`);
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function unlinkMediaFromSectionAction(
  mediaId: string,
): Promise<MediaManagementActionResult<AdminMediaAssetDetail>> {
  await requireAdmin();

  try {
    const existing = await getMediaAssetForAdmin(mediaId);
    const updated = await unlinkMediaFromSectionRecord(mediaId);
    revalidateMediaPaths(mediaId);
    if (existing?.chapterSlug) {
      revalidatePath(`/admin/chapters/${existing.chapterSlug}`);
      revalidatePath(`/learn/chapters/${existing.chapterSlug}`);
    }
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function deleteMediaAssetAction(
  mediaId: string,
): Promise<MediaManagementActionResult> {
  await requireAdmin();

  try {
    const existing = await getMediaAssetForAdmin(mediaId);
    await deleteMediaAssetRecord(mediaId);
    revalidateMediaPaths(mediaId);
    if (existing?.chapterSlug) {
      revalidatePath(`/admin/chapters/${existing.chapterSlug}`);
    }
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}
