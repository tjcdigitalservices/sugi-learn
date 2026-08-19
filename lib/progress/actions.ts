"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import {
  completeChapterProgress,
  getCurrentLearnerId,
} from "@/lib/domain/learner-progress";
import { hasSupabaseConfig } from "@/lib/supabase/service";
import type { ChapterProgressRecord } from "@/types/progress";

export type ProgressActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function revalidateLearnerProgress(chapterSlug: string) {
  revalidatePath("/learn");
  revalidatePath("/learn/chapters");
  revalidatePath("/learn/progress");
  revalidatePath(`/learn/chapters/${chapterSlug}`);
}

export async function completeChapterAction(
  chapterSlug: string,
): Promise<ProgressActionResult<ChapterProgressRecord>> {
  if (hasSupabaseConfig()) {
    await requireUser();
  }

  try {
    const learnerId = await getCurrentLearnerId();
    const record = await completeChapterProgress(learnerId, chapterSlug);
    revalidateLearnerProgress(chapterSlug);
    return { success: true, data: record };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to save chapter completion. Please try again.";

    return {
      success: false,
      error: message,
    };
  }
}
