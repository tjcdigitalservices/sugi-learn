/**
 * Generates supabase/seed-chapters-2-13.sql from TypeScript content definitions.
 * Run: npx tsx scripts/generate-chapters-2-13-seed.ts
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildChapterContent } from "../lib/content/sugidanon/build-chapter-content";
import { CHAPTERS_2_13 } from "../lib/content/sugidanon/chapters/index";
import type { Character } from "../types/chapter";

function sqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

function generateSeed(): string {
  const characters: Character[] = [];
  const lines: string[] = [
    "-- M13 — Chapters 2–13 content seed (generated from lib/content/sugidanon/)",
    "-- Source: docs/sources/Tikum-Kadlum-Sugidanon-Source.docx",
    "-- Run: psql $DATABASE_URL -f supabase/seed-chapters-2-13.sql",
    "-- Skips chapters that already have sections.",
    "",
    "DO $$",
    "DECLARE",
    "  ch_id UUID;",
    "  section_count INTEGER;",
    "BEGIN",
  ];

  for (const definition of CHAPTERS_2_13) {
    const built = buildChapterContent(definition, characters);

    lines.push(`  -- Chapter ${definition.number}: ${definition.metadata.title}`);
    lines.push(`  SELECT id INTO ch_id FROM public.chapters WHERE slug = '${definition.id}';`);
    lines.push("  IF ch_id IS NOT NULL THEN");
    lines.push(
      "    SELECT COUNT(*) INTO section_count FROM public.chapter_sections WHERE chapter_id = ch_id;",
    );
    lines.push("    IF section_count = 0 THEN");
    lines.push("      UPDATE public.chapters SET");
    lines.push(`        subtitle = '${sqlEscape(definition.metadata.subtitle)}',`);
    lines.push(`        summary = '${sqlEscape(definition.metadata.summary)}',`);
    lines.push("        updated_at = now()");
    lines.push("      WHERE id = ch_id;");

    for (const character of definition.characters) {
      const charId = `e${String(definition.number).padStart(3, "0")}-${character.slug.slice(0, 8)}`;
      lines.push(
        `      INSERT INTO public.characters (id, name, description, review_status) VALUES ('${charId}', '${sqlEscape(character.name)}', '${sqlEscape(character.description)}', 'draft') ON CONFLICT (id) DO NOTHING;`,
      );
      lines.push(
        `      INSERT INTO public.chapter_characters (chapter_id, character_id, sort_order) SELECT ch_id, '${charId}', ${definition.characters.indexOf(character)} WHERE NOT EXISTS (SELECT 1 FROM public.chapter_characters WHERE chapter_id = ch_id AND character_id = '${charId}');`,
      );
    }

    for (const [index, point] of definition.learningPoints.entries()) {
      const lpId = `f${String(definition.number).padStart(3, "0")}-lp-${index + 1}`;
      lines.push(
        `      INSERT INTO public.learning_points (id, chapter_id, title, description, sort_order, review_status) VALUES ('${lpId}', ch_id, '${sqlEscape(point.title)}', '${sqlEscape(point.description)}', ${index}, 'draft') ON CONFLICT (id) DO NOTHING;`,
      );
    }

    for (const section of built.sections) {
      const secId = `${definition.id}-sec-${section.sortOrder}`.replace(/-/g, "_");
      const body =
        "body" in section ? `'${sqlEscape(section.body)}'` : "NULL";
      const completion =
        section.kind === "completion" && "message" in section
          ? `'${sqlEscape(section.message ?? "")}'`
          : "NULL";

      lines.push(
        `      INSERT INTO public.chapter_sections (id, chapter_id, kind, title, sort_order, review_status, body_text, completion_message) VALUES ('${secId}', ch_id, '${section.kind}', '${sqlEscape(section.title)}', ${section.sortOrder}, '${section.reviewStatus}', ${section.kind === "introduction" || section.kind === "story" ? body : "NULL"}, ${section.kind === "completion" ? completion : "NULL"}) ON CONFLICT (id) DO NOTHING;`,
      );

      if (section.kind === "characters") {
        lines.push(
          `      INSERT INTO public.section_characters (section_id, character_id, sort_order) SELECT '${secId}', character_id, sort_order FROM public.chapter_characters WHERE chapter_id = ch_id ON CONFLICT DO NOTHING;`,
        );
      }

      if (section.kind === "learning_points") {
        for (const [index] of definition.learningPoints.entries()) {
          const lpId = `f${String(definition.number).padStart(3, "0")}-lp-${index + 1}`;
          lines.push(
            `      INSERT INTO public.section_learning_points (section_id, learning_point_id, sort_order) VALUES ('${secId}', '${lpId}', ${index}) ON CONFLICT DO NOTHING;`,
          );
        }
      }
    }

    lines.push("    END IF;");
    lines.push("  END IF;");
    lines.push("");
  }

  lines.push("  RAISE NOTICE 'M13 Chapters 2–13 seed applied where sections were empty.';");
  lines.push("END $$;");
  lines.push("");

  return lines.join("\n");
}

const outputPath = resolve(__dirname, "../supabase/seed-chapters-2-13.sql");
writeFileSync(outputPath, generateSeed());
console.log(`Wrote ${outputPath}`);
