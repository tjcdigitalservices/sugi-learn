import { Eye, Pencil } from "lucide-react";

import { AdminTableActionsMenu } from "@/components/admin/admin-table-actions-menu";
import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import { MEDIA_KIND_LABELS } from "@/lib/media/constants";
import { formatDateTime } from "@/lib/chapter-management/constants";
import type { AdminMediaAssetListItem } from "@/types/media-management";

interface MediaListTableProps {
  assets: AdminMediaAssetListItem[];
}

export function MediaListTable({ assets }: MediaListTableProps) {
  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        No media assets have been uploaded yet.
      </div>
    );
  }

  return (
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
                    <AdminTableActionsMenu label={title} items={items} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
