import type { ChapterContentDefinition } from "@/lib/content/sugidanon/types";

const PENDING = "PENDING CLIENT APPROVAL — " as const;

/** Chapters 12–13 — Batch 4 */
export const CHAPTERS_BATCH_4: ChapterContentDefinition[] = [
  {
    id: "alayaw",
    number: 12,
    metadata: {
      title: "Alayaw",
      subtitle: "Sugidanon (Epics) of Panay Book IX",
      summary:
        "Humadapnon wants to see Mali, but she is secluded in her family's burukutan. Laon Sina advises him to plant an alayaw tree in the yard of Mali's parents. Its sweet-smelling flowers are expected to entice Mali to leave her enclosure and gather the blossoms, allowing Humadapnon to see the woman he hopes to court. The fragrant tree becomes an intermediary that crosses the boundary the suitor cannot cross.",
      authors: "Magos, Alicia P. et al.",
      reviewStatus: "draft",
    },
    characters: [
      {
        slug: "humadapnon",
        name: "Humadapnon",
        description:
          "Wants to see Mali; plants an alayaw tree on Laon Sina's advice.",
      },
      {
        slug: "nagmalitong-yawa",
        name: "Nagmalitong Yawa (Mali)",
        description:
          "Secluded in her family's burukutan; expected to be enticed by alayaw flowers.",
      },
      {
        slug: "laon-sina",
        name: "Laon Sina",
        description: "Advises Humadapnon to plant an alayaw tree.",
      },
    ],
    storySections: [
      {
        title: "Seclusion and Desire",
        body: "Humadapnon wants to see Mali, but she is secluded in her family's burukutan. Laon Sina advises him to plant an alayaw tree in the yard of Mali's parents. Its sweet-smelling flowers are expected to entice Mali to leave her enclosure and gather the blossoms, allowing Humadapnon to see the woman he hopes to court.",
      },
      {
        title: "The Fragrant Intermediary",
        body: "The fragrant tree becomes an intermediary. It crosses the boundary that the suitor cannot cross and turns attraction into something carried through scent, curiosity, and the landscape surrounding the household.",
      },
    ],
    learningPoints: [
      {
        title: "Boundary and intermediary",
        description: `${PENDING}The source describes the alayaw tree crossing the boundary the suitor cannot cross.`,
      },
    ],
    illustration: {
      title: "Illustration: The Alayaw Tree",
      candidates: [
        {
          scene: "The alayaw tree in the yard of Mali's parents",
          purpose: "Visualize the intermediary named in the source",
          characters: ["Humadapnon", "Nagmalitong Yawa (Mali)"],
          approvalStatus: "PENDING CLIENT APPROVAL",
        },
      ],
    },
    completionMessage:
      "You have reached the end of this chapter summary. Continue the Sugidanon journey in the next chapter.",
  },
  {
    id: "nagbuhis",
    number: 13,
    metadata: {
      title: "Nagbuhis",
      subtitle: "Sugidanon (Epics) of Panay Book X",
      summary:
        "Matan-ayon has become ill and extremely thin. Ginduluman is summoned to conduct ceremonies required for her recovery. Matan-ayon also wants Mali initiated more fully into ritual knowledge so that Mali may inherit powers and a spirit guide. When the community goes to the seashore for the ceremony, Humadapnon prevents Mali from attending. She later discovers that he is courting another secluded woman. Mali answers through deception and magic, creating an enchanted pillow substitute and departing in a golden basket while the magical substitute continues the performance below.",
      authors: "Magos, Alicia P. et al.",
      reviewStatus: "draft",
    },
    characters: [
      {
        slug: "matan-ayon",
        name: "Matan-ayon",
        description:
          "Ill and extremely thin; wants Mali initiated into ritual knowledge for inheritance of powers and a spirit guide.",
      },
      {
        slug: "ginduluman",
        name: "Ginduluman",
        description: "Summoned to conduct ceremonies required for Matan-ayon's recovery.",
      },
      {
        slug: "nagmalitong-yawa",
        name: "Nagmalitong Yawa (Mali)",
        description:
          "Prevented from attending ceremony; answers through deception and magic; carried away in a golden basket.",
      },
      {
        slug: "humadapnon",
        name: "Humadapnon",
        description:
          "Prevents Mali from attending the ceremony; courting another secluded woman.",
      },
    ],
    storySections: [
      {
        title: "Illness and Ceremony",
        body: "Matan-ayon has become ill and extremely thin. Ginduluman is summoned to conduct ceremonies required for her recovery. Matan-ayon also wants Mali initiated more fully into ritual knowledge so that Mali may inherit powers and a spirit guide. When the community goes to the seashore for the ceremony, Humadapnon prevents Mali from attending.",
      },
      {
        title: "Deception and Departure",
        body: "She later discovers that he is courting another secluded woman. Mali answers through deception and magic. She creates or becomes associated with an enchanted pillow that takes her place, bids other men farewell, and deliberately arouses Humadapnon's jealousy. With assistance from her grandmother in the upper world, Mali is carried away in a golden basket while the magical substitute continues the performance below. Humadapnon's attempt to control Mali's movement is answered by powers he cannot control. The episode also connects Mali to women's ritual inheritance: she is not only a wife or desired binukot, but the prospective recipient of knowledge and authority passed through her maternal family.",
      },
    ],
    learningPoints: [
      {
        title: "Ritual inheritance",
        description: `${PENDING}The source connects Mali to women's ritual inheritance and knowledge passed through her maternal family.`,
      },
    ],
    illustration: {
      title: "Illustration: Ritual at the Seashore",
      candidates: [
        {
          scene: "Community ceremony at the seashore",
          purpose: "Visualize the ceremony setting named in the source",
          characters: ["Matan-ayon", "Ginduluman", "Nagmalitong Yawa (Mali)"],
          approvalStatus: "PENDING CLIENT APPROVAL",
        },
      ],
    },
    completionMessage:
      "You have reached the end of this chapter summary. You have completed the mapped Sugidanon chapter journey.",
  },
];
