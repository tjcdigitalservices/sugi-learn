"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  DEFAULT_CHARACTER_REPRESENTATION_NOTICE,
} from "@/lib/content/character-representation";
import type { CharacterRepresentationNoticeCopy } from "@/types/site-notice";

const CharacterRepresentationContext =
  createContext<CharacterRepresentationNoticeCopy>(
    DEFAULT_CHARACTER_REPRESENTATION_NOTICE,
  );

export function CharacterRepresentationProvider({
  value,
  children,
}: {
  value: CharacterRepresentationNoticeCopy;
  children: ReactNode;
}) {
  return (
    <CharacterRepresentationContext.Provider value={value}>
      {children}
    </CharacterRepresentationContext.Provider>
  );
}

export function useCharacterRepresentationNotice(): CharacterRepresentationNoticeCopy {
  return useContext(CharacterRepresentationContext);
}
