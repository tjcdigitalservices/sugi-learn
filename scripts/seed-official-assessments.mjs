#!/usr/bin/env node
/**
 * Applies official pre/post assessment question bank via Supabase service role.
 * Source: lib/assessment/official-question-bank.json
 *
 * Usage: node --env-file=.env.local scripts/seed-official-assessments.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bank = JSON.parse(
  readFileSync(join(root, "lib/assessment/official-question-bank.json"), "utf8"),
);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function optionId(kind, questionIndex, optionIndex) {
  const prefix = kind === "pre" ? "b2000000-0000-4000-8000-" : "c2000000-0000-4000-8000-";
  const n = questionIndex * 4 + optionIndex + 1;
  return `${prefix}${String(n).padStart(12, "0")}`;
}

async function ensureAssessment(kind) {
  const assessment = bank[kind];
  const { data: existing, error: findError } = await supabase
    .from("assessments")
    .select("id, type")
    .eq("type", kind)
    .maybeSingle();

  if (findError) {
    throw new Error(`Failed to load ${kind} assessment: ${findError.message}`);
  }

  if (existing) {
    const { error } = await supabase
      .from("assessments")
      .update({
        title: assessment.title,
        instructions: assessment.instructions,
        review_status: "approved",
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(`Failed to update ${kind} assessment: ${error.message}`);
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      id: assessment.id,
      type: assessment.type,
      title: assessment.title,
      instructions: assessment.instructions,
      review_status: "approved",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create ${kind} assessment: ${error.message}`);
  }

  return data.id;
}

async function seedKind(kind) {
  const assessment = bank[kind];
  const assessmentId = await ensureAssessment(kind);
  console.log(`✓ ${kind} assessment id=${assessmentId}`);

  const { data: existingQuestions, error: listError } = await supabase
    .from("questions")
    .select("id, prompt, sort_order")
    .eq("assessment_id", assessmentId);

  if (listError) {
    throw new Error(`Failed to list ${kind} questions: ${listError.message}`);
  }

  const officialIds = new Set(assessment.questions.map((q) => q.id));
  const toDelete = (existingQuestions ?? []).filter(
    (q) =>
      q.prompt.startsWith("[DEVELOPMENT TEST]") || officialIds.has(q.id),
  );

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("questions")
      .delete()
      .in(
        "id",
        toDelete.map((q) => q.id),
      );
    if (error) {
      throw new Error(`Failed to clear old ${kind} questions: ${error.message}`);
    }
    console.log(`  cleared ${toDelete.length} placeholder/prior official questions`);
  }

  // Free sort slots 1..N if occupied
  const remaining = (existingQuestions ?? []).filter(
    (q) => !toDelete.some((d) => d.id === q.id),
  );
  for (const q of remaining) {
    if (q.sort_order >= 1 && q.sort_order <= assessment.questions.length) {
      const { error } = await supabase
        .from("questions")
        .update({ sort_order: q.sort_order + 1000 })
        .eq("id", q.id);
      if (error) {
        throw new Error(`Failed to bump sort_order for ${q.id}: ${error.message}`);
      }
    }
  }

  const questionRows = assessment.questions.map((q, index) => ({
    id: q.id,
    assessment_id: assessmentId,
    prompt: q.prompt,
    prompt_hiligaynon: q.promptHiligaynon?.trim() || null,
    sort_order: index + 1,
    review_status: "approved",
    chapter_id: null,
  }));

  const { error: qError } = await supabase.from("questions").insert(questionRows);
  if (qError) {
    throw new Error(`Failed to insert ${kind} questions: ${qError.message}`);
  }

  const optionRows = [];
  assessment.questions.forEach((q, qIndex) => {
    const hilOptions = q.optionsHiligaynon ?? [];
    q.options.forEach((label, oIndex) => {
      optionRows.push({
        id: optionId(kind, qIndex, oIndex),
        question_id: q.id,
        label,
        label_hiligaynon: hilOptions[oIndex]?.trim() || null,
        sort_order: oIndex + 1,
        is_correct: oIndex === q.correctIndex,
      });
    });
  });

  const { error: oError } = await supabase.from("question_options").insert(optionRows);
  if (oError) {
    throw new Error(`Failed to insert ${kind} options: ${oError.message}`);
  }

  console.log(
    `✓ seeded ${assessment.questions.length} ${kind} questions (${optionRows.length} options)`,
  );
}

async function main() {
  console.log("Seeding official Sugidanon assessments…\n");
  await seedKind("pre");
  await seedKind("post");
  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
