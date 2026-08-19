import type { AssessmentType } from "@/types/assessment";
import { REVIEW_STATUS_OPTIONS } from "@/types/review";

export { REVIEW_STATUS_OPTIONS };

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  pre: "Pre-Assessment",
  post: "Post-Assessment",
};

export function formatDateTime(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
