import type { Chapter } from "@/types/chapter";
import type { ChapterNavigation } from "@/lib/domain/chapter-navigation";

interface ChapterHeaderProps {
  chapter: Chapter;
  navigation?: ChapterNavigation | null;
}

export function ChapterHeader({ chapter, navigation }: ChapterHeaderProps) {
  const eyebrow =
    chapter.number > 0
      ? navigation
        ? `Chapter ${navigation.position} of ${navigation.total}`
        : `Chapter ${chapter.number}`
      : "Demo";

  return (
    <header className="space-y-3 border-b pb-6">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {chapter.title}
      </h1>
      {chapter.subtitle ? (
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          {chapter.subtitle}
        </p>
      ) : null}
      {chapter.summary ? (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {chapter.summary}
        </p>
      ) : null}
    </header>
  );
}
