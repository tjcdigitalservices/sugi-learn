import Link from "next/link";

interface SaveProgressPromptProps {
  /** Show only for anonymous/guest sessions. */
  visible: boolean;
}

/** Soft CTA for guests to upgrade to a permanent account. */
export function SaveProgressPrompt({ visible }: SaveProgressPromptProps) {
  if (!visible) {
    return null;
  }

  return (
    <aside className="rounded-xl border border-[color:rgba(198,161,91,0.45)] bg-[color:rgba(240,212,138,0.18)] px-5 py-4 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sl-navy/70">
        Save your progress
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-sl-ink">
        You&apos;re learning as a guest. Create an account so you can return on
        another device and continue chapters without retaking the Pre-Test.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link href="/register" className="sl-btn-gold text-sm">
          Create account
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full border border-[color:rgba(44,36,22,0.15)] px-5 py-2.5 text-sm font-medium text-sl-ink transition hover:bg-white"
        >
          Sign in
        </Link>
      </div>
    </aside>
  );
}
