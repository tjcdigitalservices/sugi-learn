import type { ChapterSummary } from "@/types/chapter";

/**
 * Canonical catalog of the 13 Sugidanon chapters (titles from AGENTS.md / README).
 * Detailed content is added per chapter in later milestones.
 */
export const CHAPTER_CATALOG: readonly ChapterSummary[] = [
  {
    id: "tikum-kadlum",
    number: 1,
    title: "Tikum Kadlum",
    subtitle: null,
    reviewStatus: "draft",
    isActive: true,
    hasPublishedContent: false,
  },
  {
    id: "amburukay",
    number: 2,
    title: "Amburukay",
    subtitle: null,
    reviewStatus: "draft",
    isActive: true,
    hasPublishedContent: false,
  },
  {
    id: "derikaryong-pada",
    number: 3,
    title: "Derikaryong Pada",
    subtitle: null,
    reviewStatus: "draft",
    isActive: true,
    hasPublishedContent: false,
  },
  {
    id: "balanakon",
    number: 4,
    title: "Balanakon",
    subtitle: null,
    reviewStatus: "draft",
    isActive: true,
    hasPublishedContent: false,
  },
  {
    id: "kalampay",
    number: 5,
    title: "Kalampay",
    subtitle: null,
    reviewStatus: "draft",
    isActive: true,
    hasPublishedContent: false,
  },
  {
    id: "pahagunong",
    number: 6,
    title: "Pahagunong",
    subtitle: null,
    reviewStatus: "draft",
    isActive: true,
    hasPublishedContent: false,
  },
  {
    id: "sinagnayan",
    number: 7,
    title: "Sinagnayan",
    subtitle: null,
    reviewStatus: "draft",
    isActive: true,
    hasPublishedContent: false,
  },
  {
    id: "humadapnon-tarangban",
    number: 8,
    title: "Humadapnon: Tarangban",
    subtitle: null,
    reviewStatus: "draft",
    isActive: true,
    hasPublishedContent: false,
  },
  {
    id: "humadapnon-pagbalukat-ka-biday",
    number: 9,
    title: "Humadapnon: Pagbalukat ka Biday",
    subtitle: null,
    reviewStatus: "draft",
    isActive: true,
    hasPublishedContent: false,
  },
  {
    id: "humadapnon-hungaw",
    number: 10,
    title: "Humadapnon: Hungaw",
    subtitle: null,
    reviewStatus: "draft",
    isActive: true,
    hasPublishedContent: false,
  },
  {
    id: "humadapnon-ginlawan",
    number: 11,
    title: "Humadapnon: Ginlawan",
    subtitle: null,
    reviewStatus: "draft",
    isActive: true,
    hasPublishedContent: false,
  },
  {
    id: "alayaw",
    number: 12,
    title: "Alayaw",
    subtitle: null,
    reviewStatus: "draft",
    isActive: true,
    hasPublishedContent: false,
  },
  {
    id: "nagbuhis",
    number: 13,
    title: "Nagbuhis",
    subtitle: null,
    reviewStatus: "draft",
    isActive: true,
    hasPublishedContent: false,
  },
] as const;

export function getChapterSummaryById(
  chapterId: string,
): ChapterSummary | undefined {
  return CHAPTER_CATALOG.find((chapter) => chapter.id === chapterId);
}
