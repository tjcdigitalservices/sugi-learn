"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Upload, X } from "lucide-react";

import { MediaListTable } from "@/components/admin/media-management/media-list-table";
import { MediaUploadForm } from "@/components/admin/media-management/media-upload-form";
import {
  buttonPrimaryClassName,
  buttonSecondaryClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { REVIEW_STATUS_OPTIONS } from "@/lib/chapter-management/constants";
import { listMediaAssetsAction } from "@/lib/media/actions";
import { MEDIA_KIND_LABELS } from "@/lib/media/constants";
import type { ChapterSummary } from "@/types/chapter";
import type { AdminMediaAssetListItem } from "@/types/media-management";
import type { MediaKind } from "@/types/media";
import type { ReviewStatus } from "@/types/review";

interface MediaLibraryProps {
  chapters: readonly ChapterSummary[];
}

export function MediaLibrary({ chapters }: MediaLibraryProps) {
  const [assets, setAssets] = useState<AdminMediaAssetListItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, startLoadTransition] = useTransition();
  const [showUpload, setShowUpload] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<MediaKind | "all">("all");
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | "all">("all");
  const [chapterSlug, setChapterSlug] = useState<string | "all">("all");

  useEffect(() => {
    startLoadTransition(async () => {
      const result = await listMediaAssetsAction();
      if (!result.success) {
        setLoadError(result.error);
        return;
      }
      setAssets(result.data);
    });
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (kind !== "all" && asset.kind !== kind) {
        return false;
      }
      if (reviewStatus !== "all" && asset.reviewStatus !== reviewStatus) {
        return false;
      }
      if (chapterSlug !== "all" && asset.chapterSlug !== chapterSlug) {
        return false;
      }
      if (query.trim()) {
        const haystack = [
          asset.title,
          asset.chapterTitle,
          asset.sectionTitle,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query.trim().toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [assets, chapterSlug, kind, query, reviewStatus]);

  function handleUploaded(asset: AdminMediaAssetListItem) {
    setAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
    setShowUpload(false);
  }

  return (
    <div className="space-y-6">
      {loadError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading media library…"
            : `${filteredAssets.length} asset${filteredAssets.length === 1 ? "" : "s"}`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {showUpload ? (
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className={`${buttonSecondaryClassName} gap-2`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className={buttonPrimaryClassName}
              aria-expanded={false}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload media
            </button>
          )}
        </div>
      </div>

      {showUpload ? (
        <MediaUploadForm chapters={chapters} onUploaded={handleUploaded} />
      ) : null}

      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Search</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title or chapter"
              className="w-full rounded-md border bg-background px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Type</span>
            <select
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as MediaKind | "all")
              }
              className="w-full rounded-md border bg-background px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All types</option>
              {(Object.keys(MEDIA_KIND_LABELS) as MediaKind[]).map((value) => (
                <option key={value} value={value}>
                  {MEDIA_KIND_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Status</span>
            <select
              value={reviewStatus}
              onChange={(event) =>
                setReviewStatus(event.target.value as ReviewStatus | "all")
              }
              className="w-full rounded-md border bg-background px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All statuses</option>
              {REVIEW_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Chapter</span>
            <select
              value={chapterSlug}
              onChange={(event) => setChapterSlug(event.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All chapters</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.number}. {chapter.title}
                  {chapter.isActive === false ? " (archived)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <MediaListTable assets={filteredAssets} />
      </div>
    </div>
  );
}
