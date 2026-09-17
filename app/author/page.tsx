import type { Metadata } from "next";

import { AboutPageView } from "@/components/about/about-page";
import { DEFAULT_FEDERICO_CABALLERO_ABOUT } from "@/lib/content/federico-caballero";
import { getFedericoCaballeroAbout } from "@/lib/domain/site-notices";

export const metadata: Metadata = {
  title: "Author | Suguidanon",
  description:
    "Meet Federico 'Nong Pedring' Caballero and the living oral tradition of the Suguidanon of Central Panay.",
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
