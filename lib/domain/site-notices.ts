import { getRepositories } from "@/lib/data";
import type {
  CharacterRepresentationNoticeCopy,
  UpdateCharacterRepresentationNoticeInput,
} from "@/types/site-notice";

export async function getCharacterRepresentationNotice(): Promise<CharacterRepresentationNoticeCopy> {
  return getRepositories().siteNotices.getCharacterRepresentationNotice();
}

export async function updateCharacterRepresentationNotice(
  input: UpdateCharacterRepresentationNoticeInput,
): Promise<CharacterRepresentationNoticeCopy> {
  return getRepositories().siteNotices.updateCharacterRepresentationNotice(
    input,
  );
}

export async function getFedericoCaballeroAbout(): Promise<CharacterRepresentationNoticeCopy> {
  return getRepositories().siteNotices.getFedericoCaballeroAbout();
}

export async function updateFedericoCaballeroAbout(
  input: UpdateCharacterRepresentationNoticeInput,
): Promise<CharacterRepresentationNoticeCopy> {
  return getRepositories().siteNotices.updateFedericoCaballeroAbout(input);
}
