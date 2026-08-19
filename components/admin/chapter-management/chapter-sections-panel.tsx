"use client";

import type { ChapterSection, Character, LearningPoint } from "@/types/chapter";
import type { MediaAsset } from "@/types/media";

import { SectionEditorCard } from "@/components/admin/chapter-management/section-editor-card";
import { SectionCreateForm } from "@/components/admin/chapter-management/section-create-form";

interface ChapterSectionsPanelProps {
  chapterId: string;
  sections: ChapterSection[];
  characters: Character[];
  learningPoints: LearningPoint[];
  mediaAssets: MediaAsset[];
  onChanged: () => void;
}

export function ChapterSectionsPanel({
  chapterId,
  sections,
  characters,
  learningPoints,
  mediaAssets,
  onChanged,
}: ChapterSectionsPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Sections</h2>
        <p className="text-sm text-muted-foreground">
          Manage the ordered structure of this chapter. Assign uploaded media
          assets to illustration, audio, and animation sections.
        </p>
      </div>

      <SectionCreateForm chapterId={chapterId} onCreated={onChanged} />

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No sections yet. Add a section to begin structuring this chapter.
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <SectionEditorCard
              key={section.id}
              chapterId={chapterId}
              section={section}
              sectionIndex={index}
              sectionCount={sections.length}
              allSectionIds={sections.map((item) => item.id)}
              characters={characters}
              learningPoints={learningPoints}
              mediaAssets={mediaAssets}
              onChanged={onChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}
