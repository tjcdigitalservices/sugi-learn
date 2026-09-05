import Link from "next/link";
import { notFound } from "next/navigation";

import { AssessmentAccessBlockedState } from "@/components/assessment/assessment-access-blocked-state";
import { LearnerChapterLayout } from "@/components/chapter/learner-chapter-layout";
import { StorybookTransitionProvider } from "@/components/chapter/storybook/storybook-transition-provider";
import { getChapterNavigation } from "@/lib/domain/chapter-navigation";
import { getChapterForEngine } from "@/lib/domain/chapters";

interface AdminChapterPreviewPageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function AdminChapterPreviewPage({
  params,
}: AdminChapterPreviewPageProps) {
  const { chapterId } = await params;

  let chapter;
  try {
    chapter = await getChapterForEngine(chapterId);
  } catch {
    notFound();
  }

  if (!chapter) {
    notFound();
  }

  const navigation = await getChapterNavigation(chapterId);

  if (!navigation) {
    notFound();
  }

  if (chapter.sections.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Admin preview</p>
          <p className="mt-1">
            Same learner storybook experience — approved content only. Progress
            is not saved.
          </p>
          <Link
            href={`/admin/chapters/${chapterId}`}
            className="mt-2 inline-block font-medium underline-offset-4 hover:underline"
          >
            Back to chapter editor
          </Link>
        </div>
        <AssessmentAccessBlockedState
          title="No approved content to preview"
          description="Learners only see Approved sections. Approve at least one section (and any linked media) to preview this chapter as learners will see it."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-medium">Admin preview</p>
        <p className="mt-1">
          Same storybook UI learners use. Only Approved sections, learning
          points, and media are shown. Draft content is hidden. Progress is not
          saved.
        </p>
        <Link
          href={`/admin/chapters/${chapterId}`}
          className="mt-2 inline-block font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to chapter editor
        </Link>
      </div>

      <StorybookTransitionProvider>
        <LearnerChapterLayout
          chapter={chapter}
          navigation={navigation}
          progressStatus="not_started"
          previewMode
        />
      </StorybookTransitionProvider>
    </div>
  );
}
