/**
 * Approved researcher roster for /researchers.
 * Do not invent roles, bios, or additional institutional claims.
 */

export const RESEARCHERS_AFFILIATION =
  "BSIT 4-D · West Visayas State University · Calinog Campus";

export const RESEARCHERS = [
  {
    slug: "aeriel-jane-aguilar",
    name: "Aeriel Jane Aguilar",
    imageSrc: "/images/researchers/aeriel-jane-aguilar.png",
    imageAlt: "Portrait of Aeriel Jane Aguilar",
  },
  {
    slug: "angely-mea-gardose",
    name: "Angely Mea Gardose",
    imageSrc: "/images/researchers/angely-mea-gardose.png",
    imageAlt: "Portrait of Angely Mea Gardose",
  },
  {
    slug: "kim-delaquena",
    name: "Kim Delaquena",
    imageSrc: "/images/researchers/kim-delaquena.png",
    imageAlt: "Portrait of Kim Delaquena",
  },
  {
    slug: "daisyre-chavez",
    name: "Daisyre Chavez",
    imageSrc: "/images/researchers/daisyre-chavez.png",
    imageAlt: "Portrait of Daisyre Chavez",
  },
] as const;

export type Researcher = (typeof RESEARCHERS)[number];

export function getResearcherBySlug(slug: string): Researcher | undefined {
  return RESEARCHERS.find((researcher) => researcher.slug === slug);
}
