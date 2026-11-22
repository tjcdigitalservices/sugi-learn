"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type TransitionEvent,
} from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import type {
  AnimationSection,
  AudioSection,
  Chapter,
  ChapterSection,
  IllustrationSection,
} from "@/types/chapter";
import type { MediaAsset } from "@/types/media";
import type { StorybookLayoutMode } from "@/lib/chapter/storybook-layout-mode";
import { useStorybookLayoutMode } from "@/lib/chapter/storybook-layout-mode";

import { ChapterSummaryExpandable } from "@/components/chapter/chapter-summary-expandable";
import { MediaRenderer } from "@/components/chapter/media-renderer";
import { SectionRenderer } from "@/components/chapter/section-renderer";
import {
  LanguageToggle,
  type Language,
} from "@/components/learner/language-toggle";
import { useCharacterRepresentationNotice } from "@/components/learner/character-representation-provider";
import { resolveMediaUrl } from "@/lib/media/resolve-media-url";

type PagedLeaf = "text" | "video";

/**
 * Optional Hiligaynon fields from the database. When present they take
 * priority over the inline translations below.
 */
type ChapterTranslations = {
  titleHil?: string | null;
  subtitleHil?: string | null;
  summaryHil?: string | null;
};

type HilText = {
  title?: string;
  subtitle?: string;
  summary?: string;
};

/**
 * Inline Hiligaynon text. Key = chapter slug (chapter.id).
 * Chapters without an entry fall back to English.
 * Draft translations: have a Hiligaynon speaker review before publishing.
 */
const INLINE_HIL: Record<string, HilText> = {
  "tikum-kadlum": {
    subtitle: "Suguidanon (Epiko) sang Panay Libro I",
    summary:
      "Nagapangayam si Datu Paiburong upod sang iya utod nga si Dumaraog kag sang ila pambihira nga ido nga si Tikum Kadlum. Makapila ka beses nga ginatawag sang ido ang ila pagtalupangod sa isa ka pihak nga kawayan, apang indi naintindihan ni Paiburong ang pasidaan kag ginputol niya ini. Ang kawayan iya ni Makabagting, isa ka mapintas nga nagakaon sang tawo, kag sang iya utod nga ermitanya nga si Amburukay. Nagsulod si Paiburong sa teritoryo sang iban nga linalang kag ginguba niya ang butang nga indi iya. Pagkatapos sang pagpakigsabot, nagsugot ang mga tag-iya nga tanggapon ang mga anak ni Paiburong, si Matan-ayon kag Saranggaon, subong bayad-pinsala. Ginsulayan ni Paiburong kag ni Bulawanon nga itago ang mga bata nga babayi paagi sa pagpahid sang uling sa ila, apang nakita ni Makabagting ang paglimbong.",
  },
  "derikaryong-pada": {
    subtitle: "Suguidanon (Epiko) sang Panay Libro III",
    summary:
      "Antes pa matawo si Matan-ayon, gin-saaran na siya nga pangasawahon ni Labaw Donggon. Ang isa ka bulawan nga medalyon gintugyan subong tanda sang kasugtanan. Sang nag-edad na siya sang pag-asawa, ginapangita man siya ni Sinagnayan. Konektado siya kay Paglambuhan, nga nagkuha sang kabilin nga paraw sang mga ginikanan ni Matan-ayon. Ang pagbawi sang sakayan nangin kondisyon agod mapamatud-an sang isa ka manugpangulitawo ang iya katarungan nga mangasawa sa iya. Naipit si Labaw Donggon sa tunga sang una nga saad kag sang bag-o nga pagsulay. Ang pag-asawa diri indi lang pribado nga gugma: ginahiusa sini ang mga pamilya, manggad, dungog, mga kabilin nga butang, kag mga saad nga ginhimo antes pa mag-edad ang mga nahanungod nga tawo agod makahimo sang desisyon para sa ila kaugalingon.",
  },
  kalampay: {
    subtitle: "Suguidanon (Epiko) sang Panay Libro V",
    summary:
      "Si Masangladon, isa ka linalang nga may pambihira nga gahum nga may kaangtanan sa idalom nga kalibutan, nagahandum kay Matan-ayon. Ginbag-o niya ang isa ka kalampay, ukon alimango, nangin isla nga puno sang mga kahoy nga may bunga. Ginpabatyag kay Matan-ayon ang indi mapatas nga kainit kag nagkadto siya sa isla agod maligo. Samtang nagakuha sang bunga, indi niya hibaloan nga ginadala siya padulong sa panibyungan, ang tuburan sang tubig nga nagasulog sa idalom nga kalibutan. Ginpahibalo ni Taghuy si Labaw Donggon. Nagtinguha si Labaw kag Paubare nga magsunod sa iya sa idalom, apang ginpugngan sang dako nga alimango ang ila agi. Nagsisid si Katnub Magkaruan sa idalom sini kag nagbuhat sang bukas sa mga lutahan sini diin makaagi si Labaw Donggon. Indi madaug ni Labaw Donggon si Masangladon. Si Luyong Kabig, utod ni Laon Sina kag hukom sa idalom nga kalibutan, kinahanglan mamagitan sang kasugtanan nga nagapahanugot kay Matan-ayon nga makabalik.",
  },
  pahagunong: {
    subtitle: "Suguidanon (Epiko) sang Panay Libro IV",
    summary:
      "Nagapangayo si Labaw Donggon sang pagtugot sa iya mga asawa, si Matan-ayon kag si Padilagong Bulan, nga maglayag. Nagsugot si Matan-ayon, samtang si Padilagong Bulan nagapilit nga magduyog sa iya. Sang nagdumili siya, ginhatagan niya ini sang apog kag buyo nga ginhimo halin sa tul-an sang dako nga pawikan. Sang makakaon siya sini, nangin pawikan siya. Nagsunod si Matan-ayon kag ang iya utod nga si Paubare sa ginbag-o nga bantugan. Nakita ni Pahagunong si Matan-ayon nga naligo, nagpangandoy sa iya, kag nadaug niya si Paubare sa inaway. Wala magpabilin si Matan-ayon subong premyo nga walay kaya: ginbag-o niya ang iya kaugalingon nangin lalaki kag nagsulod sa inaway agod buligan ang iya utod. Sa katapusan, ginpahiuli ni Laon Sina si Labaw Donggon kag namagitan sa inaway.",
  },
  sinagnayan: {
    subtitle: "Suguidanon (Epiko) sang Panay Libro VI",
    summary:
      "Gin-aghat ni Matan-ayon si Labaw Donggon nga sukulon si Sinagnayan agod madala si Pinailog sa Pinggan—ang asawa ni Sinagnayan kag utod ni Matan-ayon—sa panimalay ni Labaw Donggon. Antes makaabot kay Sinagnayan, nakig-away si Labaw Donggon kay Sarandihon nga wala nila mahibaluan nga mga magutod sila. Namagitan si Laon Sina, ginpahayag ang ila kaangtanan, kag ginpaathag nga ang kusog sang kabuhi ni Sinagnayan natago sa kabhang sang isa ka itlog sa sulod sang tagiposoon sang isa ka leon nga ginabantayan sang iya iloy nga si Minayunmon. Ginbag-o ni Sarandihon ang iya kaugalingon nangin si Sinagnayan, gingamit ang isa ka mahika nga taghuy agod pahamtangon si Minayunmon, ginpatay ang leon, kag ginkuha ang kabhang sang itlog. Mapierde na dayon ni Labaw Donggon si Sinagnayan kag madala niya si Pinailog sa balay.",
  },
  "humadapnon-tarangban": {
    subtitle: "Suguidanon (Epiko) sang Panay Libro VIII, Bolyum 1",
    summary:
      "Ang Humadapnon amo ang pinakamahaba nga titulo sa serye kag nagakuha sang apat ka nalathala nga bolyum. Ang iya asoy nagasunod sa pagpangita ni Humadapnon sang nagakabagay nga asawa, sa iya pagpangulitawo kay Nagmalitong Yawa—nga kanunay ginatawag nga Mali—kag sa mga saad, pagpakigsangka, paghimulag, kag pagpasag-uli nga nagasunod. Indi lang si Mali ang babayi nga ginapangita ni Humadapnon. Sa sini nga mga yugto, nagabag-o siya sang iya dagway, nagahimo sang ritwal kag mahika nga mga buhat, nagaluwas kay Humadapnon, nagabulig sa iya sa pagdaug sa mga kaaway, nagahimo sang estratehiko nga mga desisyon, kag nagasabat sa pagpakaulaw kag pagtraidor.",
  },
  "humadapnon-pagbalukat-ka-biday": {
    subtitle: "Suguidanon (Epiko) sang Panay Libro VIII, Bolyum 2",
    summary:
      "Agod mapadayon ang iya pagpangulitawo, kinahanglan bawion ni Humadapnon ang kabilin nga sakayan nga nagaserbi subong tuos ni Mali, ukon tanda sang pagkasugot. Ang sakayan yara kay Paglambuhan. Nakig-away si Humadapnon kay Paglambuhan kag Sumagulong apang indi niya sila madaug nga wala sing buligan. Namagitan si Mali, ginlibang niya si Paglambuhan agod masugatan ni Humadapnon. Dayon ginapangayo sang kustombre nga magpabilin si Humadapnon upod sa asawa sang napierde. Sang nagdugay siya sang sobra sa ginhandum, nagselos si Mali. Ginkuha niya ang bulawan nga sakayan ni Humadapnon kag ang nabawi nga kabilin nga sakayan kag nagpanaw, ginbayaan siya sa isa ka bulawan nga bukag. Ginsulayan ni Taghuy nga pasag-uron sila. Sang ulihi ginhangkat ni Humadapnon ang amay ni Mali, apang ang pagsumpakil ginbag-o ang kahulugan subong pagsulay sang kusog sang manugpangulitawo.",
  },
  "humadapnon-hungaw": {
    subtitle: "Suguidanon (Epiko) sang Panay Libro VIII, Bolyum 3",
    summary:
      "Sang mabawi na ang biday nga nagaserbi subong tanda sang pagkasugot ni Mali, pormal nga ginpangayo ni Humadapnon ang iya kamot. May nagbangon nga una nga indi pagkaintindihan kay Labaw Donggon, apang ginsugata si Humadapnon sang mga paryente ni Mali. Ginhimo ang ila kasal kag gindaluhan sang mga ginatahod nga bisita. Ang bolyum nagahatag sang espesyal nga atensyon sa seremonya sang kasal nga hungaw kag sa pagsugata sang bisita, kaangtanan sang pamilya, pag-asawa, dungog, kag sa supernatural.",
  },
  "humadapnon-ginlawan": {
    subtitle: "Suguidanon (Epiko) sang Panay Libro VIII, Bolyum 4",
    summary:
      "Nagbalik sa dagat sanday Humadapnon kag Dumalapdap agod mangita sang nagakabagay nga mapangasawa para kay Dumalapdap. Sa ila pagkadto, nagaplano si Taghoy upod kanday Paglambuhan kag Sumagulong nga kuhaon si Mali kay Humadapnon. Ginpasugot ni Sumagulong ang mga paryente ni Mali nga tanggapon ang pagpares, kag nagsugod ang pagkaon sa kasal. Nagbalik si Humadapnon sa tunga sang selebrasyon, kag ang inaway nagdul-ong sa kamatayon ni Mali. May kaguol, ginpabalik niya siya sa kabuhi kag nagpangayo sang patawad kay Mali kag sa iya mga ginikanan. Apang ang pagbangon halin sa kamatayon wala nagpapas sang pagpakaulaw kag kaakig, kag naghimulag ang mag-asawa. Ang ginlawan nagapatuhoy sa publiko nga silot ukon pagsingil nga ginapahamtang kon ginlapas ang isa ka tuos.",
  },
  alayaw: {
    subtitle: "Suguidanon (Epiko) sang Panay Libro IX",
    summary:
      "Luyag makita ni Humadapnon si Mali, apang nakakulong siya sa burukutan sang iya pamilya. Ginsilingan ni Laon Sina si Humadapnon nga magtanom sang kahoy nga alayaw sa bakuran sang mga ginikanan ni Mali. Ginapaabot nga ang mahamot nga mga bulak sini magaakit kay Mali nga magguwa sa iya kulungan kag magkuha sang mga bulak, nga nagapahanugot kay Humadapnon nga makita ang babayi nga ginapangandoy niya nga pangulitawuhon. Ang mahamot nga kahoy nangin tagapamagitan nga nagalapas sang utlanan nga indi malapasan sang manugpangulitawo.",
  },
  nagbuhis: {
    subtitle: "Suguidanon (Epiko) sang Panay Libro X",
    summary:
      "Nagmasakit si Matan-ayon kag nangin tuman kapayat. Ginpatawag si Ginduluman agod himuon ang mga seremonya nga kinahanglanon sa iya pagkaayo. Luyag man ni Matan-ayon nga mas hingpit nga mapasulod si Mali sa kaalam sang ritwal agod mapanubli ni Mali ang mga gahum kag isa ka espiritu nga manugbantay. Sang magkadto ang komunidad sa baybayon para sa seremonya, ginpugngan ni Humadapnon si Mali nga magtambong. Sang ulihi nahibaluan niya nga nagapangulitawo si Humadapnon sa isa pa ka babayi nga nakakulong. Nagsabat si Mali paagi sa paglimbong kag mahika, nagbuhat sang isa ka ginmahika nga ulunan nga puli kag nagpanaw sa bulawan nga bukag samtang ang mahika nga puli nagapadayon sang pagpasundayag sa idalom.",
  },
  amburukay: {
    subtitle: "Suguidanon (Epiko) sang Panay Libro II",
    summary:
      "Ginpadaku ni Amburukay si Matan-ayon kag Saranggaon subong iya kaugalingon nga mga anak nga babayi, kag gintipigan niya sila sa isa ka bulawan nga lawak subong mga binukot. Nagsaad siya sang pambihira nga saad: ang iya ginpadaku nga mga anak magaasawa sa bisan sin-o nga makasarang sa pagpangawat sang iya bulawan nga bulbol. Kon maputol ang isa ka kuwerdas sang instrumento sa musika ni Labaw Donggon, nahibaluan niya nga ang buhok ni Amburukay mahimo nga ipuli sini. Gin-engkanto niya si Amburukay agod matulog kag ginputol ang buhok, apang nadiskobrehan niya nga ang pagkuha sini nagbugkos sa iya sa kondisyon ni Amburukay. Sa pagtuo nga kinahanglan niya pangasawahon ang makahadlok nga ermitanya mismo, nagapalapit siya sa kasal nga indi gusto. Apang imbes, ginpresentar ni Amburukay ang mga anak nga iya ginpadaku kag ginhukman niya nga takos si Labaw Donggon nga mangasawa sa ila.",
  },
  balanakon: {
    subtitle: "Suguidanon (Epiko) sang Panay Libro VII",
    summary:
      "Si Balanakon isa ka dalagangan, isa ka tawo nga may pambihira nga likas nga gahum. Gin-aghat siya ni Taghuy nga sumukol kay Labaw Donggon kag mangita kay Matan-ayon. Sa iya paglakat, gin-untat si Balanakon ni Sarandihon, ang utod ni Labaw Donggon, apang indi niya mapierde si Balanakon. Gintawag ni Taghuy si Labaw Donggon, apang bisan ang nagkaisa nga kusog sang mga magutod indi pa gihapon igo. Natapos lang ang inaway kon mamagitan si Laon Sina. Matuod ang gahum ni Balanakon, kag ang kadaugan indi makuha paagi sa kusog lang; kinahanglan may tagapamagitan nga may awtoridad nga magpahiuli sang kahusayan antes pa maguba sang inaway ang kaangtanan sang mga nagaaway.",
  },
};

interface StorybookSpreadProps {
  chapter: Chapter;
  chapterCompleted: boolean;
  nextChapterId: string | null;
  previousChapterId?: string | null;
  continueLabel?: string;
  turning?: boolean;
  layoutMode?: StorybookLayoutMode;
  spreadRef?: RefObject<HTMLDivElement | null>;
  /** Page-turn overlay rendered over the open book (Phase 2). */
  pageTurnOverlay?: ReactNode;
  /** Top-of-book chrome (All chapters / Chapter N of M). */
  chrome?: ReactNode;
  /** Fires once when the primary open spread has committed layout. */
  onSpreadReady?: () => void;
  onRequiredContentComplete?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onPostTest?: () => void;
}

function sectionHasRenderableMedia(
  section: AnimationSection | IllustrationSection | AudioSection,
  mediaAssets: MediaAsset[],
): boolean {
  const asset = mediaAssets.find((item) => item.id === section.mediaAssetId);
  return Boolean(asset && resolveMediaUrl(asset.storagePath));
}

/** Skip empty draft-like slots so unfinished chapters don’t open a second book. */
function sectionHasContinuationContent(
  section: ChapterSection,
  mediaAssets: MediaAsset[],
): boolean {
  switch (section.kind) {
    case "animation":
    case "illustration":
    case "audio":
      return sectionHasRenderableMedia(section, mediaAssets);
    case "introduction":
    case "story":
    case "cultural_context":
    case "activity":
      return Boolean(section.body.trim());
    case "characters":
      return section.characterIds.length > 0;
    case "learning_points":
      return true;
    case "completion":
      return false;
    default:
      return true;
  }
}

function chunkIntoPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let index = 0; index < items.length; index += 2) {
    pairs.push(items.slice(index, index + 2));
  }
  return pairs;
}

function partitionSections(
  sections: ChapterSection[],
  mediaAssets: MediaAsset[],
): {
  rightAnimation: AnimationSection | null;
  rightIllustration: IllustrationSection | null;
  continuationSections: ChapterSection[];
} {
  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
  const animations = sorted.filter(
    (section): section is AnimationSection => section.kind === "animation",
  );
  const illustrations = sorted.filter(
    (section): section is IllustrationSection =>
      section.kind === "illustration",
  );

  const playableAnimations = animations.filter((section) =>
    sectionHasRenderableMedia(section, mediaAssets),
  );
  const playableIllustrations = illustrations.filter((section) =>
    sectionHasRenderableMedia(section, mediaAssets),
  );

  const rightAnimation = playableAnimations[0] ?? null;
  const rightIllustration =
    !rightAnimation && playableIllustrations[0]
      ? playableIllustrations[0]
      : null;
  const rightIllustrationId = rightIllustration?.id ?? null;

  const continuationSections = sorted.filter((section) => {
    if (section.kind === "completion") {
      return false;
    }
    if (section.kind === "animation") {
      return false;
    }
    if (section.kind === "illustration") {
      if (rightAnimation) {
        return false;
      }
      if (section.id === rightIllustrationId) {
        return false;
      }
    }
    return sectionHasContinuationContent(section, mediaAssets);
  });

  return {
    rightAnimation,
    rightIllustration,
    continuationSections,
  };
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const LEAF_TURN_MS = 560;
const LEAF_TURN_REDUCED_MS = 240;

const continuationPageLeft =
  "sb-page space-y-4 border-b border-[color:rgba(44,36,22,0.08)] px-5 py-6 sm:px-7 sm:py-8 md:border-b-0 md:border-r md:border-[color:rgba(44,36,22,0.06)] md:pr-8 lg:pr-9";

const continuationPageRight =
  "sb-page space-y-4 px-5 py-6 sm:px-7 sm:py-8 md:pl-8 lg:pl-9";

const pageChrome =
  "sb-page sb-page--fixed border-b border-[color:rgba(44,36,22,0.08)] px-4 py-4 sm:px-5 sm:py-5 md:border-b-0 md:border-r md:border-[color:rgba(44,36,22,0.06)] md:pr-6 lg:px-6 lg:py-5 lg:pr-7";

const pageChromeRight =
  "sb-page sb-page--fixed px-2 py-3 sm:px-2.5 sm:py-4 md:pl-3 lg:px-2.5 lg:py-4 lg:pl-3";

const pageChromePaged =
  "sb-page sb-page--fixed sb-page--paged-scroll px-4 py-4 sm:px-5 sm:py-5";

/**
 * Open storybook: fixed primary frame (summary | animation-or-illustration)
 * with in-page prev/next footers. Additional sections continue below.
 * Paged mode shows one leaf at a time with a CSS page-turn.
 */
export function StorybookSpread({
  chapter,
  chapterCompleted,
  nextChapterId,
  previousChapterId = null,
  continueLabel = "Continue to next chapter",
  turning = false,
  layoutMode: layoutModeProp,
  spreadRef,
  pageTurnOverlay = null,
  chrome = null,
  onSpreadReady,
  onRequiredContentComplete,
  onPrevious,
  onNext,
  onPostTest,
}: StorybookSpreadProps) {
  const detectedMode = useStorybookLayoutMode();
  const layoutMode = layoutModeProp ?? detectedMode;
  const { shortText: characterRepresentationShort } =
    useCharacterRepresentationNotice();
  const { rightAnimation, rightIllustration, continuationSections } =
    partitionSections(chapter.sections, chapter.media);
  const continuationSpreads = chunkIntoPairs(continuationSections);
  const openCompleteFired = useRef(false);
  const readyFired = useRef(false);
  const localRootRef = useRef<HTMLDivElement | null>(null);
  const paged = layoutMode === "paged";

  // Language toggle (English / Hiligaynon)
  const [language, setLanguage] = useState<Language>("en");
  const translations = chapter as Chapter & ChapterTranslations;
  const inlineHil: HilText | undefined = INLINE_HIL[chapter.id];
  const isHil = language === "hil";
  const displayTitle =
    (isHil && (translations.titleHil?.trim() || inlineHil?.title)) ||
    chapter.title;
  const displaySubtitle =
    (isHil && (translations.subtitleHil?.trim() || inlineHil?.subtitle)) ||
    chapter.subtitle;
  const displaySummary =
    (isHil && (translations.summaryHil?.trim() || inlineHil?.summary)) ||
    chapter.summary;
  const aboutLabel = "About this chapter";

  const setRootRef = (node: HTMLDivElement | null) => {
    localRootRef.current = node;
    if (!spreadRef) {
      return;
    }
    if (typeof spreadRef === "object") {
      spreadRef.current = node;
    }
  };

  const [leaf, setLeaf] = useState<PagedLeaf>("text");
  const [leafTurn, setLeafTurn] = useState<{
    direction: "forward" | "back";
    active: boolean;
    reduced: boolean;
  } | null>(null);
  const leafTurnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingLeaf = useRef<PagedLeaf | null>(null);

  useEffect(() => {
    setLeaf("text");
    setLeafTurn(null);
    pendingLeaf.current = null;
    readyFired.current = false;
    openCompleteFired.current = false;
  }, [chapter.id]);

  useLayoutEffect(() => {
    if (!onSpreadReady || readyFired.current) {
      return;
    }

    const notifyReady = onSpreadReady;
    let cancelled = false;
    let attempts = 0;

    function checkReady() {
      if (cancelled || readyFired.current) {
        return;
      }
      const root = localRootRef.current;
      const frame = root?.querySelector(".sb-frame");
      const title = root?.querySelector(".sb-page h1");
      const rightChrome = root?.querySelector(".sb-media-host, .sb-page-nav");
      const frameWidth = frame?.getBoundingClientRect().width ?? 0;
      if (frame && frameWidth > 0 && title && rightChrome) {
        readyFired.current = true;
        notifyReady();
        return;
      }
      attempts += 1;
      if (attempts < 45) {
        window.requestAnimationFrame(checkReady);
      } else {
        // Layout should have settled; avoid blocking the turn forever.
        readyFired.current = true;
        notifyReady();
      }
    }

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(checkReady);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [chapter.id, onSpreadReady, layoutMode, leaf]);

  useEffect(() => {
    return () => {
      if (leafTurnTimer.current) {
        clearTimeout(leafTurnTimer.current);
      }
    };
  }, []);

  // Opening the book (summary visible) is enough to unlock Continue.
  useEffect(() => {
    if (chapterCompleted || openCompleteFired.current) {
      return;
    }
    openCompleteFired.current = true;
    onRequiredContentComplete?.();
  }, [chapterCompleted, onRequiredContentComplete]);

  useLayoutEffect(() => {
    if (!leafTurn || leafTurn.active) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      setLeafTurn((current) =>
        current ? { ...current, active: true } : current,
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [leafTurn]);

  function finishLeafTurn() {
    if (pendingLeaf.current) {
      setLeaf(pendingLeaf.current);
      pendingLeaf.current = null;
    }
    setLeafTurn(null);
    if (leafTurnTimer.current) {
      clearTimeout(leafTurnTimer.current);
      leafTurnTimer.current = null;
    }
  }

  function goToLeaf(next: PagedLeaf, direction: "forward" | "back") {
    if (turning || leafTurn || next === leaf) {
      return;
    }

    const reduced = prefersReducedMotion();
    pendingLeaf.current = next;
    setLeafTurn({ direction, active: false, reduced });
    leafTurnTimer.current = setTimeout(
      () => {
        finishLeafTurn();
      },
      reduced ? LEAF_TURN_REDUCED_MS : LEAF_TURN_MS,
    );
  }

  function handleLeafTurnEnd(event: TransitionEvent<HTMLDivElement>) {
    if (!leafTurn) {
      return;
    }
    if (
      event.propertyName !== "transform" &&
      event.propertyName !== "opacity"
    ) {
      return;
    }
    finishLeafTurn();
  }

  function renderSection(section: ChapterSection) {
    return (
      <section key={section.id}>
        <SectionRenderer
          section={section}
          mediaAssets={chapter.media}
          characters={chapter.characters}
          learningPoints={chapter.learningPoints}
          chapterId={chapter.id}
          chapterTitle={chapter.title}
          context="learner"
          chapterCompleted={chapterCompleted}
          nextChapterId={nextChapterId}
        />
      </section>
    );
  }

  function renderRightMedia() {
    if (rightAnimation) {
      const asset = chapter.media.find(
        (item) => item.id === rightAnimation.mediaAssetId,
      );
      return (
        <div className="sb-media-slot">
          <div className="sb-media-slot-fill">
            <MediaRenderer
              asset={asset}
              kind="animation"
              emptyMessage="Animation not available yet."
            />
          </div>
        </div>
      );
    }

    if (rightIllustration) {
      const asset = chapter.media.find(
        (item) => item.id === rightIllustration.mediaAssetId,
      );
      return (
        <div className="sb-media-slot">
          <div className="sb-media-slot-fill">
            <MediaRenderer
              asset={asset}
              kind="illustration"
              emptyMessage="Illustration not available yet."
            />
          </div>
        </div>
      );
    }

    return (
      <div className="sb-media-slot">
        <div className="sb-media-slot-empty">Animation not available yet.</div>
      </div>
    );
  }

  function handleContinue() {
    if (turning) {
      return;
    }
    if (nextChapterId) {
      onNext?.();
      return;
    }
    onPostTest?.();
  }

  const navBusy = turning || Boolean(leafTurn);
  const busyClass = navBusy ? " is-busy" : "";
  const continueBusyLabel = leafTurn ? "Turning…" : "Opening…";

  // PANEL-B05 / PANEL-B06 / PANEL-B07 — Left page: title, About summary, notice
  const textPage = (
    <div className={`${paged ? pageChromePaged : pageChrome} gap-2`}>
      {/*
        Top-align (no justify-center): centered + overflow-y clips the title on short
        laptop viewports. Only the summary scrolls so the title stays fully visible.
      */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
        {/* Language toggle (English / Hiligaynon) */}
        <div className="flex shrink-0 justify-end">
          <LanguageToggle value={language} onChange={setLanguage} />
        </div>

        {/* PANEL-B05 — Chapter title + subtitle (CMS/chapter data) */}
        <div className="shrink-0 space-y-1.5 pt-0.5 sm:space-y-2">
          <h1 className="font-display text-xl font-semibold leading-[1.15] tracking-tight text-sl-navy sm:text-2xl lg:text-3xl">
            {displayTitle}
          </h1>
          {displaySubtitle ? (
            <p className="text-xs text-sl-ink-muted sm:text-sm lg:text-base">
              {displaySubtitle}
            </p>
          ) : null}
        </div>

        {displaySummary ? (
          // PANEL-B06 — “About this chapter” + scrollable summary body
          <div className="flex min-h-0 flex-1 flex-col gap-2 border-t border-[color:rgba(44,36,22,0.1)] pt-3 sm:pt-4">
            <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-sl-navy">
              {aboutLabel}
            </p>
            <ChapterSummaryExpandable summary={displaySummary} fixedPage />
          </div>
        ) : null}

        {/* PANEL-B07 — Character representation short notice (admin-editable) */}
        <p className="shrink-0 text-[0.7rem] leading-snug text-sl-ink-muted/80 sm:text-xs">
          {characterRepresentationShort}
        </p>
      </div>

      {/* PANEL-B09 — Page / chapter navigation buttons (prev, next, continue) */}
      {paged ? (
        <div className="sb-page-nav sb-page-nav--paged sb-page-nav--paged-end shrink-0 pt-2">
          <button
            type="button"
            disabled={navBusy}
            aria-busy={navBusy}
            onClick={() => goToLeaf("video", "forward")}
            className={`sb-nav-btn sb-nav-btn--next${busyClass}`}
          >
            {navBusy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Turning…
              </>
            ) : (
              <>
                Next Page
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="sb-page-nav sb-page-nav--prev shrink-0 pt-2">
          {previousChapterId ? (
            <button
              type="button"
              disabled={turning}
              aria-busy={turning}
              onClick={onPrevious}
              className={`sb-nav-btn sb-nav-btn--prev${turning ? " is-busy" : ""}`}
            >
              {turning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {turning ? "Opening…" : "Previous Chapter"}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );

  // PANEL-B08 / PANEL-B09 — Right page: media + continue / page-turn nav
  const videoPage = (
    <div className={`${paged ? pageChromePaged : pageChromeRight} gap-1.5 sm:gap-2`}>
      {/* PANEL-B08 — Animation / illustration / video slot */}
      <div className="sb-media-host flex min-h-0 flex-1 items-center justify-center">
        {renderRightMedia()}
      </div>

      {paged ? (
        <div className="sb-page-nav sb-page-nav--paged sb-page-nav--paged-split shrink-0 pt-2">
          <button
            type="button"
            disabled={navBusy}
            aria-busy={navBusy}
            onClick={() => goToLeaf("text", "back")}
            className={`sb-nav-btn sb-nav-btn--prev${busyClass}`}
          >
            {navBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {navBusy ? "Turning…" : "Previous Page"}
          </button>
          <button
            type="button"
            disabled={navBusy}
            aria-busy={navBusy}
            onClick={handleContinue}
            className={`sb-nav-btn sb-nav-btn--next${chapterCompleted && !navBusy ? " is-ready" : ""}${busyClass}`}
          >
            {navBusy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                {continueBusyLabel}
              </>
            ) : (
              <>
                {continueLabel}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="sb-page-nav sb-page-nav--next shrink-0 pt-2">
          <button
            type="button"
            disabled={turning}
            aria-busy={turning}
            onClick={handleContinue}
            className={`sb-nav-btn sb-nav-btn--next${chapterCompleted && !turning ? " is-ready" : ""}${turning ? " is-busy" : ""}`}
          >
            {turning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                {continueBusyLabel}
              </>
            ) : (
              <>
                {continueLabel}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  const frameClass = paged
    ? `sb-spread-shell sb-spread-shell--primary sb-frame sb-frame--paged${navBusy ? " is-busy" : ""}`
    : `sb-spread-shell sb-spread-shell--primary sb-frame${navBusy ? " is-busy" : ""}`;

  const spreadClass = paged
    ? "sb-spread sb-spread--fixed sb-spread--paged"
    : "sb-spread sb-spread--fixed";

  return (
    <div
      className="w-full"
      ref={setRootRef}
      tabIndex={-1}
      aria-label={`${chapter.title} chapter content`}
    >
      <div
        className={`sb-book-shell sb-book-shell--open${paged ? " sb-book-shell--paged" : ""}`}
      >
        <div className={frameClass}>
          {chrome ? (
            <div className="sb-book-chrome sb-book-chrome--internal">{chrome}</div>
          ) : null}
          <div className={spreadClass}>
            <div className="sb-spine" aria-hidden="true" />
            <div className="sb-spread-grid">
              {paged ? (leaf === "text" ? textPage : videoPage) : null}
              {!paged ? (
                <>
                  {textPage}
                  {videoPage}
                </>
              ) : null}
            </div>

            {leafTurn ? (
              <div
                className={`sb-leaf-turn-root${leafTurn.active ? " is-turning" : ""} ${
                  leafTurn.direction === "forward" ? "is-forward" : "is-back"
                }${leafTurn.reduced ? " sb-leaf-turn-reduced" : ""}`}
                onTransitionEnd={handleLeafTurnEnd}
                aria-hidden="true"
              >
                <div className="sb-leaf-turn-leaf" />
              </div>
            ) : null}
          </div>
          {pageTurnOverlay}
        </div>
      </div>

      {continuationSpreads.map((pair, spreadIndex) => (
        <div
          key={`continuation-${spreadIndex}-${pair[0]?.id ?? "empty"}`}
          className="sb-spread-shell mt-6 sm:mt-8"
        >
          <div className="sb-spread">
            <div className="sb-spine" aria-hidden="true" />
            <div className="grid gap-0 md:grid-cols-2">
              <div className={continuationPageLeft}>
                {renderSection(pair[0])}
              </div>
              {pair[1] ? (
                <div className={continuationPageRight}>
                  {renderSection(pair[1])}
                </div>
              ) : (
                <div
                  className={`${continuationPageRight} hidden min-h-[8rem] md:block`}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
