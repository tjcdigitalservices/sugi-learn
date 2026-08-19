import type { LearnerResultsDashboardView } from "@/types/assessment";

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

function formatGain(value: number | null): string {
  if (value === null) {
    return "—";
  }
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value} percentage points`;
}

interface ScoreCardsProps {
  view: Pick<
    LearnerResultsDashboardView,
    "pre" | "post" | "learningGainPercentagePoints"
  >;
  compact?: boolean;
}

export function ResultsScoreCards({ view, compact = false }: ScoreCardsProps) {
  const cardPad = compact ? "p-4" : "p-5 sm:p-6";
  const scoreClass = compact
    ? "mt-2 text-2xl font-semibold tabular-nums"
    : "mt-3 text-3xl font-semibold tabular-nums sm:text-4xl";

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <article
        className={`rounded-2xl border border-[color:rgba(92,127,166,0.35)] bg-[color:rgba(92,127,166,0.12)] ${cardPad}`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sl-stone">
          Pre-Test
        </p>
        {view.pre ? (
          <>
            <p className={`${scoreClass} text-sl-navy`}>
              {view.pre.correctCount}/{view.pre.total}
            </p>
            <p className="mt-1 text-sm font-medium text-sl-ink-muted">
              {view.pre.score}%
            </p>
          </>
        ) : (
          <p className={`${scoreClass} text-sl-ink-muted`}>—</p>
        )}
      </article>

      <article
        className={`rounded-2xl border border-[color:rgba(46,94,78,0.35)] bg-[color:rgba(46,94,78,0.12)] ${cardPad}`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sl-forest">
          Post-Test
        </p>
        <p className={`${scoreClass} text-sl-navy`}>
          {view.post.correctCount}/{view.post.total}
        </p>
        <p className="mt-1 text-sm font-medium text-sl-ink-muted">
          {view.post.score}%
        </p>
      </article>

      <article
        className={`rounded-2xl border border-[color:rgba(209,165,58,0.45)] bg-[color:rgba(240,212,138,0.45)] ${cardPad}`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a7420]">
          Learning Gain
        </p>
        <p className={`${scoreClass} text-sl-navy`}>
          {formatGain(view.learningGainPercentagePoints)}
        </p>
      </article>
    </div>
  );
}

export { formatCompletedDate };
