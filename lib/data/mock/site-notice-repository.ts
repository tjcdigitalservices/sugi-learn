import {
  CHARACTER_REPRESENTATION_NOTICE_KEY,
  DEFAULT_CHARACTER_REPRESENTATION_NOTICE,
} from "@/lib/content/character-representation";
import {
  DEFAULT_FEDERICO_CABALLERO_ABOUT,
  FEDERICO_CABALLERO_ABOUT_KEY,
} from "@/lib/content/federico-caballero";
import type { SiteNoticeRepository } from "@/lib/data/types";
import type {
  CharacterRepresentationNoticeCopy,
  UpdateCharacterRepresentationNoticeInput,
} from "@/types/site-notice";

export class MockSiteNoticeRepository implements SiteNoticeRepository {
  private notices = new Map<string, CharacterRepresentationNoticeCopy>([
    [
      CHARACTER_REPRESENTATION_NOTICE_KEY,
      { ...DEFAULT_CHARACTER_REPRESENTATION_NOTICE },
    ],
    [FEDERICO_CABALLERO_ABOUT_KEY, { ...DEFAULT_FEDERICO_CABALLERO_ABOUT }],
  ]);

  async getCharacterRepresentationNotice(): Promise<CharacterRepresentationNoticeCopy> {
    return { ...this.notices.get(CHARACTER_REPRESENTATION_NOTICE_KEY)! };
  }

  async updateCharacterRepresentationNotice(
    input: UpdateCharacterRepresentationNoticeInput,
  ): Promise<CharacterRepresentationNoticeCopy> {
    const notice = {
      title: input.title.trim(),
      body: input.body.trim(),
      shortText: input.shortText.trim(),
    };
    this.notices.set(CHARACTER_REPRESENTATION_NOTICE_KEY, notice);
    return { ...notice };
  }

  async getFedericoCaballeroAbout(): Promise<CharacterRepresentationNoticeCopy> {
    return { ...this.notices.get(FEDERICO_CABALLERO_ABOUT_KEY)! };
  }

  async updateFedericoCaballeroAbout(
    input: UpdateCharacterRepresentationNoticeInput,
  ): Promise<CharacterRepresentationNoticeCopy> {
    const notice = {
      title: input.title.trim(),
      body: input.body.trim(),
      shortText: input.shortText.trim(),
    };
    this.notices.set(FEDERICO_CABALLERO_ABOUT_KEY, notice);
    return { ...notice };
  }
}

/** Exported for tests / clarity — same key as production. */
export { CHARACTER_REPRESENTATION_NOTICE_KEY, FEDERICO_CABALLERO_ABOUT_KEY };
