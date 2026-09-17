import type { CharacterRepresentationNoticeCopy } from "@/types/site-notice";

/** Stable key for Federico Caballero biography (site_notices). */
export const FEDERICO_CABALLERO_ABOUT_KEY = "federico_caballero_about" as const;

/**
 * Approved biographical paragraphs — use exactly as provided.
 * Do not shorten, paraphrase, romanticize, or invent details.
 * “Sugidanon” spelling is preserved where the source uses it.
 */
export const FEDERICO_CABALLERO_PARAGRAPHS = [
  "Federico 'Nong Pedring' Caballero (1935–2024) was a Panay-Bukidnon epic chanter, storyteller, and cultural bearer from Calinog, Iloilo. He was recognized in 2000 with the Gawad sa Manlilikha ng Bayan (GAMABA), or National Living Treasures Award, for his mastery of the Sugidanon, the epic tradition of Central Panay.",
  "Caballero learned the epics from his family, particularly from his elders who would chant them as part of everyday community life. He became one of the important bearers of a tradition that preserved ten major Panay-Bukidnon epics, many of which were performed in an archaic language related to Kinaray-a that is no longer spoken.",
  "Throughout his life, Caballero worked with researchers and cultural scholars to document, reconstruct, and preserve these oral epics, including Humadapnon and Labaw Donggon. He also encouraged members of his community to learn reading and writing so that their traditional stories, knowledge, and beliefs could be documented and passed on to future generations.",
  "Beyond being an epic chanter, Caballero served his community as a manughusay, an arbiter who helped resolve local disputes. His work therefore extended beyond storytelling: he was a keeper of memory, language, tradition, and community knowledge.",
  "Federico Caballero passed away on August 17, 2024, at the age of 88. His legacy continues through the documentation and publication of the Panay-Bukidnon Sugidanon epics, helping make this important oral heritage accessible to new generations.",
] as const;

export const DEFAULT_FEDERICO_CABALLERO_ABOUT: CharacterRepresentationNoticeCopy =
  {
    title: "Federico 'Nong Pedring' Caballero",
    body: FEDERICO_CABALLERO_PARAGRAPHS.join("\n\n"),
    shortText: "Federico 'Nong Pedring' Caballero (1935–2024)",
  };

/** Caption under the archival photograph — refine when a formal credit is confirmed. */
export const FEDERICO_CABALLERO_PHOTO_CREDIT =
  "Photograph of Federico 'Nong Pedring' Caballero";

export const ABOUT_PAGE_COPY = {
  hero: {
    heading: "THE VOICE BEHIND THE STORIES",
    subheading: "Federico 'Nong Pedring' Caballero",
    supporting: "Panay-Bukidnon Epic Chanter • Gawad sa Manlilikha ng Bayan",
    intro:
      "The Sugidanon lives through generations of storytellers, chanters, families, and communities. Among its most important cultural bearers was Federico 'Nong Pedring' Caballero.",
  },
  moreThanAuthor: {
    heading: "MORE THAN AN AUTHOR",
    body: "The Sugidanon is an oral tradition passed down through generations. Federico Caballero was not simply an 'author' of these stories. He was an epic chanter, cultural bearer, and keeper of a living tradition whose knowledge and performances helped preserve these stories for future generations.",
  },
  legacy: {
    heading: "A LEGACY CARRIED FORWARD",
    pillars: [
      {
        title: "ORAL TRADITION",
        body: "Stories carried through generations by epic chanters and communities.",
      },
      {
        title: "CULTURAL MEMORY",
        body: "Language, beliefs, customs, relationships, and ancestral knowledge preserved through the epics.",
      },
      {
        title: "THE NEXT GENERATION",
        body: "SugiLearn helps today's learners encounter these stories and continue learning from them.",
      },
    ],
  },
  closing: {
    heading: "FROM TRADITION TO LEARNING",
    body: "SugiLearn was created to help a new generation discover the stories of Panay.\n\nThrough illustrated storytelling, animation, interactive learning, and guided activities, we hope to make these stories more accessible to young learners while encouraging respect for the cultural tradition from which they came.",
    cta: "EXPLORE THE STORIES",
  },
} as const;

export function paragraphsFromNoticeBody(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
