import type { ChapterContentDefinition } from "@/lib/content/sugidanon/types";

const PENDING = "PENDING CLIENT APPROVAL — " as const;

/** Chapters 5–7 — Batch 2 */
export const CHAPTERS_BATCH_2: ChapterContentDefinition[] = [
  {
    id: "kalampay",
    number: 5,
    metadata: {
      title: "Kalampay",
      subtitle: "Sugidanon (Epics) of Panay Book V",
      summary:
        "Masangladon, a being of extraordinary power associated with the underworld, desires Matan-ayon. He transforms a kalampay, or crab, into an island covered with fruit trees. Matan-ayon is made to feel unbearably warm and goes to the island to bathe. As she gathers fruit, she is unknowingly carried toward the panibyungan, the source of waters descending into the underworld. Taghuy informs Labaw Donggon. Labaw and Paubare attempt to descend after her, but the enormous crab blocks their way. Katnub Magkaruan dives beneath it and makes an opening in its joints through which Labaw Donggon can pass. Labaw Donggon cannot defeat Masangladon. Luyong Kabig, sister of Laon Sina and a judge in the underworld, must mediate an agreement permitting Matan-ayon to return.",
      authors: "Magos, Alicia P. & Ramirez, Anna Razel Limoso",
      reviewStatus: "draft",
    },
    characters: [
      {
        slug: "masangladon",
        name: "Masangladon",
        description:
          "A being of extraordinary power associated with the underworld; desires Matan-ayon.",
      },
      {
        slug: "matan-ayon",
        name: "Matan-ayon",
        description:
          "Goes to bathe on the transformed crab island; carried toward the panibyungan.",
      },
      {
        slug: "labaw-donggon",
        name: "Labaw Donggon",
        description:
          "Attempts to descend after Matan-ayon; passes through the crab; cannot defeat Masangladon.",
      },
      {
        slug: "paubare",
        name: "Paubare",
        description: "Attempts to descend after Matan-ayon with Labaw Donggon.",
      },
      {
        slug: "taghuy",
        name: "Taghuy",
        description: "Informs Labaw Donggon about Matan-ayon's situation.",
      },
      {
        slug: "katnub-magkaruan",
        name: "Katnub Magkaruan",
        description:
          "Dives beneath the enormous crab and opens a passage through its joints.",
      },
      {
        slug: "luyong-kabig",
        name: "Luyong Kabig",
        description:
          "Sister of Laon Sina and a judge in the underworld; mediates Matan-ayon's return.",
      },
      {
        slug: "laon-sina",
        name: "Laon Sina",
        description: "Sister of Luyong Kabig (named in source as her relation).",
      },
    ],
    storySections: [
      {
        title: "The Crab Island",
        body: "Masangladon, a being of extraordinary power associated with the underworld, desires Matan-ayon. He transforms a kalampay, or crab, into an island covered with fruit trees. Matan-ayon is made to feel unbearably warm and goes to the island to bathe. As she gathers fruit, she is unknowingly carried toward the panibyungan, the source of waters descending into the underworld.",
      },
      {
        title: "Descent and Mediation",
        body: "Taghuy informs Labaw Donggon. Labaw and Paubare attempt to descend after her, but the enormous crab blocks their way. Katnub Magkaruan dives beneath it and makes an opening in its joints through which Labaw Donggon can pass. Labaw Donggon cannot defeat Masangladon. Luyong Kabig, sister of Laon Sina and a judge in the underworld, must mediate an agreement permitting Matan-ayon to return. The resolution demonstrates that the epic world contains several jurisdictions and powers; even Labaw Donggon must submit to negotiation beyond his own territory.",
      },
    ],
    learningPoints: [
      {
        title: "Jurisdiction and mediation",
        description: `${PENDING}The source describes multiple jurisdictions and Luyong Kabig mediating beyond Labaw Donggon's territory.`,
      },
    ],
    illustration: {
      title: "Illustration: The Crab Island",
      candidates: [
        {
          scene: "The kalampay transformed into a fruit island",
          purpose: "Visualize the transformation named in the source",
          characters: ["Matan-ayon", "Masangladon"],
          approvalStatus: "PENDING CLIENT APPROVAL",
        },
      ],
    },
    completionMessage:
      "You have reached the end of this chapter summary. Continue the Sugidanon journey in the next chapter.",
  },
  {
    id: "pahagunong",
    number: 6,
    metadata: {
      title: "Pahagunong",
      subtitle: "Sugidanon (Epics) of Panay Book IV",
      summary:
        "Labaw Donggon asks his wives, Matan-ayon and Padilagong Bulan, for permission to sail. Matan-ayon agrees, while Padilagong Bulan insists on accompanying him. When he refuses, she gives him lime and betel quid prepared from the bones of a giant turtle. Eating it transforms him into a pawikan. Matan-ayon and her brother Paubare follow the transformed hero. Pahagunong sees Matan-ayon bathing, desires her, and defeats Paubare in combat. Matan-ayon does not remain a passive prize: she transforms herself into a man and enters the conflict to assist her brother. Laon Sina eventually restores Labaw Donggon and mediates the dispute.",
      authors: "Magos, Alicia P. & Ramirez, Anna Razel Limoso",
      reviewStatus: "draft",
    },
    characters: [
      {
        slug: "labaw-donggon",
        name: "Labaw Donggon",
        description:
          "Asks his wives for permission to sail; transformed into a pawikan; restored by Laon Sina.",
      },
      {
        slug: "matan-ayon",
        name: "Matan-ayon",
        description:
          "Agrees to Labaw Donggon sailing; follows him; transforms herself into a man to assist Paubare.",
      },
      {
        slug: "padilagong-bulan",
        name: "Padilagong Bulan",
        description:
          "Wife of Labaw Donggon; gives him turtle-bone betel that transforms him into a pawikan.",
      },
      {
        slug: "paubare",
        name: "Paubare",
        description:
          "Matan-ayon's brother; follows the transformed hero; defeated by Pahagunong.",
      },
      {
        slug: "pahagunong",
        name: "Pahagunong",
        description:
          "Sees Matan-ayon bathing, desires her, and defeats Paubare in combat.",
      },
      {
        slug: "laon-sina",
        name: "Laon Sina",
        description: "Restores Labaw Donggon and mediates the dispute.",
      },
    ],
    storySections: [
      {
        title: "Permission to Sail",
        body: "Labaw Donggon asks his wives, Matan-ayon and Padilagong Bulan, for permission to sail. Matan-ayon agrees, while Padilagong Bulan insists on accompanying him. When he refuses, she gives him lime and betel quid prepared from the bones of a giant turtle. Eating it transforms him into a pawikan. Matan-ayon and her brother Paubare follow the transformed hero.",
      },
      {
        title: "Conflict and Restoration",
        body: "Pahagunong sees Matan-ayon bathing, desires her, and defeats Paubare in combat. Matan-ayon does not remain a passive prize: she transforms herself into a man and enters the conflict to assist her brother. Laon Sina eventually restores Labaw Donggon and mediates the dispute.",
      },
    ],
    learningPoints: [
      {
        title: "Agency in conflict",
        description: `${PENDING}The source states Matan-ayon transforms herself into a man to assist her brother rather than remaining a passive prize.`,
      },
    ],
    illustration: {
      title: "Illustration: The Transformation",
      candidates: [
        {
          scene: "Labaw Donggon transformed into a pawikan",
          purpose: "Visualize the transformation named in the source",
          characters: ["Labaw Donggon", "Padilagong Bulan"],
          approvalStatus: "PENDING CLIENT APPROVAL",
        },
      ],
    },
    completionMessage:
      "You have reached the end of this chapter summary. Continue the Sugidanon journey in the next chapter.",
  },
  {
    id: "sinagnayan",
    number: 7,
    metadata: {
      title: "Sinagnayan",
      subtitle: "Sugidanon (Epics) of Panay Book VI",
      summary:
        "Matan-ayon urges Labaw Donggon to confront Sinagnayan so that Pinailog sa Pinggan—Sinagnayan's wife and Matan-ayon's sister—can be brought into Labaw Donggon's household. Before reaching Sinagnayan, Labaw Donggon fights Sarandihon without either man realizing they are brothers. Laon Sina intervenes, reveals their relationship, and explains that Sinagnayan's life-force is concealed in an eggshell inside the heart of a lion guarded by his mother, Minayunmon. Sarandihon transforms himself into Sinagnayan, uses a magical taghuy to put Minayunmon to sleep, kills the lion, and removes the eggshell. Labaw Donggon can then defeat Sinagnayan and bring Pinailog home.",
      authors: "Magos, Alicia P. et al.",
      reviewStatus: "draft",
    },
    characters: [
      {
        slug: "matan-ayon",
        name: "Matan-ayon",
        description:
          "Urges Labaw Donggon to confront Sinagnayan so Pinailog sa Pinggan can join the household.",
      },
      {
        slug: "labaw-donggon",
        name: "Labaw Donggon",
        description:
          "Fights Sarandihon unknowingly; defeats Sinagnayan after the eggshell is removed.",
      },
      {
        slug: "sinagnayan",
        name: "Sinagnayan",
        description:
          "Confronted by Labaw Donggon; life-force concealed in an eggshell inside a lion.",
      },
      {
        slug: "pinailog-sa-pinggan",
        name: "Pinailog sa Pinggan",
        description:
          "Sinagnayan's wife and Matan-ayon's sister; to be brought into Labaw Donggon's household.",
      },
      {
        slug: "sarandihon",
        name: "Sarandihon",
        description:
          "Fights Labaw Donggon without either realizing they are brothers; disguises as Sinagnayan to obtain the eggshell.",
      },
      {
        slug: "laon-sina",
        name: "Laon Sina",
        description:
          "Intervenes, reveals the brothers' relationship, and explains Sinagnayan's concealed life-force.",
      },
      {
        slug: "minayunmon",
        name: "Minayunmon",
        description:
          "Sinagnayan's mother; guards the lion containing the eggshell.",
      },
    ],
    storySections: [
      {
        title: "The Confrontation Urged",
        body: "Matan-ayon urges Labaw Donggon to confront Sinagnayan so that Pinailog sa Pinggan—Sinagnayan's wife and Matan-ayon's sister—can be brought into Labaw Donggon's household. Before reaching Sinagnayan, Labaw Donggon fights Sarandihon without either man realizing they are brothers.",
      },
      {
        title: "Secret Knowledge and Victory",
        body: "Laon Sina intervenes, reveals their relationship, and explains that Sinagnayan's life-force is concealed in an eggshell inside the heart of a lion guarded by his mother, Minayunmon. Sarandihon transforms himself into Sinagnayan, uses a magical taghuy to put Minayunmon to sleep, kills the lion, and removes the eggshell. Labaw Donggon can then defeat Sinagnayan and bring Pinailog home. Strength alone accomplishes little without secret knowledge, disguise, and cooperation.",
      },
    ],
    learningPoints: [
      {
        title: "Cooperation and secret knowledge",
        description: `${PENDING}The source states strength alone accomplishes little without secret knowledge, disguise, and cooperation.`,
      },
    ],
    illustration: {
      title: "Illustration: The Concealed Life-Force",
      candidates: [
        {
          scene: "The eggshell inside the lion guarded by Minayunmon",
          purpose: "Visualize the concealment described in the source",
          characters: ["Minayunmon", "Sarandihon"],
          approvalStatus: "PENDING CLIENT APPROVAL",
        },
      ],
    },
    completionMessage:
      "You have reached the end of this chapter summary. Continue the Sugidanon journey in the next chapter.",
  },
];
