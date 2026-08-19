import { CreateChapterPanel } from "@/components/admin/chapter-management/create-chapter-panel";
import { ChapterListTable } from "@/components/admin/chapter-management/chapter-list-table";
import { PageHeader } from "@/components/shared/page-header";
import { listChaptersForAdmin } from "@/lib/domain/chapter-management";
import type { AdminChapterListItem } from "@/types/chapter-management";

export default async function AdminChaptersPage() {
  let chapters: AdminChapterListItem[] = [];
  let errorMessage: string | null = null;

  try {
    chapters = await listChaptersForAdmin();
  } catch {
    errorMessage =
      "Unable to load chapters. Please refresh the page or try again later.";
  }

  const activeCount = chapters.filter((chapter) => chapter.isActive !== false)
    .length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          eyebrow="Chapter Management"
          title="Chapters"
          description={`Manage ${activeCount} active chapter${activeCount === 1 ? "" : "s"} and their structure. The initial 13 Sugidanon stories are seeded content — you can add more without developer changes.`}
        />
        <CreateChapterPanel />
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <ChapterListTable chapters={chapters} />

      <p className="text-sm text-muted-foreground">
        Archive a chapter to remove it from new learner journeys. Existing
        learner progress and analytics records are preserved.
      </p>
    </div>
  );
}
