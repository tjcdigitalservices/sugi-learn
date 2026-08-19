import type { ReviewStatus } from "@/types/review";

export const SUGIDANON_SOURCE = {
  documentPath: "docs/sources/Tikum-Kadlum-Sugidanon-Source.docx",
} as const;

export interface ChapterCharacterDefinition {
  slug: string;
  name: string;
  description: string;
}

export interface ChapterLearningPointDefinition {
  title: string;
  description: string;
}

export interface IllustrationCandidateDefinition {
  scene: string;
  purpose: string;
  characters: string[];
  approvalStatus: "PENDING CLIENT APPROVAL";
}

export interface ChapterContentDefinition {
  id: string;
  number: number;
  metadata: {
    title: string;
    subtitle: string;
    summary: string;
    authors: string;
    reviewStatus: ReviewStatus;
  };
  characters: ChapterCharacterDefinition[];
  storySections: { title: string; body: string }[];
  learningPoints: ChapterLearningPointDefinition[];
  illustration?: {
    title: string;
    candidates: IllustrationCandidateDefinition[];
  };
  completionMessage: string;
}
