"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import {
  buttonDangerClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  FormFeedback,
  FormField,
  formControlClassName,
} from "@/components/admin/chapter-management/form-primitives";
import {
  associateCharacterAction,
  removeCharacterAssociationAction,
  reorderChapterCharactersAction,
} from "@/lib/chapter-management/actions";
import type { Character } from "@/types/chapter";

interface ChapterCharactersPanelProps {
  chapterId: string;
  chapterCharacters: Character[];
  allCharacters: Character[];
  onChanged: () => void;
}

export function ChapterCharactersPanel({
  chapterId,
  chapterCharacters,
  allCharacters,
  onChanged,
}: ChapterCharactersPanelProps) {
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableCharacters = allCharacters.filter(
    (character) =>
      !chapterCharacters.some((associated) => associated.id === character.id),
  );

  function handleAssociate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selectedCharacterId) {
      setError("Select a character to associate.");
      return;
    }

    startTransition(async () => {
      const result = await associateCharacterAction(
        chapterId,
        selectedCharacterId,
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSelectedCharacterId("");
      onChanged();
    });
  }

  function handleRemove(characterId: string) {
    startTransition(async () => {
      const result = await removeCharacterAssociationAction(
        chapterId,
        characterId,
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      onChanged();
    });
  }

  function handleMove(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapterCharacters.length) {
      return;
    }

    const nextOrder = chapterCharacters.map((character) => character.id);
    [nextOrder[index], nextOrder[targetIndex]] = [
      nextOrder[targetIndex],
      nextOrder[index],
    ];

    startTransition(async () => {
      const result = await reorderChapterCharactersAction(chapterId, nextOrder);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onChanged();
    });
  }

  if (allCharacters.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Characters</h2>
          <p className="text-sm text-muted-foreground">
            Associate existing character records with this chapter.
          </p>
        </div>
        <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No characters have been added yet.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Characters</h2>
        <p className="text-sm text-muted-foreground">
          Associate existing character records with this chapter. Character
          creation is not part of M5.
        </p>
      </div>

      {availableCharacters.length > 0 ? (
        <form onSubmit={handleAssociate} className="flex flex-col gap-3 sm:flex-row">
          <FormField
            label="Associate character"
            htmlFor="associate-character"
            className="flex-1"
          >
            <select
              id="associate-character"
              value={selectedCharacterId}
              onChange={(event) => setSelectedCharacterId(event.target.value)}
              className={formControlClassName}
            >
              <option value="">Select a character</option>
              {availableCharacters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name}
                </option>
              ))}
            </select>
          </FormField>
          <div className="flex items-end">
            <button
              type="submit"
              className={buttonPrimaryClassName}
              disabled={isPending}
            >
              Associate
            </button>
          </div>
        </form>
      ) : null}

      <FormFeedback error={error} />

      {chapterCharacters.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          No characters associated with this chapter yet.
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {chapterCharacters.map((character, index) => (
            <li
              key={character.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{character.name}</p>
                {character.description ? (
                  <p className="text-sm text-muted-foreground">
                    {character.description}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-label="Move character up"
                  className={buttonSecondaryClassName}
                  onClick={() => handleMove(index, "up")}
                  disabled={isPending || index === 0}
                >
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Move character down"
                  className={buttonSecondaryClassName}
                  onClick={() => handleMove(index, "down")}
                  disabled={
                    isPending || index === chapterCharacters.length - 1
                  }
                >
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={buttonDangerClassName}
                  onClick={() => handleRemove(character.id)}
                  disabled={isPending}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
