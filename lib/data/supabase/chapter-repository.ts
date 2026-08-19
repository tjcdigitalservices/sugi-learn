import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapChapterRecord,
  mapChapterSummary,
} from "@/lib/data/supabase/mappers/chapter";
import { ARCHITECTURE_DEMO_CHAPTER } from "@/lib/data/mock/architecture-demo-chapter";
import type { ChapterRepository } from "@/lib/data/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TypedSupabaseClient } from "@/lib/supabase/service";
import type { Chapter, ChapterSummary } from "@/types/chapter";
import type { LearningPointRow } from "@/types/database";
import { isPublishedReviewStatus } from "@/types/review";

type ClientFactory = () => Promise<SupabaseClient>;

export class SupabaseChapterRepository implements ChapterRepository {
  constructor(
    private readonly clientFactory: ClientFactory = getSupabaseServerClient,
  ) {}

  async listChapters(): Promise<ChapterSummary[]> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data: chapters, error } = await supabase
      .from("chapters")
      .select("*")
      .order("chapter_number", { ascending: true });

    if (error) {
      throw new Error(`Failed to list chapters: ${error.message}`);
    }

    if (!chapters?.length) {
      return [];
    }

    const chapterIds = chapters.map((chapter) => chapter.id);
    const { data: sections, error: sectionsError } = await supabase
      .from("chapter_sections")
      .select("chapter_id, review_status")
      .in("chapter_id", chapterIds);

    if (sectionsError) {
      throw new Error(
        `Failed to load chapter section counts: ${sectionsError.message}`,
      );
    }

    const approvedCounts = new Map<string, number>();
    for (const section of sections ?? []) {
      if (isPublishedReviewStatus(section.review_status)) {
        approvedCounts.set(
          section.chapter_id,
          (approvedCounts.get(section.chapter_id) ?? 0) + 1,
        );
      }
    }

    return chapters.map((chapter) =>
      mapChapterSummary(chapter, approvedCounts.get(chapter.id) ?? 0),
    );
  }

  async getChapterById(chapterId: string): Promise<Chapter | null> {
    if (chapterId === ARCHITECTURE_DEMO_CHAPTER.id) {
      return ARCHITECTURE_DEMO_CHAPTER;
    }

    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data: chapter, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("slug", chapterId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load chapter: ${error.message}`);
    }

    if (!chapter) {
      return null;
    }

    const { data: sections, error: sectionsError } = await supabase
      .from("chapter_sections")
      .select("*")
      .eq("chapter_id", chapter.id)
      .order("sort_order", { ascending: true });

    if (sectionsError) {
      throw new Error(
        `Failed to load chapter sections: ${sectionsError.message}`,
      );
    }

    const sectionIds = sections?.map((section) => section.id) ?? [];

    const [
      mediaResult,
      chapterCharactersResult,
      learningPointsResult,
      sectionCharactersResult,
      sectionLearningPointsResult,
    ] = await Promise.all([
      supabase.from("media_assets").select("*").eq("chapter_id", chapter.id),
      supabase
        .from("chapter_characters")
        .select("character_id, sort_order")
        .eq("chapter_id", chapter.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("learning_points")
        .select("*")
        .eq("chapter_id", chapter.id)
        .order("sort_order", { ascending: true }),
      sectionIds.length
        ? supabase
            .from("section_characters")
            .select("section_id, character_id, sort_order")
            .in("section_id", sectionIds)
        : Promise.resolve({ data: [], error: null }),
      sectionIds.length
        ? supabase
            .from("section_learning_points")
            .select("section_id, learning_point_id, sort_order")
            .in("section_id", sectionIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (mediaResult.error) {
      throw new Error(`Failed to load media assets: ${mediaResult.error.message}`);
    }
    if (chapterCharactersResult.error) {
      throw new Error(
        `Failed to load chapter characters: ${chapterCharactersResult.error.message}`,
      );
    }
    if (learningPointsResult.error) {
      throw new Error(
        `Failed to load learning points: ${learningPointsResult.error.message}`,
      );
    }
    if (sectionCharactersResult.error) {
      throw new Error(
        `Failed to load section characters: ${sectionCharactersResult.error.message}`,
      );
    }
    if (sectionLearningPointsResult.error) {
      throw new Error(
        `Failed to load section learning points: ${sectionLearningPointsResult.error.message}`,
      );
    }

    const characterIds =
      chapterCharactersResult.data?.map((row) => row.character_id) ?? [];

    const { data: characterRows, error: charactersError } = characterIds.length
      ? await supabase.from("characters").select("*").in("id", characterIds)
      : { data: [], error: null };

    if (charactersError) {
      throw new Error(`Failed to load characters: ${charactersError.message}`);
    }

    const sectionCharacterIds = new Map<string, string[]>();
    for (const row of sectionCharactersResult.data ?? []) {
      const list = sectionCharacterIds.get(row.section_id) ?? [];
      list.push(row.character_id);
      sectionCharacterIds.set(row.section_id, list);
    }

    const sectionLearningPointIds = new Map<string, string[]>();
    for (const row of sectionLearningPointsResult.data ?? []) {
      const list = sectionLearningPointIds.get(row.section_id) ?? [];
      list.push(row.learning_point_id);
      sectionLearningPointIds.set(row.section_id, list);
    }

    const characters = characterRows ?? [];

    return mapChapterRecord({
      chapter,
      sections: sections ?? [],
      media: mediaResult.data ?? [],
      characters,
      learningPoints: (learningPointsResult.data ?? []) as LearningPointRow[],
      sectionCharacterIds,
      sectionLearningPointIds,
    });
  }
}
