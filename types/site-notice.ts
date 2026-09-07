/** Editable platform notice copy (e.g. character representation disclaimer). */

export interface CharacterRepresentationNoticeCopy {
  title: string;
  body: string;
  shortText: string;
}

export interface UpdateCharacterRepresentationNoticeInput {
  title: string;
  body: string;
  shortText: string;
}

export type SiteNoticeActionResult =
  | { ok: true; notice: CharacterRepresentationNoticeCopy }
  | { ok: false; error: string };
