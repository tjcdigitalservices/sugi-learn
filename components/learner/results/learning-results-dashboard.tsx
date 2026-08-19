import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    <div className="mx-auto max-w-3xl pb-10">
      <article className="sl-card relative space-y-8 px-5 py-7 sm:px-8 sm:py-9">
        <p className="text-center text-sm font-medium text-sl-navy">
          Completed on {formatCompletedDate(view.completedAt)}
        </p>

        <ResultsScoreCards view={view} />

        <QuestionResultsGrid outcomes={view.questionOutcomes} />

        <div className="space-y-3">
          <div className="flex justify-end">
            <Link
              href={`/learn/results/${view.attemptId}/review`}
              className="sl-btn-gold w-full sm:w-auto"
            >
              Review Your Answers
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {!hasIncorrect ? (
            <p className="text-right text-xs text-sl-ink-muted">
              You answered every question correctly. Review still opens a
              celebration summary.
            </p>
          ) : null}
          <ResultsReportActions view={view} />
        </div>

        <HeritageWave className="!h-12 opacity-30" tone="gold" />
      </article>
    </div>
  );
}
