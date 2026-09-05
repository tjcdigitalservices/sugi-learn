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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <PageHeader
          title="Chapters"
          description="Manage chapter structure and content."
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
        Archive a chapter to hide it from new learner journeys. Existing
        learner progress is kept.
      </p>
    </div>
  );
}
