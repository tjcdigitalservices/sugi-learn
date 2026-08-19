import type {
  AssessmentAnswer,
  AssessmentQuestion,
  AttemptQuestionReviewItem,
} from "@/types/assessment";

/** Build per-question review rows for a completed attempt (includes correct answers). */
export function buildAttemptQuestionReviews(
  questions: AssessmentQuestion[],
  answers: AssessmentAnswer[],
): AttemptQuestionReviewItem[] {
  const answersByQuestion = new Map(
    answers.map((answer) => [answer.questionId, answer.selectedOptionId]),
  );

  const sorted = [...questions].sort((a, b) => a.sortOrder - b.sortOrder);

  return sorted.map((question) => {
    const selectedOptionId = answersByQuestion.get(question.id) ?? null;
    const selectedOption = question.options.find(
      (option) => option.id === selectedOptionId,
    );
    const correctOption = question.options.find(
      (option) => option.id === question.correctOptionId,
    );

    return {
      questionId: question.id,
      sortOrder: question.sortOrder,
      prompt: question.prompt,
      selectedOptionId,
      selectedLabel: selectedOption?.label ?? null,
      correctOptionId: question.correctOptionId,
      correctLabel: correctOption?.label ?? "—",
      isCorrect: selectedOptionId === question.correctOptionId,
      explanation: question.explanation,
    };
  });
}
