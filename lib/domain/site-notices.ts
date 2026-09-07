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
