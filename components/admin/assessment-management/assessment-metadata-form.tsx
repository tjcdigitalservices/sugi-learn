"use client";

import { useEffect, useState, useTransition } from "react";

import {
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  FormFeedback,
  FormField,
  formControlClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import {
  ASSESSMENT_TYPE_LABELS,
  REVIEW_STATUS_OPTIONS,
} from "@/lib/assessment-management/constants";
import { saveAssessmentMetadataAction } from "@/lib/assessment-management/actions";
import type { AdminAssessmentDetail } from "@/types/assessment-management";
import type { ReviewStatus } from "@/types/review";

interface AssessmentMetadataFormProps {
  assessment: AdminAssessmentDetail;
  onSaved: (assessment: AdminAssessmentDetail) => void;
}

export function AssessmentMetadataForm({
  assessment,
  onSaved,
}: AssessmentMetadataFormProps) {
  const [title, setTitle] = useState(assessment.title);
  const [instructions, setInstructions] = useState(assessment.instructions ?? "");
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    assessment.reviewStatus,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDirty =
    title !== assessment.title ||
    instructions !== (assessment.instructions ?? "") ||
    reviewStatus !== assessment.reviewStatus;

  useEffect(() => {
    setTitle(assessment.title);
    setInstructions(assessment.instructions ?? "");
    setReviewStatus(assessment.reviewStatus);
  }, [assessment]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function handleCancel() {
    setTitle(assessment.title);
    setInstructions(assessment.instructions ?? "");
    setReviewStatus(assessment.reviewStatus);
    setError(null);
    setSuccess(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await saveAssessmentMetadataAction(assessment.id, {
        title,
        instructions: instructions.trim() ? instructions.trim() : null,
        reviewStatus,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess("Assessment metadata saved.");
      onSaved(result.data);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Assessment metadata</h2>
          <p className="text-sm text-muted-foreground">
            {ASSESSMENT_TYPE_LABELS[assessment.type]} · Type cannot be changed
          </p>
        </div>
        <ReviewStatusBadge status={reviewStatus} />
      </div>

      <FormField label="Title" htmlFor="assessment-title">
        <input
          id="assessment-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={formControlClassName}
          required
        />
      </FormField>

      <FormField
        label="Instructions"
        htmlFor="assessment-instructions"
        hint="Optional learner-facing instructions shown before the assessment begins."
      >
        <textarea
          id="assessment-instructions"
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          rows={4}
          className={formControlClassName}
        />
      </FormField>

      <FormField label="Review status" htmlFor="assessment-status">
        <select
          id="assessment-status"
          value={reviewStatus}
          onChange={(event) =>
            setReviewStatus(event.target.value as ReviewStatus)
          }
          className={formControlClassName}
        >
          {REVIEW_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormFeedback error={error} success={success} />

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className={buttonPrimaryClassName}
        >
          {isPending ? "Saving…" : "Save metadata"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending || !isDirty}
          className={buttonSecondaryClassName}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
