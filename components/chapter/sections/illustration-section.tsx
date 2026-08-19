import type { IllustrationSection } from "@/types/chapter";
import type { MediaAsset } from "@/types/media";

import { AdminMediaPreviewNotice } from "@/components/chapter/sections/admin-media-preview-notice";
import { MediaRenderer } from "@/components/chapter/media-renderer";
import type { ChapterEngineContext } from "@/components/chapter/section-renderer";

interface IllustrationSectionViewProps {
  section: IllustrationSection;
  mediaAssets: MediaAsset[];
  context?: ChapterEngineContext;
}

export function IllustrationSectionView({
  section,
  mediaAssets,
  context = "learner",
}: IllustrationSectionViewProps) {
  const asset = mediaAssets.find((item) => item.id === section.mediaAssetId);
  const previewAsset =
    context === "preview" && section.mediaAssetId
      ? mediaAssets.find((item) => item.id === section.mediaAssetId)
      : asset;

  return (
    <article className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {section.title}
      </h2>

      {context === "preview" && previewAsset ? (
        <AdminMediaPreviewNotice asset={previewAsset} />
      ) : null}

      <MediaRenderer
        asset={asset}
        kind="illustration"
        emptyMessage="Illustration not available yet."
      />
    </article>
  );
}
