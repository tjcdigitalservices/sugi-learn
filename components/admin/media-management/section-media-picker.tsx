"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  buttonSecondaryClassName,
  FormFeedback,
  FormField,
  formControlClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { MediaPreviewPanel } from "@/components/admin/media-management/media-preview-panel";
import { saveSectionAction } from "@/lib/chapter-management/actions";
import type { ChapterSection } from "@/types/chapter";
import type { MediaAsset } from "@/types/media";

interface SectionMediaPickerProps {
  chapterId: string;
  section: Extract<
    ChapterSection,
    { kind: "illustration" | "audio" | "animation" }
  >;
  mediaAssets: MediaAsset[];
  onChanged: () => void;
}

export function SectionMediaPicker({
  chapterId,
  section,
  mediaAssets,
  onChanged,
}: SectionMediaPickerProps) {
  const [mediaAssetId, setMediaAssetId] = useState(section.mediaAssetId || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const compatibleAssets = mediaAssets.filter(
    (asset) => asset.kind === section.kind,
  );
  const selectedAsset = compatibleAssets.find(
    (asset) => asset.id === mediaAssetId,
  );
  const approvedUnassigned = compatibleAssets.filter(
    (asset) =>
      asset.reviewStatus === "approved" &&
      Boolean(asset.storagePath?.trim()) &&
      asset.id !== section.mediaAssetId &&
      asset.id !== mediaAssetId,
  );

  function handleSaveAssignment() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await saveSectionAction(chapterId, section.id, {
        mediaAssetId: mediaAssetId || null,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess("Media assignment saved.");
      onChanged();
    });
  }

  return (
    <div className="space-y-3 rounded-md border bg-muted/10 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Media asset</p>
        <Link
          href="/admin/media"
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Open media library
        </Link>
      </div>

      {compatibleAssets.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No {section.kind} assets uploaded for this chapter yet. Upload one in
          the media library first.
        </p>
      ) : (
        <>
          {!section.mediaAssetId && !mediaAssetId && approvedUnassigned.length > 0 ? (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
              {approvedUnassigned.length === 1
                ? "An approved file is uploaded for this chapter but not assigned to this section. Select it below and save."
                : `${approvedUnassigned.length} approved files are uploaded but not assigned to this section. Select one below and save.`}
            </p>
          ) : null}

          <FormField label="Assigned asset" htmlFor={`media-picker-${section.id}`}>
            <select
              id={`media-picker-${section.id}`}
              value={mediaAssetId}
              onChange={(event) => setMediaAssetId(event.target.value)}
              className={formControlClassName}
              disabled={isPending}
            >
              <option value="">No asset assigned</option>
              {compatibleAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {(asset.title ?? asset.caption ?? "Untitled") +
                    ` (${asset.reviewStatus})`}
                </option>
              ))}
            </select>
          </FormField>
        </>
      )}

      {selectedAsset && !selectedAsset.storagePath?.trim() ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          This asset has no uploaded file. Learners will not see the{" "}
          {section.kind} until a file is uploaded.
        </p>
      ) : null}

      {selectedAsset &&
      selectedAsset.storagePath?.trim() &&
      selectedAsset.reviewStatus !== "approved" ? (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
          This asset is not approved yet. Learners will not see it until review
          status is Approved.
        </p>
      ) : null}

      {selectedAsset ? (
        <MediaPreviewPanel asset={selectedAsset} compact />
      ) : !section.mediaAssetId && !mediaAssetId ? (
        <p className="text-sm text-muted-foreground">
          No media assigned. Learners will see &ldquo;Illustration not available
          yet.&rdquo;
        </p>
      ) : null}

      <FormFeedback error={error} success={success} />

      <button
        type="button"
        className={buttonSecondaryClassName}
        onClick={handleSaveAssignment}
        disabled={isPending || compatibleAssets.length === 0}
      >
        {isPending ? "Saving…" : "Save media assignment"}
      </button>
    </div>
  );
}
