import { cn } from "@/lib/utils";
import { getReviewStatusLabel } from "@/types/review";
import type { ReviewStatus } from "@/types/review";

const STATUS_STYLES: Record<ReviewStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  for_review: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-900",
  needs_revision: "bg-orange-100 text-orange-900",
};

interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  className?: string;
}

export function ReviewStatusBadge({ status, className }: ReviewStatusBadgeProps) {
  const label = getReviewStatusLabel(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
      aria-label={`Review status: ${label}`}
    >
      {label}
    </span>
  );
}
