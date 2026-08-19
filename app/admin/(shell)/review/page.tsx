import { ContentReviewQueuePanel } from "@/components/admin/content-review-queue-panel";
import { PageHeader } from "@/components/shared/page-header";
import { getContentReviewQueue } from "@/lib/domain/content-review-queue";

export default async function AdminReviewPage() {
  let summary = null;
  let errorMessage: string | null = null;

  try {
    summary = await getContentReviewQueue();
  } catch (error) {
    console.error("Review queue load failed:", error);
    errorMessage =
      "Unable to load the review queue. Please refresh the page or try again later.";
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Content Review"
        description="Items waiting for approval. Only approved content is shown to learners."
      />

      {errorMessage ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {summary ? <ContentReviewQueuePanel summary={summary} /> : null}
    </div>
  );
}
