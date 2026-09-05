import { StorybookTransitionProvider } from "@/components/chapter/storybook/storybook-transition-provider";

/**
 * Persists across [chapterId] navigations so storybook page-turns can
 * hold the book UI while the destination chapter loads.
 */
export default function LearnChaptersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StorybookTransitionProvider>{children}</StorybookTransitionProvider>;
}
