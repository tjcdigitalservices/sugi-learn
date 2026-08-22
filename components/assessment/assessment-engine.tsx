"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import {
  submitPreAssessmentAction,
  type AssessmentActionResult,
} from "@/lib/assessment/actions";
import {
  ASSESSMENT_LANGUAGE_STORAGE_KEY,
  type AssessmentLanguage,
} from "@/lib/assessment/language";
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

function readStoredLanguage(): AssessmentLanguage {
  if (typeof window === "undefined") {
    return "en";
  }
  try {
    const raw = localStorage.getItem(ASSESSMENT_LANGUAGE_STORAGE_KEY);
    return raw === "hil" ? "hil" : "en";
  } catch {
    return "en";
  }
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
        promptHiligaynon: question.promptHiligaynon,
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

  const [language, setLanguage] = useState<AssessmentLanguage>("en");
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

  useEffect(() => {
    setLanguage(readStoredLanguage());
  }, []);

  function setAssessmentLanguage(next: AssessmentLanguage) {
    setLanguage(next);
    try {
      localStorage.setItem(ASSESSMENT_LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Ignore private-mode storage failures.
    }
  }

  const totalQuestions = sortedQuestions.length;
  const currentQuestion = sortedQuestions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  const selectAnswer = useCallback((questionId: string, optionId: string) => {
    setAnswers((previous) => ({ ...previous, [questionId]: optionId }));
    setValidationError(null);
  }, []);

  function goPrevious() {
    setValidationError(null);
    setCurrentIndex((value) => Math.max(0, value - 1));
  }

  function goNext() {
    if (!currentQuestion) {
      return;
    }
    if (!answers[currentQuestion.id]) {
      setValidationError("Please select an answer before continuing.");
      return;
    }
    setValidationError(null);
    setCurrentIndex((value) => Math.min(totalQuestions - 1, value + 1));
  }

  function handleSubmit() {
    if (!currentQuestion) {
      return;
    }
    if (!answers[currentQuestion.id]) {
      setValidationError("Please select an answer before submitting.");
      return;
    }

    const unanswered = sortedQuestions.filter((question) => !answers[question.id]);
    if (unanswered.length > 0) {
      setValidationError(
        `Please answer all questions before submitting (${unanswered.length} remaining).`,
      );
      return;
    }

    setValidationError(null);
    setSubmitError(null);

    if (isPreview) {
      return;
    }

    startSubmitTransition(async () => {
      const actionResult = await submitAction(answers);
      if (!actionResult.success) {
        setSubmitError(actionResult.error);
        return;
      }
      setResult(actionResult.data);
    });
  }

  if (result && !isPreview) {
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
      language={language}
      onLanguageChange={setAssessmentLanguage}
    />
  );
}
