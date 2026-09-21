import type { Metadata } from "next";

import { AboutPageView } from "@/components/about/about-page";
import { DEFAULT_FEDERICO_CABALLERO_ABOUT } from "@/lib/content/federico-caballero";
import { getFedericoCaballeroAbout } from "@/lib/domain/site-notices";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Authors | Suguidanon",
  description:
    "Meet Panay-Bukidnon cultural bearers Federico 'Nong Pedring' Caballero, Rodolfo “Sandigan” Caballero, and Rita “Intaru” Caballero.",
};

export default async function AuthorPage() {
  let biography = DEFAULT_FEDERICO_CABALLERO_ABOUT;
  try {
    biography = await getFedericoCaballeroAbout();
  } catch (error) {
    console.error("Unable to load Federico Caballero about copy:", error);
  }

  return <AboutPageView biography={biography} />;
}
