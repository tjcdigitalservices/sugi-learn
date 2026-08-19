import { REVIEW_STATUSES } from "@/types/review";
import type {
  CreateQuestionInput,
  QuestionOptionInput,
  UpdateAssessmentMetadataInput,
  UpdateQuestionInput,
} from "@/types/assessment-management";

const MAX_TITLE_LENGTH = 200;
const MAX_PROMPT_LENGTH = 2000;
const MAX_OPTION_LENGTH = 500;
const MAX_INSTRUCTIONS_LENGTH = 4000;
const MIN_OPTIONS = 2;

export function validateAssessmentMetadata(
  input: UpdateAssessmentMetadataInput,
): string | null {
  const title = input.title.trim();
  if (!title) {
    return "Assessment title is required.";
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }
  if (
    input.instructions &&
    input.instructions.trim().length > MAX_INSTRUCTIONS_LENGTH
  ) {
    return `Instructions must be ${MAX_INSTRUCTIONS_LENGTH} characters or fewer.`;
  }
  if (!REVIEW_STATUSES.includes(input.reviewStatus)) {
    return "Invalid review status.";
  }
  return null;
}

function validateOptions(options: QuestionOptionInput[]): string | null {
  if (options.length < MIN_OPTIONS) {
    return `At least ${MIN_OPTIONS} answer options are required.`;
  }

  const labels = options.map((option) => option.label.trim());
  if (labels.some((label) => !label)) {
    return "Every answer option must have text.";
  }
  if (labels.some((label) => label.length > MAX_OPTION_LENGTH)) {
    return `Each option must be ${MAX_OPTION_LENGTH} characters or fewer.`;
  }

  const correctCount = options.filter((option) => option.isCorrect).length;
  if (correctCount !== 1) {
    return "Exactly one answer option must be marked as correct.";
  }

  return null;
}

export function validateCreateQuestion(input: CreateQuestionInput): string | null {
  const prompt = input.prompt.trim();
  if (!prompt) {
    return "Question text is required.";
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return `Question text must be ${MAX_PROMPT_LENGTH} characters or fewer.`;
  }
  if (input.reviewStatus && !REVIEW_STATUSES.includes(input.reviewStatus)) {
    return "Invalid review status.";
  }
  return validateOptions(input.options);
}

export function validateUpdateQuestion(input: UpdateQuestionInput): string | null {
  return validateCreateQuestion(input);
}

export function validateOrderedQuestionIds(questionIds: string[]): string | null {
  if (questionIds.length === 0) {
    return "Question order is empty.";
  }
  const unique = new Set(questionIds);
  if (unique.size !== questionIds.length) {
    return "Invalid question order.";
  }
  return null;
}
