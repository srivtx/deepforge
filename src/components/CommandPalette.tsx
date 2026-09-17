"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { CategoryMeta, Problem } from "@/types/problem";
import { SECTIONS_BY_ID, categorySlug, type SectionId } from "@/lib/sections";
import { problemHref } from "@/lib/problemLinks";
import { cn, difficultyClasses } from "@/lib/utils";
import type {
  GlobalSearchGroup,
  GlobalSearchItem,
} from "@/lib/globalSearch";

type Row =
  | { key: string; kind: "problem"; problem: Problem }
  | { key: string; kind: "category"; name: string }
  | { key: string; kind: "page"; label: string; section: SectionId }
  | { key: string; kind: "global"; group: GlobalSearchGroup; item: GlobalSearchItem };

const MAX_RESULTS = 18;
const MAX_PROBLEM_RESULTS = 8;
const MAX_CATEGORY_RESULTS = 3;
const MAX_GLOBAL_GROUP_RESULTS = 4;

const PAGES: { label: string; section: SectionId }[] = [
  { label: "Problems", section: "problems" },
  { label: "Paths", section: "paths" },
  { label: "Projects", section: "projects" },
  { label: "Contests", section: "contests" },
  { label: "Leaderboard", section: "leaderboard" },
  { label: "Collections", section: "collections" },
  { label: "Interview", section: "interview" },
  { label: "Math", section: "penpaper" },
  { label: "Daily", section: "daily" },
  { label: "Labs", section: "labs" },
  { label: "Research", section: "research" },
  { label: "Articles", section: "articles" },
  { label: "Sims", section: "sims" },
  { label: "Speedrun", section: "speedrun" },
  { label: "Playlists", section: "playlists" },
  { label: "Profile", section: "badges" },
  { label: "Stats", section: "stats" },
  { label: "Certificates", section: "certificates" },
  { label: "Discuss", section: "discuss" },
  { label: "Submit a Problem", section: "submit" },
  { label: "Playground", section: "playground" },
  { label: "Backup", section: "backup" },
  { label: "About", section: "about" },
];

const GROUP_LABELS: Record<Exclude<Row["kind"], "global">, string> = {
  problem: "Problems",
  category: "Categories",
  page: "Pages",
};

function rowGroupKey(row: Row): string {
  return row.kind === "global" ? `global:${row.group}` : row.kind;
}

function rowGroupLabel(row: Row): string {
  return row.kind === "global" ? row.group : GROUP_LABELS[row.kind];
}

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  // The problem bank is only fetched when the palette is actually opened, so
  // routes that mount this component stay lean until the user searches.
  const [catalog, setCatalog] = useState<{
    problems: Problem[];
    categories: CategoryMeta[];
  } | null>(null);
  // Paths, collections, interview tracks, blog posts and categories live in a
  // separate lazy module for the same reason the problem bank does: keep the
  // global client graph (and the first-load budgets) untouched.
  const [globalApi, setGlobalApi] = useState<
    typeof import("@/lib/globalSearch") | null
  >(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || catalog) return;
    let alive = true;
    void import("@/data/problems").then((mod) => {
      if (alive) {
        setCatalog({ problems: mod.PROBLEMS, categories: mod.CATEGORIES });
      }
    });
    return () => {
      alive = false;
    };
  }, [open, catalog]);

  useEffect(() => {
    if (!open || globalApi) return;
    let alive = true;
    void import("@/lib/globalSearch").then((mod) => {
      if (alive) setGlobalApi(mod);
    });
    return () => {
      alive = false;
    };
  }, [open, globalApi]);

  const rows = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return PAGES.map((p) => ({
        key: `page:${p.section}`,
        kind: "page" as const,
        label: p.label,
        section: p.section,
      }));
    }

    const problems = catalog?.problems ?? [];
    const categories = catalog?.categories ?? [];
    const out: Row[] = [];
    let problemCount = 0;
    let categoryCount = 0;

    for (const p of problems) {
      if (problemCount >= MAX_PROBLEM_RESULTS) break;
      if (
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      ) {
        out.push({ key: `problem:${p.id}`, kind: "problem", problem: p });
        problemCount += 1;
      }
    }

    if (globalApi) {
      // The global index already covers categories, so its Categories group
      // replaces the palette's own category scan once it has loaded.
      for (const result of globalApi.searchGlobal(q, MAX_GLOBAL_GROUP_RESULTS)) {
        for (const item of result.items) {
          out.push({
            key: `global:${result.group}:${item.id}`,
            kind: "global",
            group: result.group,
            item,
          });
        }
      }
    } else {
      for (const c of categories) {
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
    }

    for (const p of PAGES) {
      if (out.length >= MAX_RESULTS) break;
      if (p.label.toLowerCase().includes(q)) {
        out.push({
          key: `page:${p.section}`,
          kind: "page",
          label: p.label,
          section: p.section,
        });
      }
    }

    return out.slice(0, MAX_RESULTS);
  }, [query, catalog, globalApi]);

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
      close();
      if (row.kind === "problem") {
        router.push(problemHref(row.problem.id, pathname));
        return;
      }
      if (row.kind === "category") {
        router.push(`/problems?category=${categorySlug(row.name)}`);
        return;
      }
      if (row.kind === "global") {
        router.push(row.item.href);
        return;
      }
      router.push(SECTIONS_BY_ID[row.section].href);
    },
    [close, router, pathname],
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!open) {
          openPalette();
        } else {
          close();
        }
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
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
  }, [open, rows, activeIndex, close, openPalette, move, choose]);

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
    if (open) inputRef.current?.focus();
  }, [open]);

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
    if (row.kind === "global") {
      return (
        <>
          <span className="min-w-0 flex-1 truncate">{row.item.title}</span>
          {row.item.subtitle && (
            <span className="shrink-0 text-xs text-body-mid">
              {row.item.subtitle}
            </span>
          )}
        </>
      );
    }
    return (
      <>
        <span className="min-w-0 flex-1 truncate">{row.label}</span>
        <span className="shrink-0 font-mono text-[11px] text-mute">
          #{row.section}
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
            onKeyDown={(e) => {
              // The input is the only tab stop in the dialog; keep Tab from
              // escaping into the page behind the modal.
              if (e.key !== "Tab") return;
              e.preventDefault();
              inputRef.current?.focus();
            }}
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
                placeholder="Search problems, paths, collections…"
                aria-label="Search problems, paths, collections, and pages"
                role="combobox"
                aria-expanded={rows.length > 0}
                aria-controls="command-palette-listbox"
                aria-autocomplete="list"
                aria-activedescendant={
                  rows.length > 0
                    ? `command-palette-option-${activeIndex}`
                    : undefined
                }
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent py-3 text-sm text-ink placeholder:text-mute focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40"
              />
            </div>

            <p role="status" aria-live="polite" className="sr-only">
              {query.trim() === ""
                ? ""
                : rows.length === 0
                  ? "No matches"
                  : `${rows.length} result${rows.length === 1 ? "" : "s"}`}
            </p>

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
                    {(i === 0 ||
                      rowGroupKey(rows[i - 1]) !== rowGroupKey(row)) && (
                      <div
                        role="presentation"
                        className="px-3 pb-1 pt-2 text-xs text-mute"
                      >
                        {rowGroupLabel(row)}
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
    </>
  );
}
