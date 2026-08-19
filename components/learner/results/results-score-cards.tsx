import type { LearnerResultsDashboardView } from "@/types/assessment";
import { cn } from "@/lib/utils";

function formatCompletedDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatGainValue(value: number | null): string {
  if (value === null) {
    return "—";
  }
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value}`;
}

interface ScoreCardsProps {
  view: Pick<
    LearnerResultsDashboardView,
    "pre" | "post" | "learningGainPercentagePoints"
  >;
  compact?: boolean;
}

export function ResultsScoreCards({ view, compact = false }: ScoreCardsProps) {
  const cardPad = compact ? "px-4 py-4" : "px-4 py-5 sm:px-5 sm:py-6";
  const scoreClass = compact
    ? "mt-2 text-2xl font-semibold tabular-nums leading-none"
    : "mt-3 text-3xl font-semibold tabular-nums leading-none sm:text-4xl";
  const labelClass =
    "text-xs font-semibold uppercase tracking-[0.14em]";

  return (
    <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
      <article
        className={cn(
          "rounded-2xl border border-[color:rgba(92,127,166,0.35)] bg-[color:rgba(92,127,166,0.12)]",
          cardPad,
        )}
      >
        <p className={cn(labelClass, "text-sl-stone")}>Pre-Test</p>
        {view.pre ? (
          <>
            <p className={cn(scoreClass, "text-sl-navy")}>
              {view.pre.correctCount}/{view.pre.total}
            </p>
            <p className="mt-2 text-sm font-medium tabular-nums text-sl-ink-muted">
              {view.pre.score}%
            </p>
          </>
        ) : (
          <p className={cn(scoreClass, "text-sl-ink-muted")}>—</p>
        )}
      </article>

      <article
        className={cn(
          "rounded-2xl border border-[color:rgba(46,94,78,0.35)] bg-[color:rgba(46,94,78,0.12)]",
          cardPad,
        )}
      >
        <p className={cn(labelClass, "text-sl-forest")}>Post-Test</p>
        <p className={cn(scoreClass, "text-sl-navy")}>
          {view.post.correctCount}/{view.post.total}
        </p>
        <p className="mt-2 text-sm font-medium tabular-nums text-sl-ink-muted">
          {view.post.score}%
        </p>
      </article>

      <article
        className={cn(
          "rounded-2xl border border-[color:rgba(209,165,58,0.45)] bg-[color:rgba(240,212,138,0.45)]",
          cardPad,
        )}
      >
        <p className={cn(labelClass, "text-[#9a7420]")}>Learning Gain</p>
        <p
          className={cn(
            scoreClass,
            view.learningGainPercentagePoints !== null &&
              view.learningGainPercentagePoints > 0
              ? "text-emerald-700"
              : "text-sl-navy",
          )}
        >
          {formatGainValue(view.learningGainPercentagePoints)}
        </p>
        {view.learningGainPercentagePoints !== null ? (
          <p className="mt-2 text-sm font-medium text-sl-ink-muted">
            percentage points
          </p>
        ) : null}
      </article>
    </div>
  );
}

export { formatCompletedDate };
