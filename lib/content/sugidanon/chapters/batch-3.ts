import type { ChapterContentDefinition } from "@/lib/content/sugidanon/types";

const PENDING = "PENDING CLIENT APPROVAL — " as const;

/** Chapters 8–11 — Batch 3 (Humadapnon volumes) */
export const CHAPTERS_BATCH_3: ChapterContentDefinition[] = [
  {
    id: "humadapnon-tarangban",
    number: 8,
    metadata: {
      title: "Humadapnon: Tarangban",
      subtitle: "Sugidanon (Epics) of Panay Book VIII, Volume 1",
      summary:
        "Humadapnon is the longest title in the series and occupies four published volumes. Its narrative follows Humadapnon's search for a suitable wife, his courtship of Nagmalitong Yawa—frequently called Mali—and the promises, rivalries, separations, and reconciliations that follow. Mali is not merely the woman Humadapnon seeks. Throughout these episodes she disguises herself, performs ritual and magical actions, rescues Humadapnon, helps him defeat opponents, makes strategic decisions, and answers humiliation and betrayal.",
      authors: "Magos, Alicia P. et al.",
      reviewStatus: "draft",
    },
    characters: [
      {
        slug: "humadapnon",
        name: "Humadapnon",
        description:
          "Searches for a suitable wife; courts Nagmalitong Yawa (Mali); central figure of the four-volume Humadapnon epic.",
      },
      {
        slug: "nagmalitong-yawa",
        name: "Nagmalitong Yawa (Mali)",
        description:
          "Courted by Humadapnon; disguises herself, performs ritual and magical actions, rescues Humadapnon, and makes strategic decisions.",
      },
    ],
    storySections: [
      {
        title: "The Search and Courtship",
        body: "Humadapnon is the longest title in the series and occupies four published volumes. Its narrative follows Humadapnon's search for a suitable wife, his courtship of Nagmalitong Yawa—frequently called Mali—and the promises, rivalries, separations, and reconciliations that follow.",
      },
      {
        title: "Mali's Role",
        body: "Mali is not merely the woman Humadapnon seeks. Throughout these episodes she disguises herself, performs ritual and magical actions, rescues Humadapnon, helps him defeat opponents, makes strategic decisions, and answers humiliation and betrayal.",
      },
    ],
    learningPoints: [
      {
        title: "Agency beyond courtship",
        description: `${PENDING}The source describes Mali performing ritual actions, rescuing Humadapnon, and making strategic decisions beyond being the sought wife.`,
      },
    ],
    illustration: {
      title: "Illustration: Courtship and Rivalry",
      candidates: [
        {
          scene: "Humadapnon's courtship of Mali",
          purpose: "Introduce the central relationship named in the source",
          characters: ["Humadapnon", "Nagmalitong Yawa (Mali)"],
          approvalStatus: "PENDING CLIENT APPROVAL",
        },
      ],
    },
    completionMessage:
      "You have reached the end of this chapter summary. Continue the Humadapnon journey in the next volume.",
  },
  {
    id: "humadapnon-pagbalukat-ka-biday",
    number: 9,
    metadata: {
      title: "Humadapnon: Pagbalukat ka Biday",
      subtitle: "Sugidanon (Epics) of Panay Book VIII, Volume 2",
      summary:
        "To continue his courtship, Humadapnon must retrieve the heirloom boat serving as Mali's tuos, or mark of engagement. Paglambuhan possesses the vessel. Humadapnon fights Paglambuhan and Sumagulong but cannot defeat them unaided. Mali intervenes, distracting Paglambuhan so that Humadapnon can wound him. Custom then requires Humadapnon to stay with the defeated man's wife. When he remains longer than expected, Mali becomes jealous. She takes both Humadapnon's golden boat and the recovered heirloom vessel and departs, leaving him in a golden basket. Taghuy attempts to reconcile them. Humadapnon later challenges Mali's father, but the confrontation is reframed as a test of the suitor's strength.",
      authors: "Magos, Alicia P. et al.",
      reviewStatus: "draft",
    },
    characters: [
      {
        slug: "humadapnon",
        name: "Humadapnon",
        description:
          "Must retrieve Mali's tuos heirloom boat; fights Paglambuhan and Sumagulong; left in a golden basket.",
      },
      {
        slug: "nagmalitong-yawa",
        name: "Nagmalitong Yawa (Mali)",
        description:
          "Intervenes during the fight; becomes jealous; takes the boats and departs.",
      },
      {
        slug: "paglambuhan",
        name: "Paglambuhan",
        description: "Possesses the heirloom boat serving as Mali's tuos.",
      },
      {
        slug: "sumagulong",
        name: "Sumagulong",
        description: "Fights Humadapnon alongside Paglambuhan.",
      },
      {
        slug: "taghuy",
        name: "Taghuy",
        description: "Attempts to reconcile Humadapnon and Mali.",
      },
    ],
    storySections: [
      {
        title: "The Heirloom Boat",
        body: "To continue his courtship, Humadapnon must retrieve the heirloom boat serving as Mali's tuos, or mark of engagement. Paglambuhan possesses the vessel. Humadapnon fights Paglambuhan and Sumagulong but cannot defeat them unaided. Mali intervenes, distracting Paglambuhan so that Humadapnon can wound him.",
      },
      {
        title: "Jealousy and Departure",
        body: "Custom then requires Humadapnon to stay with the defeated man's wife. When he remains longer than expected, Mali becomes jealous. She takes both Humadapnon's golden boat and the recovered heirloom vessel and departs, leaving him in a golden basket. Taghuy attempts to reconcile them. Humadapnon later challenges Mali's father, but the confrontation is reframed as a test of the suitor's strength.",
      },
    ],
    learningPoints: [
      {
        title: "Custom and courtship tests",
        description: `${PENDING}The source describes tuos, custom after defeat, and reframing confrontation as a test of strength.`,
      },
    ],
    illustration: {
      title: "Illustration: The Heirloom Boat",
      candidates: [
        {
          scene: "Retrieval of Mali's tuos heirloom boat",
          purpose: "Visualize the engagement object named in the source",
          characters: ["Humadapnon", "Paglambuhan"],
          approvalStatus: "PENDING CLIENT APPROVAL",
        },
      ],
    },
    completionMessage:
      "You have reached the end of this chapter summary. Continue the Humadapnon journey in the next volume.",
  },
  {
    id: "humadapnon-hungaw",
    number: 10,
    metadata: {
      title: "Humadapnon: Hungaw",
      subtitle: "Sugidanon (Epics) of Panay Book VIII, Volume 3",
      summary:
        "After recovering the biday serving as Mali's engagement token, Humadapnon formally seeks her hand. An initial misunderstanding arises with Labaw Donggon, but Humadapnon is welcomed by Mali's relatives. Their marriage is arranged and attended by respected guests. The volume gives particular attention to the hungaw wedding ceremony and to hospitality, kinship, marriage, prestige, and the supernatural.",
      authors: "Magos, Alicia P. et al.",
      reviewStatus: "draft",
    },
    characters: [
      {
        slug: "humadapnon",
        name: "Humadapnon",
        description:
          "Recovers the biday engagement token; formally seeks Mali's hand; welcomed by her relatives.",
      },
      {
        slug: "nagmalitong-yawa",
        name: "Nagmalitong Yawa (Mali)",
        description: "Marriage arranged with Humadapnon; hungaw ceremony.",
      },
      {
        slug: "labaw-donggon",
        name: "Labaw Donggon",
        description: "Initial misunderstanding arises with Humadapnon.",
      },
    ],
    storySections: [
      {
        title: "Formal Courtship",
        body: "After recovering the biday serving as Mali's engagement token, Humadapnon formally seeks her hand. An initial misunderstanding arises with Labaw Donggon, but Humadapnon is welcomed by Mali's relatives. Their marriage is arranged and attended by respected guests.",
      },
      {
        title: "The Hungaw Ceremony",
        body: "The volume gives particular attention to the hungaw wedding ceremony and to hospitality, kinship, marriage, prestige, and the supernatural. It shows the social work needed to turn a courtship into a recognized union involving two extended families.",
      },
    ],
    learningPoints: [
      {
        title: "Marriage as social union",
        description: `${PENDING}The source emphasizes hospitality, kinship, marriage, prestige, and the hungaw ceremony joining extended families.`,
      },
    ],
    illustration: {
      title: "Illustration: The Hungaw Ceremony",
      candidates: [
        {
          scene: "The hungaw wedding ceremony",
          purpose: "Visualize the ceremony named in the source",
          characters: ["Humadapnon", "Nagmalitong Yawa (Mali)"],
          approvalStatus: "PENDING CLIENT APPROVAL",
        },
      ],
    },
    completionMessage:
      "You have reached the end of this chapter summary. Continue the Humadapnon journey in the next volume.",
  },
  {
    id: "humadapnon-ginlawan",
    number: 11,
    metadata: {
      title: "Humadapnon: Ginlawan",
      subtitle: "Sugidanon (Epics) of Panay Book VIII, Volume 4",
      summary:
        "Humadapnon and Dumalapdap return to sea to find a suitable marriage match for Dumalapdap. During their absence, Taghoy plots with Paglambuhan and Sumagulong to take Mali from Humadapnon. Sumagulong persuades Mali's relatives to accept the match, and a wedding feast begins. Humadapnon returns during the festivities, and the conflict leads to Mali's death. Remorseful, he restores her to life and asks forgiveness from Mali and her parents. Resurrection does not erase the humiliation and resentment, however, and the couple separates. Ginlawan refers to a public punishment or reckoning imposed when a tuos has been violated.",
      authors: "Magos, Alicia P. et al.",
      reviewStatus: "draft",
    },
    characters: [
      {
        slug: "humadapnon",
        name: "Humadapnon",
        description:
          "Returns during the wedding feast; restores Mali to life; asks forgiveness; couple separates.",
      },
      {
        slug: "nagmalitong-yawa",
        name: "Nagmalitong Yawa (Mali)",
        description:
          "Death during conflict; restored to life; separates from Humadapnon despite resurrection.",
      },
      {
        slug: "dumalapdap",
        name: "Dumalapdap",
        description:
          "Returns to sea with Humadapnon to find a suitable marriage match.",
      },
      {
        slug: "taghoy",
        name: "Taghoy",
        description: "Plots with Paglambuhan and Sumagulong to take Mali from Humadapnon.",
      },
      {
        slug: "paglambuhan",
        name: "Paglambuhan",
        description: "Plots with Taghoy and Sumagulong against Humadapnon.",
      },
      {
        slug: "sumagulong",
        name: "Sumagulong",
        description:
          "Persuades Mali's relatives to accept the match; wedding feast begins.",
      },
    ],
    storySections: [
      {
        title: "Plot and Feast",
        body: "Humadapnon and Dumalapdap return to sea to find a suitable marriage match for Dumalapdap. During their absence, Taghoy plots with Paglambuhan and Sumagulong to take Mali from Humadapnon. Sumagulong persuades Mali's relatives to accept the match, and a wedding feast begins.",
      },
      {
        title: "Death, Restoration, and Ginlawan",
        body: "Humadapnon returns during the festivities, and the conflict leads to Mali's death. Remorseful, he restores her to life and asks forgiveness from Mali and her parents. Resurrection does not erase the humiliation and resentment, however, and the couple separates. Ginlawan refers to a public punishment or reckoning imposed when a tuos has been violated. The volume places honour, loyalty, justice, and marital obligation above the expectation that a supernatural rescue must produce a happy ending.",
      },
    ],
    learningPoints: [
      {
        title: "Honour and violated tuos",
        description: `${PENDING}The source describes ginlawan as public reckoning when a tuos has been violated, and separation despite resurrection.`,
      },
    ],
    illustration: {
      title: "Illustration: Ginlawan",
      candidates: [
        {
          scene: "Public reckoning after tuos violation",
          purpose: "Visualize the ginlawan concept named in the source",
          characters: ["Humadapnon", "Nagmalitong Yawa (Mali)"],
          approvalStatus: "PENDING CLIENT APPROVAL",
        },
      ],
    },
    completionMessage:
      "You have reached the end of this Humadapnon volume. Continue the Sugidanon journey in the next chapter.",
  },
];
