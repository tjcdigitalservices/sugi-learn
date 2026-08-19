import Link from "next/link";
import { Eye, Pencil } from "lucide-react";

import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import {
  ASSESSMENT_TYPE_LABELS,
  formatDateTime,
} from "@/lib/assessment-management/constants";
import type { AdminAssessmentListItem } from "@/types/assessment-management";

interface AssessmentListTableProps {
  assessments: AdminAssessmentListItem[];
}

export function AssessmentListTable({ assessments }: AssessmentListTableProps) {
  if (assessments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        No assessments have been configured yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-medium">
              Title
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium">
              Type
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium">
              Questions
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium">
              Last updated
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y bg-card">
          {assessments.map((assessment) => (
            <tr key={assessment.id} className="hover:bg-muted/20">
              <td className="px-4 py-3 font-medium">{assessment.title}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {ASSESSMENT_TYPE_LABELS[assessment.type]}
              </td>
              <td className="px-4 py-3">
                <ReviewStatusBadge status={assessment.reviewStatus} />
              </td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">
                {assessment.questionCount}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                {formatDateTime(assessment.updatedAt)}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/assessments/${assessment.id}`}
                    className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Link>
                  <Link
                    href={`/admin/assessments/${assessment.id}/preview`}
                    className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    Preview
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
