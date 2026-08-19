"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  Eye,
  Pencil,
} from "lucide-react";

import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import {
  reorderChaptersAction,
  setChapterActiveAction,
} from "@/lib/chapter-management/actions";
import { formatDateTime } from "@/lib/chapter-management/constants";
import type { AdminChapterListItem } from "@/types/chapter-management";

interface ChapterListTableProps {
  chapters: AdminChapterListItem[];
}

export function ChapterListTable({ chapters }: ChapterListTableProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  if (chapters.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
        No chapters found in the database.
      </div>
    );
  }

  async function handleReorder(slug: string, direction: "up" | "down") {
    const index = chapters.findIndex((chapter) => chapter.id === slug);
    if (index === -1) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapters.length) {
      return;
    }

    const ordered = chapters.map((chapter) => chapter.id);
    [ordered[index], ordered[targetIndex]] = [
      ordered[targetIndex],
      ordered[index],
    ];

    setPendingSlug(slug);
    setError(null);

    const result = await reorderChaptersAction(ordered);
    setPendingSlug(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  async function handleArchiveToggle(slug: string, isActive: boolean) {
    setPendingSlug(slug);
    setError(null);

    const result = await setChapterActiveAction(slug, isActive);
    setPendingSlug(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.refresh();
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
                #
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                Title
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                Content
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                Sections
              </th>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                Last updated
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y bg-card">
            {chapters.map((chapter, index) => {
              const isPending = pendingSlug === chapter.id;
              const archived = chapter.isActive === false;

              return (
                <tr
                  key={chapter.id}
                  className={`hover:bg-muted/20 ${archived ? "opacity-70" : ""}`}
                >
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                    {chapter.number}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <div className="space-y-1">
                      <span>{chapter.title}</span>
                      {archived ? (
                        <span className="block text-xs text-muted-foreground">
                          Archived — hidden from new learner journeys
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ReviewStatusBadge status={chapter.reviewStatus} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {chapter.hasPublishedContent
                      ? "Has content"
                      : "No content yet"}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {chapter.sectionCount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDateTime(chapter.updatedAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        disabled={isPending || index === 0}
                        onClick={() => handleReorder(chapter.id, "up")}
                        className="inline-flex items-center rounded-md border px-2 py-1.5 text-xs disabled:opacity-40"
                        aria-label={`Move ${chapter.title} up`}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isPending || index === chapters.length - 1}
                        onClick={() => handleReorder(chapter.id, "down")}
                        className="inline-flex items-center rounded-md border px-2 py-1.5 text-xs disabled:opacity-40"
                        aria-label={`Move ${chapter.title} down`}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          handleArchiveToggle(chapter.id, !chapter.isActive)
                        }
                        className="inline-flex items-center rounded-md border px-2 py-1.5 text-xs"
                        aria-label={
                          archived ? "Restore chapter" : "Archive chapter"
                        }
                      >
                        {archived ? (
                          <ArchiveRestore className="h-3.5 w-3.5" />
                        ) : (
                          <Archive className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <Link
                        href={`/admin/chapters/${chapter.id}`}
                        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </Link>
                      <Link
                        href={`/admin/chapters/${chapter.id}/preview`}
                        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Preview
                      </Link>
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
