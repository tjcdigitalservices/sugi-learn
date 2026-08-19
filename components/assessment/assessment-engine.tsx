"use client";

import { useCallback, useMemo, useState, useTransition } from "react";

import {
  submitPreAssessmentAction,
  type AssessmentActionResult,
} from "@/lib/assessment/actions";
import type {
  Assessment,
  AssessmentAttemptSummary,
  AssessmentQuestion,
  AssessmentSubmissionResult,
  LearnerAssessmentQuestion,
} from "@/types/assessment";

import { AssessmentCompletion } from "@/components/assessment/assessment-completion";
import { AssessmentQuestionPanel } from "@/components/assessment/assessment-question-panel";

interface AssessmentEngineProps {
  assessment: Assessment;
  questions: LearnerAssessmentQuestion[];
  continueHref?: string;
  continueLabel?: string;
  initialCompletedAttempt?: AssessmentAttemptSummary | null;
  mode?: "learner" | "preview";
  previewQuestions?: AssessmentQuestion[];
  submitAction?: (
    answers: Record<string, string>,
  ) => Promise<AssessmentActionResult<AssessmentSubmissionResult>>;
}

export function AssessmentEngine({
  assessment,
  questions,
  continueHref = "/learn",
  continueLabel = "Begin Learning",
  initialCompletedAttempt = null,
  mode = "learner",
  previewQuestions = [],
  submitAction = submitPreAssessmentAction,
}: AssessmentEngineProps) {
  const isPreview = mode === "preview";
  const engineQuestions = isPreview
    ? previewQuestions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        options: question.options,
        sortOrder: question.sortOrder,
      }))
    : questions;

  const sortedQuestions = useMemo(
    () => [...engineQuestions].sort((a, b) => a.sortOrder - b.sortOrder),
    [engineQuestions],
  );

  const previewById = useMemo(() => {
    if (!isPreview) {
      return new Map<string, AssessmentQuestion>();
    }
    return new Map(previewQuestions.map((question) => [question.id, question]));
  }, [isPreview, previewQuestions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [result, setResult] = useState<AssessmentSubmissionResult | null>(
    initialCompletedAttempt
      ? {
          attemptId: initialCompletedAttempt.id,
          assessmentType: initialCompletedAttempt.assessmentType,
          score: initialCompletedAttempt.score ?? 0,
          totalQuestions: initialCompletedAttempt.totalQuestions,
          correctCount: initialCompletedAttempt.correctCount ?? 0,
          completedAt: initialCompletedAttempt.completedAt ?? new Date().toISOString(),
        }
      : null,
  );
  const [hasSubmitted, setHasSubmitted] = useState(Boolean(initialCompletedAttempt));

  const totalQuestions = sortedQuestions.length;
  const currentQuestion = sortedQuestions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  const selectAnswer = useCallback(
    (questionId: string, optionId: string) => {
      setAnswers((previous) => ({ ...previous, [questionId]: optionId }));
      setValidationError(null);
      setSubmitError(null);
    },
    [],
  );

  const goPrevious = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1));
    setValidationError(null);
  }, []);

  const goNext = useCallback(() => {
    if (!currentQuestion) {
      return;
    }

    if (!isPreview && !answers[currentQuestion.id]) {
      setValidationError("Please select an answer before continuing.");
      return;
    }

    setValidationError(null);
    setCurrentIndex((index) => Math.min(totalQuestions - 1, index + 1));
  }, [answers, currentQuestion, isPreview, totalQuestions]);

  const handleSubmit = useCallback(() => {
    if (isPreview) {
      return;
    }

    const unanswered = sortedQuestions.filter((question) => !answers[question.id]);
    if (unanswered.length > 0) {
      setValidationError(
        `Please answer all questions before submitting. ${unanswered.length} question(s) remain unanswered.`,
      );
      return;
    }

    if (hasSubmitted || isSubmitting) {
      return;
    }

    setValidationError(null);
    setSubmitError(null);

    startSubmitTransition(async () => {
      const response = await submitAction(answers);
      if (!response.success) {
        setSubmitError(response.error);
        return;
      }

      setResult(response.data);
      setHasSubmitted(true);
    });
  }, [answers, hasSubmitted, isPreview, isSubmitting, sortedQuestions, submitAction]);

  if (result) {
    const resolvedContinueHref =
      continueHref.startsWith("/learn/results") && result.attemptId
        ? `/learn/results/${result.attemptId}`
        : continueHref;

    return (
      <AssessmentCompletion
        assessmentTitle={assessment.title}
        result={result}
        continueHref={resolvedContinueHref}
        continueLabel={continueLabel}
      />
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <AssessmentQuestionPanel
      assessmentTitle={assessment.title}
      question={currentQuestion}
      questionNumber={currentIndex + 1}
      totalQuestions={totalQuestions}
      selectedOptionId={answers[currentQuestion.id] ?? null}
      onSelectOption={(optionId) => selectAnswer(currentQuestion.id, optionId)}
      onPrevious={goPrevious}
      onNext={goNext}
      onSubmit={handleSubmit}
      isFirst={isFirst}
      isLast={isLast}
      isSubmitting={isSubmitting}
      validationError={validationError}
      submitError={submitError}
      previewMode={isPreview}
      correctOptionId={previewById.get(currentQuestion.id)?.correctOptionId ?? null}
    />
  );
}
