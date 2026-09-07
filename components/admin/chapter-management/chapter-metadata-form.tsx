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
  finalizeChapterCoverUploadAction,
  prepareChapterCoverUploadAction,
  saveChapterMetadataAction,
  setChapterCoverAction,
} from "@/lib/chapter-management/actions";
import {
  MEDIA_MAX_FILE_BYTES,
  MEDIA_STORAGE_BUCKET,
} from "@/lib/media/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { validateMediaFile } from "@/lib/media/validation";
import type { Chapter } from "@/types/chapter";
import type { ReviewStatus } from "@/types/review";

interface ChapterMetadataFormProps {
  chapter: Chapter;
  onSaved: (chapter: Chapter) => void;
}

const COVER_MAX_MB = Math.round(
  MEDIA_MAX_FILE_BYTES.illustration / (1024 * 1024),
);

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
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [metadataSuccess, setMetadataSuccess] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverSuccess, setCoverSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [coverPending, startCoverTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFeedbackRef = useRef<HTMLDivElement>(null);

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

  function showCoverFeedback(next: {
    error?: string | null;
    success?: string | null;
  }) {
    setCoverError(next.error ?? null);
    setCoverSuccess(next.success ?? null);
    requestAnimationFrame(() => {
      coverFeedbackRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }

  function handleCancel() {
    setTitle(chapter.title);
    setSubtitle(chapter.subtitle ?? "");
    setSummary(chapter.summary ?? "");
    setReviewStatus(chapter.reviewStatus);
    setMetadataError(null);
    setMetadataSuccess(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMetadataError(null);
    setMetadataSuccess(null);
    setCoverError(null);
    setCoverSuccess(null);

    startTransition(async () => {
      const result = await saveChapterMetadataAction(chapter.id, {
        title,
        subtitle: subtitle.trim() ? subtitle.trim() : null,
        summary: summary.trim() ? summary.trim() : null,
        reviewStatus,
      });

      if (!result.success) {
        setMetadataError(result.error);
        return;
      }

      setMetadataSuccess("Chapter metadata saved.");
      onSaved(result.data);
    });
  }

  function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setMetadataError(null);
    setMetadataSuccess(null);

    const localError = validateMediaFile("illustration", file);
    if (localError) {
      showCoverFeedback({ error: localError });
      return;
    }

    startCoverTransition(async () => {
      try {
        const prepared = await prepareChapterCoverUploadAction({
          chapterId: chapter.id,
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        });

        if (prepared.success) {
          const supabase = createSupabaseBrowserClient();
          const { error: uploadError } = await supabase.storage
            .from(MEDIA_STORAGE_BUCKET)
            .uploadToSignedUrl(
              prepared.data.objectPath,
              prepared.data.token,
              file,
              { contentType: file.type || "image/png", upsert: false },
            );

          if (uploadError) {
            showCoverFeedback({
              error: `Unable to upload the cover image: ${uploadError.message || "please try again."}`,
            });
            return;
          }

          const finalized = await finalizeChapterCoverUploadAction({
            chapterId: chapter.id,
            assetId: prepared.data.assetId,
            storagePath: prepared.data.storagePath,
          });

          if (!finalized.success) {
            showCoverFeedback({ error: finalized.error });
            return;
          }

          showCoverFeedback({ success: "Chapter cover updated." });
          onSaved(finalized.data);
          return;
        }

        // Mock mode fallback — small FormData path only when Supabase is unavailable.
        if (file.size > 4 * 1024 * 1024) {
          showCoverFeedback({ error: prepared.error });
          return;
        }

        const formData = new FormData();
        formData.set("file", file);
        const result = await setChapterCoverAction(chapter.id, formData);
        if (!result.success) {
          showCoverFeedback({ error: result.error });
          return;
        }
        showCoverFeedback({ success: "Chapter cover updated." });
        onSaved(result.data);
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "Upload failed.";
        if (
          message.toLowerCase().includes("unexpected end of form") ||
          message.toLowerCase().includes("body exceeded")
        ) {
          showCoverFeedback({
            error:
              "Cover upload failed because the file was truncated. Refresh and try again — covers now upload directly to storage.",
          });
          return;
        }
        showCoverFeedback({
          error: "Unable to upload the cover right now. Please try again.",
        });
      }
    });
  }

  function handleClearCover() {
    setMetadataError(null);
    setMetadataSuccess(null);
    startCoverTransition(async () => {
      const result = await clearChapterCoverAction(chapter.id);
      if (!result.success) {
        showCoverFeedback({ error: result.error });
        return;
      }
      showCoverFeedback({
        success:
          "Chapter cover removed. The default cover will be used if available.",
      });
      onSaved(result.data);
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Chapter metadata</h2>
          <p className="text-sm text-muted-foreground">
            Edit chapter title, short description, summary, and review status. Do
            not replace official titles with unvalidated story content.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[120px_1fr] sm:items-center">
          <span className="text-sm font-medium text-muted-foreground">
            Number
          </span>
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

        <FormFeedback error={metadataError} success={metadataSuccess} />

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

      {/* Cover upload is outside the metadata form so file bytes never ride a
          metadata Server Action multipart body (avoids “Unexpected end of form”). */}
      <div className="space-y-3 border-t pt-6">
        <p className="text-sm font-medium">Chapter cover</p>
        <p className="text-xs text-muted-foreground">
          Shown on the learner Chapters grid. JPEG, PNG, WebP, or GIF up to{" "}
          {COVER_MAX_MB} MB.
        </p>
        <div className="overflow-hidden rounded-xl border bg-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={chapter.coverUrl ?? undefined}
            alt={`Cover for ${chapter.title}`}
            className="aspect-video w-full max-w-md object-cover"
          />
        </div>
        <div ref={coverFeedbackRef}>
          <FormFeedback error={coverError} success={coverSuccess} />
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
            {coverPending
              ? "Uploading…"
              : chapter.coverMediaAssetId
                ? "Replace cover"
                : "Upload cover"}
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
    </div>
  );
}
