"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BusyButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** True while an async action or navigation is in progress. */
  busy?: boolean;
  /** Label shown while busy. Defaults to the idle children when omitted. */
  busyLabel?: ReactNode;
  /** Idle-state trailing icon (hidden while busy). */
  trailingIcon?: ReactNode;
  /** Idle-state leading icon (replaced by spinner while busy). */
  leadingIcon?: ReactNode;
}

/**
 * Shared button loading pattern: spinner + aria-busy + cursor wait
 * for the full duration of the async work. Use on any click that waits
 * on the network or navigation — not on instant toggles.
 */
export function BusyButton({
  busy = false,
  busyLabel,
  trailingIcon,
  leadingIcon,
  children,
  className,
  disabled,
  type = "button",
  ...props
}: BusyButtonProps) {
  const isDisabled = Boolean(disabled || busy);

  return (
    <button
      type={type}
      aria-busy={busy || undefined}
      disabled={isDisabled}
      className={cn(busy && "cursor-wait disabled:cursor-wait", className)}
      {...props}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        leadingIcon
      )}
      {busy && busyLabel != null ? busyLabel : children}
      {!busy ? trailingIcon : null}
    </button>
  );
}
