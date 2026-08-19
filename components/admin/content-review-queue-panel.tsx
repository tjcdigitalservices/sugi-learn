import Link from "next/link";

import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import {
  formatReviewQueueArea,
  type ContentReviewQueueItem,
  type ContentReviewQueueSummary,
} from "@/lib/domain/content-review-queue";
import { getReviewStatusLabel } from "@/types/review";

interface ContentReviewQueuePanelProps {
  summary: ContentReviewQueueSummary;
}

function QueueRow({ item }: { item: ContentReviewQueueItem }) {
  return (
    <li className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="text-xs text-muted-foreground">
          {formatReviewQueueArea(item.area)}
        </p>
        <p className="font-medium">{item.title}</p>
        {item.subtitle ? (
          <p className="text-sm text-muted-foreground">{item.subtitle}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ReviewStatusBadge status={item.reviewStatus} />
        <Link
          href={item.href}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open
        </Link>
      </div>
    </li>
  );
}

export function ContentReviewQueuePanel({ summary }: ContentReviewQueuePanelProps) {
  const queueCount =
    summary.counts.for_review + summary.counts.needs_revision;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">For review</p>
          <p className="text-2xl font-semibold tabular-nums">
            {summary.counts.for_review}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Needs revision</p>
          <p className="text-2xl font-semibold tabular-nums">
            {summary.counts.needs_revision}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Draft</p>
          <p className="text-2xl font-semibold tabular-nums">
            {summary.counts.draft}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-semibold tabular-nums">
            {summary.counts.approved}
          </p>
        </div>
      </section>

      <section className="rounded-lg border bg-card">
        <div className="border-b px-4 py-4">
          <h2 className="text-lg font-semibold">Review queue</h2>
          <p className="text-sm text-muted-foreground">
            Items marked {getReviewStatusLabel("for_review")} or{" "}
            {getReviewStatusLabel("needs_revision")}. Open each item in the CMS to
            update status.
          </p>
        </div>

        {summary.items.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            {queueCount === 0
              ? "No items are currently waiting for review."
              : "No queue items found."}
          </div>
        ) : (
          <ul className="divide-y">
            {summary.items.map((item) => (
              <QueueRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
