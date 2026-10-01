"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CheckCheck, Eye, Pencil, Trash2 } from "lucide-react";

import { AdminTableActionsMenu } from "@/components/admin/admin-table-actions-menu";
import {
  buttonDangerClassName,
  buttonSecondaryClassName,
} from "@/components/admin/chapter-management/form-primitives";
import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import {
  bulkApproveMediaAssetsAction,
  bulkDeleteMediaAssetsAction,
  deleteMediaAssetAction,
} from "@/lib/media/actions";
import { MEDIA_KIND_LABELS } from "@/lib/media/constants";
import { formatDateTime } from "@/lib/chapter-management/constants";
import type { AdminMediaAssetListItem } from "@/types/media-management";

interface MediaListTableProps {
  assets: AdminMediaAssetListItem[];
  onDeleted?: (mediaId: string) => void;
  onApproved?: (mediaIds: string[]) => void;
  onBulkDeleted?: (mediaIds: string[]) => void;
  isLoading?: boolean;
}

export function MediaListTable({
  assets,
  onDeleted,
  onApproved,
  onBulkDeleted,
  isLoading = false,
}: MediaListTableProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const assetIds = useMemo(() => assets.map((asset) => asset.id), [assets]);

  useEffect(() => {
    setSelectedIds((current) => {
      const next = new Set(
        [...current].filter((id) => assetIds.includes(id)),
      );
      return next.size === current.size ? current : next;
    });
  }, [assetIds]);

  const allVisibleSelected =
    assets.length > 0 && assets.every((asset) => selectedIds.has(asset.id));
  const someVisibleSelected = assets.some((asset) => selectedIds.has(asset.id));
  const selectedCount = selectedIds.size;

  if (isLoading) {
    return (
      <div
        className="space-y-3"
        aria-busy="true"
        aria-live="polite"
        aria-label="Loading media assets"
      >
        <div className="overflow-hidden rounded-lg border">
          <div className="border-b bg-muted/40 px-4 py-3">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 px-4 py-3.5"
              >
                <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="hidden h-4 w-24 animate-pulse rounded bg-muted sm:block" />
                <div className="h-4 w-14 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        No media assets have been uploaded yet.
      </div>
    );
  }

  function toggleOne(mediaId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(mediaId);
      } else {
        next.delete(mediaId);
      }
      return next;
    });
  }

  function toggleAllVisible(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const asset of assets) {
        if (checked) {
          next.add(asset.id);
        } else {
          next.delete(asset.id);
        }
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function handleDelete(asset: AdminMediaAssetListItem) {
    const title = asset.title ?? "Untitled asset";
    const linkedNote = asset.sectionTitle
      ? `\n\nThis asset is currently linked to “${asset.sectionTitle}”. Deleting will unlink it first.`
      : "";

    const confirmed = window.confirm(
      `Delete “${title}” permanently?${linkedNote}\n\nThis cannot be undone. The uploaded file will be removed from storage.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);
    setPendingId(asset.id);

    startTransition(async () => {
      const result = await deleteMediaAssetAction(asset.id);
      setPendingId(null);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(asset.id);
        return next;
      });
      onDeleted?.(asset.id);
    });
  }

  function handleBulkApprove() {
    const ids = [...selectedIds];
    if (ids.length === 0) {
      return;
    }

    const missingFileCount = assets.filter(
      (asset) => selectedIds.has(asset.id) && !asset.hasFile,
    ).length;

    const confirmed = window.confirm(
      `Approve ${ids.length} selected media asset${ids.length === 1 ? "" : "s"}?${
        missingFileCount > 0
          ? `\n\n${missingFileCount} without an uploaded file will be skipped.`
          : ""
      }\n\nLinked draft sections will also be approved so learners can see them.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await bulkApproveMediaAssetsAction(ids);
      if (!result.success) {
        setError(result.error);
        return;
      }

      onApproved?.(result.data.approvedIds);
      clearSelection();

      const failNote =
        result.data.failed.length > 0
          ? ` ${result.data.failed.length} could not be approved.`
          : "";
      setSuccess(
        `Approved ${result.data.approvedIds.length} media asset${
          result.data.approvedIds.length === 1 ? "" : "s"
        }.${failNote}`,
      );
    });
  }

  function handleBulkDelete() {
    const ids = [...selectedIds];
    if (ids.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${ids.length} selected media asset${ids.length === 1 ? "" : "s"} permanently?\n\nLinked section/cover references will be unlinked first. This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await bulkDeleteMediaAssetsAction(ids);
      if (!result.success) {
        setError(result.error);
        return;
      }

      onBulkDeleted?.(result.data.deletedIds);
      clearSelection();

      const failNote =
        result.data.failed.length > 0
          ? ` ${result.data.failed.length} could not be deleted.`
          : "";
      setSuccess(
        `Deleted ${result.data.deletedIds.length} media asset${
          result.data.deletedIds.length === 1 ? "" : "s"
        }.${failNote}`,
      );
    });
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {success}
        </p>
      ) : null}

      {selectedCount > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm font-medium">
            {selectedCount} selected
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonSecondaryClassName}
              onClick={handleBulkApprove}
              disabled={isPending}
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              {isPending ? "Working…" : "Approve selected"}
            </button>
            <button
              type="button"
              className={buttonDangerClassName}
              onClick={handleBulkDelete}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {isPending ? "Working…" : "Delete selected"}
            </button>
            <button
              type="button"
              className={buttonSecondaryClassName}
              onClick={clearSelection}
              disabled={isPending}
            >
              Clear selection
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th scope="col" className="w-10 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(element) => {
                    if (element) {
                      element.indeterminate =
                        someVisibleSelected && !allVisibleSelected;
                    }
                  }}
                  onChange={(event) => toggleAllVisible(event.target.checked)}
                  aria-label="Select all visible media"
                  disabled={isPending}
                  className="h-4 w-4 rounded border"
                />
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                Title
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                Type
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                Chapter
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                File
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                Updated
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y bg-card">
            {assets.map((asset) => {
              const title = asset.title ?? "Untitled asset";
              const rowPending = isPending && pendingId === asset.id;
              const selected = selectedIds.has(asset.id);
              const items = [
                {
                  type: "link" as const,
                  label: "Edit",
                  href: `/admin/media/${asset.id}`,
                  icon: (
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  ),
                },
                ...(asset.hasFile
                  ? [
                      {
                        type: "link" as const,
                        label: "Preview",
                        href: `/admin/media/${asset.id}#preview`,
                        icon: (
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        ),
                      },
                    ]
                  : []),
                {
                  type: "button" as const,
                  label: "Delete",
                  disabled: rowPending || isPending,
                  destructive: true,
                  onClick: () => handleDelete(asset),
                  icon: (
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  ),
                },
              ];

              return (
                <tr
                  key={asset.id}
                  className={
                    selected ? "bg-muted/30 hover:bg-muted/40" : "hover:bg-muted/20"
                  }
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) =>
                        toggleOne(asset.id, event.target.checked)
                      }
                      aria-label={`Select ${title}`}
                      disabled={isPending}
                      className="h-4 w-4 rounded border"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {MEDIA_KIND_LABELS[asset.kind]}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {asset.chapterTitle ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-3">
                    <ReviewStatusBadge status={asset.reviewStatus} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {asset.hasFile ? "Uploaded" : "Missing"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDateTime(asset.updatedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex justify-end">
                      <AdminTableActionsMenu
                        label={title}
                        disabled={rowPending || isPending}
                        items={items}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
