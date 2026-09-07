import {
  CHARACTER_REPRESENTATION_NOTICE_KEY,
  DEFAULT_CHARACTER_REPRESENTATION_NOTICE,
} from "@/lib/content/character-representation";
import type { SiteNoticeRepository } from "@/lib/data/types";
import type {
  CharacterRepresentationNoticeCopy,
  UpdateCharacterRepresentationNoticeInput,
} from "@/types/site-notice";

export class MockSiteNoticeRepository implements SiteNoticeRepository {
  private notice: CharacterRepresentationNoticeCopy = {
    ...DEFAULT_CHARACTER_REPRESENTATION_NOTICE,
  };

  async getCharacterRepresentationNotice(): Promise<CharacterRepresentationNoticeCopy> {
    return { ...this.notice };
  }

  async updateCharacterRepresentationNotice(
    input: UpdateCharacterRepresentationNoticeInput,
  ): Promise<CharacterRepresentationNoticeCopy> {
    this.notice = {
      title: input.title.trim(),
      body: input.body.trim(),
      shortText: input.shortText.trim(),
    };
    return { ...this.notice };
  }
}

/** Exported for tests / clarity — same key as production. */
export { CHARACTER_REPRESENTATION_NOTICE_KEY };
