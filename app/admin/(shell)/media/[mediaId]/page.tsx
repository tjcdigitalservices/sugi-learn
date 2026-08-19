import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaDetailEditor } from "@/components/admin/media-management/media-detail-editor";
import { PageHeader } from "@/components/shared/page-header";
import { getChapterForAdmin } from "@/lib/domain/chapter-management";
import { getMediaAssetForAdmin } from "@/lib/domain/media-management";
import type { ChapterSection } from "@/types/chapter";
import type { AdminMediaAssetDetail } from "@/types/media-management";

interface AdminMediaDetailPageProps {
  params: Promise<{ mediaId: string }>;
}

export default async function AdminMediaDetailPage({
  params,
}: AdminMediaDetailPageProps) {
  const { mediaId } = await params;

  let asset: AdminMediaAssetDetail | null = null;
  let chapterSections: ChapterSection[] = [];

  try {
    asset = await getMediaAssetForAdmin(mediaId);
    if (asset?.chapterSlug) {
      const chapter = await getChapterForAdmin(asset.chapterSlug);
      chapterSections = chapter?.sections ?? [];
    }
  } catch {
    return (
      <div className="space-y-4">
        <PageHeader eyebrow="Media" title="Media asset" />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load this media asset.
        </div>
        <Link href="/admin/media" className="text-sm underline underline-offset-4">
          Back to media library
        </Link>
      </div>
    );
  }

  if (!asset) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Media"
        title="Media asset"
        description="Edit metadata, review status, and section association."
      />

      <Link href="/admin/media" className="text-sm underline underline-offset-4">
        ← Back to media library
      </Link>

      <MediaDetailEditor asset={asset} chapterSections={chapterSections} />
    </div>
  );
}
