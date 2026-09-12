"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { getProgress } from "@/lib/progress";
import {
  getLeaderboard,
  getLongestStreak,
  getUserName,
  setUserName,
  type LeaderboardEntry,
} from "@/lib/leaderboard";

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
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-8 flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Leaderboard
        </h2>
        <p className="text-sm text-body-mid">
          Flame score weights Easy 1, Medium 3, Hard 5.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-lg border border-hairline bg-canvas-card px-3 py-3 sm:px-4">
          <div className="text-xs text-body-mid">Flame score</div>
          <div className="mt-1 font-mono text-lg font-medium text-accent sm:text-xl">
            {score}
          </div>
        </div>
        <div className="rounded-lg border border-hairline bg-canvas-card px-3 py-3 sm:px-4">
          <div className="text-xs text-body-mid">Solved</div>
          <div className="mt-1 font-mono text-lg font-medium text-ink sm:text-xl">
            {solved}
          </div>
        </div>
        <div className="rounded-lg border border-hairline bg-canvas-card px-3 py-3 sm:px-4">
          <div className="text-xs text-body-mid">Streak</div>
          <div className="mt-1 font-mono text-lg font-medium text-ink sm:text-xl">
            {streak}
          </div>
          <div className="text-xs text-body-mid">best {board.longestStreak}</div>
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
            className="w-40 rounded-md border border-hairline bg-canvas px-2 py-1 text-sm text-ink focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
        ) : (
          <>
            <button
              type="button"
              onClick={startEditing}
              className="rounded-md text-sm font-medium text-ink transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
            >
              {board.name}
            </button>
            <button
              type="button"
              onClick={startEditing}
              aria-label="Edit username"
              className="rounded-md border border-hairline px-2 py-0.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
            >
              Edit
            </button>
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-hairline bg-canvas-card">
        <table className="w-full table-fixed border-collapse text-left text-sm sm:table-auto">
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
            {board.entries.map((entry, index) => (
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
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-body-mid">
        Local leaderboard — your score lives in your browser.
      </p>
    </section>
  );
}
