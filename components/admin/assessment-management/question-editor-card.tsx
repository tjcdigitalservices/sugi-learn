"use client";

import { useEffect, useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import {
  buttonDangerClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  FormFeedback,
  FormField,
  formControlClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import { REVIEW_STATUS_OPTIONS } from "@/lib/assessment-management/constants";
import {
  deleteQuestionAction,
  reorderQuestionsAction,
  saveQuestionAction,
} from "@/lib/assessment-management/actions";
import type { AssessmentQuestion } from "@/types/assessment";
import type { QuestionOptionInput } from "@/types/assessment-management";
import type { ReviewStatus } from "@/types/review";
import type { ChapterSummary } from "@/types/chapter";

interface QuestionEditorCardProps {
  assessmentId: string;
  question: AssessmentQuestion;
  questionIndex: number;
  questionCount: number;
  allQuestionIds: string[];
  chapters: ChapterSummary[];
  onChanged: () => void;
}

function buildOptionsFromQuestion(question: AssessmentQuestion): QuestionOptionInput[] {
  return question.options.map((option) => ({
    id: option.id,
    label: option.label,
    sortOrder: option.sortOrder,
    isCorrect: option.id === question.correctOptionId,
  }));
}

export function QuestionEditorCard({
  assessmentId,
  question,
  questionIndex,
  questionCount,
  allQuestionIds,
  chapters,
  onChanged,
}: QuestionEditorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [prompt, setPrompt] = useState(question.prompt);
  const [explanation, setExplanation] = useState(question.explanation ?? "");
  const [sourceReference, setSourceReference] = useState(
    question.sourceReference ?? "",
  );
  const [chapterId, setChapterId] = useState(question.chapterId ?? "");
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    question.reviewStatus,
  );
  const [options, setOptions] = useState<QuestionOptionInput[]>(
    buildOptionsFromQuestion(question),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPrompt(question.prompt);
    setExplanation(question.explanation ?? "");
    setSourceReference(question.sourceReference ?? "");
    setChapterId(question.chapterId ?? "");
    setReviewStatus(question.reviewStatus);
    setOptions(buildOptionsFromQuestion(question));
  }, [question]);

  function updateOption(index: number, patch: Partial<QuestionOptionInput>) {
    setOptions((previous) =>
      previous.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    );
  }

  function markCorrect(index: number) {
    setOptions((previous) =>
      previous.map((option, optionIndex) => ({
        ...option,
        isCorrect: optionIndex === index,
      })),
    );
  }

  function addOption() {
    setOptions((previous) => [
      ...previous,
      {
        label: "",
        sortOrder: previous.length,
        isCorrect: previous.length === 0,
      },
    ]);
  }

  function removeOption(index: number) {
    setOptions((previous) => {
      const next = previous.filter((_, optionIndex) => optionIndex !== index);
      if (next.length > 0 && !next.some((option) => option.isCorrect)) {
        next[0] = { ...next[0], isCorrect: true };
      }
      return next.map((option, optionIndex) => ({
        ...option,
        sortOrder: optionIndex,
      }));
    });
  }

  function moveQuestion(direction: "up" | "down") {
    const targetIndex = direction === "up" ? questionIndex - 1 : questionIndex + 1;
    if (targetIndex < 0 || targetIndex >= questionCount) {
      return;
    }

    const reordered = [...allQuestionIds];
    [reordered[questionIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[questionIndex],
    ];

    startTransition(async () => {
      const result = await reorderQuestionsAction(assessmentId, reordered);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onChanged();
    });
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await saveQuestionAction(assessmentId, question.id, {
        prompt,
        explanation: explanation.trim() ? explanation.trim() : null,
        sourceReference: sourceReference.trim() ? sourceReference.trim() : null,
        chapterId: chapterId || null,
        reviewStatus,
        options: options.map((option, index) => ({
          ...option,
          sortOrder: index,
        })),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess("Question saved.");
      onChanged();
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Remove this question? If learners have already answered it, it will be retired (set to Draft and hidden from learners) instead of permanently deleted.",
    );
    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteQuestionAction(assessmentId, question.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (result.data.outcome === "retired") {
        setSuccess(
          "Retired — hidden from learners because responses exist. Status set to Draft.",
        );
      }
      onChanged();
    });
  }

  return (
    <article className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 items-start gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={expanded}
        >
          <span className="mt-0.5 text-muted-foreground">
            {expanded ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Question {questionIndex + 1}
            </span>
            <span className="block truncate font-medium">{question.prompt}</span>
          </span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <ReviewStatusBadge status={question.reviewStatus} />
          <button
            type="button"
            onClick={() => moveQuestion("up")}
            disabled={isPending || questionIndex === 0}
            className={buttonSecondaryClassName}
            aria-label="Move question up"
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => moveQuestion("down")}
            disabled={isPending || questionIndex === questionCount - 1}
            className={buttonSecondaryClassName}
            aria-label="Move question down"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {expanded ? (
        <form onSubmit={handleSave} className="space-y-5 border-t px-4 py-5">
          <FormField label="Question text" htmlFor={`prompt-${question.id}`}>
            <textarea
              id={`prompt-${question.id}`}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={3}
              required
              className={formControlClassName}
            />
          </FormField>

          <FormField
            label="Explanation"
            htmlFor={`explanation-${question.id}`}
            hint="Optional explanation shown after submission when supported."
          >
            <textarea
              id={`explanation-${question.id}`}
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              rows={2}
              className={formControlClassName}
            />
          </FormField>

          <FormField
            label="Source reference"
            htmlFor={`source-${question.id}`}
            hint="Traceability to approved learning material. Do not invent references."
          >
            <input
              id={`source-${question.id}`}
              value={sourceReference}
              onChange={(event) => setSourceReference(event.target.value)}
              className={formControlClassName}
            />
          </FormField>

          <FormField label="Chapter association" htmlFor={`chapter-${question.id}`}>
            <select
              id={`chapter-${question.id}`}
              value={chapterId}
              onChange={(event) => setChapterId(event.target.value)}
              className={formControlClassName}
            >
              <option value="">No chapter association</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.number}. {chapter.title}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Review status" htmlFor={`status-${question.id}`}>
            <select
              id={`status-${question.id}`}
              value={reviewStatus}
              onChange={(event) =>
                setReviewStatus(event.target.value as ReviewStatus)
              }
              className={formControlClassName}
            >
              {REVIEW_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Answer options</legend>
            {options.map((option, index) => (
              <div
                key={option.id ?? `new-${index}`}
                className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center"
              >
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={option.isCorrect}
                  onChange={() => markCorrect(index)}
                  aria-label={`Mark option ${index + 1} as correct`}
                  className="size-4 accent-primary"
                />
                <input
                  value={option.label}
                  onChange={(event) =>
                    updateOption(index, { label: event.target.value })
                  }
                  placeholder={`Option ${index + 1}`}
                  className={`${formControlClassName} flex-1`}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2 || isPending}
                  className={buttonDangerClassName}
                  aria-label={`Remove option ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              disabled={isPending}
              className={buttonSecondaryClassName}
            >
              <Plus className="mr-1 inline h-4 w-4" aria-hidden="true" />
              Add option
            </button>
          </fieldset>

          <FormFeedback error={error} success={success} />

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={isPending} className={buttonPrimaryClassName}>
              {isPending ? "Saving…" : "Save question"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className={buttonDangerClassName}
            >
              Remove question
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}
