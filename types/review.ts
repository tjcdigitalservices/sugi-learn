/** Content review / approval workflow states (M18). */
export const REVIEW_STATUSES = [
  "draft",
  "for_review",
  "approved",
  "needs_revision",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export function getReviewStatusLabel(status: ReviewStatus): string {
  if (status === "for_review") {
    return "For review";
  }
  if (status === "needs_revision") {
    return "Needs revision";
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export const REVIEW_STATUS_OPTIONS = REVIEW_STATUSES.map((status) => ({
  value: status,
  label: getReviewStatusLabel(status),
}));

export function isPublishedReviewStatus(status: ReviewStatus): boolean {
  return status === "approved";
}

export function isReviewQueueStatus(status: ReviewStatus): boolean {
  return status === "for_review" || status === "needs_revision";
}
