import { ContentReviewQueuePanel } from "@/components/admin/content-review-queue-panel";
import { PageHeader } from "@/components/shared/page-header";
import { getContentReviewQueue } from "@/lib/domain/content-review-queue";

export default async function AdminReviewPage() {
  const summary = await getContentReviewQueue();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Review"
        title="Content Review"
        description="Review items awaiting client or cultural approval. Only Approved content is visible to learners."
      />
      <ContentReviewQueuePanel summary={summary} />
    </div>
  );
}
