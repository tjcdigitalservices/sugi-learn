"use client";

import { resolveMediaUrl } from "@/lib/media/resolve-media-url";
import type { MediaAsset } from "@/types/media";

import { SectionEmptyState } from "@/components/chapter/sections/section-empty-state";

interface MediaRendererProps {
  asset: MediaAsset | undefined;
  kind: MediaAsset["kind"];
  emptyMessage: string;
  transcript?: string | null;
  onEnded?: () => void;
}

export function MediaRenderer({
  asset,
  kind,
  emptyMessage,
  transcript,
  onEnded,
}: MediaRendererProps) {
  if (!asset) {
    return <SectionEmptyState message={emptyMessage} />;
  }

  const mediaUrl = resolveMediaUrl(asset.storagePath);

  if (!mediaUrl) {
    return (
      <div className="space-y-3">
        <SectionEmptyState message={emptyMessage} />
        {asset.caption ? (
          <p className="text-sm text-muted-foreground">{asset.caption}</p>
        ) : null}
      </div>
    );
  }

  switch (kind) {
    case "illustration":
      return (
        <figure className="mx-auto w-full max-w-2xl space-y-3">
          <div className="overflow-hidden rounded-lg border bg-muted/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaUrl}
              alt={asset.altText ?? asset.caption ?? "Chapter illustration"}
              className="mx-auto max-h-[min(70vh,720px)] w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
          {asset.caption ? (
            <figcaption className="text-center text-sm text-muted-foreground">
              {asset.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "audio":
      return (
        <div className="space-y-3">
          <audio
            controls
            preload="metadata"
            className="w-full"
            aria-label={asset.caption ?? "Chapter audio"}
          >
            <source src={mediaUrl} />
            Your browser does not support the audio element.
          </audio>
          {transcript ? (
            <div className="rounded-md border bg-muted/10 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Transcript
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {transcript}
              </p>
            </div>
          ) : null}
          {asset.caption ? (
            <p className="text-sm text-muted-foreground">{asset.caption}</p>
          ) : null}
        </div>
      );

    case "animation":
      return (
        <figure className="space-y-3">
          <video
            controls
            preload="metadata"
            className="aspect-video w-full rounded-lg border bg-black/5"
            aria-label={asset.caption ?? "Chapter animation"}
            onEnded={onEnded}
          >
            <source src={mediaUrl} />
            Your browser does not support the video element.
          </video>
        </figure>
      );

    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}
