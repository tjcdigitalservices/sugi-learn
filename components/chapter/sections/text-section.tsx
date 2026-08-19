import type { TextSection } from "@/types/chapter";

import { SectionEmptyState } from "@/components/chapter/sections/section-empty-state";

interface TextSectionViewProps {
  section: TextSection;
}

function renderBody(body: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return null;
  }

  return paragraphs.map((paragraph, index) => (
    <p key={index} className="leading-relaxed text-foreground/90">
      {paragraph.split("\n").map((line, lineIndex) => (
        <span key={lineIndex}>
          {lineIndex > 0 ? <br /> : null}
          {line}
        </span>
      ))}
    </p>
  ));
}

export function TextSectionView({ section }: TextSectionViewProps) {
  const bodyContent = renderBody(section.body);

  return (
    <article className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {section.title}
      </h2>
      {bodyContent ? (
        <div className="space-y-4 text-base sm:text-[1.05rem]">{bodyContent}</div>
      ) : (
        <SectionEmptyState message="Content for this section is not available yet." />
      )}
    </article>
  );
}
