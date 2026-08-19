import Link from "next/link";

import { HeritageWave } from "@/components/brand/heritage-wave";
import type { AssessmentSubmissionResult } from "@/types/assessment";

interface AssessmentCompletionProps {
  assessmentTitle: string;
  result: AssessmentSubmissionResult;
  continueHref: string;
  continueLabel: string;
}

export function AssessmentCompletion({
  result,
  continueHref,
  continueLabel,
}: AssessmentCompletionProps) {
  return (
    <section
      aria-labelledby="assessment-completion-heading"
      className="sl-card relative mx-auto w-full max-w-2xl overflow-hidden"
    >
      <div className="space-y-5 px-4 py-6 sm:space-y-6 sm:px-8 sm:py-8">
        <header className="space-y-1.5 sm:space-y-2">
          <h1
            id="assessment-completion-heading"
            className="font-display text-2xl font-semibold tracking-tight text-sl-navy sm:text-3xl"
          >
            Assessment completed
          </h1>
          <p className="text-sm text-sl-ink-muted">
            Your responses have been saved.
          </p>
        </header>

        <dl className="grid grid-cols-2 gap-3 rounded-xl border border-[color:rgba(44,36,22,0.08)] bg-white/70 p-3 sm:gap-4 sm:p-4">
          <div className="min-w-0">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-sl-ink-muted sm:text-xs">
              Score
            </dt>
            <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-sl-navy sm:text-3xl">
              {result.score}%
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-sl-ink-muted sm:text-xs">
              Correct answers
            </dt>
            <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-sl-navy sm:text-3xl">
              {result.correctCount} of {result.totalQuestions}
            </dd>
          </div>
        </dl>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Link
            href="/learn"
            className="inline-flex items-center justify-center rounded-full border border-[color:rgba(44,36,22,0.15)] px-3 py-3 text-center text-sm font-medium text-sl-ink transition hover:bg-white sm:px-5"
          >
            Back to home
          </Link>
          <Link
            href={continueHref}
            className="sl-btn-gold justify-center px-3 text-center sm:px-5"
          >
            {continueLabel}
          </Link>
        </div>
      </div>
      <HeritageWave className="h-12" />
    </section>
  );
}
