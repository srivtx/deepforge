"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  solvedCount: number;
  totalCount: number;
}

export function Header({ solvedCount, totalCount }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            href="#about"
            className="hidden rounded-md px-2.5 py-1.5 text-sm text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink sm:inline-block sm:px-3"
          >
            About
          </a>
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
        </nav>
      </div>
    </header>
  );
}
