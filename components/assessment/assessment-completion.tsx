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
      className="sl-card relative mx-auto max-w-2xl overflow-hidden"
    >
      <div className="space-y-6 px-6 py-8 sm:px-8">
        <header className="space-y-2">
          <h1
            id="assessment-completion-heading"
            className="font-display text-3xl font-semibold tracking-tight text-sl-navy"
          >
            Assessment completed
          </h1>
          <p className="text-sm text-sl-ink-muted">
            Your responses have been saved.
          </p>
        </header>

        <dl className="grid gap-4 rounded-xl border border-[color:rgba(44,36,22,0.08)] bg-white/70 p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-sl-ink-muted">
              Score
            </dt>
            <dd className="mt-1 font-display text-3xl font-semibold tabular-nums text-sl-navy">
              {result.score}%
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-sl-ink-muted">
              Correct answers
            </dt>
            <dd className="mt-1 font-display text-3xl font-semibold tabular-nums text-sl-navy">
              {result.correctCount} of {result.totalQuestions}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/learn"
            className="inline-flex items-center rounded-full border border-[color:rgba(44,36,22,0.15)] px-5 py-3 text-sm font-medium text-sl-ink transition hover:bg-white"
          >
            Back to home
          </Link>
          <Link href={continueHref} className="sl-btn-gold">
            {continueLabel}
          </Link>
        </div>
      </div>
      <HeritageWave className="h-12" />
    </section>
  );
}
