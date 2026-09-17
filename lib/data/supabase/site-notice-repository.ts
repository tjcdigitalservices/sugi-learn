import type { SupabaseClient } from "@supabase/supabase-js";

import {
  CHARACTER_REPRESENTATION_NOTICE_KEY,
  DEFAULT_CHARACTER_REPRESENTATION_NOTICE,
} from "@/lib/content/character-representation";
import {
  DEFAULT_FEDERICO_CABALLERO_ABOUT,
  FEDERICO_CABALLERO_ABOUT_KEY,
} from "@/lib/content/federico-caballero";
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

function isMissingSiteNoticesTable(error: {
  message?: string;
  code?: string;
}): boolean {
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("site_notices") &&
    (message.includes("schema cache") ||
      message.includes("does not exist") ||
      message.includes("could not find the table"))
  );
}

export class SupabaseSiteNoticeRepository implements SiteNoticeRepository {
  constructor(
    private readonly clientFactory: ClientFactory = getSupabaseServerClient,
  ) {}

  private async getNotice(
    key: string,
    fallback: CharacterRepresentationNoticeCopy,
  ): Promise<CharacterRepresentationNoticeCopy> {
    const supabase = (await this.clientFactory()) as TypedSupabaseClient;

    const { data, error } = await supabase
      .from("site_notices")
      .select("title, body, short_text")
      .eq("key", key)
      .maybeSingle();

    if (error) {
      if (isMissingSiteNoticesTable(error)) {
        return { ...fallback };
      }
      throw new Error(`Failed to load site notice (${key}): ${error.message}`);
    }

    if (!data) {
      return { ...fallback };
    }

    return mapRow(data);
  }

  private async upsertNotice(
    key: string,
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
          key,
          title,
          body,
          short_text: shortText,
        },
        { onConflict: "key" },
      )
      .select("title, body, short_text")
      .single();

    if (error || !data) {
      if (error && isMissingSiteNoticesTable(error)) {
        throw new Error(
          "Site notices table is missing. Run `supabase db push` (migration 0017_site_notices.sql), then try again.",
        );
      }
      throw new Error(
        `Unable to save site notice (${key}): ${error?.message ?? "unknown error"}`,
      );
    }

    return mapRow(data);
  }

  async getCharacterRepresentationNotice(): Promise<CharacterRepresentationNoticeCopy> {
    return this.getNotice(
      CHARACTER_REPRESENTATION_NOTICE_KEY,
      DEFAULT_CHARACTER_REPRESENTATION_NOTICE,
    );
  }

  async updateCharacterRepresentationNotice(
    input: UpdateCharacterRepresentationNoticeInput,
  ): Promise<CharacterRepresentationNoticeCopy> {
    return this.upsertNotice(CHARACTER_REPRESENTATION_NOTICE_KEY, input);
  }

  async getFedericoCaballeroAbout(): Promise<CharacterRepresentationNoticeCopy> {
    return this.getNotice(
      FEDERICO_CABALLERO_ABOUT_KEY,
      DEFAULT_FEDERICO_CABALLERO_ABOUT,
    );
  }

  async updateFedericoCaballeroAbout(
    input: UpdateCharacterRepresentationNoticeInput,
  ): Promise<CharacterRepresentationNoticeCopy> {
    return this.upsertNotice(FEDERICO_CABALLERO_ABOUT_KEY, input);
  }
}
