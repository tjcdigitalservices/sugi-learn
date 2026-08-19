import type {
  ChapterSection,
  Character,
  LearningPoint,
} from "@/types/chapter";
import type { MediaAsset } from "@/types/media";

import { AnimationSectionView } from "@/components/chapter/sections/animation-section";
import { AudioSectionView } from "@/components/chapter/sections/audio-section";
import { CharactersSectionView } from "@/components/chapter/sections/characters-section";
import { CompletionSectionView } from "@/components/chapter/sections/completion-section";
import { IllustrationSectionView } from "@/components/chapter/sections/illustration-section";
import { LearningPointsSectionView } from "@/components/chapter/sections/learning-points-section";
import { SectionEmptyState } from "@/components/chapter/sections/section-empty-state";
import { TextSectionView } from "@/components/chapter/sections/text-section";

export type ChapterEngineContext = "learner" | "preview";

interface SectionRendererProps {
  section: ChapterSection;
  mediaAssets: MediaAsset[];
  characters: Character[];
  learningPoints: LearningPoint[];
  chapterId: string;
  chapterTitle: string;
  context?: ChapterEngineContext;
  chapterCompleted?: boolean;
  nextChapterId?: string | null;
}

export function SectionRenderer({
  section,
  mediaAssets,
  characters,
  learningPoints,
  chapterId,
  chapterTitle,
  context = "learner",
  chapterCompleted = false,
  nextChapterId,
}: SectionRendererProps) {
  switch (section.kind) {
    case "introduction":
    case "story":
    case "cultural_context":
    case "activity":
      return <TextSectionView section={section} />;

    case "characters":
      return (
        <CharactersSectionView section={section} characters={characters} />
      );

    case "illustration":
      return (
        <IllustrationSectionView
          section={section}
          mediaAssets={mediaAssets}
          context={context}
        />
      );

    case "audio":
      return (
        <AudioSectionView
          section={section}
          mediaAssets={mediaAssets}
          context={context}
        />
      );

    case "animation":
      return (
        <AnimationSectionView
          section={section}
          mediaAssets={mediaAssets}
          context={context}
        />
      );

    case "learning_points":
      return (
        <LearningPointsSectionView
          section={section}
          learningPoints={learningPoints}
        />
      );

    case "completion":
      return (
        <CompletionSectionView
          section={section}
          chapterId={chapterId}
          chapterTitle={chapterTitle}
          interactive={context === "learner"}
          initiallyCompleted={chapterCompleted}
          nextChapterId={nextChapterId}
        />
      );

    default: {
      const unknownSection = section as { kind?: string };
      return (
        <article className="space-y-3">
          <SectionEmptyState
            message={`This section type (${unknownSection.kind ?? "unknown"}) is not supported yet.`}
          />
        </article>
      );
    }
  }
}
