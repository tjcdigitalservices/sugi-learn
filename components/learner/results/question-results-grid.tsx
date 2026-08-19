import { Check, X } from "lucide-react";

import type { QuestionOutcomeSummary } from "@/types/assessment";
import { cn } from "@/lib/utils";

interface QuestionResultsGridProps {
  outcomes: QuestionOutcomeSummary[];
}

export function QuestionResultsGrid({ outcomes }: QuestionResultsGridProps) {
  return (
    <section className="space-y-4" aria-labelledby="question-results-heading">
      <h2
        id="question-results-heading"
        className="font-display text-xl font-semibold text-sl-navy"
      >
        Question Results
      </h2>

      <ul className="flex flex-wrap gap-3">
        {outcomes.map((outcome) => (
          <li
            key={outcome.questionId}
            className="flex w-11 flex-col items-center gap-1.5 sm:w-12"
          >
            <span
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full",
                outcome.isCorrect
                  ? "bg-emerald-500/10 text-emerald-700/70"
                  : "bg-rose-500/10 text-rose-700/70",
              )}
              aria-label={
                outcome.isCorrect
                  ? `Question ${outcome.index} correct`
                  : `Question ${outcome.index} incorrect`
              }
            >
              {outcome.isCorrect ? (
                <Check className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />
              ) : (
                <X className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />
              )}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-sl-ink-muted">
              Q{outcome.index}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-4 text-xs text-sl-ink-muted">
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700/70">
            <Check className="h-3 w-3" aria-hidden="true" />
          </span>
          Correct
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/10 text-rose-700/70">
            <X className="h-3 w-3" aria-hidden="true" />
          </span>
          Incorrect
        </span>
      </div>
    </section>
  );
}
