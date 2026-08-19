"use server";

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
