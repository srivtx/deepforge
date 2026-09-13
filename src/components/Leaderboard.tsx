"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { getProgress } from "@/lib/progress";
import {
  getLeaderboard,
  getLongestStreak,
  getUserName,
  setUserName,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import {
  fetchGlobalLeaderboard,
  isGlobalLeaderboardAvailable,
  GLOBAL_LEADERBOARD_DEFAULT_LIMIT,
  type GlobalLeaderboardRow,
} from "@/lib/sync/leaderboardRemote";

const GLOBAL_ERROR_MESSAGE = "Couldn't reach the leaderboard — try again";

interface BoardSnapshot {
  entries: LeaderboardEntry[];
  name: string;
  longestStreak: number;
}

const EMPTY_SNAPSHOT: BoardSnapshot = {
  entries: [],
  name: "you",
  longestStreak: 0,
};

let cached: BoardSnapshot | null = null;

function getSnapshot(): BoardSnapshot {
  if (!cached) {
    const progress = getProgress();
    cached = {
      entries: getLeaderboard(),
      name: getUserName(),
      longestStreak: getLongestStreak(progress),
    };
  }
  return cached;
}

function getServerSnapshot(): BoardSnapshot {
  return EMPTY_SNAPSHOT;
}

function subscribe(onStoreChange: () => void): () => void {
  const onChange = () => {
    cached = null;
    onStoreChange();
  };
  window.addEventListener("deepforge:progress-change", onChange);
  window.addEventListener("deepforge:username-change", onChange);
  return () => {
    window.removeEventListener("deepforge:progress-change", onChange);
    window.removeEventListener("deepforge:username-change", onChange);
  };
}

export function Leaderboard() {
  const board = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const skipCommit = useRef(false);
  const globalAvailable = isGlobalLeaderboardAvailable();
  const [tab, setTab] = useState<"local" | "global">("local");
  const [globalRows, setGlobalRows] = useState<GlobalLeaderboardRow[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (tab !== "global") return;
    let cancelled = false;
    const load = async () => {
      try {
        const result = await fetchGlobalLeaderboard(
          GLOBAL_LEADERBOARD_DEFAULT_LIMIT,
        );
        if (cancelled) return;
        if (!result || result.error) {
          setGlobalError(GLOBAL_ERROR_MESSAGE);
          return;
        }
        setGlobalRows(result.rows);
      } catch {
        if (!cancelled) setGlobalError(GLOBAL_ERROR_MESSAGE);
      } finally {
        if (!cancelled) setGlobalLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [tab, refreshToken]);

  const openTab = (next: "local" | "global") => {
    if (next === "global") {
      setGlobalLoading(true);
      setGlobalError(null);
      setRefreshToken((token) => token + 1);
    }
    setTab(next);
  };

  const refreshGlobal = () => {
    setGlobalLoading(true);
    setGlobalError(null);
    setRefreshToken((token) => token + 1);
  };

  // Best effort: the leaderboard view exposes usernames but no user ids, and
  // the sync state only carries an email — the local username (written during
  // first sign-in) is the closest identity available, so a row is highlighted
  // when its name matches it case-insensitively.
  const isSelf = (name: string) =>
    name.trim().toLowerCase() === board.name.trim().toLowerCase();

  const you = board.entries.find((entry) => entry.isYou);
  const score = you?.score ?? 0;
  const solved = you?.solved ?? 0;
  const streak = you?.streak ?? 0;

  const startEditing = () => {
    setDraft(board.name);
    skipCommit.current = false;
    setEditing(true);
  };

  const commit = () => {
    if (skipCommit.current) {
      skipCommit.current = false;
    } else {
      setUserName(draft);
    }
    setEditing(false);
  };

  return (
    <section
      id="leaderboard"
      className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 py-8 sm:px-6 sm:py-12"
    >
      <p className="mb-6 text-sm text-body-mid">
        Flame score weights Easy 1, Medium 3, Hard 5.
      </p>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <div className="text-xs text-body-mid">Flame score</div>
          <div className="mt-1.5 font-mono text-lg font-medium text-accent sm:text-xl">
            {score}
          </div>
        </div>
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <div className="text-xs text-body-mid">Solved</div>
          <div className="mt-1.5 font-mono text-lg font-medium text-ink sm:text-xl">
            {solved}
          </div>
        </div>
        <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
          <div className="text-xs text-body-mid">Streak</div>
          <div className="mt-1.5 font-mono text-lg font-medium text-ink sm:text-xl">
            {streak}
          </div>
          <div className="mt-0.5 text-xs text-body-mid">
            best {board.longestStreak}
          </div>
        </div>
      </div>

      <div className="mt-6 mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-body-mid">Playing as</span>
        {editing ? (
          <input
            autoFocus
            type="text"
            value={draft}
            maxLength={24}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                skipCommit.current = true;
                setEditing(false);
              }
            }}
            aria-label="Display name"
            className="min-h-11 w-40 rounded-md border border-hairline bg-canvas px-3 text-sm text-ink focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
        ) : (
          <>
            <button
              type="button"
              onClick={startEditing}
              aria-label={`Edit display name, currently ${board.name}`}
              className="inline-flex min-h-11 items-center rounded-md text-sm font-medium text-ink transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              {board.name}
            </button>
            <button
              type="button"
              onClick={startEditing}
              aria-label="Edit username"
              className="inline-flex min-h-11 items-center rounded-md border border-hairline px-3 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              Edit
            </button>
          </>
        )}
      </div>

      {globalAvailable && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Leaderboard scope"
            className="inline-flex rounded-lg border border-hairline bg-canvas-card p-1"
          >
            <button
              type="button"
              aria-pressed={tab === "local"}
              onClick={() => openTab("local")}
              className={cn(
                "inline-flex min-h-11 items-center rounded-md px-4 text-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
                tab === "local"
                  ? "bg-canvas-soft font-medium text-ink"
                  : "text-body-mid hover:text-ink",
              )}
            >
              Local
            </button>
            <button
              type="button"
              aria-pressed={tab === "global"}
              onClick={() => openTab("global")}
              className={cn(
                "inline-flex min-h-11 items-center rounded-md px-4 text-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
                tab === "global"
                  ? "bg-canvas-soft font-medium text-ink"
                  : "text-body-mid hover:text-ink",
              )}
            >
              Global
            </button>
          </div>
          {tab === "global" && (
            <button
              type="button"
              onClick={refreshGlobal}
              disabled={globalLoading}
              aria-label="Refresh global leaderboard"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-hairline px-3.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink disabled:cursor-default disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              Refresh
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-hairline bg-canvas-card">
        <table
          aria-label="Leaderboard"
          className="w-full table-fixed border-collapse text-left text-sm sm:table-auto"
        >
          <thead>
            <tr className="border-b border-hairline">
              <th
                scope="col"
                className="w-10 px-2 py-2.5 text-xs font-medium text-body-mid sm:w-16 sm:px-4"
              >
                <span className="sm:hidden">#</span>
                <span className="hidden sm:inline">Rank</span>
              </th>
              <th
                scope="col"
                className="px-2 py-2.5 text-xs font-medium text-body-mid sm:px-4"
              >
                Name
              </th>
              <th
                scope="col"
                className="w-16 px-2 py-2.5 text-right text-xs font-medium text-body-mid sm:w-28 sm:px-4"
              >
                <span className="sm:hidden">Flame</span>
                <span className="hidden sm:inline">Flame score</span>
              </th>
              <th
                scope="col"
                className="hidden w-16 px-4 py-2.5 text-right text-xs font-medium text-body-mid sm:table-cell"
              >
                Solved
              </th>
              <th
                scope="col"
                className="w-14 px-2 py-2.5 text-right text-xs font-medium text-body-mid sm:w-20 sm:px-4"
              >
                Streak
              </th>
            </tr>
          </thead>
          <tbody>
            {tab === "global" ? (
              globalLoading ? (
                <tr>
                  <td colSpan={5} className="px-2 py-3 sm:px-4">
                    <span className="sr-only">Loading global leaderboard</span>
                    <span
                      aria-hidden="true"
                      className="block h-3 w-full animate-pulse rounded bg-canvas-soft"
                    />
                  </td>
                </tr>
              ) : globalError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-5 text-center text-sm text-body-mid"
                  >
                    <p role="alert">{globalError}</p>
                    <button
                      type="button"
                      onClick={refreshGlobal}
                      className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-hairline px-3.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : globalRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-5 text-center text-sm text-body-mid"
                  >
                    No global scores yet. Sync your progress to appear here.
                  </td>
                </tr>
              ) : (
                globalRows.map((entry, index) => {
                  const isYou = isSelf(entry.name);
                  return (
                    <tr
                      key={entry.id}
                      className={cn(
                        "border-b border-hairline last:border-b-0",
                        isYou && "bg-accent/5",
                      )}
                    >
                      <td
                        className={cn(
                          "px-2 py-2.5 font-mono text-xs text-body-mid sm:px-4",
                          isYou && "border-l-2 border-accent",
                        )}
                      >
                        {index + 1}
                      </td>
                      <td
                        className={cn(
                          "truncate px-2 py-2.5 sm:px-4",
                          isYou ? "font-medium text-accent" : "text-body",
                        )}
                      >
                        {entry.name}
                      </td>
                      <td className="px-2 py-2.5 text-right font-mono text-ink sm:px-4">
                        {entry.score}
                      </td>
                      <td className="hidden px-4 py-2.5 text-right font-mono text-body-mid sm:table-cell">
                        {entry.solved}
                      </td>
                      <td className="px-2 py-2.5 text-right font-mono text-body-mid sm:px-4">
                        {entry.streak}d
                      </td>
                    </tr>
                  );
                })
              )
            ) : (
              board.entries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={cn(
                    "border-b border-hairline last:border-b-0",
                    entry.isYou && "bg-accent/5",
                  )}
                >
                  <td
                    className={cn(
                      "px-2 py-2.5 font-mono text-xs text-body-mid sm:px-4",
                      entry.isYou && "border-l-2 border-accent",
                    )}
                  >
                    {index + 1}
                  </td>
                  <td
                    className={cn(
                      "truncate px-2 py-2.5 sm:px-4",
                      entry.isYou ? "font-medium text-accent" : "text-body",
                    )}
                  >
                    {entry.name}
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono text-ink sm:px-4">
                    {entry.score}
                  </td>
                  <td className="hidden px-4 py-2.5 text-right font-mono text-body-mid sm:table-cell">
                    {entry.solved}
                  </td>
                  <td className="px-2 py-2.5 text-right font-mono text-body-mid sm:px-4">
                    {entry.streak}d
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-body-mid">
        {tab === "global"
          ? "Global leaderboard — top scores synced to Supabase."
          : "Local leaderboard — your score lives in your browser."}
      </p>
    </section>
  );
}
