interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="space-y-2">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sl-gold">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-display text-3xl font-semibold tracking-tight text-sl-navy">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-sl-ink-muted">
          {description}
        </p>
      ) : null}
    </header>
  );
}
