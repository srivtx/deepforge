"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  solvedCount: number;
  totalCount: number;
}

const MOBILE_LINKS: { label: string; hash: string }[] = [
  { label: "Problems", hash: "#problems" },
  { label: "Paths", hash: "#paths" },
  { label: "Projects", hash: "#projects" },
  { label: "Labs", hash: "#labs" },
  { label: "Contests", hash: "#contests" },
  { label: "Research", hash: "#research" },
  { label: "Daily", hash: "#daily" },
  { label: "Leaderboard", hash: "#leaderboard" },
  { label: "Profile", hash: "#profile" },
  { label: "Collections", hash: "#collections" },
  { label: "Playlists", hash: "#playlists" },
  { label: "Interview", hash: "#interview" },
  { label: "Math", hash: "#math" },
  { label: "Articles", hash: "#articles" },
  { label: "Discuss", hash: "#discuss" },
  { label: "Playground", hash: "#playground" },
  { label: "About", hash: "#about" },
];

export function Header({ solvedCount, totalCount }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors ${
        scrolled
          ? "border-hairline bg-canvas/85 backdrop-blur-md"
          : "border-transparent bg-canvas"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            DeepForge
          </span>
          <span className="text-xs text-body-mid">by svx</span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 sm:flex sm:gap-2">
            <a
              href="#problems"
              className="rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink sm:px-3"
            >
              Problems
            </a>
            <a
              href="#paths"
              className="rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink sm:px-3"
            >
              Paths
            </a>
            <a
              href="#projects"
              className="rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink sm:px-3"
            >
              Projects
            </a>
            <a
              href="#contests"
              className="rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink sm:px-3"
            >
              Contests
            </a>
            <a
              href="#daily"
              className="rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink sm:px-3"
            >
              Daily
            </a>
            <a
              href="#playground"
              className="hidden rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink xl:inline-block sm:px-3"
            >
              Playground
            </a>
            <a
              href="#leaderboard"
              className="hidden rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink md:inline-block sm:px-3"
            >
              Leaderboard
            </a>
            <a
              href="#collections"
              className="hidden rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink lg:inline-block sm:px-3"
            >
              Collections
            </a>
            <a
              href="#interview"
              className="hidden rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink lg:inline-block sm:px-3"
            >
              Interview
            </a>
            <a
              href="#math"
              className="hidden rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink xl:inline-block sm:px-3"
            >
              Math
            </a>
            <a
              href="#labs"
              className="hidden rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink xl:inline-block sm:px-3"
            >
              Labs
            </a>
            <a
              href="#research"
              className="hidden rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink xl:inline-block sm:px-3"
            >
              Research
            </a>
            <a
              href="#articles"
              className="hidden rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink xl:inline-block sm:px-3"
            >
              Articles
            </a>
            <a
              href="#discuss"
              className="hidden rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink xl:inline-block sm:px-3"
            >
              Discuss
            </a>
            <a
              href="#about"
              className="hidden rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink sm:inline-block sm:px-3"
            >
              About
            </a>
          </div>
          <div className="ml-1 hidden items-center gap-2 rounded-md border border-hairline px-2.5 py-1 text-xs text-body-mid sm:flex">
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
            className="ml-1 hidden items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink sm:flex"
          >
            <span>Search</span>
            <span className="font-mono text-[10px] text-mute">⌘K</span>
          </button>
          <div className="ml-1 sm:ml-2">
            <ThemeToggle />
          </div>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
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
        </nav>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav"
          className="df-scroll absolute inset-x-0 top-full max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-hairline bg-canvas shadow-lg sm:hidden"
        >
          <nav
            aria-label="Mobile navigation"
            className="mx-auto flex max-w-6xl flex-col px-2 py-2"
          >
            {MOBILE_LINKS.map((link) => (
              <a
                key={link.hash}
                href={link.hash}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-11 items-center rounded-md px-3 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
              >
                {link.label}
              </a>
            ))}
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
  );
}
