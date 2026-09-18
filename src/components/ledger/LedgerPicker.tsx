"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ProblemMeta } from "@/data/problems/problem-meta";
import type { Difficulty } from "@/types/problem";
import { getProgress } from "@/lib/progress";
import {
  BDL_CHANGE_EVENT,
  BDL_LEDGER_MAX_PROBLEMS,
  BDL_SHELF_CHANGE_EVENT,
  BDL_SHELF_MAX_PER_PROBLEM,
  BDL_SHELF_MAX_SOURCE_CHARS,
  BDL_SHELF_MAX_SOURCES,
  clearBdl,
  clearBdlShelf,
  exportBdlShelf,
  getBdlLedger,
  getBdlShelf,
  isBdlEnabled,
  removeBdlSource,
  setBdlEnabled,
  type BdlSavedSource,
} from "@/lib/bdlStore";
import { cn, difficultyClasses } from "@/lib/utils";

const INTRO =
  "The Ledger checks whether an edit changed your program's behavior on a set of hidden checks built from this exercise's own tests. It reports counts only — never which check, never whether a change is right.";
const ENABLE_LABEL = "Turn on the Ledger on this device.";
const CAVEAT =
  "The hidden checks are a sample; an edit can still matter without changing them.";
const PRIVACY =
  "The Ledger stores one signature per problem in this browser. Nothing is synced. You can clear it at any time.";

const DIFFICULTIES: readonly ("All" | Difficulty)[] = [
  "All",
  "Easy",
  "Medium",
  "Hard",
];

const CHIP_BASE =
  "rounded-full border px-2.5 py-1 text-[11px] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

const SECONDARY_BUTTON =
  "inline-flex min-h-11 items-center rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-40 sm:min-h-0";

const SHELF_KB = Math.round(BDL_SHELF_MAX_SOURCE_CHARS / 1024);

interface ShelfEntry {
  readonly problemId: string;
  readonly source: BdlSavedSource;
}

interface LedgerView {
  readonly enabled: boolean;
  readonly attemptedIds: readonly string[];
  readonly signatures: number;
  readonly records: ReadonlySet<string>;
  readonly shelfByProblem: ReadonlyMap<string, readonly BdlSavedSource[]>;
}

const EMPTY_VIEW: LedgerView = {
  enabled: false,
  attemptedIds: [],
  signatures: 0,
  records: new Set(),
  shelfByProblem: new Map(),
};

let cachedView: LedgerView | null = null;
let cachedKey = "";

function readView(): LedgerView {
  const progress = getProgress();
  const ledger = getBdlLedger();
  const ids = new Set<string>();
  for (const [id, entry] of Object.entries(progress)) {
    if (entry?.attempted || entry?.solved || entry?.savedCode) ids.add(id);
  }
  for (const id of Object.keys(ledger.problems)) ids.add(id);
  const attemptedIds = [...ids].sort();
  const shelfByProblem = new Map<string, readonly BdlSavedSource[]>();
  for (const id of attemptedIds) {
    const sources = getBdlShelf(id);
    if (sources.length > 0) shelfByProblem.set(id, sources);
  }
  const recordIds = Object.keys(ledger.problems);
  const shelfKey = [...shelfByProblem.entries()]
    .map(([id, sources]) => `${id}:${sources.map((s) => `${s.id}@${s.at}`).join(",")}`)
    .join("|");
  const key = JSON.stringify({
    enabled: isBdlEnabled(),
    recordIds,
    shelfKey,
    attemptedIds,
  });
  if (cachedView && cachedKey === key) return cachedView;
  cachedKey = key;
  cachedView = {
    enabled: isBdlEnabled(),
    attemptedIds,
    signatures: recordIds.length,
    records: new Set(recordIds),
    shelfByProblem,
  };
  return cachedView;
}

function getServerView(): LedgerView {
  return EMPTY_VIEW;
}

function subscribeView(onStoreChange: () => void): () => void {
  const onChange = () => onStoreChange();
  window.addEventListener(BDL_CHANGE_EVENT, onChange);
  window.addEventListener(BDL_SHELF_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(BDL_CHANGE_EVENT, onChange);
    window.removeEventListener(BDL_SHELF_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function formatAt(at: string): string {
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return at;
  return date.toLocaleString();
}

function previewSource(code: string): string {
  const lines = code.split("\n");
  const firstLine = lines.find((line) => line.trim().length > 0) ?? "";
  const clipped =
    firstLine.length > 96 ? `${firstLine.slice(0, 96)}…` : firstLine;
  return lines.length > 1 ? `${clipped}\n…` : clipped;
}

export function LedgerPicker() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const view = useSyncExternalStore(subscribeView, readView, getServerView);
  const [, setRevision] = useState(0);
  const [meta, setMeta] = useState<readonly ProblemMeta[] | null>(null);
  const [metaFailed, setMetaFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<"All" | Difficulty>("All");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void import("@/data/problems/problem-meta")
      .then((mod) => {
        if (alive) setMeta(mod.PROBLEM_META);
      })
      .catch(() => {
        if (alive) setMetaFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const attemptedIds = useMemo(
    () => new Set(view.attemptedIds),
    [view.attemptedIds],
  );

  const metaById = useMemo(
    () => new Map((meta ?? []).map((entry) => [entry.id, entry])),
    [meta],
  );

  const rows = useMemo(() => {
    if (!meta) return [];
    const q = query.trim().toLowerCase();
    return meta.filter((entry) => {
      if (!attemptedIds.has(entry.id)) return false;
      if (difficulty !== "All" && entry.difficulty !== difficulty) return false;
      if (!q) return true;
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.id.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q)
      );
    });
  }, [meta, attemptedIds, difficulty, query]);

  const shelfEntries = useMemo(() => {
    const entries: ShelfEntry[] = [];
    for (const [problemId, sources] of view.shelfByProblem) {
      for (const source of sources) {
        entries.push({ problemId, source });
      }
    }
    entries.sort((a, b) => {
      if (a.source.at === b.source.at) return 0;
      return a.source.at < b.source.at ? 1 : -1;
    });
    return entries;
  }, [view.shelfByProblem]);

  const savedByProblem = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of shelfEntries) {
      map.set(entry.problemId, (map.get(entry.problemId) ?? 0) + 1);
    }
    return map;
  }, [shelfEntries]);

  const signatureCount = view.signatures;
  const searching = query.trim().length > 0;

  const toggleEnabled = () => {
    const next = !view.enabled;
    setBdlEnabled(next);
    setRevision((revision) => revision + 1);
    setNotice(
      next
        ? "The Ledger is on for this device."
        : "The Ledger is off. Stored signatures stay until you clear them.",
    );
  };

  const onExport = () => {
    try {
      const blob = new Blob([exportBdlShelf()], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "deepforge-ledger-shelf.json";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setNotice("Exported the saved sources as JSON.");
    } catch {
      setNotice("The export did not start in this browser.");
    }
  };

  const onRemoveSource = (problemId: string, sourceId: string) => {
    removeBdlSource(problemId, sourceId);
    setRevision((revision) => revision + 1);
    setNotice("Removed from Your bugs.");
  };

  const onClearShelf = () => {
    if (
      !window.confirm("Remove every saved source from Your bugs on this device?")
    ) {
      return;
    }
    clearBdlShelf();
    setRevision((revision) => revision + 1);
    setNotice("Your bugs is empty.");
  };

  const onClearSignatures = () => {
    if (
      !window.confirm(
        "Clear every stored signature and turn the Ledger off on this device? You can turn it on again at any time.",
      )
    ) {
      return;
    }
    clearBdl();
    setRevision((revision) => revision + 1);
    setNotice("Stored signatures cleared; the Ledger is off.");
  };

  return (
    <section
      aria-label="Behavioral Delta Ledger"
      className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8"
    >
      <div className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        <p className="max-w-3xl text-sm leading-relaxed text-body">{INTRO}</p>
        <div className="flex max-w-3xl flex-col gap-1 text-xs leading-relaxed text-body-mid">
          <p>
            It is practice only and never a grade. It never changes your saved
            progress, review schedule, streaks, or certificates.
          </p>
          <p>It never shows which hidden check changed.</p>
        </div>
        <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2.5 rounded-lg border border-hairline bg-canvas-soft px-3 py-2.5">
          <input
            type="checkbox"
            checked={view.enabled}
            onChange={toggleEnabled}
            className="h-4 w-4 accent-accent"
          />
          <span className="text-xs text-body">{ENABLE_LABEL}</span>
        </label>
        <p className="max-w-3xl text-xs leading-relaxed text-body-mid">
          {PRIVACY}
        </p>
        <p className="max-w-3xl text-xs leading-relaxed text-body-mid">
          {CAVEAT}
        </p>
        {notice && (
          <p role="status" className="text-xs leading-relaxed text-body-mid">
            {notice}
          </p>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-hairline bg-canvas-card">
        <div className="flex flex-col gap-2.5 border-b border-hairline px-4 py-3.5 sm:px-5">
          <h2 className="text-sm font-medium text-ink">
            Problems you have attempted
          </h2>
          <label htmlFor="ledger-search" className="sr-only">
            Search attempted problems
          </label>
          <input
            id="ledger-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, id, or category"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            className="w-full rounded-lg border border-hairline bg-canvas-soft px-3 py-2 text-xs text-ink placeholder:text-mute focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
          />
          <div
            role="group"
            aria-label="Filter by difficulty"
            className="flex flex-wrap items-center gap-1.5"
          >
            {DIFFICULTIES.map((option) => {
              const active = difficulty === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDifficulty(option)}
                  className={cn(
                    CHIP_BASE,
                    "min-h-11 sm:min-h-0",
                    active
                      ? "border-accent/40 bg-accent/5 text-accent"
                      : "border-hairline text-body-mid hover:bg-canvas-soft hover:text-ink",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
        <div className="df-scroll max-h-96 overflow-y-auto p-2">
          {!mounted || (!meta && !metaFailed) ? (
            <p className="px-2 py-6 text-center text-xs text-body-mid">
              Loading attempted problems…
            </p>
          ) : metaFailed ? (
            <p className="px-2 py-6 text-center text-xs text-body-mid">
              Could not load the problem list. Reload to try again.
            </p>
          ) : rows.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-body-mid">
              {searching || difficulty !== "All"
                ? "No attempted problems match these filters."
                : "No attempted problems yet. "}{" "}
              {!searching && difficulty === "All" && (
                <Link
                  href="/problems"
                  className="text-accent underline-offset-2 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                >
                  Browse problems
                </Link>
              )}
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {rows.map((entry) => {
                const hasRecord = view.records.has(entry.id);
                const savedCount = savedByProblem.get(entry.id) ?? 0;
                return (
                  <li key={entry.id}>
                    <Link
                      href={`/ledger/${entry.id}`}
                      className="flex min-h-11 w-full flex-col gap-1 rounded-md border border-transparent px-2.5 py-2 transition-colors hover:bg-canvas-soft focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                    >
                      <span className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="min-w-0 truncate text-xs text-ink">
                          {entry.title}
                        </span>
                        {hasRecord && (
                          <span className="font-mono text-[10px] text-mute">
                            signature stored
                          </span>
                        )}
                        {savedCount > 0 && (
                          <span className="font-mono text-[10px] text-mute">
                            {savedCount} in Your bugs
                          </span>
                        )}
                      </span>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            "rounded-full border px-1.5 py-0.5 text-[10px]",
                            difficultyClasses(entry.difficulty),
                          )}
                        >
                          {entry.difficulty}
                        </span>
                        <span className="text-[10px] text-mute">
                          {entry.category}
                        </span>
                        <span className="font-mono text-[10px] text-mute">
                          {entry.id}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-hairline bg-canvas-card">
        <div className="flex flex-col gap-2 border-b border-hairline px-4 py-3.5 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-ink">Your bugs</h2>
            {shelfEntries.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={onExport}
                  className={SECONDARY_BUTTON}
                >
                  Export shelf (JSON)
                </button>
                <button
                  type="button"
                  onClick={onClearShelf}
                  className={SECONDARY_BUTTON}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
          <p className="max-w-3xl text-xs leading-relaxed text-body-mid">
            Sources you explicitly saved from a Ledger workspace. Up to{" "}
            {BDL_SHELF_MAX_PER_PROBLEM} per problem, {SHELF_KB} KB each,{" "}
            {BDL_SHELF_MAX_SOURCES} in total — stored in this browser only,
            newest kept when a cap is reached.
          </p>
        </div>
        {shelfEntries.length === 0 ? (
          <p className="px-4 py-4 text-xs leading-relaxed text-body-mid sm:px-5">
            Nothing saved yet. Open an attempted problem and use “Save this
            source to Your bugs”.
          </p>
        ) : (
          <ul className="flex flex-col gap-2 p-3 sm:p-4">
            {shelfEntries.map((entry) => (
              <li
                key={`${entry.problemId}:${entry.source.id}`}
                className="rounded-md border border-hairline bg-canvas-soft p-2.5"
              >
                <Link
                  href={`/ledger/${entry.problemId}`}
                  className="rounded-sm text-xs text-ink underline-offset-2 transition-colors hover:text-accent hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                >
                  {metaById.get(entry.problemId)?.title ?? entry.problemId}
                </Link>
                <pre className="df-scroll mt-1 overflow-x-auto whitespace-pre font-mono text-[11px] leading-relaxed text-body-mid">
                  {previewSource(entry.source.code)}
                </pre>
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] text-mute">
                    saved {formatAt(entry.source.at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Link
                      href={`/ledger/${entry.problemId}`}
                      className={SECONDARY_BUTTON}
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        onRemoveSource(entry.problemId, entry.source.id)
                      }
                      className={SECONDARY_BUTTON}
                    >
                      Remove
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-hairline bg-canvas-card px-4 py-3 sm:px-5">
        <p className="text-xs leading-relaxed text-body-mid">
          {signatureCount === 0
            ? "No signatures stored on this device."
            : `${signatureCount} of ${BDL_LEDGER_MAX_PROBLEMS} signatures stored on this device.`}
        </p>
        {signatureCount > 0 && (
          <button
            type="button"
            onClick={onClearSignatures}
            className={SECONDARY_BUTTON}
          >
            Clear stored signatures
          </button>
        )}
      </div>
    </section>
  );
}
