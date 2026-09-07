import type { SupabaseClient } from "@supabase/supabase-js";

import {
  CHARACTER_REPRESENTATION_NOTICE_KEY,
  DEFAULT_CHARACTER_REPRESENTATION_NOTICE,
} from "@/lib/content/character-representation";
import type { SiteNoticeRepository } from "@/lib/data/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TypedSupabaseClient } from "@/lib/supabase/service";
import type {
  CharacterRepresentationNoticeCopy,
  UpdateCharacterRepresentationNoticeInput,
} from "@/types/site-notice";

type ClientFactory = () => Promise<SupabaseClient>;

function mapRow(row: {
  title: string;
  body: string;
  short_text: string;
}): CharacterRepresentationNoticeCopy {
  return {
    title: row.title,
    body: row.body,
    shortText: row.short_text,
  };
}

export class SupabaseSiteNoticeRepository implements SiteNoticeRepository {
  constructor(
    private readonly clientFactory: ClientFactory = getSupabaseServerClient,
  ) {}

  async getCharacterRepresentationNotice(): Promise<CharacterRepresentationNoticeCopy> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data, error } = await supabase
      .from("site_notices")
      .select("title, body, short_text")
      .eq("key", CHARACTER_REPRESENTATION_NOTICE_KEY)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to load character representation notice: ${error.message}`,
      );
    }

    if (!data) {
      return { ...DEFAULT_CHARACTER_REPRESENTATION_NOTICE };
    }

    return mapRow(data);
  }

  async updateCharacterRepresentationNotice(
    input: UpdateCharacterRepresentationNoticeInput,
  ): Promise<CharacterRepresentationNoticeCopy> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const title = input.title.trim();
    const body = input.body.trim();
    const shortText = input.shortText.trim();

    const { data, error } = await supabase
      .from("site_notices")
      .upsert(
        {
          key: CHARACTER_REPRESENTATION_NOTICE_KEY,
          title,
          body,
          short_text: shortText,
        },
        { onConflict: "key" },
      )
      .select("title, body, short_text")
      .single();

    if (error || !data) {
      throw new Error(
        `Unable to save character representation notice: ${error?.message ?? "unknown error"}`,
      );
    }

    return mapRow(data);
  }
}
