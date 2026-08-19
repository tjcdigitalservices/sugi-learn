"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { hasSupabaseConfig } from "@/lib/supabase/service";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type OnboardingActionResult =
  | { success: true }
  | { success: false; error: string };

export async function saveLearnerNameAction(input: {
  firstName: string;
  lastName: string;
}): Promise<OnboardingActionResult> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!firstName || !lastName) {
    return { success: false, error: "First name and last name are required." };
  }

  if (firstName.length > 80 || lastName.length > 80) {
    return {
      success: false,
      error: "Each name must be 80 characters or fewer.",
    };
  }

  const displayName = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
  const auth = await requireUser();

  if (hasSupabaseConfig()) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", auth.profile.id);

    if (error) {
      return {
        success: false,
        error: "Unable to save your name. Please try again.",
      };
    }
  }

  revalidatePath("/learn");
  revalidatePath("/learn/onboarding");
  redirect("/learn/assessment/pre");
}
