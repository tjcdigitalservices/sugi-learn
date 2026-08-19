import type { ChapterSectionKind } from "@/types/chapter";
import { REVIEW_STATUS_OPTIONS } from "@/types/review";

export { REVIEW_STATUS_OPTIONS };

export const SECTION_KIND_OPTIONS: {
  value: ChapterSectionKind;
  label: string;
  group: string;
}[] = [
  { value: "introduction", label: "Introduction", group: "Text" },
  { value: "story", label: "Story", group: "Text" },
  { value: "cultural_context", label: "Cultural context", group: "Text" },
  { value: "activity", label: "Activity", group: "Text" },
  { value: "illustration", label: "Illustration", group: "Media" },
  { value: "audio", label: "Audio", group: "Media" },
  { value: "animation", label: "Animation", group: "Media" },
  { value: "characters", label: "Characters", group: "References" },
  { value: "learning_points", label: "Learning points", group: "References" },
  { value: "completion", label: "Completion", group: "Structure" },
];

export function formatSectionKind(kind: ChapterSectionKind): string {
  return SECTION_KIND_OPTIONS.find((option) => option.value === kind)?.label ?? kind;
}

export function formatDateTime(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
