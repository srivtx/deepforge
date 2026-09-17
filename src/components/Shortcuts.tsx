"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/** Two-key sequences stay armed for this long after the first key. */
export const SEQUENCE_TIMEOUT_MS = 1000;

/** The key that toggles the help overlay. */
export const HELP_KEY = "?";

export interface ShortcutRoute {
  keys: string;
  sequence: readonly [string, string];
  href: string;
  label: string;
}

/**
 * The navigation table. `SHORTCUT_ROUTES` is the single source of truth for
 * both the keydown resolver and the help overlay, so a route can never be
 * documented in one place and handled in another.
 */
export const SHORTCUT_ROUTES: readonly ShortcutRoute[] = [
  { keys: "g p", sequence: ["g", "p"], href: "/problems", label: "Problems" },
  { keys: "g t", sequence: ["g", "t"], href: "/today", label: "Today" },
  {
    keys: "g l",
    sequence: ["g", "l"],
    href: "/leaderboard",
    label: "Leaderboard",
  },
  { keys: "g s", sequence: ["g", "s"], href: "/stats", label: "Stats" },
  { keys: "g b", sequence: ["g", "b"], href: "/badges", label: "Badges" },
  { keys: "g h", sequence: ["g", "h"], href: "/", label: "Home" },
];

/**
 * The command palette marks itself open by rendering this node (see
 * `CommandPalette.tsx`), so its presence in the DOM is the coordination
 * signal — no edits to the palette are needed. Every other modal marks
 * itself the same way, which keeps single-key navigation off while any
 * overlay owns the page.
 */
export const MODAL_DIALOG_SELECTOR = '[role="dialog"][aria-modal="true"]';

export interface KeyPress {
  key: string;
  at: number;
}

export type SequenceOutcome =
  | { kind: "navigate"; route: ShortcutRoute }
  | { kind: "pending" }
  | { kind: "cancel" }
  | { kind: "none" };

export interface TargetLike {
  tagName?: string | null;
  isContentEditable?: boolean | null;
}

export interface ModifierFlags {
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  /** Shift is allowed — `?` needs it — and is never treated as blocking. */
  shiftKey?: boolean;
}

/** Single-character keys are matched case-insensitively; named keys as-is. */
export function normalizeKey(key: string): string {
  return key.length === 1 ? key.toLowerCase() : key;
}

/** Look up the route for a first + second key pair, order-sensitive. */
export function findRoute(
  prefix: string,
  key: string,
): ShortcutRoute | undefined {
  const first = normalizeKey(prefix);
  const second = normalizeKey(key);
  return SHORTCUT_ROUTES.find(
    (route) => route.sequence[0] === first && route.sequence[1] === second,
  );
}

/**
 * Pure resolver for the two-key buffer. Takes the last one or two presses
 * and decides what should happen; the caller owns the buffer and timers.
 *
 * - `[g]` → pending
 * - `[g, p]` inside the window → navigate
 * - `[g, p]` after the window → none (the sequence expired)
 * - `[g, Escape]` or `[g, x]` → cancel
 */
export function resolveSequence(
  presses: readonly KeyPress[],
  timeoutMs: number = SEQUENCE_TIMEOUT_MS,
): SequenceOutcome {
  if (presses.length === 0) return { kind: "none" };
  const last = presses[presses.length - 1];
  if (last.key === "Escape") return { kind: "cancel" };
  if (presses.length >= 2) {
    const previous = presses[presses.length - 2];
    if (last.at - previous.at > timeoutMs) return { kind: "none" };
    const route = findRoute(previous.key, last.key);
    return route ? { kind: "navigate", route } : { kind: "cancel" };
  }
  return normalizeKey(last.key) === "g" ? { kind: "pending" } : { kind: "none" };
}

/**
 * True when the event target is a text surface: typing there must never be
 * hijacked by shortcuts. `isContentEditable` already accounts for targets
 * nested inside a contenteditable ancestor.
 */
export function shouldIgnoreTarget(
  target: TargetLike | null | undefined,
): boolean {
  if (!target) return false;
  if (target.isContentEditable === true) return true;
  const tag = (target.tagName ?? "").toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select";
}

/** Cmd/Ctrl/Alt combos belong to the OS, the browser, or the palette. */
export function hasModifier(flags: ModifierFlags | null | undefined): boolean {
  if (!flags) return false;
  return (
    flags.metaKey === true || flags.ctrlKey === true || flags.altKey === true
  );
}

/** True while a modal dialog (the command palette included) is mounted. */
export function isDialogOpen(
  root: ParentNode | null | undefined,
  selector: string = MODAL_DIALOG_SELECTOR,
): boolean {
  if (!root) return false;
  return root.querySelector(selector) !== null;
}

const KBD_CLASS =
  "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-hairline bg-canvas-soft px-1.5 font-mono text-[11px] text-ink";

/**
 * Global keyboard layer, mounted once from the root layout. Implements the
 * `g`-then-key navigation sequences and the `?` help overlay. The palette's
 * Cmd/Ctrl+K binding is deliberately never touched here.
 */
export function Shortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const pending = useRef<KeyPress[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const closeHelp = useCallback(() => setHelpOpen(false), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      if (hasModifier(event)) return;
      const target = event.target;
      if (target instanceof HTMLElement && shouldIgnoreTarget(target)) return;

      const key = event.key;

      if (helpOpen) {
        if (key === "Escape" || key === HELP_KEY) {
          event.preventDefault();
          closeHelp();
        }
        return;
      }

      if (key === HELP_KEY) {
        if (isDialogOpen(document)) return;
        event.preventDefault();
        pending.current = [];
        setHelpOpen(true);
        return;
      }

      if (isDialogOpen(document)) return;

      const at = Date.now();
      const previous = pending.current[pending.current.length - 1];
      const next =
        previous && at - previous.at <= SEQUENCE_TIMEOUT_MS
          ? [...pending.current, { key, at }]
          : [{ key, at }];
      const outcome = resolveSequence(next.slice(-2));
      if (outcome.kind === "navigate") {
        event.preventDefault();
        pending.current = [];
        router.push(outcome.route.href);
      } else if (outcome.kind === "pending") {
        pending.current = [{ key, at }];
      } else {
        pending.current = [];
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [helpOpen, closeHelp, router]);

  useEffect(() => {
    if (!helpOpen) return;
    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      const el = previouslyFocused.current;
      if (el && el.isConnected) el.focus();
    };
  }, [helpOpen]);

  // Lite focus trap: Tab cycles through the overlay's links and close button
  // instead of escaping into the inert page behind it.
  const trapTab = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const focusable = Array.from(
      root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    ).filter((el) => el.getClientRects().length > 0);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey) {
      if (active === first || active === root || !root.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || active === root || !root.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      {helpOpen && (
        <div
          className="df-fade-in fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-canvas/60 px-3 pb-8 pt-[10vh] backdrop-blur-sm"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeHelp();
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeHelp();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
            tabIndex={-1}
            onKeyDown={trapTab}
            className="df-slide-up w-full max-w-md overflow-hidden rounded-lg border border-hairline bg-canvas-card text-left focus:outline-none"
          >
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <h2
                id="shortcuts-title"
                className="text-sm font-semibold tracking-tight text-ink"
              >
                Keyboard shortcuts
              </h2>
              <button
                type="button"
                onClick={closeHelp}
                aria-label="Close keyboard shortcuts"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-mute transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="px-4 py-4 sm:px-5">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">
                  Navigation shortcuts: press g, then a second key
                </caption>
                <thead>
                  <tr className="text-xs text-mute">
                    <th scope="col" className="pb-2 text-left font-medium">
                      Keys
                    </th>
                    <th scope="col" className="pb-2 text-left font-medium">
                      Page
                    </th>
                    <th scope="col" className="pb-2 text-right font-medium">
                      Path
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SHORTCUT_ROUTES.map((route) => (
                    <tr key={route.keys} className="border-t border-hairline">
                      <td className="py-2 pr-3 align-middle">
                        <span className="flex items-center gap-1">
                          {route.sequence.map((key) => (
                            <kbd key={key} className={KBD_CLASS}>
                              {key}
                            </kbd>
                          ))}
                        </span>
                      </td>
                      <td className="py-2 align-middle">
                        <Link
                          href={route.href}
                          onClick={closeHelp}
                          className="rounded-md text-body transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                        >
                          {route.label}
                        </Link>
                      </td>
                      <td className="py-2 text-right align-middle font-mono text-[11px] text-mute">
                        {route.href}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-4 text-xs leading-relaxed text-body-mid">
                Press g, then the second key within a second. Cmd/Ctrl K opens
                search, and ? toggles this list from anywhere outside a text
                field.
              </p>
            </div>

            <div className="border-t border-hairline px-4 py-2 text-xs text-mute">
              esc close · ? toggle
            </div>
          </div>
        </div>
      )}
    </>
  );
}
