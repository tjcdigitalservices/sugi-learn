#!/usr/bin/env node
/**
 * Smoke test aligned with M2 repository queries.
 * Usage: node --env-file=.env.local scripts/repository-test.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing Supabase env vars. Run with --env-file=.env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("Sugidanon M2 — repository smoke test\n");

  const { data: chapters, error } = await supabase
    .from("chapters")
    .select("*")
    .order("chapter_number");

  if (error) throw error;

  console.log(`✓ listChapters: ${chapters.length} rows`);

  const tikum = chapters.find((chapter) => chapter.slug === "tikum-kadlum");
  if (!tikum) throw new Error("tikum-kadlum not found");

  const { data: sections } = await supabase
    .from("chapter_sections")
    .select("*")
    .eq("chapter_id", tikum.id);

  console.log(
    `✓ getChapterById: tikum-kadlum with ${sections?.length ?? 0} sections`,
  );

  const { data: assessments } = await supabase.from("assessments").select("*");
  console.log(`✓ listAssessments: ${assessments?.length ?? 0} rows`);

  console.log("\nRepository smoke test passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
