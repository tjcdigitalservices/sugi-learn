"use client";

export type Language = "en" | "hil";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hil", label: "Hiligaynon" },
];

type LanguageToggleProps = {
  value: Language;
  onChange: (language: Language) => void;
  className?: string;
};

export function LanguageToggle({
  value,
  onChange,
  className = "",
}: LanguageToggleProps) {
  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-full border border-[color:rgba(44,36,22,0.12)] bg-white p-1 shadow-sm ${className}`}
    >
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors sm:px-4 sm:py-1.5 sm:text-sm ${
              active
                ? "bg-sl-navy text-white"
                : "text-sl-ink-muted hover:text-sl-navy"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}