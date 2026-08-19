import Link from "next/link";

import { MediaLibrary } from "@/components/admin/media-management/media-library";
import { PageHeader } from "@/components/shared/page-header";
import { listChaptersForAdmin } from "@/lib/domain/chapter-management";
import type { ChapterSummary } from "@/types/chapter";

export default async function AdminMediaPage() {
  let chapters: ChapterSummary[] = [];
  let errorMessage: string | null = null;

  try {
    chapters = await listChaptersForAdmin().then((items) =>
      items.map((item) => ({
        id: item.id,
        number: item.number,
        title: item.title,
        subtitle: item.subtitle,
        reviewStatus: item.reviewStatus,
        isActive: item.isActive,
        hasPublishedContent: item.hasPublishedContent,
      })),
    );
  } catch {
    errorMessage =
      "Unable to load media library. Please refresh the page or try again later.";
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Media Library"
        description="Upload and manage illustrations, audio, and animation. Approve items before learners can see them."
      />

      {errorMessage ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <MediaLibrary chapters={chapters} />

      <p className="text-sm text-muted-foreground">
        Assign uploaded assets to chapter sections from the{" "}
        <Link href="/admin/chapters" className="underline underline-offset-4">
          chapter editor
        </Link>{" "}
        or each asset&apos;s detail page.
      </p>
    </div>
  );
}
