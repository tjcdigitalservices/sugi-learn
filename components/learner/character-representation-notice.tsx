"use client";

import { Info } from "lucide-react";

import { useCharacterRepresentationNotice } from "@/components/learner/character-representation-provider";

/**
 * Always-visible cultural/informational notice for character artwork.
 * Copy is admin-editable; defaults come from approved source wording.
 */
export function CharacterRepresentationNotice() {
  const { title, body } = useCharacterRepresentationNotice();

  return (
    <aside
      className="rounded-md border border-[color:rgba(44,36,22,0.12)] bg-[color:rgba(251,246,239,0.9)]"
      aria-label={title}
    >
      <div className="flex items-start gap-2 px-3.5 py-2.5 text-sm text-sl-navy">
        <Info
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sl-ink-muted"
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-2">
          <p className="font-medium tracking-tight">{title}</p>
          <p className="max-w-3xl text-sm leading-relaxed text-sl-ink-muted">
            {body}
          </p>
        </div>
      </div>
    </aside>
  );
}
