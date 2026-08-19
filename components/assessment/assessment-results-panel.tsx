import Link from "next/link";

import type { AssessmentResultsView } from "@/types/assessment";

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatSignedChange(value: number | null, suffix = ""): string {
  if (value === null) {
    return "—";
  }
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value}${suffix}`;
}

interface AssessmentResultsViewProps {
  view: AssessmentResultsView;
}

export function AssessmentResultsPanel({ view }: AssessmentResultsViewProps) {
  const { attempt, assessmentTitle, comparison, history } = view;
  const score = attempt.score ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Results
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {assessmentTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          Completed on {formatDate(attempt.completedAt)}
        </p>
      </header>

      <section
        aria-labelledby="post-results-heading"
        className="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
      >
        <h2 id="post-results-heading" className="text-lg font-semibold">
          Assessment completed
        </h2>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Score
            </dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums">{score}%</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Correct answers
            </dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums">
              {attempt.correctCount ?? "—"} of {attempt.totalQuestions}
            </dd>
          </div>
        </dl>

        <p className="text-xs text-muted-foreground">
          Scores show how many questions you answered correctly.
        </p>
      </section>

      {comparison ? (
        <section
          aria-labelledby="score-comparison-heading"
          className="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
        >
          <h2 id="score-comparison-heading" className="text-lg font-semibold">
            Score comparison
          </h2>

          {comparison.preAttempt ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border bg-muted/20 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Pre-Assessment
                </dt>
                <dd className="mt-2 text-xl font-semibold tabular-nums">
                  {comparison.preAttempt.correctCount ?? "—"} /{" "}
                  {comparison.preAttempt.totalQuestions}
                </dd>
                <dd className="mt-1 text-sm text-muted-foreground tabular-nums">
                  {comparison.preAttempt.score ?? 0}%
                </dd>
              </div>
              <div className="rounded-md border bg-muted/20 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Post-Assessment
                </dt>
                <dd className="mt-2 text-xl font-semibold tabular-nums">
                  {comparison.postAttempt.correctCount ?? "—"} /{" "}
                  {comparison.postAttempt.totalQuestions}
                </dd>
                <dd className="mt-1 text-sm text-muted-foreground tabular-nums">
                  {comparison.postAttempt.score ?? 0}%
                </dd>
              </div>
              <div className="sm:col-span-2 rounded-md border border-dashed p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Change in score
                </dt>
                <dd className="mt-2 text-base font-medium tabular-nums">
                  {formatSignedChange(comparison.correctCountChange)} questions
                </dd>
                <dd className="mt-1 text-sm text-muted-foreground tabular-nums">
                  {formatSignedChange(comparison.percentagePointChange)} percentage points
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              Pre-Assessment results are not available for comparison.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            This comparison shows raw score differences only. It is not a research
            conclusion about learning effectiveness.
          </p>
        </section>
      ) : null}

      {history.length > 1 ? (
        <section
          aria-labelledby="attempt-history-heading"
          className="space-y-4 rounded-lg border bg-card p-6 shadow-sm"
        >
          <h2 id="attempt-history-heading" className="text-lg font-semibold">
            Assessment history
          </h2>
          <ul className="divide-y rounded-md border">
            {history.map((item) => (
              <li key={item.attemptId} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{item.assessmentTitle}</p>
                  <p className="text-muted-foreground">
                    {formatDate(item.completedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums">
                    {item.correctCount ?? "—"} / {item.totalQuestions} ({item.score ?? 0}%)
                  </span>
                  {item.attemptId === attempt.id ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      Current
                    </span>
                  ) : (
                    <Link
                      href={`/learn/results/${item.attemptId}`}
                      className="text-sm font-medium underline underline-offset-4"
                    >
                      View
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Your most recent completed attempt for each assessment is shown.
          </p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/learn"
          className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to home
        </Link>
        <Link
          href="/learn/chapters"
          className="inline-flex items-center rounded-md border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Review chapters
        </Link>
      </div>
    </div>
  );
}
