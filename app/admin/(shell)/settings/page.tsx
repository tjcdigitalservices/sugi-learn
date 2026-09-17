import { CharacterRepresentationNoticeForm } from "@/components/admin/character-representation-notice-form";
import { FedericoCaballeroAboutForm } from "@/components/admin/federico-caballero-about-form";
import { PageHeader } from "@/components/shared/page-header";
import {
  getCharacterRepresentationNotice,
  getFedericoCaballeroAbout,
} from "@/lib/domain/site-notices";

export default async function AdminSettingsPage() {
  let characterNotice = null;
  let federicoAbout = null;
  let errorMessage: string | null = null;

  try {
    [characterNotice, federicoAbout] = await Promise.all([
      getCharacterRepresentationNotice(),
      getFedericoCaballeroAbout(),
    ]);
  } catch (error) {
    console.error("Settings load failed:", error);
    errorMessage =
      "Unable to load site notices. Please refresh the page or try again later.";
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Platform copy shown to learners. Changes apply after you save."
      />

      {errorMessage ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {characterNotice ? (
        <section className="max-w-2xl space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Character Representation Notice
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Educational disclaimer for character artwork. Do not invent cultural
              or historical claims — keep wording aligned with approved guidance.
            </p>
          </div>
          <CharacterRepresentationNoticeForm initialNotice={characterNotice} />
        </section>
      ) : null}

      {federicoAbout ? (
        <section className="max-w-2xl space-y-4 border-t border-border pt-8">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Federico Caballero Biography
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Shown on the About page. Preserve approved names, dates, and cultural
              terms. Do not invent or romanticize additional details.
            </p>
          </div>
          <FedericoCaballeroAboutForm initialNotice={federicoAbout} />
        </section>
      ) : null}
    </div>
  );
}
