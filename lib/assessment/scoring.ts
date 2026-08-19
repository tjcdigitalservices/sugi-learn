import type {
  AssessmentQuestion,
  LearnerAssessmentQuestion,
} from "@/types/assessment";

export function toLearnerAssessmentQuestions(
  questions: AssessmentQuestion[],
): LearnerAssessmentQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    sortOrder: question.sortOrder,
    options: question.options.map((option) => ({
      id: option.id,
      label: option.label,
      sortOrder: option.sortOrder,
    })),
  }));
}

export function calculateRawScore(
  questions: AssessmentQuestion[],
  answers: { questionId: string; selectedOptionId: string | null }[],
): { correctCount: number; totalQuestions: number; score: number } {
  const totalQuestions = questions.length;
  const answersByQuestion = new Map(
    answers.map((answer) => [answer.questionId, answer.selectedOptionId]),
  );

  let correctCount = 0;
  for (const question of questions) {
    if (answersByQuestion.get(question.id) === question.correctOptionId) {
      correctCount += 1;
    }
  }

  const score =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return { correctCount, totalQuestions, score };
}
