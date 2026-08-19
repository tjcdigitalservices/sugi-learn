/**
 * Chapter 1 (Tikum Kadlum) content derived from:
 * docs/sources/Tikum-Kadlum-Sugidanon-Source.docx
 *
 * Educational summary/adaptation — not the full epic text.
 * Wording traceable to the client source; final publication pending client approval.
 */

export const TIKUM_KADLUM_SOURCE = {
  documentPath: "docs/sources/Tikum-Kadlum-Sugidanon-Source.docx",
  book: "Sugidanon (Epics) of Panay Book I",
  authors: "Magos, Alicia P. et al.",
} as const;

export const TIKUM_KADLUM_CHAPTER_METADATA = {
  title: "Tikum Kadlum",
  subtitle: "Sugidanon (Epics) of Panay Book I",
  summary:
    "Datu Paiburong goes hunting with his brother Dumaraog and his extraordinary dog, Tikum Kadlum. The dog repeatedly draws their attention to an unusual bamboo tree, but Paiburong does not understand the warning and cuts it down. The bamboo belongs to Makabagting, a dangerous man-eating being, and his hermit sister Amburukay. Paiburong has entered another being's territory and destroyed something that was not his. After negotiation, the owners agree to accept Paiburong's daughters, Matan-ayon and Saranggaon, as compensation. Paiburong and Bulawanon try to hide the girls by disguising them with soot, but Makabagting sees through the deception.",
  reviewStatus: "draft" as const,
} as const;

/** Source-backed character notes — no invented appearance or personality. */
export const TIKUM_KADLUM_CHARACTERS = [
  {
    slug: "datu-paiburong",
    name: "Datu Paiburong",
    description:
      "Goes hunting with Dumaraog and Tikum Kadlum. Does not understand the dog's warning, cuts down the bamboo, enters another being's territory, and offers his daughters Matan-ayon and Saranggaon as compensation after negotiation.",
  },
  {
    slug: "dumaraog",
    name: "Dumaraog",
    description:
      "Paiburong's brother; goes hunting with Paiburong and Tikum Kadlum.",
  },
  {
    slug: "tikum-kadlum",
    name: "Tikum Kadlum",
    description:
      "Paiburong's extraordinary dog; repeatedly draws attention to an unusual bamboo tree.",
  },
  {
    slug: "makabagting",
    name: "Makabagting",
    description:
      "A dangerous man-eating being; owner of the bamboo tree with his hermit sister Amburukay. Sees through the attempt to disguise the girls with soot.",
  },
  {
    slug: "amburukay-ch1",
    name: "Amburukay",
    description:
      "Hermit sister of Makabagting; associated with the bamboo that Paiburong destroys.",
  },
  {
    slug: "matan-ayon",
    name: "Matan-ayon",
    description:
      "Paiburong's daughter; accepted as compensation after negotiation.",
  },
  {
    slug: "saranggaon",
    name: "Saranggaon",
    description:
      "Paiburong's daughter; accepted as compensation after negotiation.",
  },
  {
    slug: "bulawanon",
    name: "Bulawanon",
    description:
      "With Paiburong, attempts to hide the girls by disguising them with soot.",
  },
] as const;

/** Candidate learning themes — PENDING CLIENT APPROVAL for official outcomes. */
export const TIKUM_KADLUM_LEARNING_POINTS = [
  {
    title: "Territory and what is not one's own",
    description:
      "PENDING CLIENT APPROVAL — The source states that Paiburong entered another being's territory and destroyed something that was not his.",
  },
  {
    title: "Negotiation and compensation",
    description:
      "PENDING CLIENT APPROVAL — The source describes negotiation after which Makabagting and Amburukay accept Paiburong's daughters as compensation.",
  },
  {
    title: "Deception and recognition",
    description:
      "PENDING CLIENT APPROVAL — The source describes an attempt to disguise the girls with soot and Makabagting seeing through the deception.",
  },
] as const;

export const TIKUM_KADLUM_SECTIONS = [
  {
    kind: "introduction" as const,
    title: "Chapter Introduction",
    body: `This chapter presents an educational summary adapted from the client-provided source document Tikum Kadlum: Sugidanon (Epics) of Panay Book I (${TIKUM_KADLUM_SOURCE.authors}).

This material is a source-based summary for learning purposes. It is not the complete published epic text.

Source reference: ${TIKUM_KADLUM_SOURCE.documentPath}`,
    reviewStatus: "approved" as const,
  },
  {
    kind: "story" as const,
    title: "The Hunting Trip",
    body: "Datu Paiburong goes hunting with his brother Dumaraog and his extraordinary dog, Tikum Kadlum. The dog repeatedly draws their attention to an unusual bamboo tree, but Paiburong does not understand the warning and cuts it down.",
    reviewStatus: "approved" as const,
  },
  {
    kind: "story" as const,
    title: "Territory and Negotiation",
    body: "The bamboo belongs to Makabagting, a dangerous man-eating being, and his hermit sister Amburukay. Paiburong has entered another being's territory and destroyed something that was not his. After negotiation, the owners agree to accept Paiburong's daughters, Matan-ayon and Saranggaon, as compensation.",
    reviewStatus: "approved" as const,
  },
  {
    kind: "story" as const,
    title: "Compensation and Deception",
    body: "Paiburong and Bulawanon try to hide the girls by disguising them with soot, but Makabagting sees through the deception.",
    reviewStatus: "approved" as const,
  },
  {
    kind: "illustration" as const,
    title: "Illustration: The Unusual Bamboo",
    reviewStatus: "approved" as const,
  },
  {
    kind: "characters" as const,
    title: "Characters in This Chapter",
    reviewStatus: "approved" as const,
  },
  {
    kind: "learning_points" as const,
    title: "Learning Points",
    reviewStatus: "draft" as const,
  },
  {
    kind: "completion" as const,
    title: "Chapter Complete",
    message:
      "You have reached the end of this chapter summary. Continue the Sugidanon journey when the next chapter is available.",
    reviewStatus: "approved" as const,
  },
] as const;

/** Illustration opportunities — scene candidates only; no assets in M10. */
export const TIKUM_KADLUM_ILLUSTRATION_CANDIDATES = [
  {
    scene: "Tikum Kadlum draws attention to the unusual bamboo",
    purpose: "Highlight the warning Paiburong does not understand",
    characters: ["Tikum Kadlum", "Datu Paiburong", "Dumaraog"],
    approvalStatus: "PENDING CLIENT APPROVAL",
  },
  {
    scene: "Paiburong cuts down the bamboo",
    purpose: "Visualize the act that triggers the conflict",
    characters: ["Datu Paiburong"],
    approvalStatus: "PENDING CLIENT APPROVAL",
  },
  {
    scene: "Makabagting and Amburukay connected to the bamboo",
    purpose: "Show ownership and territorial consequence",
    characters: ["Makabagting", "Amburukay"],
    approvalStatus: "PENDING CLIENT APPROVAL",
  },
  {
    scene: "Negotiation over compensation",
    purpose: "Support understanding of negotiation in the source",
    characters: ["Datu Paiburong", "Makabagting", "Amburukay"],
    approvalStatus: "PENDING CLIENT APPROVAL",
  },
  {
    scene: "Attempted disguise with soot",
    purpose: "Visualize deception and recognition in the source",
    characters: ["Datu Paiburong", "Bulawanon", "Matan-ayon", "Saranggaon", "Makabagting"],
    approvalStatus: "PENDING CLIENT APPROVAL",
  },
] as const;
