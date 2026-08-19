import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import type { MediaAsset } from "@/types/media";
import { isPublishedReviewStatus } from "@/types/review";

interface AdminMediaPreviewNoticeProps {
  asset: MediaAsset;
}

/** Shown in admin preview when a linked asset is not learner-visible. */
export function AdminMediaPreviewNotice({ asset }: AdminMediaPreviewNoticeProps) {
  if (isPublishedReviewStatus(asset.reviewStatus)) {
    return null;
  }

  return (
    <div
      className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
      role="status"
    >
      <p className="font-medium">Admin preview — media not learner-visible</p>
      <p className="mt-1">
        Linked asset &ldquo;{asset.title ?? "Untitled"}&rdquo; has status{" "}
        <ReviewStatusBadge status={asset.reviewStatus} /> and will not appear
        to learners until approved.
      </p>
    </div>
  );
}
