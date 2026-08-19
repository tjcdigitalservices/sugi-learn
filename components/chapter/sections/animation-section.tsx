import type { AnimationSection } from "@/types/chapter";
import type { MediaAsset } from "@/types/media";

import { AdminMediaPreviewNotice } from "@/components/chapter/sections/admin-media-preview-notice";
import { MediaRenderer } from "@/components/chapter/media-renderer";
import type { ChapterEngineContext } from "@/components/chapter/section-renderer";

interface AnimationSectionViewProps {
  section: AnimationSection;
  mediaAssets: MediaAsset[];
  context?: ChapterEngineContext;
}

export function AnimationSectionView({
  section,
  mediaAssets,
  context = "learner",
}: AnimationSectionViewProps) {
  const asset = mediaAssets.find((item) => item.id === section.mediaAssetId);

  return (
    <article className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {section.title}
      </h2>
      {context === "preview" && asset ? (
        <AdminMediaPreviewNotice asset={asset} />
      ) : null}
      <MediaRenderer
        asset={asset}
        kind="animation"
        emptyMessage="Animation not available yet."
      />
    </article>
  );
}
