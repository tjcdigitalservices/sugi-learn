import { getRepositories } from "@/lib/data";
import type { Chapter, ChapterSection, Character, LearningPoint } from "@/types/chapter";
import type {
  AdminChapterListItem,
  CreateChapterInput,
  CreateLearningPointInput,
  CreateSectionInput,
  UpdateChapterMetadataInput,
  UpdateLearningPointInput,
  UpdateSectionInput,
} from "@/types/chapter-management";

export async function listChaptersForAdmin(): Promise<AdminChapterListItem[]> {
  return getRepositories().chapterManagement.listChaptersForAdmin();
}

export async function getChapterForAdmin(
  chapterId: string,
): Promise<Chapter | null> {
  return getRepositories().chapterManagement.getChapterForAdmin(chapterId);
}

export async function updateChapterMetadata(
  chapterId: string,
  input: UpdateChapterMetadataInput,
): Promise<Chapter> {
  return getRepositories().chapterManagement.updateChapterMetadata(
    chapterId,
    input,
  );
}

export async function createSection(
  chapterId: string,
  input: CreateSectionInput,
): Promise<ChapterSection> {
  return getRepositories().chapterManagement.createSection(chapterId, input);
}

export async function updateSection(
  chapterId: string,
  sectionId: string,
  input: UpdateSectionInput,
): Promise<ChapterSection> {
  return getRepositories().chapterManagement.updateSection(
    chapterId,
    sectionId,
    input,
  );
}

export async function deleteSection(
  chapterId: string,
  sectionId: string,
): Promise<void> {
  return getRepositories().chapterManagement.deleteSection(chapterId, sectionId);
}

export async function reorderSections(
  chapterId: string,
  sectionIds: string[],
): Promise<void> {
  return getRepositories().chapterManagement.reorderSections(
    chapterId,
    sectionIds,
  );
}

export async function listAllCharacters(): Promise<Character[]> {
  return getRepositories().chapterManagement.listAllCharacters();
}

export async function associateCharacter(
  chapterId: string,
  characterId: string,
): Promise<void> {
  return getRepositories().chapterManagement.associateCharacter(
    chapterId,
    characterId,
  );
}

export async function removeCharacterAssociation(
  chapterId: string,
  characterId: string,
): Promise<void> {
  return getRepositories().chapterManagement.removeCharacterAssociation(
    chapterId,
    characterId,
  );
}

export async function reorderChapterCharacters(
  chapterId: string,
  characterIds: string[],
): Promise<void> {
  return getRepositories().chapterManagement.reorderChapterCharacters(
    chapterId,
    characterIds,
  );
}

export async function createLearningPoint(
  chapterId: string,
  input: CreateLearningPointInput,
): Promise<LearningPoint> {
  return getRepositories().chapterManagement.createLearningPoint(
    chapterId,
    input,
  );
}

export async function updateLearningPoint(
  chapterId: string,
  learningPointId: string,
  input: UpdateLearningPointInput,
): Promise<LearningPoint> {
  return getRepositories().chapterManagement.updateLearningPoint(
    chapterId,
    learningPointId,
    input,
  );
}

export async function deleteLearningPoint(
  chapterId: string,
  learningPointId: string,
): Promise<void> {
  return getRepositories().chapterManagement.deleteLearningPoint(
    chapterId,
    learningPointId,
  );
}

export async function reorderLearningPoints(
  chapterId: string,
  learningPointIds: string[],
): Promise<void> {
  return getRepositories().chapterManagement.reorderLearningPoints(
    chapterId,
    learningPointIds,
  );
}

export async function createChapter(input: CreateChapterInput): Promise<Chapter> {
  return getRepositories().chapterManagement.createChapter(input);
}

export async function reorderChapters(
  orderedChapterSlugs: string[],
): Promise<void> {
  return getRepositories().chapterManagement.reorderChapters(
    orderedChapterSlugs,
  );
}

export async function setChapterActive(
  chapterId: string,
  isActive: boolean,
): Promise<Chapter> {
  return getRepositories().chapterManagement.setChapterActive(
    chapterId,
    isActive,
  );
}
