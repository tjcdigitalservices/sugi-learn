import type { CharactersSection, Character } from "@/types/chapter";

import { SectionEmptyState } from "@/components/chapter/sections/section-empty-state";

interface CharactersSectionViewProps {
  section: CharactersSection;
  characters: Character[];
}

export function CharactersSectionView({
  section,
  characters,
}: CharactersSectionViewProps) {
  const sectionCharacters = section.characterIds
    .map((id) => characters.find((character) => character.id === id))
    .filter((character): character is Character => Boolean(character));

  return (
    <article className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {section.title}
      </h2>

      {sectionCharacters.length === 0 ? (
        <SectionEmptyState message="Character information not available yet." />
      ) : (
        <ul className="space-y-3">
          {sectionCharacters.map((character) => (
            <li
              key={character.id}
              className="rounded-lg border bg-card px-4 py-3"
            >
              <h3 className="font-medium">{character.name}</h3>
              {character.description ? (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {character.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
