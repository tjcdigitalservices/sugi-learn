"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import {
  validateChapterMetadata,
  validateCreateChapter,
  validateCreateLearningPoint,
  validateCreateSection,
  validateOrderedIds,
  validateUpdateLearningPoint,
  validateUpdateSection,
} from "@/lib/chapter-management/validation";
import {
  associateCharacter,
  createChapter,
  createLearningPoint,
  createSection,
  deleteChapter,
  deleteLearningPoint,
  deleteSection,
  getChapterForAdmin,
  listAllCharacters,
  removeCharacterAssociation,
  reorderChapterCharacters,
  reorderChapters,
  reorderLearningPoints,
  reorderSections,
  setChapterActive,
  updateChapterMetadata,
  updateLearningPoint,
  updateSection,
} from "@/lib/domain/chapter-management";
import {
  countMediaByKind,
  createMediaAssetRecord,
} from "@/lib/domain/media-management";
import { MEDIA_STORAGE_BUCKET } from "@/lib/media/constants";
import {
  buildMockDataUrl,
  buildStorageObjectPath,
} from "@/lib/media/storage";
import {
  validateMediaFile,
  validateMediaFileMeta,
  validateScopeLimit,
} from "@/lib/media/validation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  createSupabaseServiceClient,
  hasSupabaseConfig,
  hasSupabaseServiceConfig,
} from "@/lib/supabase/service";
import type { Chapter, ChapterSection, LearningPoint } from "@/types/chapter";
import type {
  ChapterManagementActionResult,
  CreateChapterInput,
  CreateLearningPointInput,
  CreateSectionInput,
  UpdateChapterMetadataInput,
  UpdateLearningPointInput,
  UpdateSectionInput,
} from "@/types/chapter-management";

export type PreparedChapterCoverUpload = {
  assetId: string;
  storagePath: string;
  objectPath: string;
  token: string;
};

function adminPaths(chapterId: string) {
  return [
    `/admin/chapters/${chapterId}`,
    "/admin/chapters",
    "/admin",
  ] as const;
}

function revalidateChapter(chapterId: string) {
  for (const path of adminPaths(chapterId)) {
    revalidatePath(path);
  }
}

function safeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    const message = error.message;
    if (
      message.includes("Unable to") ||
      message.includes("not found") ||
      message.includes("Invalid") ||
      message.includes("Media type") ||
      message.includes("Media asset")
    ) {
      return message;
    }
  }
  return "Something went wrong. Please try again.";
}

export async function saveChapterMetadataAction(
  chapterId: string,
  input: UpdateChapterMetadataInput,
): Promise<ChapterManagementActionResult<Chapter>> {
  await requireAdmin();

  const validationError = validateChapterMetadata(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const chapter = await updateChapterMetadata(chapterId, input);
    revalidateChapter(chapterId);
    return { success: true, data: chapter };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function createSectionAction(
  chapterId: string,
  input: CreateSectionInput,
): Promise<ChapterManagementActionResult<ChapterSection>> {
  await requireAdmin();

  const validationError = validateCreateSection(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const section = await createSection(chapterId, input);
    revalidateChapter(chapterId);
    return { success: true, data: section };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function saveSectionAction(
  chapterId: string,
  sectionId: string,
  input: UpdateSectionInput,
): Promise<ChapterManagementActionResult<ChapterSection>> {
  await requireAdmin();

  const validationError = validateUpdateSection(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const section = await updateSection(chapterId, sectionId, input);
    revalidateChapter(chapterId);
    if (input.mediaAssetId !== undefined) {
      revalidatePath(`/learn/chapters/${chapterId}`);
      revalidatePath(`/admin/chapters/${chapterId}/preview`);
    }
    return { success: true, data: section };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function deleteSectionAction(
  chapterId: string,
  sectionId: string,
): Promise<ChapterManagementActionResult> {
  await requireAdmin();

  try {
    await deleteSection(chapterId, sectionId);
    revalidateChapter(chapterId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function reorderSectionsAction(
  chapterId: string,
  sectionIds: string[],
): Promise<ChapterManagementActionResult> {
  await requireAdmin();

  const validationError = validateOrderedIds(sectionIds);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    await reorderSections(chapterId, sectionIds);
    revalidateChapter(chapterId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function loadAllCharactersAction(): Promise<
  ChapterManagementActionResult<Awaited<ReturnType<typeof listAllCharacters>>>
> {
  await requireAdmin();

  try {
    const characters = await listAllCharacters();
    return { success: true, data: characters };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function associateCharacterAction(
  chapterId: string,
  characterId: string,
): Promise<ChapterManagementActionResult> {
  await requireAdmin();

  try {
    await associateCharacter(chapterId, characterId);
    revalidateChapter(chapterId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function removeCharacterAssociationAction(
  chapterId: string,
  characterId: string,
): Promise<ChapterManagementActionResult> {
  await requireAdmin();

  try {
    await removeCharacterAssociation(chapterId, characterId);
    revalidateChapter(chapterId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function reorderChapterCharactersAction(
  chapterId: string,
  characterIds: string[],
): Promise<ChapterManagementActionResult> {
  await requireAdmin();

  const validationError = validateOrderedIds(characterIds);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    await reorderChapterCharacters(chapterId, characterIds);
    revalidateChapter(chapterId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function createLearningPointAction(
  chapterId: string,
  input: CreateLearningPointInput,
): Promise<ChapterManagementActionResult<LearningPoint>> {
  await requireAdmin();

  const validationError = validateCreateLearningPoint(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const point = await createLearningPoint(chapterId, input);
    revalidateChapter(chapterId);
    return { success: true, data: point };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function saveLearningPointAction(
  chapterId: string,
  learningPointId: string,
  input: UpdateLearningPointInput,
): Promise<ChapterManagementActionResult<LearningPoint>> {
  await requireAdmin();

  const validationError = validateUpdateLearningPoint(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const point = await updateLearningPoint(chapterId, learningPointId, input);
    revalidateChapter(chapterId);
    return { success: true, data: point };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function deleteLearningPointAction(
  chapterId: string,
  learningPointId: string,
): Promise<ChapterManagementActionResult> {
  await requireAdmin();

  try {
    await deleteLearningPoint(chapterId, learningPointId);
    revalidateChapter(chapterId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function reorderLearningPointsAction(
  chapterId: string,
  learningPointIds: string[],
): Promise<ChapterManagementActionResult> {
  await requireAdmin();

  const validationError = validateOrderedIds(learningPointIds);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    await reorderLearningPoints(chapterId, learningPointIds);
    revalidateChapter(chapterId);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

function revalidateLearnerPaths() {
  revalidatePath("/learn");
  revalidatePath("/learn/chapters");
  revalidatePath("/admin/chapters");
  revalidatePath("/admin/media");
}

export async function createChapterAction(
  input: CreateChapterInput,
): Promise<ChapterManagementActionResult<Chapter>> {
  await requireAdmin();

  const validationError = validateCreateChapter(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const chapter = await createChapter(input);
    revalidateLearnerPaths();
    revalidateChapter(chapter.id);
    return { success: true, data: chapter };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function reorderChaptersAction(
  orderedChapterSlugs: string[],
): Promise<ChapterManagementActionResult> {
  await requireAdmin();

  const validationError = validateOrderedIds(orderedChapterSlugs);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    await reorderChapters(orderedChapterSlugs);
    revalidateLearnerPaths();
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function setChapterActiveAction(
  chapterId: string,
  isActive: boolean,
): Promise<ChapterManagementActionResult<Chapter>> {
  await requireAdmin();

  try {
    const chapter = await setChapterActive(chapterId, isActive);
    revalidateLearnerPaths();
    revalidateChapter(chapterId);
    return { success: true, data: chapter };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function deleteChapterAction(
  chapterId: string,
): Promise<ChapterManagementActionResult> {
  await requireAdmin();

  try {
    await deleteChapter(chapterId);
    revalidateLearnerPaths();
    revalidatePath("/admin/chapters");
    revalidatePath(`/admin/chapters/${chapterId}`);
    revalidatePath(`/admin/chapters/${chapterId}/preview`);
    revalidatePath(`/learn/chapters/${chapterId}`);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function reloadChapterAction(
  chapterId: string,
): Promise<ChapterManagementActionResult<Chapter>> {
  await requireAdmin();

  try {
    const chapter = await getChapterForAdmin(chapterId);
    if (!chapter) {
      return { success: false, error: "Chapter not found." };
    }
    return { success: true, data: chapter };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function prepareChapterCoverUploadAction(input: {
  chapterId: string;
  filename: string;
  contentType: string;
  fileSize: number;
}): Promise<ChapterManagementActionResult<PreparedChapterCoverUpload>> {
  await requireAdmin();

  if (!hasSupabaseConfig()) {
    return {
      success: false,
      error: "Direct uploads require Supabase configuration.",
    };
  }

  const fileError = validateMediaFileMeta("illustration", {
    name: input.filename,
    type: input.contentType,
    size: input.fileSize,
  });
  if (fileError) {
    return { success: false, error: fileError };
  }

  try {
    const existing = await getChapterForAdmin(input.chapterId);
    if (!existing) {
      return { success: false, error: "Chapter not found." };
    }

    const currentCount = await countMediaByKind("illustration");
    const scopeError = validateScopeLimit("illustration", currentCount);
    if (scopeError && !existing.coverMediaAssetId) {
      return { success: false, error: scopeError };
    }

    const assetId = randomUUID();
    const storagePath = buildStorageObjectPath({
      chapterSlug: input.chapterId,
      kind: "illustration",
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
        error: "Unable to prepare cover upload. Please try again.",
      };
    }

    return {
      success: true,
      data: {
        assetId,
        storagePath,
        objectPath,
        token: data.token,
      },
    };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function finalizeChapterCoverUploadAction(input: {
  chapterId: string;
  assetId: string;
  storagePath: string;
}): Promise<ChapterManagementActionResult<Chapter>> {
  await requireAdmin();

  if (!input.assetId.trim() || !input.storagePath.trim()) {
    return { success: false, error: "Upload session is incomplete." };
  }

  try {
    const existing = await getChapterForAdmin(input.chapterId);
    if (!existing) {
      return { success: false, error: "Chapter not found." };
    }

    await createMediaAssetRecord(
      {
        id: input.assetId,
        kind: "illustration",
        title: `${existing.title} — Cover`,
        description: "Chapter cover image",
        altText: `Cover for ${existing.title}`,
        chapterSlug: input.chapterId,
        sectionId: null,
        sourceReference: null,
        reviewStatus: "approved",
      },
      input.storagePath,
    );

    const chapter = await updateChapterMetadata(input.chapterId, {
      title: existing.title,
      subtitle: existing.subtitle,
      summary: existing.summary,
      reviewStatus: existing.reviewStatus,
      coverMediaAssetId: input.assetId,
    });

    revalidateChapter(input.chapterId);
    revalidateLearnerPaths();
    return { success: true, data: chapter };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

/**
 * Mock-mode / small-file fallback. Prefer prepare + direct storage upload when
 * Supabase is configured (avoids Next.js multipart truncation).
 */
export async function setChapterCoverAction(
  chapterId: string,
  formData: FormData,
): Promise<ChapterManagementActionResult<Chapter>> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "A cover image file is required." };
  }

  const fileError = validateMediaFile("illustration", file);
  if (fileError) {
    return { success: false, error: fileError };
  }

  if (hasSupabaseConfig()) {
    return {
      success: false,
      error:
        "Cover upload should use direct storage. Refresh the page and try again.",
    };
  }

  try {
    const existing = await getChapterForAdmin(chapterId);
    if (!existing) {
      return { success: false, error: "Chapter not found." };
    }

    const currentCount = await countMediaByKind("illustration");
    const scopeError = validateScopeLimit("illustration", currentCount);
    if (scopeError && !existing.coverMediaAssetId) {
      return { success: false, error: scopeError };
    }

    const assetId = randomUUID();
    const storagePath = await buildMockDataUrl(file);

    await createMediaAssetRecord(
      {
        id: assetId,
        kind: "illustration",
        title: `${existing.title} — Cover`,
        description: "Chapter cover image",
        altText: `Cover for ${existing.title}`,
        chapterSlug: chapterId,
        sectionId: null,
        sourceReference: null,
        reviewStatus: "approved",
      },
      storagePath,
    );

    const chapter = await updateChapterMetadata(chapterId, {
      title: existing.title,
      subtitle: existing.subtitle,
      summary: existing.summary,
      reviewStatus: existing.reviewStatus,
      coverMediaAssetId: assetId,
    });

    revalidateChapter(chapterId);
    revalidateLearnerPaths();
    return { success: true, data: chapter };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}

export async function clearChapterCoverAction(
  chapterId: string,
): Promise<ChapterManagementActionResult<Chapter>> {
  await requireAdmin();

  try {
    const existing = await getChapterForAdmin(chapterId);
    if (!existing) {
      return { success: false, error: "Chapter not found." };
    }

    const chapter = await updateChapterMetadata(chapterId, {
      title: existing.title,
      subtitle: existing.subtitle,
      summary: existing.summary,
      reviewStatus: existing.reviewStatus,
      coverMediaAssetId: null,
    });

    revalidateChapter(chapterId);
    revalidateLearnerPaths();
    return { success: true, data: chapter };
  } catch (error) {
    return { success: false, error: safeError(error) };
  }
}
