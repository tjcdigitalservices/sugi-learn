"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Info, X } from "lucide-react";

import { HeritageWave } from "@/components/brand/heritage-wave";
import type { AttemptQuestionReviewItem } from "@/types/assessment";
import { cn } from "@/lib/utils";

interface QuestionReviewPanelProps {
  attemptId: string;
  incorrectReviews: AttemptQuestionReviewItem[];
}

export function QuestionReviewPanel({
  attemptId,
  incorrectReviews,
}: QuestionReviewPanelProps) {
  const [index, setIndex] = useState(0);
  const total = incorrectReviews.length;

  if (total === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-6">
        <Link
          href={`/learn/results/${attemptId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-sl-ink-muted transition hover:text-sl-navy"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Results
        </Link>

        <div className="sl-card space-y-4 p-8 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="font-display text-2xl font-semibold text-sl-navy">
            All answers correct
          </h1>
          <p className="text-sm text-sl-ink-muted">
            There are no incorrect answers to review for this attempt.
          </p>
          <Link href={`/learn/results/${attemptId}`} className="sl-btn-gold">
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  const item = incorrectReviews[index];
  const explanation =
    item.explanation?.trim() ||
    "No explanation was provided for this question.";

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/learn/results/${attemptId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-sl-ink-muted transition hover:text-sl-navy"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Results
        </Link>
        <p className="text-sm font-medium text-sl-ink-muted">
          Question {index + 1} of {total}
        </p>
        <span className="w-28" aria-hidden="true" />
      </div>

      <div className="sl-card relative space-y-6 overflow-hidden p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold leading-snug text-sl-navy sm:text-[1.75rem]">
          {item.prompt}
        </h1>

        <div className="space-y-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-700">
              Your answer
            </p>
            <p className="flex items-start gap-2 text-sm text-rose-950">
              <X
                className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"
                aria-hidden="true"
              />
              <span>{item.selectedLabel ?? "No answer selected"}</span>
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Correct answer
            </p>
            <p className="flex items-start gap-2 text-sm text-emerald-950">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                aria-hidden="true"
              />
              <span>{item.correctLabel}</span>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[color:rgba(11,29,58,0.12)] bg-[color:rgba(11,29,58,0.04)] px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-sl-navy">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sl-navy text-white">
              <Info className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Explanation
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-sl-ink">{explanation}</p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
            disabled={index === 0}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-[color:rgba(44,36,22,0.15)] bg-white px-4 py-2 text-sm font-medium text-sl-ink transition disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </button>
          <button
            type="button"
            onClick={() =>
              setIndex((value) => Math.min(total - 1, value + 1))
            }
            disabled={index >= total - 1}
            className="inline-flex items-center gap-2 rounded-full bg-sl-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--sl-navy-deep)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <HeritageWave className="!absolute bottom-0 left-0 !h-14 w-full opacity-25" />
      </div>
    </div>
  );
}
