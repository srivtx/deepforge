"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Problem } from "@/types/problem";
import { CATEGORIES, PROBLEMS } from "@/data/problems";
import { ProblemView } from "@/components/ProblemView";
import { cn, difficultyClasses } from "@/lib/utils";

type Row =
  | { key: string; kind: "problem"; problem: Problem }
  | { key: string; kind: "category"; name: string }
  | { key: string; kind: "page"; label: string; hash: string };

const MAX_RESULTS = 12;
const MAX_PROBLEM_RESULTS = 8;
const MAX_CATEGORY_RESULTS = 3;

const PAGES: { label: string; hash: string }[] = [
  { label: "Problems", hash: "#problems" },
  { label: "Paths", hash: "#paths" },
  { label: "Projects", hash: "#projects" },
  { label: "Contests", hash: "#contests" },
  { label: "Leaderboard", hash: "#leaderboard" },
  { label: "Collections", hash: "#collections" },
  { label: "Interview", hash: "#interview" },
  { label: "Math", hash: "#math" },
  { label: "Daily", hash: "#daily" },
  { label: "Labs", hash: "#labs" },
  { label: "Research", hash: "#research" },
  { label: "Articles", hash: "#articles" },
  { label: "Sims", hash: "#sims" },
  { label: "Speedrun", hash: "#speedrun" },
  { label: "Playlists", hash: "#playlists" },
  { label: "Profile", hash: "#profile" },
  { label: "Stats", hash: "#stats" },
  { label: "Certificates", hash: "#certificates" },
  { label: "Discuss", hash: "#discuss" },
  { label: "Submit a Problem", hash: "#submit-problem" },
  { label: "Playground", hash: "#playground" },
];

const GROUP_LABELS: Record<Row["kind"], string> = {
  problem: "Problems",
  category: "Categories",
  page: "Pages",
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const rows = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return PAGES.map((p) => ({
        key: `page:${p.hash}`,
        kind: "page" as const,
        label: p.label,
        hash: p.hash,
      }));
    }

    const out: Row[] = [];
    let problemCount = 0;
    let categoryCount = 0;

    for (const p of PROBLEMS) {
      if (problemCount >= MAX_PROBLEM_RESULTS) break;
      if (
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      ) {
        out.push({ key: `problem:${p.id}`, kind: "problem", problem: p });
        problemCount += 1;
      }
    }

    for (const c of CATEGORIES) {
      if (categoryCount >= MAX_CATEGORY_RESULTS) break;
      if (c.name.toLowerCase().includes(q)) {
        out.push({
          key: `category:${c.name}`,
          kind: "category",
          name: c.name,
        });
        categoryCount += 1;
      }
    }

    for (const p of PAGES) {
      if (out.length >= MAX_RESULTS) break;
      if (p.label.toLowerCase().includes(q)) {
        out.push({
          key: `page:${p.hash}`,
          kind: "page",
          label: p.label,
          hash: p.hash,
        });
      }
    }

    return out.slice(0, MAX_RESULTS);
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const choose = useCallback(
    (row: Row | undefined) => {
      if (!row) return;
      if (row.kind === "problem") {
        setSelectedProblem(row.problem);
        return;
      }
      close();
      const hash = row.kind === "page" ? row.hash : "#problems";
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.location.hash = hash;
      }
    },
    [close],
  );

  const move = useCallback(
    (delta: number) => {
      setActiveIndex((i) => {
        if (rows.length === 0) return 0;
        return (i + delta + rows.length) % rows.length;
      });
    },
    [rows.length],
  );

  const noop = useCallback(() => {}, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!open) {
          openPalette();
        } else if (selectedProblem) {
          setSelectedProblem(null);
        } else {
          close();
        }
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        if (selectedProblem) return;
        e.preventDefault();
        close();
        return;
      }
      if (selectedProblem) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        move(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        choose(rows[activeIndex]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const onOpenEvent = () => openPalette();
    window.addEventListener("deepforge:open-command", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("deepforge:open-command", onOpenEvent);
    };
  }, [open, selectedProblem, rows, activeIndex, close, openPalette, move, choose]);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      const el = previouslyFocused.current;
      if (el && el.isConnected) el.focus();
    };
  }, [open]);

  useEffect(() => {
    if (open && !selectedProblem) inputRef.current?.focus();
  }, [open, selectedProblem]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, rows]);

  const renderRow = (row: Row) => {
    if (row.kind === "problem") {
      return (
        <>
          <span className="min-w-0 flex-1 truncate">{row.problem.title}</span>
          <span className="shrink-0 font-mono text-[11px] text-mute">
            {row.problem.id}
          </span>
          <span className="hidden shrink-0 text-xs text-body-mid sm:inline">
            {row.problem.category}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
              difficultyClasses(row.problem.difficulty),
            )}
          >
            {row.problem.difficulty}
          </span>
        </>
      );
    }
    if (row.kind === "category") {
      return (
        <span className="min-w-0 flex-1 truncate">
          <span className="text-body">Category: {row.name}</span>
          <span className="text-mute"> — jump to problems</span>
        </span>
      );
    }
    return (
      <>
        <span className="min-w-0 flex-1 truncate">{row.label}</span>
        <span className="shrink-0 font-mono text-[11px] text-mute">
          {row.hash}
        </span>
      </>
    );
  };

  return (
    <>
      {open && (
        <div
          className="df-fade-in fixed inset-0 z-50 flex items-start justify-center bg-canvas/60 px-3 pt-[10vh] backdrop-blur-sm"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="df-slide-up w-full max-w-xl overflow-hidden rounded-lg border border-hairline bg-canvas"
          >
            <div className="flex items-center gap-2 border-b border-hairline px-3">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
                className="shrink-0 text-mute"
              >
                <circle
                  cx="6"
                  cy="6"
                  r="4.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M9.5 9.5l3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Search problems, categories, pages…"
                aria-label="Search problems, categories, and pages"
                role="combobox"
                aria-expanded={!selectedProblem}
                aria-controls="command-palette-listbox"
                aria-autocomplete="list"
                aria-activedescendant={
                  rows.length > 0
                    ? `command-palette-option-${activeIndex}`
                    : undefined
                }
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent py-3 text-sm text-ink placeholder:text-mute focus:outline-none"
              />
            </div>

            <div
              ref={listRef}
              id="command-palette-listbox"
              role={rows.length > 0 ? "listbox" : undefined}
              aria-label="Search results"
              className="df-scroll max-h-[55vh] overflow-y-auto py-1"
            >
              {rows.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-mute">
                  No matches.
                </p>
              ) : (
                rows.map((row, i) => (
                  <Fragment key={row.key}>
                    {(i === 0 || rows[i - 1].kind !== row.kind) && (
                      <div
                        role="presentation"
                        className="px-3 pb-1 pt-2 text-xs text-mute"
                      >
                        {GROUP_LABELS[row.kind]}
                      </div>
                    )}
                    <button
                      type="button"
                      id={`command-palette-option-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      tabIndex={-1}
                      data-index={i}
                      onClick={() => choose(row)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                        i === activeIndex
                          ? "bg-canvas-soft text-ink"
                          : "text-body hover:bg-canvas-soft hover:text-ink",
                      )}
                    >
                      {renderRow(row)}
                    </button>
                  </Fragment>
                ))
              )}
            </div>

            <div className="border-t border-hairline px-3 py-2 text-xs text-mute">
              ↑↓ navigate · ↵ select · esc close
            </div>
          </div>
        </div>
      )}

      {selectedProblem && (
        <ProblemView
          problem={selectedProblem}
          onClose={() => setSelectedProblem(null)}
          onProgressChange={noop}
        />
      )}
    </>
  );
}
