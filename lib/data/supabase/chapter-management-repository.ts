import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapChapterSection,
  mapChapterSummary,
  mapCharacter,
  mapLearningPoint,
} from "@/lib/data/supabase/mappers/chapter";
import { SupabaseChapterRepository } from "@/lib/data/supabase/chapter-repository";
import type { ChapterManagementRepository } from "@/lib/data/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TypedSupabaseClient } from "@/lib/supabase/service";
import type {
  Chapter,
  ChapterSection,
  ChapterSectionKind,
  Character,
  LearningPoint,
} from "@/types/chapter";
import type {
  AdminChapterListItem,
  CreateChapterInput,
  CreateLearningPointInput,
  CreateSectionInput,
  UpdateChapterMetadataInput,
  UpdateLearningPointInput,
  UpdateSectionInput,
} from "@/types/chapter-management";
import type { ChapterRow, ChapterSectionRow, LearningPointRow } from "@/types/database";
import { isPublishedReviewStatus } from "@/types/review";
import {
  ensureUniqueChapterSlug,
  slugifyChapterTitle,
} from "@/lib/chapter-management/slug";

type ClientFactory = () => Promise<SupabaseClient>;

function managementError(message: string): Error {
  return new Error(message);
}

async function getChapterRowBySlug(
  supabase: TypedSupabaseClient,
  chapterSlug: string,
): Promise<ChapterRow> {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("slug", chapterSlug)
    .maybeSingle();

  if (error) {
    throw managementError("Unable to load chapter.");
  }
  if (!data) {
    throw managementError("Chapter not found.");
  }

  return data;
}

async function applySectionSortOrder(
  supabase: TypedSupabaseClient,
  sectionIds: string[],
) {
  const tempOffset = 10_000;

  for (let index = 0; index < sectionIds.length; index += 1) {
    const { error } = await supabase
      .from("chapter_sections")
      .update({ sort_order: tempOffset + index })
      .eq("id", sectionIds[index]);

    if (error) {
      throw managementError("Unable to reorder items.");
    }
  }

  for (let index = 0; index < sectionIds.length; index += 1) {
    const { error } = await supabase
      .from("chapter_sections")
      .update({ sort_order: index })
      .eq("id", sectionIds[index]);

    if (error) {
      throw managementError("Unable to reorder items.");
    }
  }
}

async function applyLearningPointSortOrder(
  supabase: TypedSupabaseClient,
  learningPointIds: string[],
) {
  const tempOffset = 10_000;

  for (let index = 0; index < learningPointIds.length; index += 1) {
    const { error } = await supabase
      .from("learning_points")
      .update({ sort_order: tempOffset + index })
      .eq("id", learningPointIds[index]);

    if (error) {
      throw managementError("Unable to reorder items.");
    }
  }

  for (let index = 0; index < learningPointIds.length; index += 1) {
    const { error } = await supabase
      .from("learning_points")
      .update({ sort_order: index })
      .eq("id", learningPointIds[index]);

    if (error) {
      throw managementError("Unable to reorder items.");
    }
  }
}

async function applyChapterCharacterSortOrder(
  supabase: TypedSupabaseClient,
  chapterId: string,
  characterIds: string[],
) {
  const tempOffset = 10_000;

  for (let index = 0; index < characterIds.length; index += 1) {
    const { error } = await supabase
      .from("chapter_characters")
      .update({ sort_order: tempOffset + index })
      .eq("chapter_id", chapterId)
      .eq("character_id", characterIds[index]);

    if (error) {
      throw managementError("Unable to reorder chapter characters.");
    }
  }

  for (let index = 0; index < characterIds.length; index += 1) {
    const { error } = await supabase
      .from("chapter_characters")
      .update({ sort_order: index })
      .eq("chapter_id", chapterId)
      .eq("character_id", characterIds[index]);

    if (error) {
      throw managementError("Unable to reorder chapter characters.");
    }
  }
}

function buildSectionInsertPayload(
  chapterId: string,
  sortOrder: number,
  input: CreateSectionInput,
) {
  const reviewStatus = input.reviewStatus ?? "draft";

  const base = {
    chapter_id: chapterId,
    kind: input.kind,
    title: input.title.trim(),
    sort_order: sortOrder,
    review_status: reviewStatus,
  };

  switch (input.kind) {
    case "introduction":
    case "story":
    case "cultural_context":
    case "activity":
      return {
        ...base,
        body_text: input.body ?? "",
      };
    case "illustration":
    case "animation":
      return {
        ...base,
        media_asset_id: null,
      };
    case "audio":
      return {
        ...base,
        media_asset_id: null,
        transcript: input.transcript ?? null,
      };
    case "completion":
      return {
        ...base,
        completion_message: input.completionMessage ?? null,
      };
    case "characters":
    case "learning_points":
      return base;
    default: {
      const exhaustive: never = input.kind;
      throw managementError(`Unsupported section kind: ${exhaustive}`);
    }
  }
}

function buildSectionUpdatePayload(
  input: UpdateSectionInput,
  kind: ChapterSectionKind,
): Partial<
  Pick<
    ChapterSectionRow,
    | "title"
    | "review_status"
    | "body_text"
    | "transcript"
    | "completion_message"
    | "media_asset_id"
  >
> {
  const payload: Partial<
    Pick<
      ChapterSectionRow,
      | "title"
      | "review_status"
      | "body_text"
      | "transcript"
      | "completion_message"
      | "media_asset_id"
    >
  > = {};

  if (input.title !== undefined) {
    payload.title = input.title.trim();
  }
  if (input.reviewStatus !== undefined) {
    payload.review_status = input.reviewStatus;
  }

  switch (kind) {
    case "introduction":
    case "story":
    case "cultural_context":
    case "activity":
      if (input.body !== undefined) {
        payload.body_text = input.body;
      }
      break;
    case "audio":
      if (input.transcript !== undefined) {
        payload.transcript = input.transcript;
      }
      if (input.mediaAssetId !== undefined) {
        payload.media_asset_id = input.mediaAssetId;
      }
      break;
    case "illustration":
    case "animation":
      if (input.mediaAssetId !== undefined) {
        payload.media_asset_id = input.mediaAssetId;
      }
      break;
    case "completion":
      if (input.completionMessage !== undefined) {
        payload.completion_message = input.completionMessage;
      }
      break;
    default:
      break;
  }

  return payload;
}

async function syncSectionCharacters(
  supabase: TypedSupabaseClient,
  sectionId: string,
  characterIds: string[],
) {
  const { error: deleteError } = await supabase
    .from("section_characters")
    .delete()
    .eq("section_id", sectionId);

  if (deleteError) {
    throw managementError("Unable to update section characters.");
  }

  if (characterIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from("section_characters").insert(
    characterIds.map((characterId, index) => ({
      section_id: sectionId,
      character_id: characterId,
      sort_order: index,
    })),
  );

  if (insertError) {
    throw managementError("Unable to update section characters.");
  }
}

async function syncSectionLearningPoints(
  supabase: TypedSupabaseClient,
  sectionId: string,
  learningPointIds: string[],
) {
  const { error: deleteError } = await supabase
    .from("section_learning_points")
    .delete()
    .eq("section_id", sectionId);

  if (deleteError) {
    throw managementError("Unable to update section learning points.");
  }

  if (learningPointIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from("section_learning_points")
    .insert(
      learningPointIds.map((learningPointId, index) => ({
        section_id: sectionId,
        learning_point_id: learningPointId,
        sort_order: index,
      })),
    );

  if (insertError) {
    throw managementError("Unable to update section learning points.");
  }
}

async function applyChapterNumberOrder(
  supabase: TypedSupabaseClient,
  orderedChapterIds: string[],
) {
  const tempOffset = 10_000;

  for (let index = 0; index < orderedChapterIds.length; index += 1) {
    const { error } = await supabase
      .from("chapters")
      .update({ chapter_number: tempOffset + index })
      .eq("id", orderedChapterIds[index]);

    if (error) {
      throw managementError("Unable to reorder chapters.");
    }
  }

  for (let index = 0; index < orderedChapterIds.length; index += 1) {
    const { error } = await supabase
      .from("chapters")
      .update({ chapter_number: index + 1 })
      .eq("id", orderedChapterIds[index]);

    if (error) {
      throw managementError("Unable to reorder chapters.");
    }
  }
}

export class SupabaseChapterManagementRepository
  implements ChapterManagementRepository
{
  private readonly reader: SupabaseChapterRepository;

  constructor(
    private readonly clientFactory: ClientFactory = getSupabaseServerClient,
  ) {
    this.reader = new SupabaseChapterRepository(clientFactory);
  }

  async listChaptersForAdmin(): Promise<AdminChapterListItem[]> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data: chapters, error } = await supabase
      .from("chapters")
      .select("*")
      .order("chapter_number", { ascending: true });

    if (error) {
      throw managementError("Unable to load chapters.");
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
      throw managementError("Unable to load chapter sections.");
    }

    const approvedCounts = new Map<string, number>();
    const sectionCounts = new Map<string, number>();

    for (const section of sections ?? []) {
      sectionCounts.set(
        section.chapter_id,
        (sectionCounts.get(section.chapter_id) ?? 0) + 1,
      );
      if (isPublishedReviewStatus(section.review_status)) {
        approvedCounts.set(
          section.chapter_id,
          (approvedCounts.get(section.chapter_id) ?? 0) + 1,
        );
      }
    }

    const coverIds = chapters
      .map((chapter) => chapter.cover_media_asset_id)
      .filter((id): id is string => Boolean(id));
    const coverPathByAssetId = new Map<string, string | null>();
    if (coverIds.length > 0) {
      const { data: coverAssets } = await supabase
        .from("media_assets")
        .select("id, storage_path")
        .in("id", coverIds);
      for (const asset of coverAssets ?? []) {
        coverPathByAssetId.set(asset.id, asset.storage_path);
      }
    }

    return chapters.map((chapter) => ({
      ...mapChapterSummary(
        chapter,
        approvedCounts.get(chapter.id) ?? 0,
        chapter.cover_media_asset_id
          ? (coverPathByAssetId.get(chapter.cover_media_asset_id) ?? null)
          : null,
      ),
      updatedAt: chapter.updated_at,
      sectionCount: sectionCounts.get(chapter.id) ?? 0,
      dbId: chapter.id,
    }));
  }

  async getChapterForAdmin(chapterId: string): Promise<Chapter | null> {
    return this.reader.getChapterById(chapterId);
  }

  async updateChapterMetadata(
    chapterId: string,
    input: UpdateChapterMetadataInput,
  ): Promise<Chapter> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    await getChapterRowBySlug(supabase, chapterId);

    const { error } = await supabase
      .from("chapters")
      .update({
        title: input.title.trim(),
        subtitle: input.subtitle,
        summary: input.summary,
        review_status: input.reviewStatus,
        ...(input.coverMediaAssetId !== undefined
          ? { cover_media_asset_id: input.coverMediaAssetId }
          : {}),
      })
      .eq("slug", chapterId);

    if (error) {
      throw managementError("Unable to save chapter metadata.");
    }

    const chapter = await this.getChapterForAdmin(chapterId);
    if (!chapter) {
      throw managementError("Chapter not found after update.");
    }

    return chapter;
  }

  async createSection(
    chapterId: string,
    input: CreateSectionInput,
  ): Promise<ChapterSection> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapter = await getChapterRowBySlug(supabase, chapterId);

    const { data: existingSections, error: listError } = await supabase
      .from("chapter_sections")
      .select("sort_order")
      .eq("chapter_id", chapter.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    if (listError) {
      throw managementError("Unable to create section.");
    }

    const nextSortOrder =
      existingSections && existingSections.length > 0
        ? existingSections[0].sort_order + 1
        : 0;

    const { data: inserted, error } = await supabase
      .from("chapter_sections")
      .insert(buildSectionInsertPayload(chapter.id, nextSortOrder, input))
      .select("*")
      .single();

    if (error || !inserted) {
      throw managementError("Unable to create section.");
    }

    if (input.kind === "characters" && input.characterIds) {
      await syncSectionCharacters(supabase, inserted.id, input.characterIds);
    }
    if (input.kind === "learning_points" && input.learningPointIds) {
      await syncSectionLearningPoints(
        supabase,
        inserted.id,
        input.learningPointIds,
      );
    }

    const sectionCharacterIds = new Map<string, string[]>();
    const sectionLearningPointIds = new Map<string, string[]>();

    if (input.kind === "characters" && input.characterIds) {
      sectionCharacterIds.set(inserted.id, input.characterIds);
    }
    if (input.kind === "learning_points" && input.learningPointIds) {
      sectionLearningPointIds.set(inserted.id, input.learningPointIds);
    }

    return mapChapterSection(inserted, {
      sectionCharacterIds,
      sectionLearningPointIds,
    });
  }

  async updateSection(
    chapterId: string,
    sectionId: string,
    input: UpdateSectionInput,
  ): Promise<ChapterSection> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapter = await getChapterRowBySlug(supabase, chapterId);

    const { data: existing, error: existingError } = await supabase
      .from("chapter_sections")
      .select("*")
      .eq("id", sectionId)
      .eq("chapter_id", chapter.id)
      .maybeSingle();

    if (existingError || !existing) {
      throw managementError("Section not found.");
    }

    const { data: updated, error } = await supabase
      .from("chapter_sections")
      .update(buildSectionUpdatePayload(input, existing.kind))
      .eq("id", sectionId)
      .select("*")
      .single();

    if (error || !updated) {
      throw managementError("Unable to save section.");
    }

    if (existing.kind === "characters" && input.characterIds) {
      await syncSectionCharacters(supabase, sectionId, input.characterIds);
    }
    if (existing.kind === "learning_points" && input.learningPointIds) {
      await syncSectionLearningPoints(
        supabase,
        sectionId,
        input.learningPointIds,
      );
    }

    if (
      (existing.kind === "illustration" ||
        existing.kind === "audio" ||
        existing.kind === "animation") &&
      input.mediaAssetId !== undefined
    ) {
      const previousAssetId = existing.media_asset_id;

      if (previousAssetId && previousAssetId !== input.mediaAssetId) {
        await supabase
          .from("media_assets")
          .update({ section_id: null })
          .eq("id", previousAssetId)
          .eq("section_id", sectionId);
      }

      if (input.mediaAssetId) {
        const { data: asset, error: assetError } = await supabase
          .from("media_assets")
          .select("kind")
          .eq("id", input.mediaAssetId)
          .maybeSingle();

        if (assetError || !asset) {
          throw managementError("Media asset not found.");
        }

        if (asset.kind !== existing.kind) {
          throw managementError("Media type does not match section type.");
        }

        const { error: linkError } = await supabase
          .from("media_assets")
          .update({
            chapter_id: chapter.id,
            section_id: sectionId,
          })
          .eq("id", input.mediaAssetId);

        if (linkError) {
          throw managementError("Unable to link media to section.");
        }
      } else if (previousAssetId) {
        await supabase
          .from("media_assets")
          .update({ section_id: null })
          .eq("id", previousAssetId);
      }
    }

    const sectionCharacterIds = new Map<string, string[]>();
    const sectionLearningPointIds = new Map<string, string[]>();

    if (existing.kind === "characters") {
      const { data: characterRows } = await supabase
        .from("section_characters")
        .select("character_id")
        .eq("section_id", sectionId)
        .order("sort_order", { ascending: true });
      sectionCharacterIds.set(
        sectionId,
        characterRows?.map((row) => row.character_id) ?? [],
      );
    }

    if (existing.kind === "learning_points") {
      const { data: pointRows } = await supabase
        .from("section_learning_points")
        .select("learning_point_id")
        .eq("section_id", sectionId)
        .order("sort_order", { ascending: true });
      sectionLearningPointIds.set(
        sectionId,
        pointRows?.map((row) => row.learning_point_id) ?? [],
      );
    }

    return mapChapterSection(updated, {
      sectionCharacterIds,
      sectionLearningPointIds,
    });
  }

  async deleteSection(chapterId: string, sectionId: string): Promise<void> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapter = await getChapterRowBySlug(supabase, chapterId);

    const { error } = await supabase
      .from("chapter_sections")
      .delete()
      .eq("id", sectionId)
      .eq("chapter_id", chapter.id);

    if (error) {
      throw managementError("Unable to delete section.");
    }

    const { data: remaining, error: listError } = await supabase
      .from("chapter_sections")
      .select("id")
      .eq("chapter_id", chapter.id)
      .order("sort_order", { ascending: true });

    if (listError) {
      throw managementError("Unable to reorder sections after deletion.");
    }

    if (remaining?.length) {
      await applySectionSortOrder(
        supabase,
        remaining.map((section) => section.id),
      );
    }
  }

  async reorderSections(
    chapterId: string,
    sectionIds: string[],
  ): Promise<void> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapter = await getChapterRowBySlug(supabase, chapterId);

    const { data: sections, error } = await supabase
      .from("chapter_sections")
      .select("id")
      .eq("chapter_id", chapter.id);

    if (error) {
      throw managementError("Unable to reorder sections.");
    }

    const existingIds = new Set(sections?.map((section) => section.id) ?? []);
    if (
      sectionIds.length !== existingIds.size ||
      sectionIds.some((id) => !existingIds.has(id))
    ) {
      throw managementError("Invalid section order.");
    }

    await applySectionSortOrder(supabase, sectionIds);
  }

  async listAllCharacters(): Promise<Character[]> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw managementError("Unable to load characters.");
    }

    return (data ?? []).map(mapCharacter);
  }

  async associateCharacter(
    chapterId: string,
    characterId: string,
  ): Promise<void> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapter = await getChapterRowBySlug(supabase, chapterId);

    const { data: character, error: characterError } = await supabase
      .from("characters")
      .select("id")
      .eq("id", characterId)
      .maybeSingle();

    if (characterError || !character) {
      throw managementError("Character not found.");
    }

    const { data: existing, error: existingError } = await supabase
      .from("chapter_characters")
      .select("sort_order")
      .eq("chapter_id", chapter.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    if (existingError) {
      throw managementError("Unable to associate character.");
    }

    const nextSortOrder =
      existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { error } = await supabase.from("chapter_characters").insert({
      chapter_id: chapter.id,
      character_id: characterId,
      sort_order: nextSortOrder,
    });

    if (error) {
      throw managementError("Unable to associate character.");
    }
  }

  async removeCharacterAssociation(
    chapterId: string,
    characterId: string,
  ): Promise<void> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapter = await getChapterRowBySlug(supabase, chapterId);

    const { error } = await supabase
      .from("chapter_characters")
      .delete()
      .eq("chapter_id", chapter.id)
      .eq("character_id", characterId);

    if (error) {
      throw managementError("Unable to remove character association.");
    }

    const { data: remaining, error: listError } = await supabase
      .from("chapter_characters")
      .select("character_id")
      .eq("chapter_id", chapter.id)
      .order("sort_order", { ascending: true });

    if (listError) {
      throw managementError("Unable to reorder characters after removal.");
    }

    if (remaining?.length) {
      await applyChapterCharacterSortOrder(
        supabase,
        chapter.id,
        remaining.map((row) => row.character_id),
      );
    }
  }

  async reorderChapterCharacters(
    chapterId: string,
    characterIds: string[],
  ): Promise<void> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapter = await getChapterRowBySlug(supabase, chapterId);

    const { data: associations, error } = await supabase
      .from("chapter_characters")
      .select("character_id")
      .eq("chapter_id", chapter.id);

    if (error) {
      throw managementError("Unable to reorder chapter characters.");
    }

    const existingIds = new Set(
      associations?.map((row) => row.character_id) ?? [],
    );
    if (
      characterIds.length !== existingIds.size ||
      characterIds.some((id) => !existingIds.has(id))
    ) {
      throw managementError("Invalid character order.");
    }

    await applyChapterCharacterSortOrder(supabase, chapter.id, characterIds);
  }

  async createLearningPoint(
    chapterId: string,
    input: CreateLearningPointInput,
  ): Promise<LearningPoint> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapter = await getChapterRowBySlug(supabase, chapterId);

    const { data: existing, error: listError } = await supabase
      .from("learning_points")
      .select("sort_order")
      .eq("chapter_id", chapter.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    if (listError) {
      throw managementError("Unable to create learning point.");
    }

    const nextSortOrder =
      existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data, error } = await supabase
      .from("learning_points")
      .insert({
        chapter_id: chapter.id,
        title: input.title?.trim() || null,
        description: input.description.trim(),
        sort_order: nextSortOrder,
        review_status: input.reviewStatus ?? "draft",
      })
      .select("*")
      .single();

    if (error || !data) {
      throw managementError("Unable to create learning point.");
    }

    return mapLearningPoint(data as LearningPointRow);
  }

  async updateLearningPoint(
    chapterId: string,
    learningPointId: string,
    input: UpdateLearningPointInput,
  ): Promise<LearningPoint> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapter = await getChapterRowBySlug(supabase, chapterId);

    const payload: Partial<
      Pick<LearningPointRow, "title" | "description" | "review_status">
    > = {};
    if (input.title !== undefined) {
      payload.title = input.title?.trim() || null;
    }
    if (input.description !== undefined) {
      payload.description = input.description.trim();
    }
    if (input.reviewStatus !== undefined) {
      payload.review_status = input.reviewStatus;
    }

    const { data, error } = await supabase
      .from("learning_points")
      .update(payload)
      .eq("id", learningPointId)
      .eq("chapter_id", chapter.id)
      .select("*")
      .single();

    if (error || !data) {
      throw managementError("Unable to save learning point.");
    }

    return mapLearningPoint(data as LearningPointRow);
  }

  async deleteLearningPoint(
    chapterId: string,
    learningPointId: string,
  ): Promise<void> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapter = await getChapterRowBySlug(supabase, chapterId);

    const { error } = await supabase
      .from("learning_points")
      .delete()
      .eq("id", learningPointId)
      .eq("chapter_id", chapter.id);

    if (error) {
      throw managementError("Unable to delete learning point.");
    }

    const { data: remaining, error: listError } = await supabase
      .from("learning_points")
      .select("id")
      .eq("chapter_id", chapter.id)
      .order("sort_order", { ascending: true });

    if (listError) {
      throw managementError("Unable to reorder learning points after deletion.");
    }

    if (remaining?.length) {
      await applyLearningPointSortOrder(
        supabase,
        remaining.map((point) => point.id),
      );
    }
  }

  async reorderLearningPoints(
    chapterId: string,
    learningPointIds: string[],
  ): Promise<void> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapter = await getChapterRowBySlug(supabase, chapterId);

    const { data: points, error } = await supabase
      .from("learning_points")
      .select("id")
      .eq("chapter_id", chapter.id);

    if (error) {
      throw managementError("Unable to reorder learning points.");
    }

    const existingIds = new Set(points?.map((point) => point.id) ?? []);
    if (
      learningPointIds.length !== existingIds.size ||
      learningPointIds.some((id) => !existingIds.has(id))
    ) {
      throw managementError("Invalid learning point order.");
    }

    await applyLearningPointSortOrder(supabase, learningPointIds);
  }

  async createChapter(input: CreateChapterInput): Promise<Chapter> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const title = input.title.trim();

    if (!title) {
      throw managementError("Chapter title is required.");
    }

    const { data: existingChapters, error: listError } = await supabase
      .from("chapters")
      .select("slug, chapter_number");

    if (listError) {
      throw managementError("Unable to create chapter.");
    }

    const slugs = new Set((existingChapters ?? []).map((row) => row.slug));
    const slug = ensureUniqueChapterSlug(slugifyChapterTitle(title), slugs);
    const maxNumber = Math.max(
      0,
      ...(existingChapters ?? []).map((row) => row.chapter_number),
    );

    const { error: insertError } = await supabase.from("chapters").insert({
      slug,
      chapter_number: maxNumber + 1,
      title,
      subtitle: input.subtitle?.trim() || null,
      summary: input.summary?.trim() || null,
      review_status: "draft",
      is_active: true,
    });

    if (insertError) {
      throw managementError("Unable to create chapter.");
    }

    const chapter = await this.getChapterForAdmin(slug);
    if (!chapter) {
      throw managementError("Unable to load created chapter.");
    }

    return chapter;
  }

  async reorderChapters(orderedChapterSlugs: string[]): Promise<void> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data: chapters, error } = await supabase
      .from("chapters")
      .select("id, slug")
      .order("chapter_number", { ascending: true });

    if (error) {
      throw managementError("Unable to reorder chapters.");
    }

    const slugToId = new Map((chapters ?? []).map((row) => [row.slug, row.id]));
    const existingSlugs = new Set(slugToId.keys());

    if (
      orderedChapterSlugs.length !== existingSlugs.size ||
      orderedChapterSlugs.some((slug) => !existingSlugs.has(slug))
    ) {
      throw managementError("Invalid chapter order.");
    }

    const orderedIds = orderedChapterSlugs.map(
      (slug) => slugToId.get(slug) as string,
    );
    await applyChapterNumberOrder(supabase, orderedIds);
  }

  async setChapterActive(
    chapterId: string,
    isActive: boolean,
  ): Promise<Chapter> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapterRow = await getChapterRowBySlug(supabase, chapterId);

    const { error } = await supabase
      .from("chapters")
      .update({ is_active: isActive })
      .eq("id", chapterRow.id);

    if (error) {
      throw managementError("Unable to update chapter status.");
    }

    const chapter = await this.getChapterForAdmin(chapterId);
    if (!chapter) {
      throw managementError("Chapter not found.");
    }

    return chapter;
  }
}
