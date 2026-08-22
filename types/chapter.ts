import type { MediaAsset } from "@/types/media";
import type { ReviewStatus } from "@/types/review";

/** Catalog entry for official Sugidanon chapter metadata (initial content set). */
export interface ChapterSummary {
  id: string;
  number: number;
  title: string;
  /** Pending until client-approved summary exists. */
  subtitle: string | null;
  reviewStatus: ReviewStatus;
  /** Whether the chapter appears in active learner journeys (archived when false). */
  isActive: boolean;
  /** Whether learner-facing content is available. */
  hasPublishedContent: boolean;
  /** Admin-assigned cover media asset id (nullable). */
  coverMediaAssetId: string | null;
  /** Resolved cover image URL for learner/admin UI (nullable). */
  coverUrl: string | null;
}

/** Full chapter record for the chapter engine. */
export interface Chapter extends ChapterSummary {
  summary: string | null;
  sections: ChapterSection[];
  characters: Character[];
  learningPoints: LearningPoint[];
  media: MediaAsset[];
  assessmentReferences: AssessmentReference[];
}

/** Section kinds the chapter engine can render (not all required per chapter). */
export const CHAPTER_SECTION_KINDS = [
  "introduction",
  "story",
  "characters",
  "cultural_context",
  "illustration",
  "audio",
  "animation",
  "learning_points",
  "activity",
  "completion",
] as const;

export type ChapterSectionKind = (typeof CHAPTER_SECTION_KINDS)[number];

interface ChapterSectionBase {
  id: string;
  kind: ChapterSectionKind;
  title: string;
  sortOrder: number;
  reviewStatus: ReviewStatus;
}

export interface TextSection extends ChapterSectionBase {
  kind: "introduction" | "story" | "cultural_context" | "activity";
  body: string;
}

export interface CharactersSection extends ChapterSectionBase {
  kind: "characters";
  characterIds: string[];
}

export interface IllustrationSection extends ChapterSectionBase {
  kind: "illustration";
  mediaAssetId: string;
}

export interface AudioSection extends ChapterSectionBase {
  kind: "audio";
  mediaAssetId: string;
  transcript: string | null;
}

export interface AnimationSection extends ChapterSectionBase {
  kind: "animation";
  mediaAssetId: string;
}

export interface LearningPointsSection extends ChapterSectionBase {
  kind: "learning_points";
  learningPointIds: string[];
}

export interface CompletionSection extends ChapterSectionBase {
  kind: "completion";
  message: string | null;
}

export type ChapterSection =
  | TextSection
  | CharactersSection
  | IllustrationSection
  | AudioSection
  | AnimationSection
  | LearningPointsSection
  | CompletionSection;

export interface Character {
  id: string;
  name: string;
  description: string | null;
  mediaAssetId: string | null;
  reviewStatus: ReviewStatus;
}

export interface LearningPoint {
  id: string;
  title: string | null;
  text: string;
  reviewStatus: ReviewStatus;
}

export interface AssessmentReference {
  assessmentType: "pre" | "post";
  assessmentId: string;
}
