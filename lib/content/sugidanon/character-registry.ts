import type { Character } from "@/types/chapter";
import type { ReviewStatus } from "@/types/review";

import type { ChapterCharacterDefinition } from "@/lib/content/sugidanon/types";

const SLUG_ALIASES: Record<string, string[]> = {
  amburukay: ["amburukay-ch1"],
};

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function getCharacterId(slug: string): string {
  return `sg-char-${slug}`;
}

export function registerChapterCharacters(
  registry: Character[],
  definitions: ChapterCharacterDefinition[],
  reviewStatus: ReviewStatus = "draft",
): string[] {
  const order: string[] = [];

  for (const definition of definitions) {
    const aliases = [definition.slug, ...(SLUG_ALIASES[definition.slug] ?? [])];

    let character = registry.find((item) => {
      if (normalizeName(item.name) === normalizeName(definition.name)) {
        return true;
      }
      if (item.id === getCharacterId(definition.slug)) {
        return true;
      }
      return aliases.some((alias) => item.id.endsWith(alias));
    });

    if (!character) {
      character = {
        id: getCharacterId(definition.slug),
        name: definition.name,
        description: definition.description,
        mediaAssetId: null,
        reviewStatus,
      };
      registry.push(character);
    }

    order.push(character.id);
  }

  return order;
}
