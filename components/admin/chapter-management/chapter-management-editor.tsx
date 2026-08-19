"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChapterCharactersPanel } from "@/components/admin/chapter-management/chapter-characters-panel";
import { ChapterLearningPointsPanel } from "@/components/admin/chapter-management/chapter-learning-points-panel";
import { ChapterMetadataForm } from "@/components/admin/chapter-management/chapter-metadata-form";
import { ChapterSectionsPanel } from "@/components/admin/chapter-management/chapter-sections-panel";
import { ReviewStatusBadge } from "@/components/admin/review-status-badge";
import type { Chapter, Character } from "@/types/chapter";

type ChapterTab = "overview" | "sections" | "characters" | "learning-points";

interface ChapterManagementEditorProps {
  chapter: Chapter;
  allCharacters: Character[];
}

const TABS: { id: ChapterTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "sections", label: "Sections" },
  { id: "characters", label: "Characters" },
  { id: "learning-points", label: "Learning points" },
];

export function ChapterManagementEditor({
  chapter: initialChapter,
  allCharacters,
}: ChapterManagementEditorProps) {
  const router = useRouter();
  const [chapter, setChapter] = useState(initialChapter);
  const [activeTab, setActiveTab] = useState<ChapterTab>("overview");
  const [, startTransition] = useTransition();

  const sortedSections = useMemo(
    () => [...chapter.sections].sort((a, b) => a.sortOrder - b.sortOrder),
    [chapter.sections],
  );

  function refreshFromServer() {
    startTransition(() => {
      router.refresh();
    });
  }

  function handleChapterUpdated(nextChapter: Chapter) {
    setChapter(nextChapter);
    refreshFromServer();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Chapter {chapter.number}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{chapter.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <ReviewStatusBadge status={chapter.reviewStatus} />
            <span className="text-muted-foreground">
              {chapter.hasPublishedContent
                ? "Has published sections"
                : "No published sections yet"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/chapters/${chapter.id}/preview`}
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Preview
          </Link>
          <Link
            href="/admin/chapters"
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            All chapters
          </Link>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Chapter management sections"
        className="flex flex-wrap gap-2 border-b pb-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={
              activeTab === tab.id
                ? "rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                : "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <ChapterMetadataForm chapter={chapter} onSaved={handleChapterUpdated} />
      ) : null}

      {activeTab === "sections" ? (
        <ChapterSectionsPanel
          chapterId={chapter.id}
          sections={sortedSections}
          characters={chapter.characters}
          learningPoints={chapter.learningPoints}
          mediaAssets={chapter.media}
          onChanged={refreshFromServer}
        />
      ) : null}

      {activeTab === "characters" ? (
        <ChapterCharactersPanel
          chapterId={chapter.id}
          chapterCharacters={chapter.characters}
          allCharacters={allCharacters}
          onChanged={refreshFromServer}
        />
      ) : null}

      {activeTab === "learning-points" ? (
        <ChapterLearningPointsPanel
          chapterId={chapter.id}
          learningPoints={chapter.learningPoints}
          onChanged={refreshFromServer}
        />
      ) : null}
    </div>
  );
}
