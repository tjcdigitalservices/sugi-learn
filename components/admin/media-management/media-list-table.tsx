"use client";

import { useState, useTransition } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { AdminTableActionsMenu } from "@/components/admin/admin-table-actions-menu";
import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import { deleteMediaAssetAction } from "@/lib/media/actions";
import { MEDIA_KIND_LABELS } from "@/lib/media/constants";
import { formatDateTime } from "@/lib/chapter-management/constants";
import type { AdminMediaAssetListItem } from "@/types/media-management";

interface MediaListTableProps {
  assets: AdminMediaAssetListItem[];
  onDeleted?: (mediaId: string) => void;
}

export function MediaListTable({ assets, onDeleted }: MediaListTableProps) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        No media assets have been uploaded yet.
      </div>
    );
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
    setPendingId(asset.id);

    startTransition(async () => {
      const result = await deleteMediaAssetAction(asset.id);
      setPendingId(null);

      if (!result.success) {
        setError(result.error);
        return;
      }

      onDeleted?.(asset.id);
    });
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-muted/40">
            <tr>
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
                  disabled: rowPending,
                  destructive: true,
                  onClick: () => handleDelete(asset),
                  icon: (
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  ),
                },
              ];

              return (
                <tr key={asset.id} className="hover:bg-muted/20">
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
                        disabled={rowPending}
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
