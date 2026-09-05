"use client";

interface ChapterSummaryExpandableProps {
  summary: string;
  /**
   * When true, summary scrolls inside the parent flex region
   * instead of growing the page (fixed storybook frame).
   */
  fixedPage?: boolean;
}

/**
 * Full chapter summary (static). Never truncates or ellipsizes text.
 * Optional fixedPage scrolls inside the storybook left page.
 */
export function ChapterSummaryExpandable({
  summary,
  fixedPage = false,
}: ChapterSummaryExpandableProps) {
  const text = (
    <p className="whitespace-normal break-words text-sm leading-relaxed text-sl-ink-muted sm:text-base">
      {summary}
    </p>
  );

  if (fixedPage) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        {text}
      </div>
    );
  }

  return text;
}
