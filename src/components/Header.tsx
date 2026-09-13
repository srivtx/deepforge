"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SyncPanel } from "./SyncPanel";
import { MOBILE_NAV_GROUPS, NavItemLink, NavMenus } from "./NavMenus";

interface HeaderProps {
  solvedCount: number;
  totalCount: number;
}

const MOBILE_LINK_CLASS =
  "flex min-h-11 items-center rounded-md px-3 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

function SyncIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={`${className} shrink-0`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

export function Header({ solvedCount, totalCount }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet on Escape and return focus to the trigger.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full border-b transition-colors ${
          scrolled
            ? "border-hairline bg-canvas/85 backdrop-blur-md"
            : "border-transparent bg-canvas"
        }`}
      >
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/"
              onClick={() => {
                if (pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="flex items-baseline gap-2 rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
              aria-label="DeepForge home"
            >
              <span className="text-[15px] font-semibold tracking-tight text-ink">
                DeepForge
              </span>
              <span className="text-xs text-body-mid">by svx</span>
            </Link>
            <NavMenus />
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="ml-1 hidden h-8 items-center gap-1.5 rounded-md border border-hairline px-2 text-xs text-body-mid md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="font-mono">
                {solvedCount}/{totalCount} solved
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("deepforge:open-command"))
              }
              aria-label="Open command palette"
              className="ml-1 hidden h-8 items-center gap-1.5 rounded-md border border-hairline px-2 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 md:flex"
            >
              <span>Search</span>
              <span className="font-mono text-[10px] text-mute">⌘K</span>
            </button>
            <button
              type="button"
              onClick={() => setSyncOpen(true)}
              aria-label="Sync across devices"
              className="ml-1 hidden h-8 items-center gap-1.5 rounded-md border border-hairline px-2 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:flex"
            >
              <SyncIcon />
              <span>Sync</span>
            </button>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              className="ml-1 flex h-11 w-11 items-center justify-center rounded-md border border-hairline text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:hidden"
            >
              {menuOpen ? (
                <svg
                  width="16"
                  height="16"
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
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 4h12M2 8h12M2 12h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="mobile-nav"
            className="df-scroll absolute inset-x-0 top-full max-h-[calc(100dvh-3rem)] overflow-y-auto border-b border-hairline bg-canvas sm:hidden"
          >
            <nav
              aria-label="Mobile navigation"
              className="mx-auto flex w-full max-w-6xl flex-col px-2 pb-3 pt-2"
            >
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                aria-current={pathname === "/" ? "page" : undefined}
                className={MOBILE_LINK_CLASS}
              >
                Home
              </Link>
              {MOBILE_NAV_GROUPS.map((group) => (
                <div key={group.label} className="flex flex-col pt-2 pb-3">
                  <p className="px-3 pb-1 text-xs font-medium text-mute">
                    {group.label}
                  </p>
                  {group.items.map((id) => (
                    <NavItemLink
                      key={id}
                      id={id}
                      onSelect={() => setMenuOpen(false)}
                      className={MOBILE_LINK_CLASS}
                    />
                  ))}
                </div>
              ))}
              <div className="mt-1 border-t border-hairline pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setSyncOpen(true);
                  }}
                  aria-label="Sync across devices"
                  className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                >
                  <SyncIcon />
                  <span>Sync</span>
                </button>
              </div>
              <div className="mt-1 flex items-center gap-2 border-t border-hairline px-3 pb-1 pt-3 text-xs text-body-mid">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="font-mono">
                  {solvedCount}/{totalCount} solved
                </span>
              </div>
            </nav>
          </div>
        )}
      </header>
      <SyncPanel open={syncOpen} onClose={() => setSyncOpen(false)} />
    </>
  );
}
