import bank from "@/lib/assessment/official-question-bank.json";
import type { AssessmentQuestion, AssessmentType } from "@/types/assessment";

export const OFFICIAL_PRE_ASSESSMENT_ID = bank.pre.id;
export const OFFICIAL_POST_ASSESSMENT_ID = bank.post.id;

type BankQuestion = {
  id: string;
  prompt: string;
  correctIndex: number;
  options: string[];
};

type BankAssessment = {
  id: string;
  type: AssessmentType;
  title: string;
  instructions: string;
  questions: BankQuestion[];
};

function optionId(assessmentType: AssessmentType, questionIndex: number, optionIndex: number) {
  const prefix = assessmentType === "pre" ? "b2000000-0000-4000-8000-" : "c2000000-0000-4000-8000-";
  const n = questionIndex * 4 + optionIndex + 1;
  return `${prefix}${String(n).padStart(12, "0")}`;
}

function toAssessmentQuestions(
  assessment: BankAssessment,
): AssessmentQuestion[] {
  return assessment.questions.map((question, questionIndex) => {
    const options = question.options.map((label, optionIndex) => ({
      id: optionId(assessment.type, questionIndex, optionIndex),
      label,
      sortOrder: optionIndex + 1,
    }));

    return {
      id: question.id,
      assessmentId: assessment.id,
      assessmentType: assessment.type,
      chapterId: null,
      prompt: question.prompt,
      options,
      correctOptionId: options[question.correctIndex]!.id,
      explanation: null,
      sourceReference: null,
      reviewStatus: "approved",
      sortOrder: questionIndex + 1,
    };
  });
}

export function getOfficialAssessmentMeta(type: AssessmentType) {
  const assessment = type === "pre" ? bank.pre : bank.post;
  return {
    id: assessment.id,
    type: assessment.type as AssessmentType,
    title: assessment.title,
    instructions: assessment.instructions,
    reviewStatus: "approved" as const,
  };
}

export function getOfficialAssessmentQuestions(
  type: AssessmentType,
): AssessmentQuestion[] {
  const assessment = (type === "pre" ? bank.pre : bank.post) as BankAssessment;
  return toAssessmentQuestions(assessment);
}
