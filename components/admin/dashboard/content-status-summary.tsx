import type { ChapterStatusCounts } from "@/types/admin-dashboard";

interface ContentStatusSummaryProps {
  chapters: ChapterStatusCounts;
}

interface StatusRowProps {
  label: string;
  value: number;
}

function StatusRow({ label, value }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[color:rgba(44,36,22,0.06)] py-2.5 text-sm last:border-b-0">
      <span className="text-sl-ink-muted">{label}</span>
      <span className="font-medium tabular-nums text-sl-navy">{value}</span>
    </div>
  );
}

export function ContentStatusSummary({ chapters }: ContentStatusSummaryProps) {
  return (
    <section aria-labelledby="content-status-heading" className="space-y-4">
      <div>
        <h2
          id="content-status-heading"
          className="font-display text-xl font-semibold text-sl-navy"
        >
          Content status
        </h2>
        <p className="text-sm text-sl-ink-muted">
          High-level chapter and review counts from the current database.
        </p>
      </div>

      <div className="rounded-2xl border border-[color:rgba(44,36,22,0.08)] bg-white/80 px-4 py-2 shadow-sm">
        <StatusRow label="Total chapters" value={chapters.total} />
        <StatusRow label="Published / approved" value={chapters.approved} />
        <StatusRow label="Pending content" value={chapters.pendingContent} />
        <StatusRow label="Pending review" value={chapters.forReview} />
        <StatusRow label="Draft" value={chapters.draft} />
        <StatusRow label="Needs revision" value={chapters.needsRevision} />
      </div>
    </section>
  );
}
