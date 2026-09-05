"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { MoreHorizontal } from "lucide-react";

export type AdminTableActionItem =
  | {
      type: "link";
      label: string;
      href: string;
      icon?: ReactNode;
    }
  | {
      type: "button";
      label: string;
      onClick: () => void;
      icon?: ReactNode;
      disabled?: boolean;
    };

interface AdminTableActionsMenuProps {
  /** Accessible name for the row, e.g. chapter title */
  label: string;
  items: AdminTableActionItem[];
  disabled?: boolean;
}

const itemClassName =
  "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted disabled:opacity-40";

const singleActionClassName =
  "inline-flex min-h-10 items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40";

function renderActionContent(item: AdminTableActionItem) {
  return (
    <>
      {item.icon}
      {item.label}
    </>
  );
}

/**
 * Ellipsis actions menu for admin tables.
 * Uses fixed positioning so menus are not clipped by overflow-x table wrappers.
 * Renders a single inline control when there is only one action.
 */
export function AdminTableActionsMenu({
  label,
  items,
  disabled = false,
}: AdminTableActionsMenuProps) {
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setMenuStyle(null);
      return;
    }

    function updatePosition() {
      const button = buttonRef.current;
      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      const menuWidth = 168;
      const estimatedHeight = items.length * 40 + 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < estimatedHeight + 12;
      const right = Math.max(8, window.innerWidth - rect.right);

      if (openUpward) {
        setMenuStyle({
          position: "fixed",
          right,
          bottom: window.innerHeight - rect.top + 4,
          width: menuWidth,
          zIndex: 60,
        });
      } else {
        setMenuStyle({
          position: "fixed",
          right,
          top: rect.bottom + 4,
          width: menuWidth,
          zIndex: 60,
        });
      }
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, items.length]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    const item = items[0];
    if (item.type === "link") {
      return (
        <Link href={item.href} className={singleActionClassName}>
          {renderActionContent(item)}
        </Link>
      );
    }

    return (
      <button
        type="button"
        disabled={disabled || item.disabled}
        onClick={item.onClick}
        className={singleActionClassName}
      >
        {renderActionContent(item)}
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions for ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && menuStyle ? (
        <div
          id={menuId}
          role="menu"
          aria-label={`${label} actions`}
          style={menuStyle}
          className="overflow-hidden rounded-md border bg-card py-1 shadow-md"
        >
          {items.map((item) =>
            item.type === "link" ? (
              <Link
                key={`${item.label}-${item.href}`}
                role="menuitem"
                href={item.href}
                className={itemClassName}
                onClick={() => setOpen(false)}
              >
                {renderActionContent(item)}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={disabled || item.disabled}
                className={itemClassName}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
              >
                {renderActionContent(item)}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
