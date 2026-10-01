import Link from "next/link";
import { notFound } from "next/navigation";

import { AssessmentAccessBlockedState } from "@/components/assessment/assessment-access-blocked-state";
import { LearnerChapterLayout } from "@/components/chapter/learner-chapter-layout";
import { StorybookTransitionProvider } from "@/components/chapter/storybook/storybook-transition-provider";
import { CharacterRepresentationProvider } from "@/components/learner/character-representation-provider";
import { DEFAULT_CHARACTER_REPRESENTATION_NOTICE } from "@/lib/content/character-representation";
import { getChapterNavigation } from "@/lib/domain/chapter-navigation";
import { getChapterForEngine } from "@/lib/domain/chapters";
import { getCharacterRepresentationNotice } from "@/lib/domain/site-notices";

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

  let notice = DEFAULT_CHARACTER_REPRESENTATION_NOTICE;
  try {
    notice = await getCharacterRepresentationNotice();
  } catch {
    // Keep approved defaults if the notice store is unavailable.
  }

  if (chapter.sections.length === 0) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-4 py-10">
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
    <CharacterRepresentationProvider value={notice}>
      <StorybookTransitionProvider>
        <div className="sb-book-view sb-book-view--admin-preview flex h-dvh min-h-0 flex-col overflow-hidden bg-sl-cream font-body text-sl-ink">
          <div className="shrink-0 border-b border-amber-200/80 bg-amber-50 px-3 py-2 text-sm text-amber-950 sm:px-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>
                <span className="font-medium">Admin preview</span>
                <span className="text-amber-900/80">
                  {" "}
                  · Approved content only · Progress not saved
                </span>
              </p>
              <Link
                href={`/admin/chapters/${chapterId}`}
                className="font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Back to editor
              </Link>
            </div>
          </div>
          <main className="sb-book-view-main flex min-h-0 flex-1 flex-col px-2 py-1 sm:px-3 md:px-3 md:py-1">
            <LearnerChapterLayout
              chapter={chapter}
              navigation={navigation}
              progressStatus="not_started"
              previewMode
            />
          </main>
        </div>
      </StorybookTransitionProvider>
    </CharacterRepresentationProvider>
  );
}
