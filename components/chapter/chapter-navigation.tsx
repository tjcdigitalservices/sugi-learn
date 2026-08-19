import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ChapterNavigation } from "@/lib/domain/chapter-navigation";

interface ChapterNavigationProps {
  navigation: ChapterNavigation;
}

export function ChapterNavigationBar({ navigation }: ChapterNavigationProps) {
  return (
    <nav
      aria-label="Chapter navigation"
      className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 flex-1">
        {navigation.previous ? (
          <Link
            href={`/learn/chapters/${navigation.previous.id}`}
            className="inline-flex max-w-full items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">
              <span className="block text-xs font-normal text-muted-foreground">
                Previous
              </span>
              {navigation.previous.number}. {navigation.previous.title}
            </span>
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">This is the first chapter.</p>
        )}
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        Chapter {navigation.position} of {navigation.total}
      </p>

      <div className="min-w-0 flex-1 sm:text-right">
        {navigation.next ? (
          <Link
            href={`/learn/chapters/${navigation.next.id}`}
            className="inline-flex max-w-full items-center justify-end gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:ml-auto"
          >
            <span className="truncate text-left sm:text-right">
              <span className="block text-xs font-normal text-muted-foreground">
                Next
              </span>
              {navigation.next.number}. {navigation.next.title}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground sm:text-right">
            This is the last chapter.
          </p>
        )}
      </div>
    </nav>
  );
}
