/**
 * Cultural bearers featured on /author beside Federico Caballero.
 * Copy is client-supplied — do not invent biographical details.
 * “Sugidanun” spelling is preserved where the source uses it.
 */

export type CulturalBearerProfile = {
  id: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  photoCredit: string;
  /** Optional object-position for portrait framing */
  photoPosition?: string;
  /** Light frame for portraits shot on white */
  frameTone?: "dark" | "light";
  paragraphs: readonly string[];
};

export const RODOLFO_SANDIGAN_CABALLERO: CulturalBearerProfile = {
  id: "rodolfo-sandigan-caballero",
  name: "Rodolfo “Sandigan” Caballero",
  imageSrc: "/images/rodolfo-sandigan-caballero.png",
  imageAlt: "Rodolfo “Sandigan” Caballero",
  photoCredit: "Photograph of Rodolfo “Sandigan” Caballero",
  photoPosition: "center top",
  frameTone: "dark",
  paragraphs: [
    "Rodolfo “Sandigan” Caballero is a Panay-Bukidnon cultural elder, farmer, epic chanter, and cultural consultant from Barangay Garangan, Calinog, Iloilo. He has played an active role in sharing and safeguarding the traditions, oral literature, customary practices, and cultural identity of the Panay-Bukidnon people. Academic sources identify him as an elder and epic chanter, while cultural accounts describe him as a cultural consultant who helps introduce Panay-Bukidnon heritage to wider audiences.",
    "Sandigan is particularly associated with the Sugidanun, the traditional epic-chanting tradition of the Panay-Bukidnon. He has also shared knowledge about their customary laws, traditional dances such as Binanog, and the importance of Panubok, their distinctive traditional embroidery.",
    "Beyond performing and sharing cultural knowledge, Sandigan represents the role of an elder in passing ancestral knowledge to younger generations. Recent cultural documentation describes him teaching children about the Sugidanun and helping them understand the stories, characters, and cultural values contained within the epics.",
  ],
};

export const RITA_INTARU_CABALLERO: CulturalBearerProfile = {
  id: "rita-intaru-caballero",
  name: "Rita “Intaru” Caballero",
  imageSrc: "/images/rita-intaru-caballero.png",
  imageAlt: "Rita “Intaru” Caballero",
  photoCredit: "Photograph of Rita “Intaru” Caballero",
  photoPosition: "center top",
  frameTone: "light",
  paragraphs: [
    "Rita “Intaru” Caballero is a Panay-Bukidnon cultural bearer and advocate for the preservation and appreciation of her community's traditions. Together with Rodolfo “Sandigan” Caballero, she has participated in cultural presentations where they introduce audiences to Panay-Bukidnon customs, traditional clothing, stories, and ways of life. Accounts of their cultural presentations specifically describe Rita as sharing knowledge about their traditions and explaining aspects of Panay-Bukidnon life to students and other audiences.",
    "Rita is also associated with the promotion of traditional clothing and Panubok embroidery, an important artistic tradition of the Panay-Bukidnon. Panubok features intricate geometric and nature-inspired patterns and serves not only as decoration but also as an expression of cultural identity and inherited knowledge.",
    "Through her involvement in cultural education, Rita helps make Panay-Bukidnon traditions more accessible to younger people and to communities outside the upland areas. Her work reflects the importance of women as keepers and transmitters of cultural knowledge, particularly in traditional arts, clothing, storytelling, and community practices.",
  ],
};

export const ADDITIONAL_CULTURAL_BEARERS = [
  RODOLFO_SANDIGAN_CABALLERO,
  RITA_INTARU_CABALLERO,
] as const;
