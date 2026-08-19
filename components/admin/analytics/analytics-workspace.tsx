import {
  exportAssessmentResultsCsvAction,
  exportChapterCompletionCsvAction,
  exportLearnerProgressCsvAction,
} from "@/lib/analytics/actions";
import type { AdminAnalyticsSummary, AnalyticsFilters } from "@/types/admin-analytics";

import { AnalyticsExportButtons } from "@/components/admin/analytics/analytics-export-buttons";

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {detail ? (
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}

function formatRate(value: number | null): string {
  return value === null ? "No data" : `${value}%`;
}

function formatScore(value: number | null): string {
  return value === null ? "No data" : `${value}%`;
}

function AnalyticsFiltersForm({
  filters,
  chapters,
}: {
  filters: AnalyticsFilters;
  chapters: { id: string; title: string }[];
}) {
  return (
    <form
      method="get"
      className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <label className="space-y-1 text-sm">
        <span className="font-medium">Assessment type</span>
        <select
          name="assessmentType"
          defaultValue={filters.assessmentType ?? "all"}
          className="w-full rounded-md border bg-background px-3 py-2"
        >
          <option value="all">All</option>
          <option value="pre">Pre-Assessment</option>
          <option value="post">Post-Assessment</option>
        </select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-medium">Chapter</span>
        <select
          name="chapterId"
          defaultValue={filters.chapterId ?? ""}
          className="w-full rounded-md border bg-background px-3 py-2"
        >
          <option value="">All chapters</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-medium">Date from</span>
        <input
          type="date"
          name="dateFrom"
          defaultValue={filters.dateFrom ?? ""}
          className="w-full rounded-md border bg-background px-3 py-2"
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-medium">Date to</span>
        <input
          type="date"
          name="dateTo"
          defaultValue={filters.dateTo ?? ""}
          className="w-full rounded-md border bg-background px-3 py-2"
        />
      </label>

      <div className="flex flex-wrap items-end gap-2 sm:col-span-2 xl:col-span-4">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Apply filters
        </button>
        <a
          href="/admin/analytics"
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Clear filters
        </a>
      </div>
    </form>
  );
}

interface AnalyticsWorkspaceProps {
  summary: AdminAnalyticsSummary;
}

export function AnalyticsWorkspace({ summary }: AnalyticsWorkspaceProps) {
  const { overview, chapters, learners, assessments, questions, dropOffs } =
    summary;

  return (
    <div className="space-y-10">
      <AnalyticsFiltersForm
        filters={summary.filters}
        chapters={chapters.map((chapter) => ({
          id: chapter.chapterId,
          title: chapter.title,
        }))}
      />

      {!summary.hasActivityData && overview.totalLearners === 0 ? (
        <section className="rounded-lg border border-dashed bg-card p-8 text-center">
          <h2 className="text-lg font-semibold">No learner activity yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Metrics will appear when learners register and begin chapters or
            assessments. No sample data is shown.
          </p>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total learners" value={overview.totalLearners} />
          <Metric label="Learners started" value={overview.learnersStarted} />
          <Metric
            label="Completed all chapters"
            value={overview.learnersCompletedAllChapters}
          />
          <Metric label="Total chapters" value={overview.totalChapters} />
          <Metric
            label="Completed chapter records"
            value={overview.totalCompletedChapterRecords}
          />
          <Metric
            label="Pre-assessment attempts"
            value={overview.preAssessmentAttempts}
          />
          <Metric
            label="Post-assessment attempts"
            value={overview.postAssessmentAttempts}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Chapter progress</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Chapter</th>
                <th className="px-4 py-3 font-medium">Started</th>
                <th className="px-4 py-3 font-medium">Completed</th>
                <th className="px-4 py-3 font-medium">Completion rate</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((chapter) => (
                <tr key={chapter.chapterId} className="border-t">
                  <td className="px-4 py-3">
                    {chapter.chapterNumber}. {chapter.title}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {chapter.startedLearners}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {chapter.completedLearners}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatRate(chapter.completionRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {dropOffs.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Chapter drop-off observations</h2>
          <ul className="space-y-3">
            {dropOffs.map((insight) => (
              <li
                key={insight.chapterId}
                className="rounded-lg border bg-card px-4 py-3 text-sm"
              >
                {insight.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Assessments</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {(["pre", "post"] as const).map((type) => {
            const metrics = assessments[type];
            return (
              <div key={type} className="rounded-lg border bg-card p-4">
                <h3 className="font-medium">
                  {metrics?.assessmentTitle ??
                    (type === "pre" ? "Pre-Assessment" : "Post-Assessment")}
                </h3>
                {metrics ? (
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">
                        Completed attempts
                      </dt>
                      <dd className="mt-1 text-xl font-semibold tabular-nums">
                        {metrics.completedAttempts}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">
                        Average score
                      </dt>
                      <dd className="mt-1 text-xl font-semibold tabular-nums">
                        {formatScore(metrics.averageScore)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">
                        Highest score
                      </dt>
                      <dd className="mt-1 tabular-nums">
                        {formatScore(metrics.highestScore)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">
                        Lowest score
                      </dt>
                      <dd className="mt-1 tabular-nums">
                        {formatScore(metrics.lowestScore)}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No completed attempts recorded.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {assessments.comparison ? (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium">Score comparison</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  Pre average
                </dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">
                  {formatScore(assessments.comparison.preAverageScore)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  Post average
                </dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">
                  {formatScore(assessments.comparison.postAverageScore)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  Score difference
                </dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">
                  {assessments.comparison.scoreDifference === null
                    ? "No data"
                    : `${assessments.comparison.scoreDifference > 0 ? "+" : ""}${assessments.comparison.scoreDifference} pts`}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">
                  Paired learners
                </dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">
                  {assessments.comparison.pairedLearnerCount}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Pre-only: {assessments.comparison.preOnlyCount} · Post-only:{" "}
              {assessments.comparison.postOnlyCount}. This shows raw score
              differences only — not a research conclusion.
            </p>

            {assessments.comparison.preAverageScore !== null &&
            assessments.comparison.postAverageScore !== null ? (
              <div
                className="mt-6 space-y-3"
                role="img"
                aria-label="Pre and post average score comparison chart"
              >
                {[
                  {
                    label: "Pre-Assessment average",
                    value: assessments.comparison.preAverageScore,
                  },
                  {
                    label: "Post-Assessment average",
                    value: assessments.comparison.postAverageScore,
                  },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{bar.label}</span>
                      <span className="tabular-nums">{bar.value}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-muted">
                      <div
                        className="h-3 rounded-full bg-primary"
                        style={{ width: `${Math.min(bar.value, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Learners</h2>
        {learners.length === 0 ? (
          <p className="text-sm text-muted-foreground">No learner records available.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Learner</th>
                  <th className="px-4 py-3 font-medium">Progress</th>
                  <th className="px-4 py-3 font-medium">Current chapter</th>
                  <th className="px-4 py-3 font-medium">Pre</th>
                  <th className="px-4 py-3 font-medium">Post</th>
                </tr>
              </thead>
              <tbody>
                {learners.map((learner) => (
                  <tr key={learner.learnerId} className="border-t">
                    <td className="px-4 py-3">{learner.displayLabel}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {learner.chaptersCompleted}/{learner.totalChapters}
                      {learner.progressPercentage !== null
                        ? ` (${learner.progressPercentage}%)`
                        : ""}
                    </td>
                    <td className="px-4 py-3">
                      {learner.currentChapterTitle ?? "—"}
                    </td>
                    <td className="px-4 py-3">{learner.preAssessmentStatus}</td>
                    <td className="px-4 py-3">{learner.postAssessmentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Question performance</h2>
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No question responses recorded for the selected filters.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Assessment</th>
                  <th className="px-4 py-3 font-medium">Question</th>
                  <th className="px-4 py-3 font-medium">Responses</th>
                  <th className="px-4 py-3 font-medium">Correct</th>
                  <th className="px-4 py-3 font-medium">Incorrect</th>
                  <th className="px-4 py-3 font-medium">Correct %</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.questionId} className="border-t">
                    <td className="px-4 py-3">{question.assessmentTitle}</td>
                    <td className="max-w-md px-4 py-3">{question.prompt}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {question.responseCount}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {question.correctCount}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {question.incorrectCount}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatRate(question.correctPercentage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Exports</h2>
        <AnalyticsExportButtons
          filters={summary.filters}
          exportLearnerProgress={exportLearnerProgressCsvAction}
          exportAssessmentResults={exportAssessmentResultsCsvAction}
          exportChapterCompletion={exportChapterCompletionCsvAction}
        />
      </section>
    </div>
  );
}
