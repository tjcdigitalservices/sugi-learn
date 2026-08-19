import Link from "next/link";
import { ArrowRight, PartyPopper } from "lucide-react";

import { HeritageWave } from "@/components/brand/heritage-wave";
import { QuestionResultsGrid } from "@/components/learner/results/question-results-grid";
import { ResultsReportActions } from "@/components/learner/results/results-report-actions";
import {
  formatCompletedDate,
  ResultsScoreCards,
} from "@/components/learner/results/results-score-cards";
import type { LearnerResultsDashboardView } from "@/types/assessment";

interface LearningResultsDashboardProps {
  view: LearnerResultsDashboardView;
}

export function LearningResultsDashboard({
  view,
}: LearningResultsDashboardProps) {
  const hasIncorrect = view.incorrectReviews.length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-10">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sl-gold">
          <PartyPopper className="h-5 w-5" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">
            Completed {formatCompletedDate(view.completedAt)}
          </p>
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-sl-navy sm:text-4xl">
          Learning Results
        </h1>
        {view.learnerDisplayName ? (
          <p className="text-sm text-sl-ink-muted sm:text-base">
            Well done, {view.learnerDisplayName}. Here is how your learning
            journey measured up.
          </p>
        ) : (
          <p className="text-sm text-sl-ink-muted sm:text-base">
            Here is how your learning journey measured up.
          </p>
        )}
      </header>

      <ResultsScoreCards view={view} />

      <div className="sl-card relative space-y-6 p-6 sm:p-8">
        <QuestionResultsGrid outcomes={view.questionOutcomes} />

        <div className="space-y-3 pt-2">
          <Link
            href={`/learn/results/${view.attemptId}/review`}
            className="sl-btn-gold w-full"
          >
            Review Your Answers
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {!hasIncorrect ? (
            <p className="text-center text-xs text-sl-ink-muted">
              You answered every question correctly. Review still opens a
              celebration summary.
            </p>
          ) : null}
          <ResultsReportActions view={view} />
        </div>

        <HeritageWave className="!h-12 opacity-30" tone="gold" />
      </div>

      <p className="text-center text-sm italic text-sl-ink-muted">
        Learning Culture. Building Tomorrow, Together.
      </p>
    </div>
  );
}
