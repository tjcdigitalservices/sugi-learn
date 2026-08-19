"use client";

import { useState, useTransition } from "react";

import {
  buttonPrimaryClassName,
  FormFeedback,
  FormField,
  formControlClassName,
} from "@/components/admin/chapter-management/form-primitives";
import {
  MEDIA_ACCEPT_ATTRIBUTE,
  MEDIA_KIND_LABELS,
  MEDIA_MAX_FILE_BYTES,
  MEDIA_STORAGE_BUCKET,
} from "@/lib/media/constants";
import {
  finalizeMediaUploadAction,
  prepareMediaUploadAction,
  uploadMediaAssetAction,
} from "@/lib/media/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { validateMediaFile } from "@/lib/media/validation";
import type { ChapterSummary } from "@/types/chapter";
import type { AdminMediaAssetListItem } from "@/types/media-management";
import type { MediaKind } from "@/types/media";

interface MediaUploadFormProps {
  chapters: readonly ChapterSummary[];
  sectionId?: string;
  defaultChapterSlug?: string;
  defaultKind?: MediaKind;
  onUploaded: (asset: AdminMediaAssetListItem) => void;
}

export function MediaUploadForm({
  chapters,
  sectionId,
  defaultChapterSlug = "",
  defaultKind = "illustration",
  onUploaded,
}: MediaUploadFormProps) {
  const [isPending, startTransition] = useTransition();
  const [kind, setKind] = useState<MediaKind>(defaultKind);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [altText, setAltText] = useState("");
  const [chapterSlug, setChapterSlug] = useState(defaultChapterSlug);
  const [sourceReference, setSourceReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const maxMb = Math.round(MEDIA_MAX_FILE_BYTES[kind] / (1024 * 1024));

  function resetForm() {
    setTitle("");
    setDescription("");
    setAltText("");
    setSourceReference("");
    setFile(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError("Choose a file to upload.");
      return;
    }

    const localError = validateMediaFile(kind, file);
    if (localError) {
      setError(localError);
      return;
    }

    startTransition(async () => {
      try {
        // Prefer direct-to-storage for reliable large uploads (avoids Next.js multipart limits).
        const prepared = await prepareMediaUploadAction({
          kind,
          title,
          description,
          altText,
          chapterSlug,
          sectionId,
          sourceReference,
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
              { contentType: file.type, upsert: false },
            );

          if (uploadError) {
            const raw = uploadError.message || "";
            const tooLarge =
              raw.toLowerCase().includes("maximum") ||
              raw.toLowerCase().includes("too large") ||
              raw.toLowerCase().includes("size") ||
              raw.includes("413") ||
              raw.includes("EntityTooLarge");

            setError(
              tooLarge
                ? "Upload rejected: file exceeds Supabase Storage limits. The media bucket is set to 200 MB, but the project Global file size limit may still be lower (Free plans max out at 50 MB). Raise it under Supabase → Storage → Settings → Global file size limit (Pro required above 50 MB), then retry with an MP4/WebM under that limit."
                : `Unable to upload the file to storage: ${raw || "please try again."}`,
            );
            return;
          }

          const finalized = await finalizeMediaUploadAction({
            assetId: prepared.data.assetId,
            storagePath: prepared.data.storagePath,
            kind,
            title,
            description,
            altText,
            chapterSlug,
            sectionId,
            sourceReference,
          });

          if (!finalized.success) {
            setError(finalized.error);
            return;
          }

          setSuccess("Media uploaded successfully. Status: Draft.");
          resetForm();
          onUploaded(finalized.data);
          return;
        }

        // Fallback for local mock / when signed uploads are unavailable (small files only).
        if (file.size > 4 * 1024 * 1024) {
          setError(prepared.error);
          return;
        }

        const formData = new FormData();
        formData.set("kind", kind);
        formData.set("title", title);
        formData.set("description", description);
        formData.set("altText", altText);
        formData.set("chapterSlug", chapterSlug);
        if (sectionId) {
          formData.set("sectionId", sectionId);
        }
        formData.set("sourceReference", sourceReference);
        formData.set("file", file);

        const result = await uploadMediaAssetAction(formData);
        if (!result.success) {
          setError(result.error);
          return;
        }

        setSuccess("Media uploaded successfully. Status: Draft.");
        resetForm();
        onUploaded(result.data);
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "Upload failed.";
        if (
          message.toLowerCase().includes("unexpected end of form") ||
          message.toLowerCase().includes("body exceeded")
        ) {
          setError(
            "Upload failed because the file is too large for the page form. Refresh and try again — large files now upload directly to storage.",
          );
          return;
        }
        setError("Unable to upload right now. Please try again.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border bg-card p-4 md:p-6"
    >
      <div>
        <h2 className="text-lg font-semibold">Upload media</h2>
        <p className="text-sm text-muted-foreground">
          New uploads start as Draft. Large videos upload directly to storage
          (max {maxMb} MB).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Media type" htmlFor="media-kind">
          <select
            id="media-kind"
            value={kind}
            onChange={(event) => setKind(event.target.value as MediaKind)}
            className={formControlClassName}
            disabled={isPending}
          >
            {(Object.keys(MEDIA_KIND_LABELS) as MediaKind[]).map((value) => (
              <option key={value} value={value}>
                {MEDIA_KIND_LABELS[value]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Chapter (optional)" htmlFor="media-chapter">
          <select
            id="media-chapter"
            value={chapterSlug}
            onChange={(event) => setChapterSlug(event.target.value)}
            className={formControlClassName}
            disabled={isPending || Boolean(defaultChapterSlug)}
          >
            <option value="">Unassigned</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.number}. {chapter.title}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Title" htmlFor="media-title">
          <input
            id="media-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={formControlClassName}
            required
            disabled={isPending}
            placeholder="e.g. Tikum Kadlum — The Unusual Bamboo"
          />
        </FormField>

        <FormField
          label="Alt text"
          htmlFor="media-alt"
          hint={
            kind === "illustration"
              ? "Required for illustrations. Describe the actual image only."
              : "Optional for audio/video."
          }
        >
          <input
            id="media-alt"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            className={formControlClassName}
            required={kind === "illustration"}
            disabled={isPending}
          />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="media-description">
        <textarea
          id="media-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={`${formControlClassName} min-h-20`}
          disabled={isPending}
        />
      </FormField>

      <FormField
        label="Source reference"
        htmlFor="media-source"
        hint="Optional document or approval reference."
      >
        <input
          id="media-source"
          value={sourceReference}
          onChange={(event) => setSourceReference(event.target.value)}
          className={formControlClassName}
          disabled={isPending}
          placeholder="e.g. docs/TIKUM_KADLUM_CHAPTER_1_SOURCE_MAP.md"
        />
      </FormField>

      <FormField
        label="File"
        htmlFor="media-file"
        hint={`Accepted types for ${MEDIA_KIND_LABELS[kind]}. Max ${maxMb} MB.`}
      >
        <input
          id="media-file"
          type="file"
          accept={MEDIA_ACCEPT_ATTRIBUTE[kind]}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-2"
          disabled={isPending}
          required
        />
      </FormField>

      <FormFeedback error={error} success={success} />

      <button
        type="submit"
        className={buttonPrimaryClassName}
        disabled={isPending}
      >
        {isPending ? "Uploading…" : "Upload media"}
      </button>
    </form>
  );
}
