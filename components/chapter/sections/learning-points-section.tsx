import type { LearningPointsSection, LearningPoint } from "@/types/chapter";

import { SectionEmptyState } from "@/components/chapter/sections/section-empty-state";

interface LearningPointsSectionViewProps {
  section: LearningPointsSection;
  learningPoints: LearningPoint[];
}

export function LearningPointsSectionView({
  section,
  learningPoints,
}: LearningPointsSectionViewProps) {
  const points = section.learningPointIds
    .map((id) => learningPoints.find((point) => point.id === id))
    .filter((point): point is LearningPoint => Boolean(point));

  return (
    <article className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {section.title}
      </h2>

      {points.length === 0 ? (
        <SectionEmptyState message="Learning points are not available yet." />
      ) : (
        <ul className="space-y-3">
          {points.map((point) => (
            <li
              key={point.id}
              className="rounded-lg border border-l-4 border-l-primary/30 bg-muted/10 px-4 py-3"
            >
              {point.title ? (
                <h3 className="font-medium">{point.title}</h3>
              ) : null}
              <p
                className={
                  point.title
                    ? "mt-1 text-sm leading-relaxed text-muted-foreground"
                    : "text-sm leading-relaxed text-foreground/90"
                }
              >
                {point.text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
