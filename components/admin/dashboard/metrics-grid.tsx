import type { AdminDashboardSummary } from "@/types/admin-dashboard";

interface MetricProps {
  label: string;
  value: number | string;
  detail?: string;
}

function Metric({ label, value, detail }: MetricProps) {
  return (
    <div className="rounded-2xl border border-[color:rgba(44,36,22,0.08)] bg-white/80 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sl-ink-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-sl-navy">
        {value}
      </p>
      {detail ? (
        <p className="mt-1 text-xs text-sl-ink-muted">{detail}</p>
      ) : null}
    </div>
  );
}

interface MetricsGridProps {
  summary: AdminDashboardSummary;
}

export function MetricsGrid({ summary }: MetricsGridProps) {
  const { chapters } = summary;

  return (
    <section aria-labelledby="dashboard-metrics-heading">
      <h2 id="dashboard-metrics-heading" className="sr-only">
        Overview metrics
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total chapters"
          value={chapters.total}
          detail="Official Sugidanon catalog"
        />
        <Metric
          label="Chapters with content"
          value={chapters.withPublishedContent}
          detail="At least one approved section"
        />
        <Metric
          label="Awaiting review"
          value={chapters.forReview}
          detail="Submitted for approval"
        />
        <Metric
          label="Approved chapters"
          value={chapters.approved}
          detail="Review status approved"
        />
        <Metric label="Media assets" value={summary.mediaAssetCount} />
        <Metric
          label="Assessment questions"
          value={summary.questionCount}
          detail={
            summary.assessmentCount > 0
              ? `${summary.assessmentCount} assessment${summary.assessmentCount === 1 ? "" : "s"}`
              : "No assessments yet"
          }
        />
        <Metric
          label="Learners"
          value={summary.learnerCount}
          detail={
            summary.learnerCount === 0
              ? "No learner accounts yet"
              : "Registered learner profiles"
          }
        />
        <Metric
          label="Pending content"
          value={chapters.pendingContent}
          detail="Chapters without published sections"
        />
      </div>
    </section>
  );
}
