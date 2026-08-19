import { CHAPTER_SECTION_KINDS } from "@/types/chapter";
import type {
  CreateChapterInput,
  CreateLearningPointInput,
  CreateSectionInput,
  UpdateChapterMetadataInput,
  UpdateLearningPointInput,
  UpdateSectionInput,
} from "@/types/chapter-management";
import { REVIEW_STATUSES } from "@/types/review";

const TEXT_SECTION_KINDS = new Set([
  "introduction",
  "story",
  "cultural_context",
  "activity",
]);

export function validateCreateChapter(input: CreateChapterInput): string | null {
  const title = input.title.trim();
  if (!title) {
    return "Chapter title is required.";
  }
  if (title.length > 200) {
    return "Chapter title must be 200 characters or fewer.";
  }
  return null;
}

export function validateChapterMetadata(
  input: UpdateChapterMetadataInput,
): string | null {
  const title = input.title.trim();
  if (!title) {
    return "Chapter title is required.";
  }
  if (title.length > 200) {
    return "Chapter title must be 200 characters or fewer.";
  }
  if (!REVIEW_STATUSES.includes(input.reviewStatus)) {
    return "Invalid review status.";
  }
  return null;
}

export function validateCreateSection(input: CreateSectionInput): string | null {
  const title = input.title.trim();
  if (!title) {
    return "Section title is required.";
  }
  if (!CHAPTER_SECTION_KINDS.includes(input.kind)) {
    return "Invalid section type.";
  }
  if (input.reviewStatus && !REVIEW_STATUSES.includes(input.reviewStatus)) {
    return "Invalid section review status.";
  }
  if (TEXT_SECTION_KINDS.has(input.kind) && input.body === undefined) {
    return "Text sections require content.";
  }
  if (input.kind === "completion" && input.completionMessage === undefined) {
    return "Completion sections require a message field (may be empty).";
  }
  return null;
}

export function validateUpdateSection(input: UpdateSectionInput): string | null {
  if (input.title !== undefined && !input.title.trim()) {
    return "Section title cannot be empty.";
  }
  if (input.reviewStatus && !REVIEW_STATUSES.includes(input.reviewStatus)) {
    return "Invalid section review status.";
  }
  return null;
}

export function validateCreateLearningPoint(
  input: CreateLearningPointInput,
): string | null {
  const description = input.description.trim();
  if (!description) {
    return "Learning point description is required.";
  }
  if (input.reviewStatus && !REVIEW_STATUSES.includes(input.reviewStatus)) {
    return "Invalid learning point review status.";
  }
  return null;
}

export function validateUpdateLearningPoint(
  input: UpdateLearningPointInput,
): string | null {
  if (input.description !== undefined && !input.description.trim()) {
    return "Learning point description cannot be empty.";
  }
  if (input.reviewStatus && !REVIEW_STATUSES.includes(input.reviewStatus)) {
    return "Invalid learning point review status.";
  }
  return null;
}

export function validateOrderedIds(ids: string[]): string | null {
  if (ids.length === 0) {
    return "At least one item is required to reorder.";
  }
  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    return "Duplicate items in reorder request.";
  }
  return null;
}
