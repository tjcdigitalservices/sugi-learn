"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import {
  submitPreAssessmentAction,
  type AssessmentActionResult,
} from "@/lib/assessment/actions";
import { buildAttemptQuestionReviews } from "@/lib/assessment/attempt-review";
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
  LearnerResultsDashboardView,
} from "@/types/assessment";

import { AssessmentCompletion } from "@/components/assessment/assessment-completion";
import { AssessmentQuestionPanel } from "@/components/assessment/assessment-question-panel";
import { LearningResultsDashboard } from "@/components/learner/results/learning-results-dashboard";
import { QuestionReviewPanel } from "@/components/learner/results/question-review-panel";
import { HeritageWave } from "@/components/brand/heritage-wave";

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

type PreviewStage = "questions" | "completion" | "results" | "next" | "review";

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

function gradePreviewAnswers(
  assessment: Assessment,
  questions: AssessmentQuestion[],
  answers: Record<string, string>,
): AssessmentSubmissionResult {
  let correctCount = 0;
  for (const question of questions) {
    if (answers[question.id] === question.correctOptionId) {
      correctCount += 1;
    }
  }
  const totalQuestions = questions.length;
  const score =
    totalQuestions === 0
      ? 0
      : Math.round((correctCount / totalQuestions) * 100);

  return {
    attemptId: "preview",
    assessmentType: assessment.type,
    score,
    totalQuestions,
    correctCount,
    completedAt: new Date().toISOString(),
  };
}

function buildPreviewResultsView(
  assessment: Assessment,
  questions: AssessmentQuestion[],
  answers: Record<string, string>,
  result: AssessmentSubmissionResult,
): LearnerResultsDashboardView {
  const reviewAnswers = Object.entries(answers).map(
    ([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }),
  );
  const reviews = buildAttemptQuestionReviews(questions, reviewAnswers);
  const incorrectReviews = reviews.filter((item) => !item.isCorrect);

  return {
    attemptId: "preview",
    learnerDisplayName: "Preview learner",
    completedAt: result.completedAt,
    pre: null,
    post: {
      correctCount: result.correctCount,
      total: result.totalQuestions,
      score: result.score,
    },
    learningGainPercentagePoints: null,
    questionOutcomes: reviews.map((item, index) => ({
      index: index + 1,
      questionId: item.questionId,
      isCorrect: item.isCorrect,
    })),
    incorrectReviews,
  };
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
  const [previewStage, setPreviewStage] = useState<PreviewStage>("questions");
  const [result, setResult] = useState<AssessmentSubmissionResult | null>(
    initialCompletedAttempt
      ? {
          attemptId: initialCompletedAttempt.id,
          assessmentType: initialCompletedAttempt.assessmentType,
          score: initialCompletedAttempt.score ?? 0,
          totalQuestions: initialCompletedAttempt.totalQuestions,
          correctCount: initialCompletedAttempt.correctCount ?? 0,
          completedAt:
            initialCompletedAttempt.completedAt ?? new Date().toISOString(),
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

  function restartPreview() {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setValidationError(null);
    setSubmitError(null);
    setPreviewStage("questions");
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
      const previewResult = gradePreviewAnswers(
        assessment,
        previewQuestions,
        answers,
      );
      setResult(previewResult);
      setPreviewStage("completion");
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

  const previewResultsView = useMemo(() => {
    if (!isPreview || !result) {
      return null;
    }
    return buildPreviewResultsView(
      assessment,
      previewQuestions,
      answers,
      result,
    );
  }, [answers, assessment, isPreview, previewQuestions, result]);

  if (isPreview && result && previewStage === "completion") {
    return (
      <AssessmentCompletion
        assessmentTitle={assessment.title}
        result={result}
        continueHref={continueHref}
        continueLabel={continueLabel}
        onContinue={() =>
          setPreviewStage(assessment.type === "post" ? "results" : "next")
        }
        onSecondaryAction={restartPreview}
        secondaryLabel="Restart preview"
      />
    );
  }

  if (isPreview && result && previewStage === "results" && previewResultsView) {
    return (
      <LearningResultsDashboard
        view={previewResultsView}
        hideReportActions
        onReviewAnswers={() => setPreviewStage("review")}
      />
    );
  }

  if (isPreview && result && previewStage === "review" && previewResultsView) {
    return (
      <QuestionReviewPanel
        attemptId="preview"
        incorrectReviews={previewResultsView.incorrectReviews}
        onBackToResults={() => setPreviewStage("results")}
      />
    );
  }

  if (isPreview && result && previewStage === "next") {
    return (
      <section className="sl-card relative mx-auto w-full max-w-2xl overflow-hidden">
        <div className="space-y-5 px-4 py-6 sm:space-y-6 sm:px-8 sm:py-8">
          <header className="space-y-1.5 sm:space-y-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-sl-navy sm:text-3xl">
              Next for learners
            </h1>
            <p className="text-sm text-sl-ink-muted">
              After the pre-assessment, learners continue to the chapter journey
              at <span className="font-medium text-sl-navy">/learn/chapters</span>
              . Progress is not saved in admin preview.
            </p>
          </header>
          <button type="button" onClick={restartPreview} className="sl-btn-gold">
            Restart preview
          </button>
        </div>
        <HeritageWave className="h-12" />
      </section>
    );
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
