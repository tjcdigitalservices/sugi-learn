import { cn } from "@/lib/utils";

interface FormFeedbackProps {
  error?: string | null;
  success?: string | null;
  className?: string;
}

export function FormFeedback({ error, success, className }: FormFeedbackProps) {
  if (!error && !success) {
    return null;
  }

  return (
    <div className={cn("text-sm", className)} role="status" aria-live="polite">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
          {success}
        </p>
      ) : null}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-sl-ink">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-sl-ink-muted">{hint}</p> : null}
    </div>
  );
}

export const formControlClassName =
  "w-full rounded-xl border border-[color:rgba(44,36,22,0.15)] bg-white px-4 py-2.5 text-sm text-[var(--sl-ink)] shadow-sm outline-none transition focus-visible:border-[var(--sl-gold)] focus-visible:shadow-[0_0_0_3px_rgba(209,165,58,0.25)]";

export const buttonPrimaryClassName =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[var(--sl-gold-bright)] to-[var(--sl-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--sl-navy)] shadow-[0_2px_8px_rgba(11,29,58,0.18)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sl-gold-bright)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonSecondaryClassName =
  "inline-flex items-center justify-center rounded-full border border-[color:rgba(44,36,22,0.15)] bg-white px-5 py-2.5 text-sm font-medium text-sl-ink transition-colors hover:bg-[var(--sl-cream-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sl-gold)] disabled:cursor-not-allowed disabled:opacity-60";

export const buttonDangerClassName =
  "inline-flex items-center justify-center rounded-full border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";


