import { CharacterRepresentationProvider } from "@/components/learner/character-representation-provider";
import { StorybookTransitionProvider } from "@/components/chapter/storybook/storybook-transition-provider";
import { DEFAULT_CHARACTER_REPRESENTATION_NOTICE } from "@/lib/content/character-representation";
import { getCharacterRepresentationNotice } from "@/lib/domain/site-notices";

/**
 * Persists across [chapterId] navigations so storybook page-turns can
 * hold the book UI while the destination chapter loads.
 * Also provides admin-editable character representation copy to learner UI.
 */
export default async function LearnChaptersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let notice = DEFAULT_CHARACTER_REPRESENTATION_NOTICE;

  try {
    notice = await getCharacterRepresentationNotice();
  } catch {
    // Keep approved defaults if the notice store is unavailable.
  }

  return (
    <CharacterRepresentationProvider value={notice}>
      <StorybookTransitionProvider>{children}</StorybookTransitionProvider>
    </CharacterRepresentationProvider>
  );
}
