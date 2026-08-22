#!/usr/bin/env node
/**
 * Generates supabase/seed-official-*-assessment.sql from
 * lib/assessment/official-question-bank.json
 *
 * Usage: node scripts/generate-official-assessment-seeds.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bank = JSON.parse(
  readFileSync(join(root, "lib/assessment/official-question-bank.json"), "utf8"),
);

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function optionId(prefix, questionIndex, optionIndex) {
  const n = questionIndex * 4 + optionIndex + 1;
  return `${prefix}${String(n).padStart(12, "0")}`;
}

function generateSeed(kind) {
  const assessment = bank[kind];
  const optionPrefix = kind === "pre" ? "b2000000-0000-4000-8000-" : "c2000000-0000-4000-8000-";
  const lines = [];

  lines.push(`-- Official Sugidanon ${assessment.title} content (client PDF question bank).`);
  lines.push(`-- Source of truth for initial content: lib/assessment/official-question-bank.json`);
  lines.push(`-- Regenerate: node scripts/generate-official-assessment-seeds.mjs`);
  lines.push(`-- Safe for staging/production. Admins may edit further in /admin/assessments.`);
  lines.push(`--`);
  lines.push(`--   psql $DATABASE_URL -f supabase/seed-official-${kind}-assessment.sql`);
  lines.push("");
  lines.push("BEGIN;");
  lines.push("");
  lines.push("INSERT INTO public.assessments (id, type, title, instructions, review_status)");
  lines.push("VALUES (");
  lines.push(`  ${sqlString(assessment.id)},`);
  lines.push(`  ${sqlString(assessment.type)},`);
  lines.push(`  ${sqlString(assessment.title)},`);
  lines.push(`  ${sqlString(assessment.instructions)},`);
  lines.push("  'approved'");
  lines.push(")");
  lines.push("ON CONFLICT (type) DO UPDATE");
  lines.push("SET");
  lines.push("  title = EXCLUDED.title,");
  lines.push("  instructions = EXCLUDED.instructions,");
  lines.push("  review_status = EXCLUDED.review_status,");
  lines.push("  updated_at = now();");
  lines.push("");
  lines.push("-- Remove development placeholder questions for this assessment type only.");
  lines.push("DELETE FROM public.questions q");
  lines.push("USING public.assessments a");
  lines.push("WHERE q.assessment_id = a.id");
  lines.push(`  AND a.type = ${sqlString(assessment.type)}`);
  lines.push("  AND q.prompt LIKE '[DEVELOPMENT TEST]%';");
  lines.push("");
  lines.push("-- Clear prior rows for these official question ids (re-seed safe).");
  const questionIds = assessment.questions.map((q) => sqlString(q.id)).join(",\n  ");
  lines.push("DELETE FROM public.questions");
  lines.push("WHERE id IN (");
  lines.push(`  ${questionIds}`);
  lines.push(");");
  lines.push("");
  lines.push("-- Free sort slots 1–15 if other CMS questions occupy them.");
  lines.push("UPDATE public.questions q");
  lines.push("SET sort_order = q.sort_order + 1000,");
  lines.push("    updated_at = now()");
  lines.push("FROM public.assessments a");
  lines.push("WHERE q.assessment_id = a.id");
  lines.push(`  AND a.type = ${sqlString(assessment.type)}`);
  lines.push(`  AND q.sort_order BETWEEN 1 AND ${assessment.questions.length};`);
  lines.push("");

  // Questions — bind to whatever assessment id currently owns this type
  lines.push("INSERT INTO public.questions (");
  lines.push("  id,");
  lines.push("  assessment_id,");
  lines.push("  prompt,");
  lines.push("  prompt_hiligaynon,");
  lines.push("  sort_order,");
  lines.push("  review_status");
  lines.push(")");
  lines.push("SELECT");
  lines.push("  v.id,");
  lines.push("  a.id,");
  lines.push("  v.prompt,");
  lines.push("  v.prompt_hiligaynon,");
  lines.push("  v.sort_order,");
  lines.push("  'approved'");
  lines.push("FROM (");
  lines.push("  VALUES");

  const questionValues = assessment.questions.map((q, index) => {
    const hil = q.promptHiligaynon?.trim() ? sqlString(q.promptHiligaynon.trim()) : "NULL";
    return `    (${sqlString(q.id)}::uuid, ${sqlString(q.prompt)}, ${hil}, ${index + 1})`;
  });
  lines.push(questionValues.join(",\n"));
  lines.push(") AS v(id, prompt, prompt_hiligaynon, sort_order)");
  lines.push("CROSS JOIN public.assessments a");
  lines.push(`WHERE a.type = ${sqlString(assessment.type)};`);
  lines.push("");

  lines.push(
    "INSERT INTO public.question_options (id, question_id, label, label_hiligaynon, sort_order, is_correct)",
  );
  lines.push("VALUES");

  const optionRows = [];
  assessment.questions.forEach((q, qIndex) => {
    const hilOptions = q.optionsHiligaynon ?? [];
    q.options.forEach((label, oIndex) => {
      const id = optionId(optionPrefix, qIndex, oIndex);
      const hilLabel = hilOptions[oIndex]?.trim()
        ? sqlString(hilOptions[oIndex].trim())
        : "NULL";
      optionRows.push(
        `  (${sqlString(id)}, ${sqlString(q.id)}, ${sqlString(label)}, ${hilLabel}, ${oIndex + 1}, ${
          oIndex === q.correctIndex ? "true" : "false"
        })`,
      );
    });
  });
  lines.push(optionRows.join(",\n"));
  lines.push(";");
  lines.push("");
  lines.push("COMMIT;");
  lines.push("");

  return lines.join("\n");
}

for (const kind of ["pre", "post"]) {
  const out = join(root, `supabase/seed-official-${kind}-assessment.sql`);
  writeFileSync(out, generateSeed(kind));
  console.log(`Wrote ${out}`);
}
