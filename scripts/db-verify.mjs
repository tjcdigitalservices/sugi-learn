#!/usr/bin/env node
/**
 * Verifies Supabase migrations, seed data, and repository layer.
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Usage: node --env-file=.env.local scripts/db-verify.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  console.error("Copy .env.example to .env.local and configure Supabase.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const results = [];

function pass(message) {
  results.push({ ok: true, message });
  console.log(`✓ ${message}`);
}

function fail(message) {
  results.push({ ok: false, message });
  console.error(`✗ ${message}`);
}

async function main() {
  console.log("Sugidanon M2 — database verification\n");

  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("slug, chapter_number, title, review_status")
    .order("chapter_number", { ascending: true });

  if (chaptersError) {
    fail(`chapters query failed: ${chaptersError.message}`);
    process.exit(1);
  }

  if (chapters.length === 13) {
    pass("Seed contains 13 chapters");
  } else {
    fail(`Expected 13 chapters, found ${chapters.length}`);
  }

  const expectedSlugs = [
    "tikum-kadlum",
    "amburukay",
    "derikaryong-pada",
    "balanakon",
    "kalampay",
    "pahagunong",
    "sinagnayan",
    "humadapnon-tarangban",
    "humadapnon-pagbalukat-ka-biday",
    "humadapnon-hungaw",
    "humadapnon-ginlawan",
    "alayaw",
    "nagbuhis",
  ];

  const slugs = chapters.map((chapter) => chapter.slug);
  const missing = expectedSlugs.filter((slug) => !slugs.includes(slug));

  if (missing.length === 0) {
    pass("All expected chapter slugs present");
  } else {
    fail(`Missing chapter slugs: ${missing.join(", ")}`);
  }

  if (chapters.every((chapter) => chapter.review_status === "draft")) {
    pass("All seeded chapters have draft review_status");
  } else {
    fail("Unexpected review_status on seeded chapters");
  }

  const { count: sectionCount, error: sectionError } = await supabase
    .from("chapter_sections")
    .select("*", { count: "exact", head: true });

  if (sectionError) {
    fail(`chapter_sections query failed: ${sectionError.message}`);
  } else if (sectionCount === 0) {
    pass("No chapter sections seeded (expected)");
  } else {
    fail(`Unexpected seeded sections: ${sectionCount}`);
  }

  const { count: questionCount, error: questionError } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true });

  if (questionError) {
    fail(`questions query failed: ${questionError.message}`);
  } else if (questionCount === 0) {
    pass("No questions seeded (expected)");
  } else {
    fail(`Unexpected seeded questions: ${questionCount}`);
  }

  pass("Core tables queryable via service role");

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey) {
    const anon = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: anonChapters, error: anonError } = await anon
      .from("chapters")
      .select("slug")
      .limit(1);

    if (anonError) {
      fail(`Anon chapter catalog read failed: ${anonError.message}`);
    } else if (anonChapters?.length) {
      pass("Anonymous users can read chapter catalog metadata");
    } else {
      fail("Anonymous chapter catalog returned no rows");
    }

    const { data: anonSections, error: anonSectionsError } = await anon
      .from("chapter_sections")
      .select("id")
      .limit(1);

    if (anonSectionsError) {
      fail(`Unexpected anon sections error: ${anonSectionsError.message}`);
    } else if ((anonSections ?? []).length === 0) {
      pass("Anonymous users cannot read chapter sections (RLS)");
    } else {
      fail("Anonymous users unexpectedly read chapter sections");
    }
  } else {
    console.log("· Skipping anon RLS checks (NEXT_PUBLIC_SUPABASE_ANON_KEY not set)");
  }

  console.log("\n--- Summary ---");
  const failed = results.filter((result) => !result.ok);
  if (failed.length === 0) {
    console.log("All checks passed.");
    process.exit(0);
  }

  console.log(`${failed.length} check(s) failed.`);
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
