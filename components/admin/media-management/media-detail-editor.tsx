"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { MediaPreviewPanel } from "@/components/admin/media-management/media-preview-panel";
import {
  buttonDangerClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  FormFeedback,
  FormField,
  formControlClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import { REVIEW_STATUS_OPTIONS } from "@/lib/chapter-management/constants";
import { MEDIA_KIND_LABELS } from "@/lib/media/constants";
import {
  assignMediaToSectionAction,
  deleteMediaAssetAction,
  saveMediaAssetAction,
  unlinkMediaFromSectionAction,
} from "@/lib/media/actions";
import { formatDateTime } from "@/lib/chapter-management/constants";
import type { ChapterSection } from "@/types/chapter";
import type { AdminMediaAssetDetail } from "@/types/media-management";
import type { ReviewStatus } from "@/types/review";

interface MediaDetailEditorProps {
  asset: AdminMediaAssetDetail;
  chapterSections: ChapterSection[];
}

export function MediaDetailEditor({
  asset: initialAsset,
  chapterSections,
}: MediaDetailEditorProps) {
  const router = useRouter();
  const [asset, setAsset] = useState(initialAsset);
  const [title, setTitle] = useState(asset.title ?? "");
  const [description, setDescription] = useState(asset.description ?? "");
  const [altText, setAltText] = useState(asset.altText ?? "");
  const [sourceReference, setSourceReference] = useState(
    asset.sourceReference ?? "",
  );
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    asset.reviewStatus,
  );
  const [sectionId, setSectionId] = useState(asset.sectionId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const compatibleSections = chapterSections.filter((section) => {
    if (asset.kind === "illustration") {
      return section.kind === "illustration";
    }
    if (asset.kind === "audio") {
      return section.kind === "audio";
    }
    return section.kind === "animation";
  });

  function handleSaveMetadata() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await saveMediaAssetAction(asset.id, {
        title,
        description,
        altText,
        sourceReference,
        reviewStatus,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setAsset(result.data);
      setSuccess("Media metadata saved.");
    });
  }

  function handleAssignSection() {
    if (!asset.chapterSlug || !sectionId) {
      setError("Choose a section to assign this asset.");
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await assignMediaToSectionAction(
        asset.id,
        asset.chapterSlug!,
        sectionId,
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setAsset(result.data);
      setSuccess("Media assigned to section.");
    });
  }

  function handleUnlink() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await unlinkMediaFromSectionAction(asset.id);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setAsset(result.data);
      setSectionId("");
      setSuccess("Media unlinked from section.");
    });
  }

  function handleDelete() {
    if (
      !window.confirm(
        asset.isReferenced
          ? "This asset is linked to content and cannot be deleted until unlinked."
          : "Delete this media asset permanently?",
      )
    ) {
      return;
    }

    if (asset.isReferenced) {
      setError("Unlink this asset from its section before deleting.");
      return;
    }

    startTransition(async () => {
      const result = await deleteMediaAssetAction(asset.id);
      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/admin/media");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold">{asset.title ?? "Untitled asset"}</h2>
          <ReviewStatusBadge status={asset.reviewStatus} />
          <span className="text-sm text-muted-foreground">
            {MEDIA_KIND_LABELS[asset.kind]}
          </span>
        </div>

        <div id="preview" className="scroll-mt-24">
          <MediaPreviewPanel
            asset={{
              kind: asset.kind,
              storagePath: asset.storagePath,
              altText: asset.altText,
              caption: asset.description,
              title: asset.title,
            }}
          />
        </div>

        {!asset.storagePath?.trim() ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            No file is uploaded for this asset. Learners will not see it, and it
            cannot be approved until a file is uploaded.
          </p>
        ) : null}

        {!asset.sectionId ? (
          <p className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
            This asset is not assigned to a chapter section. Assign it from the
            chapter editor or below before learners can see it in the journey.
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Title" htmlFor="detail-title">
            <input
              id="detail-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={formControlClassName}
              disabled={isPending}
            />
          </FormField>

          <FormField label="Review status" htmlFor="detail-status">
            <select
              id="detail-status"
              value={reviewStatus}
              onChange={(event) =>
                setReviewStatus(event.target.value as ReviewStatus)
              }
              className={formControlClassName}
              disabled={isPending}
            >
              {REVIEW_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Description" htmlFor="detail-description">
          <textarea
            id="detail-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={`${formControlClassName} min-h-24`}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Alt text" htmlFor="detail-alt">
          <input
            id="detail-alt"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            className={formControlClassName}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Source reference" htmlFor="detail-source">
          <input
            id="detail-source"
            value={sourceReference}
            onChange={(event) => setSourceReference(event.target.value)}
            className={formControlClassName}
            disabled={isPending}
          />
        </FormField>

        {asset.chapterSlug ? (
          <div className="space-y-3 rounded-lg border p-4">
            <h3 className="font-medium">Section association</h3>
            <p className="text-sm text-muted-foreground">
              Chapter: {asset.chapterTitle ?? asset.chapterSlug}
            </p>
            {asset.isReferenced ? (
              <p className="text-sm">{asset.referenceSummary}</p>
            ) : null}
            <FormField label="Assign to section" htmlFor="detail-section">
              <select
                id="detail-section"
                value={sectionId}
                onChange={(event) => setSectionId(event.target.value)}
                className={formControlClassName}
                disabled={isPending}
              >
                <option value="">Select a section</option>
                {compatibleSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonSecondaryClassName}
                onClick={handleAssignSection}
                disabled={isPending || !sectionId}
              >
                Assign to section
              </button>
              {asset.sectionId ? (
                <button
                  type="button"
                  className={buttonSecondaryClassName}
                  onClick={handleUnlink}
                  disabled={isPending}
                >
                  Unlink from section
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
            Assign a chapter when uploading to enable section association.
          </p>
        )}

        <FormFeedback error={error} success={success} />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={buttonPrimaryClassName}
            onClick={handleSaveMetadata}
            disabled={isPending}
          >
            Save changes
          </button>
          <button
            type="button"
            className={buttonDangerClassName}
            onClick={handleDelete}
            disabled={isPending}
          >
            Delete asset
          </button>
        </div>
      </div>

      <aside className="space-y-4 rounded-lg border bg-muted/10 p-4 text-sm">
        <div>
          <p className="font-medium">Created</p>
          <p className="text-muted-foreground">{formatDateTime(asset.createdAt)}</p>
        </div>
        <div>
          <p className="font-medium">Updated</p>
          <p className="text-muted-foreground">{formatDateTime(asset.updatedAt)}</p>
        </div>
        <div>
          <p className="font-medium">Learner visibility</p>
          <p className="text-muted-foreground">
            Only assets with status Approved are visible to learners.
          </p>
        </div>
        {asset.isReferenced ? (
          <div>
            <p className="font-medium">Reference protection</p>
            <p className="text-muted-foreground">
              Unlink before deleting to avoid breaking chapter content.
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
