#!/usr/bin/env node
/**
 * Clears developer/test learner data from Supabase.
 * Keeps: admin profiles, chapters, sections, media, assessments/questions.
 * Removes: learner chapter progress, assessment attempts/answers, learner profiles + Auth users.
 *
 * Usage:
 *   node --env-file=.env.local scripts/clear-learner-data.mjs --confirm
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const confirmed = process.argv.includes("--confirm");

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

if (!confirmed) {
  console.error(
    "Dry-run only. Re-run with --confirm to delete learner test data.",
  );
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function countExact(table, filter) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) {
    query = filter(query);
  }
  const { count, error } = await query;
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
  return count ?? 0;
}

async function main() {
  console.log("Suguidanon — clear learner test data\n");

  const { data: learners, error: learnersError } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("role", "learner");

  if (learnersError) {
    throw new Error(`profiles: ${learnersError.message}`);
  }

  const learnerIds = (learners ?? []).map((row) => row.id);
  const progressCount = await countExact("learner_chapter_progress");
  const attemptsCount = await countExact("assessment_attempts");
  const answersCount = await countExact("assessment_answers");
  const adminCount = await countExact("profiles", (q) =>
    q.eq("role", "admin"),
  );

  console.log(`Learners (profiles):     ${learnerIds.length}`);
  console.log(`Chapter progress rows:   ${progressCount}`);
  console.log(`Assessment attempts:     ${attemptsCount}`);
  console.log(`Assessment answers:      ${answersCount}`);
  console.log(`Admins preserved:        ${adminCount}`);

  if (learnerIds.length) {
    console.log("\nLearner display names:");
    for (const learner of learners ?? []) {
      console.log(`  - ${learner.display_name ?? "(unnamed / guest)"}`);
    }
  }

  if (!confirmed) {
    console.log("\nNo changes made.");
    process.exit(0);
  }

  console.log("\nDeleting…");

  // Attempts first (answers cascade). Progress next. Then Auth users (profiles cascade).
  const { error: attemptsError } = await supabase
    .from("assessment_attempts")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (attemptsError) {
    throw new Error(`assessment_attempts: ${attemptsError.message}`);
  }
  console.log("✓ assessment_attempts (+ answers)");

  const { error: progressError } = await supabase
    .from("learner_chapter_progress")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (progressError) {
    throw new Error(`learner_chapter_progress: ${progressError.message}`);
  }
  console.log("✓ learner_chapter_progress");

  let deletedUsers = 0;
  let failedUsers = 0;
  for (const id of learnerIds) {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      failedUsers += 1;
      console.error(`✗ auth user ${id}: ${error.message}`);
      // Fall back to profile delete if Auth user is already gone.
      await supabase.from("profiles").delete().eq("id", id);
      continue;
    }
    deletedUsers += 1;
  }
  console.log(`✓ learner Auth users deleted: ${deletedUsers}`);
  if (failedUsers) {
    console.log(`! Auth delete failures (profile cleanup attempted): ${failedUsers}`);
  }

  const remainingLearners = await countExact("profiles", (q) =>
    q.eq("role", "learner"),
  );
  const remainingProgress = await countExact("learner_chapter_progress");
  const remainingAttempts = await countExact("assessment_attempts");

  console.log("\nAfter cleanup:");
  console.log(`  Learners:  ${remainingLearners}`);
  console.log(`  Progress:  ${remainingProgress}`);
  console.log(`  Attempts:  ${remainingAttempts}`);
  console.log("\nDone. Sign out any open learner browser sessions and start fresh.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
