"use client";

import type { ReactNode, RefObject } from "react";

import type { StorybookLayoutMode } from "@/lib/chapter/storybook-layout-mode";

interface StorybookCoverProps {
  title: string;
  subtitle: string | null;
  chapterNumber: number;
  coverUrl: string | null;
  opening: boolean;
  onOpen: () => void;
  coverRef?: RefObject<HTMLButtonElement | null>;
  layoutMode?: StorybookLayoutMode;
  /** Top-of-book chrome (All chapters / Chapter N of M). */
  chrome?: ReactNode;
}

/**
 * Closed cover = one page of the open book (canonical page tokens).
 * The whole cover is the open control — no separate CTA button.
 */
export function StorybookCover({
  title,
  subtitle,
  chapterNumber,
  coverUrl,
  opening,
  onOpen,
  coverRef,
  layoutMode = "spread",
  chrome = null,
}: StorybookCoverProps) {
  const paged = layoutMode === "paged";

  return (
    <div className="sb-stage w-full px-1">
      <div
        className={`sb-book-shell sb-book-shell--cover${paged ? " sb-book-shell--paged" : ""}`}
      >
        {chrome ? (
          <div className="sb-book-chrome sb-book-chrome--external">{chrome}</div>
        ) : null}
        <button
          type="button"
          ref={coverRef}
          onClick={onOpen}
          disabled={opening}
          aria-busy={opening}
          aria-label={`Open chapter: ${title}`}
          className={`sb-cover-book${opening ? " is-opening" : ""}`}
        >
          <div className="sb-cover-panel">
            <div className="sb-cover-face">
              <div className="sb-cover-spine-edge" aria-hidden="true" />

              <div className="sb-cover-body">
                <div className="sb-cover-brand">
                  <p className="sb-cover-brand-title">Sugidanon</p>
                  <p className="sb-cover-brand-sub">Epics of Panay</p>
                  <div className="sb-cover-gold-rule" aria-hidden="true" />
                </div>

                <div className="sb-cover-art-frame">
                  <div className="sb-cover-art-inner">
                    {coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- same pattern as chapter cover grid
                      <img src={coverUrl} alt="" />
                    ) : (
                      <div className="sb-cover-art-fallback" aria-hidden="true" />
                    )}
                  </div>
                </div>

                <div className="sb-cover-meta">
                  {chapterNumber > 0 ? (
                    <p className="sb-cover-meta-chapter">
                      Chapter {chapterNumber}
                    </p>
                  ) : null}
                  <h1 className="sb-cover-meta-title">{title}</h1>
                  {subtitle ? (
                    <p className="sb-cover-meta-subtitle">{subtitle}</p>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="sb-cover-inner" aria-hidden="true" />
          </div>
        </button>
      </div>
    </div>
  );
}
