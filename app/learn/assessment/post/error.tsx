"use client";

import { useEffect } from "react";

import { AssessmentErrorState } from "@/components/assessment/assessment-error-state";
import { logClientError } from "@/lib/logging/log-client-error";

export default function PostAssessmentError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logClientError(error);
  }, [error]);

  return (
    <AssessmentErrorState
      description="Something went wrong while loading the post-assessment. Please try again."
      title="Unable to load post-assessment"
    />
  );
}
