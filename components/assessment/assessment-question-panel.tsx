"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Bookmark } from "lucide-react";

import { HeritageWave } from "@/components/brand/heritage-wave";
import { cn } from "@/lib/utils";
import type { LearnerAssessmentQuestion } from "@/types/assessment";

interface AssessmentQuestionPanelProps {
  assessmentTitle: string;
  assessmentType?: "pre" | "post" | string;
  question: LearnerAssessmentQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
  validationError: string | null;
  submitError?: string | null;
  previewMode?: boolean;
  correctOptionId?: string | null;
}

function bookmarkKey(assessmentTitle: string) {
  return `sugilearn:bookmarks:${assessmentTitle}`;
}

export function AssessmentQuestionPanel({
  assessmentTitle,
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  onPrevious,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  isSubmitting = false,
  validationError,
  submitError = null,
  previewMode = false,
  correctOptionId = null,
}: AssessmentQuestionPanelProps) {
  const groupName = `question-${question.id}`;
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(bookmarkKey(assessmentTitle));
      const ids: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      setBookmarked(ids.includes(question.id));
    } catch {
      setBookmarked(false);
    }
  }, [assessmentTitle, question.id]);

  function toggleBookmark() {
    try {
      const raw = localStorage.getItem(bookmarkKey(assessmentTitle));
      const ids: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      const next = ids.includes(question.id)
        ? ids.filter((id) => id !== question.id)
        : [...ids, question.id];
      localStorage.setItem(bookmarkKey(assessmentTitle), JSON.stringify(next));
      setBookmarked(next.includes(question.id));
    } catch {
      // Ignore storage failures (private mode, etc.)
    }
  }

  return (
    <article
      aria-labelledby={`${groupName}-prompt`}
      className="sl-card relative mx-auto w-full max-w-2xl"
    >
      <div className="space-y-6 px-5 py-7 sm:px-8">
        <p className="text-center text-sm font-medium text-sl-ink-muted" aria-live="polite">
          Question {questionNumber} of {totalQuestions}
        </p>

        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-[color:rgba(44,36,22,0.12)]" />
          <div
            className="h-2 w-2 rotate-45 bg-sl-gold"
            aria-hidden="true"
          />
          <div className="h-px flex-1 bg-[color:rgba(44,36,22,0.12)]" />
        </div>

        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-[color:rgba(44,36,22,0.1)]"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={totalQuestions}
          aria-valuenow={questionNumber}
          aria-label={`Assessment progress: question ${questionNumber} of ${totalQuestions}`}
        >
          <div
            className="h-full rounded-full bg-sl-gold transition-all"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>

        <h1
          id={`${groupName}-prompt`}
          className="font-display text-2xl font-semibold leading-snug tracking-tight text-sl-navy sm:text-3xl"
        >
          {question.prompt}
        </h1>

        <fieldset className="space-y-3">
          <legend className="sr-only">Answer choices</legend>
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrect = previewMode && correctOptionId === option.id;
            return (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-sm transition-colors",
                  "focus-within:ring-2 focus-within:ring-sl-gold",
                  isSelected
                    ? "border-sl-gold bg-sl-gold-soft/60"
                    : "border-[color:rgba(44,36,22,0.12)] bg-white hover:bg-sl-cream-deep/60",
                  isCorrect ? "border-emerald-500 bg-emerald-50/80" : null,
                )}
              >
                <input
                  type="radio"
                  name={groupName}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => onSelectOption(option.id)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--sl-gold)]"
                />
                <span className="leading-relaxed text-sl-ink">
                  {option.label}
                  {isCorrect ? (
                    <span className="ml-2 text-xs font-medium text-emerald-700">
                      (Correct answer)
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </fieldset>

        {(validationError || submitError) && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {validationError ?? submitError}
          </p>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={toggleBookmark}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition",
              bookmarked
                ? "text-sl-gold"
                : "text-sl-ink-muted hover:text-sl-navy",
            )}
            aria-pressed={bookmarked}
          >
            <Bookmark
              className={cn("h-4 w-4", bookmarked ? "fill-current" : null)}
              aria-hidden="true"
            />
            Bookmark
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {!isFirst ? (
              <button
                type="button"
                onClick={onPrevious}
                disabled={isSubmitting}
                className="inline-flex items-center rounded-full border border-[color:rgba(44,36,22,0.15)] px-4 py-2 text-sm font-medium text-sl-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
            ) : null}

            {isLast ? (
              previewMode ? (
                <span className="text-sm text-sl-ink-muted">End of preview</span>
              ) : (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="sl-btn-gold"
                >
                  {isSubmitting ? "Submitting…" : "Submit"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={onNext}
                disabled={isSubmitting}
                className="sl-btn-gold"
              >
                Next
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </footer>
      </div>

      <HeritageWave className="h-12" />
    </article>
  );
}
