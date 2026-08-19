import Link from "next/link";

import type { ParticipationOverview } from "@/types/admin-analytics";

interface ParticipationSummaryProps {
  participation: ParticipationOverview;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[color:rgba(44,36,22,0.08)] bg-[var(--sl-cream-deep)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sl-ink-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-sl-navy">
        {value}
      </p>
    </div>
  );
}

export function ParticipationSummary({
  participation,
}: ParticipationSummaryProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-[color:rgba(44,36,22,0.08)] bg-white/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-sl-navy">
            Learner participation
          </h2>
          <p className="text-sm text-sl-ink-muted">
            Summary from persisted learner activity records.
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="text-sm font-medium text-sl-navy underline underline-offset-4"
        >
          Open analytics
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Learners" value={participation.totalLearners} />
        <StatCard label="Started" value={participation.learnersStarted} />
        <StatCard
          label="Chapter completions"
          value={participation.totalCompletedChapterRecords}
        />
        <StatCard
          label="Pre attempts"
          value={participation.preAssessmentAttempts}
        />
        <StatCard
          label="Post attempts"
          value={participation.postAssessmentAttempts}
        />
      </div>
    </section>
  );
}
