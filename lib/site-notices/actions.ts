"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import {
  updateCharacterRepresentationNotice,
  updateFedericoCaballeroAbout,
} from "@/lib/domain/site-notices";
import { hasSupabaseConfig } from "@/lib/supabase/service";
import type {
  SiteNoticeActionResult,
  UpdateCharacterRepresentationNoticeInput,
} from "@/types/site-notice";

function validateNoticeInput(
  input: UpdateCharacterRepresentationNoticeInput,
  options?: { maxBodyLength?: number },
): string | null {
  const title = input.title.trim();
  const body = input.body.trim();
  const shortText = input.shortText.trim();
  const maxBodyLength = options?.maxBodyLength ?? 2000;

  if (!title) {
    return "Title is required.";
  }
  if (title.length > 120) {
    return "Title must be 120 characters or fewer.";
  }
  if (!body) {
    return "Notice body is required.";
  }
  if (body.length > maxBodyLength) {
    return `Notice body must be ${maxBodyLength} characters or fewer.`;
  }
  if (!shortText) {
    return "Short text is required.";
  }
  if (shortText.length > 240) {
    return "Short text must be 240 characters or fewer.";
  }

  return null;
}

function safeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    const message = error.message;
    if (
      message.includes("Unable to") ||
      message.includes("Failed to") ||
      message.includes("not found")
    ) {
      return message;
    }
  }
  return "Unable to save the notice. Please try again.";
}

export async function saveCharacterRepresentationNoticeAction(
  input: UpdateCharacterRepresentationNoticeInput,
): Promise<SiteNoticeActionResult> {
  try {
    if (hasSupabaseConfig()) {
      await requireAdmin();
    }

    const validationError = validateNoticeInput(input);
    if (validationError) {
      return { ok: false, error: validationError };
    }

    const notice = await updateCharacterRepresentationNotice({
      title: input.title.trim(),
      body: input.body.trim(),
      shortText: input.shortText.trim(),
    });

    revalidatePath("/admin/settings");
    revalidatePath("/learn/chapters");
    revalidatePath("/learn/chapters", "layout");

    return { ok: true, notice };
  } catch (error) {
    console.error("Save character representation notice failed:", error);
    return { ok: false, error: safeError(error) };
  }
}

export async function saveFedericoCaballeroAboutAction(
  input: UpdateCharacterRepresentationNoticeInput,
): Promise<SiteNoticeActionResult> {
  try {
    if (hasSupabaseConfig()) {
      await requireAdmin();
    }

    const validationError = validateNoticeInput(input, {
      maxBodyLength: 10000,
    });
    if (validationError) {
      return { ok: false, error: validationError };
    }

    const notice = await updateFedericoCaballeroAbout({
      title: input.title.trim(),
      body: input.body.trim(),
      shortText: input.shortText.trim(),
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/author");
    revalidatePath("/about");

    return { ok: true, notice };
  } catch (error) {
    console.error("Save Federico Caballero about failed:", error);
    return { ok: false, error: safeError(error) };
  }
}
