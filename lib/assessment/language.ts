import type { LearnerAssessmentQuestion, QuestionOption } from "@/types/assessment";

export type AssessmentLanguage = "en" | "hil";

export const ASSESSMENT_LANGUAGE_STORAGE_KEY = "sugidanon:assessment-lang";

export function resolveAssessmentPrompt(
  question: Pick<LearnerAssessmentQuestion, "prompt" | "promptHiligaynon">,
  language: AssessmentLanguage,
): string {
  if (language === "hil" && question.promptHiligaynon?.trim()) {
    return question.promptHiligaynon.trim();
  }
  return question.prompt;
}

export function resolveAssessmentOptionLabel(
  option: Pick<QuestionOption, "label" | "labelHiligaynon">,
  language: AssessmentLanguage,
): string {
  if (language === "hil" && option.labelHiligaynon?.trim()) {
    return option.labelHiligaynon.trim();
  }
  return option.label;
}
