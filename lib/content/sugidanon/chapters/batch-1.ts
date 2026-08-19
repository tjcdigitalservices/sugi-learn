import type { ChapterContentDefinition } from "@/lib/content/sugidanon/types";

const PENDING = "PENDING CLIENT APPROVAL — " as const;

/** Chapters 2–4 — Batch 1 */
export const CHAPTERS_BATCH_1: ChapterContentDefinition[] = [
  {
    id: "amburukay",
    number: 2,
    metadata: {
      title: "Amburukay",
      subtitle: "Sugidanon (Epics) of Panay Book II",
      summary:
        "Amburukay raises Matan-ayon and Saranggaon as her own daughters, keeping them in a golden chamber as binukot. She makes an extraordinary vow: her adopted daughters will marry whoever succeeds in stealing her golden pubic hair. When a string on Labaw Donggon's musical instrument breaks, he learns that Amburukay's hair can replace it. He enchants her into sleep and cuts the hair, only to discover that taking it has bound him to her condition. Believing he must marry the frightening hermit herself, he approaches the wedding reluctantly. Amburukay instead presents the daughters she has raised and judges Labaw Donggon worthy to marry them.",
      authors: "Magos, Alicia P. et al.",
      reviewStatus: "draft",
    },
    characters: [
      {
        slug: "amburukay",
        name: "Amburukay",
        description:
          "Raises Matan-ayon and Saranggaon as her own daughters in a golden chamber as binukot. Makes a vow about her golden pubic hair and marriage.",
      },
      {
        slug: "matan-ayon",
        name: "Matan-ayon",
        description:
          "Raised by Amburukay as a binukot in a golden chamber; presented for marriage to Labaw Donggon.",
      },
      {
        slug: "saranggaon",
        name: "Saranggaon",
        description:
          "Raised by Amburukay as a binukot in a golden chamber; presented for marriage to Labaw Donggon.",
      },
      {
        slug: "labaw-donggon",
        name: "Labaw Donggon",
        description:
          "Takes Amburukay's golden pubic hair after enchanting her to sleep; bound to her marriage condition; judged worthy to marry the daughters she raised.",
      },
    ],
    storySections: [
      {
        title: "Raising the Daughters",
        body: "Amburukay raises Matan-ayon and Saranggaon as her own daughters, keeping them in a golden chamber as binukot. She makes an extraordinary vow: her adopted daughters will marry whoever succeeds in stealing her golden pubic hair.",
      },
      {
        title: "The Hair and the Condition",
        body: "When a string on Labaw Donggon's musical instrument breaks, he learns that Amburukay's hair can replace it. He enchants her into sleep and cuts the hair, only to discover that taking it has bound him to her condition. Believing he must marry the frightening hermit herself, he approaches the wedding reluctantly. Amburukay instead presents the daughters she has raised and judges Labaw Donggon worthy to marry them.",
      },
    ],
    learningPoints: [
      {
        title: "Vows and conditions",
        description: `${PENDING}The source describes Amburukay's vow linking marriage to stealing her golden pubic hair, and Labaw Donggon becoming bound to that condition.`,
      },
    ],
    illustration: {
      title: "Illustration: The Golden Chamber",
      candidates: [
        {
          scene: "Amburukay and the binukot in the golden chamber",
          purpose: "Introduce the setting named in the source",
          characters: ["Amburukay", "Matan-ayon", "Saranggaon"],
          approvalStatus: "PENDING CLIENT APPROVAL",
        },
      ],
    },
    completionMessage:
      "You have reached the end of this chapter summary. Continue the Sugidanon journey in the next chapter.",
  },
  {
    id: "derikaryong-pada",
    number: 3,
    metadata: {
      title: "Derikaryong Pada",
      subtitle: "Sugidanon (Epics) of Panay Book III",
      summary:
        "Before Matan-ayon is born, she has already been promised in marriage to Labaw Donggon. A gold medallion is given as the sign of this agreement. When she reaches marriageable age, Sinagnayan also seeks her. He is connected to Paglambuhan, who has taken an heirloom sailboat belonging to Matan-ayon's parents. The recovery of the vessel becomes the condition by which a suitor may prove his right to marry her. Labaw Donggon is caught between a prior promise and a new test. Marriage here is not simply private romance: it joins families, wealth, reputation, inherited objects, and promises made before the individuals concerned are old enough to act for themselves.",
      authors: "Magos, Alicia P.",
      reviewStatus: "draft",
    },
    characters: [
      {
        slug: "matan-ayon",
        name: "Matan-ayon",
        description:
          "Promised in marriage to Labaw Donggon before birth; a gold medallion marks the agreement; sought also by Sinagnayan.",
      },
      {
        slug: "labaw-donggon",
        name: "Labaw Donggon",
        description:
          "Promised Matan-ayon before her birth; caught between a prior promise and a new test involving recovery of an heirloom sailboat.",
      },
      {
        slug: "sinagnayan",
        name: "Sinagnayan",
        description: "Also seeks Matan-ayon when she reaches marriageable age.",
      },
      {
        slug: "paglambuhan",
        name: "Paglambuhan",
        description:
          "Connected to Sinagnayan; has taken an heirloom sailboat belonging to Matan-ayon's parents.",
      },
    ],
    storySections: [
      {
        title: "Promise Before Birth",
        body: "Before Matan-ayon is born, she has already been promised in marriage to Labaw Donggon. A gold medallion is given as the sign of this agreement.",
      },
      {
        title: "A New Suitor and a Condition",
        body: "When she reaches marriageable age, Sinagnayan also seeks her. He is connected to Paglambuhan, who has taken an heirloom sailboat belonging to Matan-ayon's parents. The recovery of the vessel becomes the condition by which a suitor may prove his right to marry her. Labaw Donggon is caught between a prior promise and a new test. Marriage here is not simply private romance: it joins families, wealth, reputation, inherited objects, and promises made before the individuals concerned are old enough to act for themselves.",
      },
    ],
    learningPoints: [
      {
        title: "Promises and marriage conditions",
        description: `${PENDING}The source describes a prior promise, a gold medallion, and recovery of an heirloom sailboat as a marriage condition.`,
      },
    ],
    illustration: {
      title: "Illustration: The Gold Medallion",
      candidates: [
        {
          scene: "The gold medallion as sign of agreement",
          purpose: "Visualize the object named in the source",
          characters: ["Matan-ayon", "Labaw Donggon"],
          approvalStatus: "PENDING CLIENT APPROVAL",
        },
      ],
    },
    completionMessage:
      "You have reached the end of this chapter summary. Continue the Sugidanon journey in the next chapter.",
  },
  {
    id: "balanakon",
    number: 4,
    metadata: {
      title: "Balanakon",
      subtitle: "Sugidanon (Epics) of Panay Book VII",
      summary:
        "Balanakon is a dalagangan, a person possessing extraordinary innate power. Taghuy persuades him to challenge Labaw Donggon and seek Matan-ayon. During his journey, Balanakon is stopped by Sarandihon, Labaw Donggon's brother, but Sarandihon cannot defeat him. Taghuy summons Labaw Donggon, yet even the brothers' combined strength is insufficient. The conflict ends only when Laon Sina intervenes. Balanakon's power is genuine, and victory cannot be secured through force alone; an authoritative intermediary must restore order before rivalry destroys the relationships surrounding the fighters.",
      authors: "Magos, Alicia P. & Ramirez, Anna Razel Limoso",
      reviewStatus: "draft",
    },
    characters: [
      {
        slug: "balanakon",
        name: "Balanakon",
        description:
          "A dalagangan possessing extraordinary innate power; persuaded to challenge Labaw Donggon for Matan-ayon.",
      },
      {
        slug: "taghuy",
        name: "Taghuy",
        description:
          "Persuades Balanakon to challenge Labaw Donggon; summons Labaw Donggon during the conflict.",
      },
      {
        slug: "labaw-donggon",
        name: "Labaw Donggon",
        description:
          "Challenged by Balanakon; fights alongside Sarandihon but combined strength is insufficient.",
      },
      {
        slug: "sarandihon",
        name: "Sarandihon",
        description:
          "Labaw Donggon's brother; stops Balanakon but cannot defeat him.",
      },
      {
        slug: "matan-ayon",
        name: "Matan-ayon",
        description: "Sought by Balanakon through his challenge to Labaw Donggon.",
      },
      {
        slug: "laon-sina",
        name: "Laon Sina",
        description:
          "Intervenes to end the conflict when force alone cannot restore order.",
      },
    ],
    storySections: [
      {
        title: "The Challenge",
        body: "Balanakon is a dalagangan, a person possessing extraordinary innate power. Taghuy persuades him to challenge Labaw Donggon and seek Matan-ayon. During his journey, Balanakon is stopped by Sarandihon, Labaw Donggon's brother, but Sarandihon cannot defeat him.",
      },
      {
        title: "Intervention",
        body: "Taghuy summons Labaw Donggon, yet even the brothers' combined strength is insufficient. The conflict ends only when Laon Sina intervenes. Balanakon's power is genuine, and victory cannot be secured through force alone; an authoritative intermediary must restore order before rivalry destroys the relationships surrounding the fighters.",
      },
    ],
    learningPoints: [
      {
        title: "Mediation and authority",
        description: `${PENDING}The source states that Laon Sina must intervene because victory cannot be secured through force alone.`,
      },
    ],
    illustration: {
      title: "Illustration: The Challenge",
      candidates: [
        {
          scene: "Balanakon stopped by Sarandihon",
          purpose: "Visualize the confrontation described in the source",
          characters: ["Balanakon", "Sarandihon"],
          approvalStatus: "PENDING CLIENT APPROVAL",
        },
      ],
    },
    completionMessage:
      "You have reached the end of this chapter summary. Continue the Sugidanon journey in the next chapter.",
  },
];
