"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import {
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  FormFeedback,
  FormField,
  formControlClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { REVIEW_STATUS_OPTIONS } from "@/lib/chapter-management/constants";
import {
  clearChapterCoverAction,
  saveChapterMetadataAction,
  setChapterCoverAction,
} from "@/lib/chapter-management/actions";
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
  const [coverPending, startCoverTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.set("file", file);

    startCoverTransition(async () => {
      const result = await setChapterCoverAction(chapter.id, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess("Chapter cover updated.");
      onSaved(result.data);
    });
  }

  function handleClearCover() {
    setError(null);
    setSuccess(null);
    startCoverTransition(async () => {
      const result = await clearChapterCoverAction(chapter.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess("Chapter cover removed. The default cover will be used if available.");
      onSaved(result.data);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Chapter metadata</h2>
        <p className="text-sm text-muted-foreground">
          Edit chapter title, short description, summary, cover image, and review
          status. Do not replace official titles with unvalidated story content.
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

      <div className="space-y-3">
        <p className="text-sm font-medium">Chapter cover</p>
        <p className="text-xs text-muted-foreground">
          Shown on the learner Chapters grid. Upload to replace, or remove to
          fall back to the seeded cover.
        </p>
        <div className="overflow-hidden rounded-xl border bg-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={chapter.coverUrl ?? undefined}
            alt={`Cover for ${chapter.title}`}
            className="aspect-video w-full max-w-md object-cover"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleCoverUpload}
          />
          <button
            type="button"
            className={buttonSecondaryClassName}
            disabled={coverPending || isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {coverPending ? "Uploading…" : chapter.coverMediaAssetId ? "Replace cover" : "Upload cover"}
          </button>
          {chapter.coverMediaAssetId ? (
            <button
              type="button"
              className={buttonSecondaryClassName}
              disabled={coverPending || isPending}
              onClick={handleClearCover}
            >
              Remove cover
            </button>
          ) : null}
        </div>
      </div>

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
          disabled={isPending || coverPending || !isDirty}
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          className={buttonSecondaryClassName}
          onClick={handleCancel}
          disabled={isPending || coverPending || !isDirty}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
