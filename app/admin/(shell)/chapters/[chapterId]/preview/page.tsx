import Link from "next/link";
import { notFound } from "next/navigation";

import { ChapterEngine } from "@/components/chapter/chapter-engine";
import { getChapterForAdmin } from "@/lib/domain/chapter-management";

interface AdminChapterPreviewPageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function AdminChapterPreviewPage({
  params,
}: AdminChapterPreviewPageProps) {
  const { chapterId } = await params;

  let chapter;
  try {
    chapter = await getChapterForAdmin(chapterId);
  } catch {
    notFound();
  }

  if (!chapter) {
    notFound();
  }

  const sortedChapter = {
    ...chapter,
    sections: [...chapter.sections].sort((a, b) => a.sortOrder - b.sortOrder),
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-medium">Admin preview</p>
        <p className="mt-1">
          This preview uses the same Chapter Engine as the learner experience.
          Draft and unpublished sections are visible here for editorial review.
        </p>
        <Link
          href={`/admin/chapters/${chapterId}`}
          className="mt-2 inline-block font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to chapter editor
        </Link>
      </div>

      <ChapterEngine chapter={sortedChapter} context="preview" />
    </div>
  );
}
