import type { MediaAsset } from "@/types/media";
import { MediaRenderer } from "@/components/chapter/media-renderer";

interface MediaPreviewPanelProps {
  asset: Pick<
    MediaAsset,
    "kind" | "storagePath" | "altText" | "caption" | "title"
  > | null;
  transcript?: string | null;
  compact?: boolean;
}

export function MediaPreviewPanel({
  asset,
  transcript,
  compact = false,
}: MediaPreviewPanelProps) {
  if (!asset) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        No preview available.
      </div>
    );
  }

  return (
    <div className={compact ? "max-w-sm" : undefined}>
      <MediaRenderer
        asset={asset as MediaAsset}
        kind={asset.kind}
        emptyMessage="Preview not available yet."
        transcript={transcript}
      />
    </div>
  );
}
