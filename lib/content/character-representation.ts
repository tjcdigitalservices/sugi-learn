import type { CharacterRepresentationNoticeCopy } from "@/types/site-notice";

/** Stable key for the character artwork representation notice. */
export const CHARACTER_REPRESENTATION_NOTICE_KEY =
  "character_representation" as const;

/** Approved default copy — used when DB row is missing or mock mode. */
export const DEFAULT_CHARACTER_REPRESENTATION_NOTICE: CharacterRepresentationNoticeCopy =
  {
    title: "Character Representation Notice",
    body: "Characters shown throughout Suguidanon are artistic representations created to support the educational presentation of the Suguidanon narratives. Their appearance, clothing, features, expressions, and other visual details may include artistic interpretation based on the stories and available cultural references. These representations should not be understood as definitive or historically accurate depictions of the characters.",
    shortText:
      "Character representations are artistic interpretations for educational purposes.",
  };

/** @deprecated Prefer DEFAULT_CHARACTER_REPRESENTATION_NOTICE.title */
export const CHARACTER_REPRESENTATION_TITLE =
  DEFAULT_CHARACTER_REPRESENTATION_NOTICE.title;

/** @deprecated Prefer DEFAULT_CHARACTER_REPRESENTATION_NOTICE.body */
export const CHARACTER_REPRESENTATION_BODY =
  DEFAULT_CHARACTER_REPRESENTATION_NOTICE.body;

/** @deprecated Prefer DEFAULT_CHARACTER_REPRESENTATION_NOTICE.shortText */
export const CHARACTER_REPRESENTATION_SHORT =
  DEFAULT_CHARACTER_REPRESENTATION_NOTICE.shortText;
