import Link from "next/link";

import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import type { ChapterSummary } from "@/types/chapter";

interface ChapterOverviewTableProps {
  chapters: ChapterSummary[];
}

export function ChapterOverviewTable({ chapters }: ChapterOverviewTableProps) {
  return (
    <section aria-labelledby="chapter-overview-heading" className="space-y-4">
      <div>
        <h2
          id="chapter-overview-heading"
          className="font-display text-xl font-semibold text-sl-navy"
        >
          Chapter overview
        </h2>
        <p className="text-sm text-sl-ink-muted">
          Read-only view of all chapters. Open a chapter to manage content.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[color:rgba(44,36,22,0.08)] bg-white/80 shadow-sm">
        <table className="min-w-full divide-y divide-[color:rgba(44,36,22,0.08)] text-sm">
          <thead className="bg-[var(--sl-cream-deep)] text-left">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-sl-navy">
                #
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-sl-navy">
                Title
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-sl-navy">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-sl-navy">
                Content
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-sl-navy">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:rgba(44,36,22,0.06)]">
            {chapters.map((chapter) => (
              <tr
                key={chapter.id}
                className="transition-colors hover:bg-[var(--sl-cream-deep)]/70"
              >
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-sl-ink-muted">
                  {chapter.number}
                </td>
                <td className="px-4 py-3 font-medium text-sl-ink">
                  {chapter.title}
                </td>
                <td className="px-4 py-3">
                  <ReviewStatusBadge status={chapter.reviewStatus} />
                </td>
                <td className="px-4 py-3 text-sl-ink-muted">
                  {chapter.hasPublishedContent ? "Has content" : "No content yet"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link
                    href={`/admin/chapters/${chapter.id}`}
                    className="text-sm font-medium text-sl-navy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-gold"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
