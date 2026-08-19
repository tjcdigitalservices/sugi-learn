"use client";

import { useEffect, useState, useTransition } from "react";

import {
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  FormFeedback,
  FormField,
  formControlClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { REVIEW_STATUS_OPTIONS } from "@/lib/chapter-management/constants";
import { saveChapterMetadataAction } from "@/lib/chapter-management/actions";
import type { Chapter } from "@/types/chapter";
import type { ReviewStatus } from "@/types/review";

interface ChapterMetadataFormProps {
  chapter: Chapter;
  onSaved: (chapter: Chapter) => void;
}

export function ChapterMetadataForm({
  chapter,
  onSaved,
}: ChapterMetadataFormProps) {
  const [title, setTitle] = useState(chapter.title);
  const [subtitle, setSubtitle] = useState(chapter.subtitle ?? "");
  const [summary, setSummary] = useState(chapter.summary ?? "");
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    chapter.reviewStatus,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDirty =
    title !== chapter.title ||
    subtitle !== (chapter.subtitle ?? "") ||
    summary !== (chapter.summary ?? "") ||
    reviewStatus !== chapter.reviewStatus;

  useEffect(() => {
    setTitle(chapter.title);
    setSubtitle(chapter.subtitle ?? "");
    setSummary(chapter.summary ?? "");
    setReviewStatus(chapter.reviewStatus);
  }, [chapter]);

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
    setTitle(chapter.title);
    setSubtitle(chapter.subtitle ?? "");
    setSummary(chapter.summary ?? "");
    setReviewStatus(chapter.reviewStatus);
    setError(null);
    setSuccess(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await saveChapterMetadataAction(chapter.id, {
        title,
        subtitle: subtitle.trim() ? subtitle.trim() : null,
        summary: summary.trim() ? summary.trim() : null,
        reviewStatus,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess("Chapter metadata saved.");
      onSaved(result.data);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Chapter metadata</h2>
        <p className="text-sm text-muted-foreground">
          Edit chapter title, short description, summary, and review status. Do
          not replace official titles with unvalidated story content.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[120px_1fr] sm:items-center">
        <span className="text-sm font-medium text-muted-foreground">Number</span>
        <span className="text-sm tabular-nums">{chapter.number}</span>
      </div>

      <FormField label="Title" htmlFor="chapter-title">
        <input
          id="chapter-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={formControlClassName}
          required
          maxLength={200}
        />
      </FormField>

      <FormField
        label="Subtitle"
        htmlFor="chapter-subtitle"
        hint="Optional short description."
      >
        <input
          id="chapter-subtitle"
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
          className={formControlClassName}
        />
      </FormField>

      <FormField
        label="Summary"
        htmlFor="chapter-summary"
        hint="Optional overview. Leave empty until client-approved summary exists."
      >
        <textarea
          id="chapter-summary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          className={`${formControlClassName} min-h-28`}
        />
      </FormField>

      <FormField label="Status" htmlFor="chapter-status">
        <select
          id="chapter-status"
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
          className={buttonPrimaryClassName}
          disabled={isPending || !isDirty}
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          className={buttonSecondaryClassName}
          onClick={handleCancel}
          disabled={isPending || !isDirty}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
