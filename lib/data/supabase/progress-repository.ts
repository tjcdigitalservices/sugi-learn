import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapChapterProgressRow,
} from "@/lib/data/supabase/mappers/progress";
import type { ProgressRepository } from "@/lib/data/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TypedSupabaseClient } from "@/lib/supabase/service";
import type {
  ChapterProgressRecord,
  LearnerProgress,
} from "@/types/progress";

type ClientFactory = () => Promise<SupabaseClient>;

function progressError(message: string): Error {
  return new Error(message);
}

export class SupabaseProgressRepository implements ProgressRepository {
  constructor(
    private readonly clientFactory: ClientFactory = getSupabaseServerClient,
  ) {}

  private async resolveChapterUuid(
    supabase: TypedSupabaseClient,
    chapterSlug: string,
  ): Promise<string> {
    const { data, error } = await supabase
      .from("chapters")
      .select("id")
      .eq("slug", chapterSlug)
      .maybeSingle();

    if (error) {
      throw progressError("Unable to load chapter.");
    }
    if (!data) {
      throw progressError("Chapter not found.");
    }

    return data.id;
  }

  private async loadProgressRows(
    supabase: TypedSupabaseClient,
    learnerId: string,
  ) {
    const { data, error } = await supabase
      .from("learner_chapter_progress")
      .select("chapter_id, started_at, completed_at, updated_at")
      .eq("profile_id", learnerId);

    if (error) {
      throw progressError("Unable to load learner progress.");
    }

    return data ?? [];
  }

  private async mapRowsToRecords(
    supabase: TypedSupabaseClient,
    rows: {
      chapter_id: string;
      started_at: string;
      completed_at: string | null;
      updated_at: string;
    }[],
  ): Promise<ChapterProgressRecord[]> {
    if (rows.length === 0) {
      return [];
    }

    const chapterIds = rows.map((row) => row.chapter_id);
    const { data: chapters, error } = await supabase
      .from("chapters")
      .select("id, slug")
      .in("id", chapterIds);

    if (error) {
      throw progressError("Unable to load chapter metadata for progress.");
    }

    const slugById = new Map(
      (chapters ?? []).map((chapter) => [chapter.id, chapter.slug]),
    );

    return rows
      .map((row) => {
        const slug = slugById.get(row.chapter_id);
        if (!slug) {
          return null;
        }
        return mapChapterProgressRow(slug, row);
      })
      .filter((record): record is ChapterProgressRecord => Boolean(record));
  }

  async listChapterProgress(learnerId: string): Promise<ChapterProgressRecord[]> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const rows = await this.loadProgressRows(supabase, learnerId);
    return this.mapRowsToRecords(supabase, rows);
  }

  async getChapterProgress(
    learnerId: string,
    chapterSlug: string,
  ): Promise<ChapterProgressRecord | null> {
    const records = await this.listChapterProgress(learnerId);
    return records.find((record) => record.chapterId === chapterSlug) ?? null;
  }

  async startChapter(
    learnerId: string,
    chapterSlug: string,
  ): Promise<ChapterProgressRecord> {
    const existing = await this.getChapterProgress(learnerId, chapterSlug);
    if (existing) {
      return existing;
    }

    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    // Ensure the Auth JWT is loaded on this client before RLS-checked writes.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw progressError("Unable to start chapter progress. Please sign in again.");
    }

    // RLS requires profile_id = auth.uid(); never trust a mismatched caller id.
    const profileId = user.id;
    if (profileId !== learnerId) {
      throw progressError("Unable to start chapter progress. Session mismatch.");
    }

    const chapterUuid = await this.resolveChapterUuid(supabase, chapterSlug);

    const { error: upsertError } = await supabase
      .from("learner_chapter_progress")
      .upsert(
        {
          profile_id: profileId,
          chapter_id: chapterUuid,
        },
        { onConflict: "profile_id,chapter_id", ignoreDuplicates: true },
      );

    if (upsertError) {
      throw progressError(
        `Unable to start chapter progress. (${upsertError.code ?? "unknown"}: ${upsertError.message})`,
      );
    }

    const { data, error } = await supabase
      .from("learner_chapter_progress")
      .select("started_at, completed_at, updated_at")
      .eq("profile_id", profileId)
      .eq("chapter_id", chapterUuid)
      .maybeSingle();

    if (error || !data) {
      throw progressError(
        `Unable to start chapter progress. (${error?.code ?? "missing"}: ${error?.message ?? "row not found after save"})`,
      );
    }

    return mapChapterProgressRow(chapterSlug, data);
  }

  async completeChapter(
    learnerId: string,
    chapterSlug: string,
  ): Promise<ChapterProgressRecord> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;
    const chapterUuid = await this.resolveChapterUuid(supabase, chapterSlug);

    const existing = await this.getChapterProgress(learnerId, chapterSlug);
    if (!existing) {
      await this.startChapter(learnerId, chapterSlug);
    }

    const completedAt = new Date().toISOString();
    const { data, error } = await supabase
      .from("learner_chapter_progress")
      .update({ completed_at: completedAt })
      .eq("profile_id", learnerId)
      .eq("chapter_id", chapterUuid)
      .select("started_at, completed_at, updated_at")
      .single();

    if (error || !data) {
      throw progressError("Unable to complete chapter.");
    }

    return mapChapterProgressRow(chapterSlug, data);
  }

  async getLearnerProgress(learnerId: string): Promise<LearnerProgress | null> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const chapterRecords = await this.listChapterProgress(learnerId);

    const { data: attempts, error: attemptsError } = await supabase
      .from("assessment_attempts")
      .select("assessment_id, completed_at")
      .eq("profile_id", learnerId);

    if (attemptsError) {
      throw progressError("Unable to load assessment attempts.");
    }

    if (!chapterRecords.length && !attempts?.length) {
      return null;
    }

    const assessmentIds = attempts?.map((row) => row.assessment_id) ?? [];
    const { data: assessments, error: assessmentsError } = assessmentIds.length
      ? await supabase.from("assessments").select("id, type").in("id", assessmentIds)
      : { data: [], error: null };

    if (assessmentsError) {
      throw progressError("Unable to load assessments.");
    }

    const typeByAssessmentId = new Map(
      (assessments ?? []).map((assessment) => [assessment.id, assessment.type]),
    );

    const completedChapterIds = chapterRecords
      .filter((record) => record.status === "completed")
      .map((record) => record.chapterId);

    const inProgressRecords = chapterRecords
      .filter((record) => record.status === "in_progress")
      .sort((a, b) => {
        const aTime = a.updatedAt ?? a.startedAt ?? "";
        const bTime = b.updatedAt ?? b.startedAt ?? "";
        return bTime.localeCompare(aTime);
      });

    const preCompleted = (attempts ?? []).some(
      (attempt) =>
        typeByAssessmentId.get(attempt.assessment_id) === "pre" &&
        attempt.completed_at !== null,
    );

    const postCompleted = (attempts ?? []).some(
      (attempt) =>
        typeByAssessmentId.get(attempt.assessment_id) === "post" &&
        attempt.completed_at !== null,
    );

    const lastActivity = [
      ...chapterRecords.map((record) => record.updatedAt).filter(Boolean),
      ...(attempts ?? [])
        .map((attempt) => attempt.completed_at)
        .filter((value): value is string => Boolean(value)),
    ]
      .sort()
      .at(-1) ?? null;

    return {
      learnerId,
      completedChapterIds,
      currentChapterId: inProgressRecords[0]?.chapterId ?? null,
      preAssessmentCompleted: preCompleted,
      postAssessmentCompleted: postCompleted,
      lastActivityAt: lastActivity,
    };
  }
}
