import type { ChapterEngineContext } from "@/components/chapter/section-renderer";

interface ChapterEmptyStateProps {
  context?: ChapterEngineContext;
}

export function ChapterEmptyState({
  context = "learner",
}: ChapterEmptyStateProps) {
  const message =
    context === "preview"
      ? "This chapter has no sections configured yet."
      : "This chapter is being prepared. Content will be available soon.";

  return (
    <div
      className="rounded-lg border border-dashed bg-muted/20 px-6 py-10 text-center"
      role="status"
    >
      <p className="text-sm font-medium">{message}</p>
      {context === "learner" ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Check back later as approved Sugidanon content is added.
        </p>
      ) : null}
    </div>
  );
}
