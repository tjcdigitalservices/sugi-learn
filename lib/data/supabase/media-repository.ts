import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildReferenceInfo,
  mapAdminMediaDetail,
  mapAdminMediaListItem,
  mapMediaAsset,
} from "@/lib/data/supabase/mappers/media";
import type { MediaRepository } from "@/lib/data/types";
import { deleteMediaFile } from "@/lib/media/storage";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TypedSupabaseClient } from "@/lib/supabase/service";
import type { MediaAsset } from "@/types/media";
import type {
  AdminMediaAssetDetail,
  AdminMediaAssetListItem,
  CreateMediaAssetInput,
  MediaListFilters,
  UpdateMediaAssetInput,
} from "@/types/media-management";
import type { MediaAssetRow } from "@/types/database";

type ClientFactory = () => Promise<SupabaseClient>;

function mediaError(message: string): Error {
  return new Error(message);
}

async function loadChapterContext(
  supabase: TypedSupabaseClient,
  chapterId: string | null,
) {
  if (!chapterId) {
    return { chapterSlug: null, chapterTitle: null };
  }

  const { data } = await supabase
    .from("chapters")
    .select("slug, title")
    .eq("id", chapterId)
    .maybeSingle();

  return {
    chapterSlug: data?.slug ?? null,
    chapterTitle: data?.title ?? null,
  };
}

async function loadSectionTitle(
  supabase: TypedSupabaseClient,
  sectionId: string | null,
) {
  if (!sectionId) {
    return null;
  }

  const { data } = await supabase
    .from("chapter_sections")
    .select("title")
    .eq("id", sectionId)
    .maybeSingle();

  return data?.title ?? null;
}

async function loadReferenceContext(
  supabase: TypedSupabaseClient,
  row: MediaAssetRow,
) {
  const sectionTitle = await loadSectionTitle(supabase, row.section_id);

  const { data: characterRows } = await supabase
    .from("characters")
    .select("name")
    .eq("media_asset_id", row.id);

  const reference = buildReferenceInfo({
    sectionTitle,
    characterNames: characterRows?.map((character) => character.name) ?? [],
  });

  return {
    sectionTitle,
    isReferenced: reference.isReferenced,
    referenceSummary: reference.summary,
  };
}

async function getChapterIdBySlug(
  supabase: TypedSupabaseClient,
  chapterSlug: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("chapters")
    .select("id")
    .eq("slug", chapterSlug)
    .maybeSingle();

  if (error || !data) {
    throw mediaError("Chapter not found.");
  }

  return data.id;
}

export class SupabaseMediaRepository implements MediaRepository {
  constructor(
    private readonly clientFactory: ClientFactory = getSupabaseServerClient,
  ) {}

  async listMediaAssets(
    filters?: MediaListFilters,
  ): Promise<AdminMediaAssetListItem[]> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    let query = supabase.from("media_assets").select("*").order("updated_at", {
      ascending: false,
    });

    if (filters?.kind && filters.kind !== "all") {
      query = query.eq("kind", filters.kind);
    }

    if (filters?.reviewStatus && filters.reviewStatus !== "all") {
      query = query.eq("review_status", filters.reviewStatus);
    }

    if (filters?.chapterSlug && filters.chapterSlug !== "all") {
      const chapterId = await getChapterIdBySlug(supabase, filters.chapterSlug);
      query = query.eq("chapter_id", chapterId);
    }

    const { data, error } = await query;

    if (error) {
      throw mediaError("Unable to load media assets.");
    }

    const rows = (data ?? []) as MediaAssetRow[];
    const filteredRows = filters?.query?.trim()
      ? rows.filter((row) => {
          const queryText = filters.query!.trim().toLowerCase();
          const haystack = [row.title, row.caption, row.source_reference]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(queryText);
        })
      : rows;

    const items: AdminMediaAssetListItem[] = [];

    for (const row of filteredRows) {
      const chapterContext = await loadChapterContext(supabase, row.chapter_id);
      const sectionTitle = await loadSectionTitle(supabase, row.section_id);
      items.push(
        mapAdminMediaListItem(row, {
          ...chapterContext,
          sectionTitle,
        }),
      );
    }

    return items;
  }

  async getMediaAsset(mediaId: string): Promise<AdminMediaAssetDetail | null> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .eq("id", mediaId)
      .maybeSingle();

    if (error) {
      throw mediaError("Unable to load media asset.");
    }

    if (!data) {
      return null;
    }

    const row = data as MediaAssetRow;
    const chapterContext = await loadChapterContext(supabase, row.chapter_id);
    const referenceContext = await loadReferenceContext(supabase, row);

    return mapAdminMediaDetail(row, {
      ...chapterContext,
      sectionTitle: referenceContext.sectionTitle,
      isReferenced: referenceContext.isReferenced,
      referenceSummary: referenceContext.referenceSummary,
    });
  }

  async countByKind(kind: MediaAsset["kind"]): Promise<number> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const { count, error } = await supabase
      .from("media_assets")
      .select("*", { count: "exact", head: true })
      .eq("kind", kind);

    if (error) {
      throw mediaError("Unable to count media assets.");
    }

    return count ?? 0;
  }

  async createMediaAsset(
    input: CreateMediaAssetInput,
    storagePath: string | null,
  ): Promise<AdminMediaAssetDetail> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    let chapterId: string | null = null;
    if (input.chapterSlug) {
      chapterId = await getChapterIdBySlug(supabase, input.chapterSlug);
    }

    const insertPayload = {
      kind: input.kind,
      title: input.title.trim(),
      caption: input.description?.trim() || null,
      alt_text: input.altText?.trim() || null,
      chapter_id: chapterId,
      section_id: input.sectionId ?? null,
      source_reference: input.sourceReference?.trim() || null,
      storage_path: storagePath,
      review_status: input.reviewStatus ?? "draft",
      ...(input.id ? { id: input.id } : {}),
    };

    const { data, error } = await supabase
      .from("media_assets")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error || !data) {
      throw mediaError("Unable to create media asset.");
    }

    if (input.sectionId) {
      await this.syncSectionLink(supabase, input.sectionId, data.id);
    }

    return (await this.getMediaAsset(data.id))!;
  }

  async updateMediaAsset(
    mediaId: string,
    input: UpdateMediaAssetInput,
  ): Promise<AdminMediaAssetDetail> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const payload: Partial<MediaAssetRow> = {};

    if (input.title !== undefined) {
      payload.title = input.title.trim();
    }
    if (input.description !== undefined) {
      payload.caption = input.description?.trim() || null;
    }
    if (input.altText !== undefined) {
      payload.alt_text = input.altText?.trim() || null;
    }
    if (input.sourceReference !== undefined) {
      payload.source_reference = input.sourceReference?.trim() || null;
    }
    if (input.durationSeconds !== undefined) {
      payload.duration_seconds = input.durationSeconds;
    }
    if (input.reviewStatus !== undefined) {
      payload.review_status = input.reviewStatus;
    }

    if (input.chapterSlug !== undefined) {
      payload.chapter_id = input.chapterSlug
        ? await getChapterIdBySlug(supabase, input.chapterSlug)
        : null;
    }

    if (input.sectionId !== undefined) {
      payload.section_id = input.sectionId;
    }

    const { error } = await supabase
      .from("media_assets")
      .update(payload)
      .eq("id", mediaId);

    if (error) {
      throw mediaError("Unable to save media asset.");
    }

    if (input.sectionId) {
      await this.syncSectionLink(supabase, input.sectionId, mediaId);
    }

    const updated = await this.getMediaAsset(mediaId);
    if (!updated) {
      throw mediaError("Media asset not found after update.");
    }

    return updated;
  }

  async deleteMediaAsset(mediaId: string): Promise<void> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const existing = await this.getMediaAsset(mediaId);

    if (!existing) {
      throw mediaError("Media asset not found.");
    }

    if (existing.isReferenced) {
      throw mediaError(
        "This asset is linked to chapter content. Unlink it before deleting.",
      );
    }

    await deleteMediaFile(existing.storagePath);

    const { error } = await supabase.from("media_assets").delete().eq("id", mediaId);

    if (error) {
      throw mediaError("Unable to delete media asset.");
    }
  }

  async assignMediaToSection(
    mediaId: string,
    chapterSlug: string,
    sectionId: string,
  ): Promise<AdminMediaAssetDetail> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapterId = await getChapterIdBySlug(supabase, chapterSlug);

    const { data: section, error: sectionError } = await supabase
      .from("chapter_sections")
      .select("id, kind")
      .eq("id", sectionId)
      .eq("chapter_id", chapterId)
      .maybeSingle();

    if (sectionError || !section) {
      throw mediaError("Section not found for this chapter.");
    }

    const { data: asset, error: assetError } = await supabase
      .from("media_assets")
      .select("kind")
      .eq("id", mediaId)
      .maybeSingle();

    if (assetError || !asset) {
      throw mediaError("Media asset not found.");
    }

    const validKinds: Record<string, MediaAsset["kind"]> = {
      illustration: "illustration",
      audio: "audio",
      animation: "animation",
    };

    if (validKinds[section.kind] !== asset.kind) {
      throw mediaError("Media type does not match section type.");
    }

    const { error: assetUpdateError } = await supabase
      .from("media_assets")
      .update({
        chapter_id: chapterId,
        section_id: sectionId,
      })
      .eq("id", mediaId);

    if (assetUpdateError) {
      throw mediaError("Unable to assign media to section.");
    }

    await this.syncSectionLink(supabase, sectionId, mediaId);

    const updated = await this.getMediaAsset(mediaId);
    if (!updated) {
      throw mediaError("Media asset not found after assignment.");
    }

    return updated;
  }

  async unlinkMediaFromSection(mediaId: string): Promise<AdminMediaAssetDetail> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const existing = await this.getMediaAsset(mediaId);

    if (!existing?.sectionId) {
      return existing ?? (() => { throw mediaError("Media asset not found."); })();
    }

    await supabase
      .from("chapter_sections")
      .update({ media_asset_id: null })
      .eq("id", existing.sectionId);

    const { error } = await supabase
      .from("media_assets")
      .update({ section_id: null })
      .eq("id", mediaId);

    if (error) {
      throw mediaError("Unable to unlink media from section.");
    }

    const updated = await this.getMediaAsset(mediaId);
    if (!updated) {
      throw mediaError("Media asset not found after unlink.");
    }

    return updated;
  }

  async listMediaForChapter(chapterSlug: string): Promise<MediaAsset[]> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapterId = await getChapterIdBySlug(supabase, chapterSlug);

    const { data, error } = await supabase
      .from("media_assets")
      .select("*")
      .eq("chapter_id", chapterId);

    if (error) {
      throw mediaError("Unable to load chapter media.");
    }

    return ((data ?? []) as MediaAssetRow[]).map(mapMediaAsset);
  }

  private async syncSectionLink(
    supabase: TypedSupabaseClient,
    sectionId: string,
    mediaAssetId: string,
  ) {
    const { error } = await supabase
      .from("chapter_sections")
      .update({ media_asset_id: mediaAssetId })
      .eq("id", sectionId);

    if (error) {
      throw mediaError("Unable to link media to section.");
    }
  }
}
