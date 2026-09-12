"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { Problem } from "@/types/problem";
import { PROBLEMS } from "@/data/problems";
import {
  PLAYLISTS_CHANGE_EVENT,
  addToPlaylist,
  createPlaylist,
  decodePlaylist,
  deletePlaylist,
  duplicatePlaylist,
  encodePlaylist,
  forkPlaylist,
  getPlaylists,
  playlistProgress,
  removeFromPlaylist,
  renamePlaylist,
  reorderPlaylist,
  type Playlist,
} from "@/lib/playlists";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { cn, difficultyClasses } from "@/lib/utils";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";
const PICKER_LIMIT = 50;

const fieldClasses =
  "w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";
const primaryButton =
  "rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50";
const secondaryButton =
  "rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink disabled:opacity-50";
const dangerButton =
  "rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-error";
const iconButton =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-hairline text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink disabled:cursor-default disabled:opacity-40";

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M2 5l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <circle cx="4" cy="2" r="1" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="10" r="1" />
      <circle cx="8" cy="2" r="1" />
      <circle cx="8" cy="6" r="1" />
      <circle cx="8" cy="10" r="1" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d={direction === "up" ? "M2 6l3-3 3 3" : "M2 4l3 3 3-3"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2 2l10 10M12 2L2 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the textarea fallback */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Accept either a bare share code or a full URL containing ?playlist=. */
function extractShareCode(raw: string): string {
  const value = raw.trim();
  const match = value.match(/[?&]playlist=([^&\s]+)/);
  return match ? match[1] : value;
}

interface ProblemPickerProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  label?: string;
}

function ProblemPicker({
  selectedIds,
  onToggle,
  label = "Search problems by title, id, or category",
}: ProblemPickerProps) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Filter the full catalogue on every keystroke, but only ever render the
  // first PICKER_LIMIT matches so the DOM stays small.
  const picker = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        items: PROBLEMS.slice(0, PICKER_LIMIT),
        total: PROBLEMS.length,
      };
    }
    const items: Problem[] = [];
    let total = 0;
    for (const problem of PROBLEMS) {
      const matches =
        problem.title.toLowerCase().includes(q) ||
        problem.id.toLowerCase().includes(q) ||
        problem.category.toLowerCase().includes(q);
      if (!matches) continue;
      total += 1;
      if (items.length < PICKER_LIMIT) items.push(problem);
    }
    return { items, total };
  }, [query]);

  const activeProblem = picker.items[activeIndex];

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        picker.items.length === 0
          ? 0
          : Math.min(index + 1, picker.items.length - 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      if (!activeProblem) return;
      event.preventDefault();
      onToggle(activeProblem.id);
    }
  };

  return (
    <div>
      <input
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-activedescendant={
          activeProblem ? `${listId}-${activeIndex}` : undefined
        }
        aria-autocomplete="list"
        aria-label={label}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={onKeyDown}
        placeholder="Search by title, id, or category…"
        className={fieldClasses}
      />
      <div
        id={listId}
        role="listbox"
        aria-label="Matching problems"
        className="df-scroll mt-2 max-h-64 overflow-y-auto rounded-md border border-hairline bg-canvas"
      >
        {picker.items.length === 0 ? (
          <p className="px-3 py-4 text-xs text-mute">
            No problems match your search.
          </p>
        ) : (
          picker.items.map((problem, index) => {
            const isSelected = selected.has(problem.id);
            const isActive = index === activeIndex;
            return (
              <div
                key={problem.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => onToggle(problem.id)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 border-b border-hairline px-3 py-2 transition-colors last:border-b-0",
                  isActive && "bg-canvas-soft",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    isSelected
                      ? "border-accent/40 bg-accent/5 text-accent"
                      : "border-hairline text-transparent",
                  )}
                  aria-hidden
                >
                  <CheckIcon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">
                    {problem.title}
                  </span>
                  <span className="block font-mono text-[10px] text-mute">
                    {problem.id} · {problem.category}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                    difficultyClasses(problem.difficulty),
                  )}
                >
                  {problem.difficulty}
                </span>
              </div>
            );
          })
        )}
      </div>
      {picker.total > picker.items.length && (
        <p className="mt-1.5 text-[11px] text-mute">
          Showing {picker.items.length} of {picker.total} matches. Refine your
          search to narrow it down.
        </p>
      )}
    </div>
  );
}

interface ImportMessage {
  text: string;
  ok: boolean;
}

function ImportForm({ onImport }: { onImport: (code: string) => boolean }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<ImportMessage | null>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!code.trim()) return;
        if (onImport(code)) {
          setCode("");
          setMessage({
            text: "Playlist imported. Rename it or reorder it any time.",
            ok: true,
          });
        } else {
          setMessage({
            text: "That code could not be read. Double-check the link and try again.",
            ok: false,
          });
        }
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            if (message) setMessage(null);
          }}
          placeholder="Paste a share link or code…"
          aria-label="Playlist share link or code"
          className={cn(fieldClasses, "sm:flex-1")}
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className={secondaryButton}
        >
          Import
        </button>
      </div>
      {message && (
        <p
          className={cn(
            "mt-2 text-[11px]",
            message.ok ? "text-accent" : "text-error",
          )}
          role="status"
        >
          {message.text}
        </p>
      )}
    </form>
  );
}

export function Playlists() {
  const problemMap = useMemo(
    () => new Map(PROBLEMS.map((p) => [p.id, p])),
    [],
  );

  const [progress, setProgress] = useState<ProgressMap>({});
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [shared, setShared] = useState<{
    code: string;
    name: string;
    description?: string;
    itemIds: string[];
  } | null>(null);
  const [sharedImported, setSharedImported] = useState(false);

  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>([]);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const [openId, setOpenId] = useState<string | null>(null);
  const [share, setShare] = useState<{ id: string; url: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const copiedTimer = useRef<number | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const opened = useMemo(
    () => playlists.find((playlist) => playlist.id === openId) ?? null,
    [playlists, openId],
  );

  const solvedIds = useMemo(() => {
    const set = new Set<string>();
    for (const [id, entry] of Object.entries(progress)) {
      if (entry.solved) set.add(id);
    }
    return set;
  }, [progress]);

  useEffect(() => {
    const load = () => {
      const next = getPlaylists();
      setPlaylists(next);
      setOpenId((id) =>
        id && !next.some((playlist) => playlist.id === id) ? null : id,
      );
    };
    load();
    window.addEventListener(PLAYLISTS_CHANGE_EVENT, load);
    return () => window.removeEventListener(PLAYLISTS_CHANGE_EVENT, load);
  }, []);

  useEffect(() => {
    const load = () => setProgress(getProgress());
    load();
    window.addEventListener(PROGRESS_CHANGE_EVENT, load);
    return () => window.removeEventListener(PROGRESS_CHANGE_EVENT, load);
  }, []);

  // Surface a share link on load without rewriting or clearing the URL.
  useEffect(() => {
    const loadShared = () => {
      try {
        const code = new URLSearchParams(window.location.search).get(
          "playlist",
        );
        if (!code) return;
        const decoded = decodePlaylist(code);
        if (!decoded) return;
        setShared({ code, ...decoded });
      } catch {
        /* ignore malformed share links */
      }
    };
    loadShared();
  }, []);

  useEffect(() => {
    if (!openId) return;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    overlayRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [openId]);

  useEffect(() => {
    if (!openId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  useEffect(() => {
    return () => {
      if (copiedTimer.current !== null) {
        window.clearTimeout(copiedTimer.current);
      }
    };
  }, []);

  const markCopied = (key: string) => {
    setCopiedKey(key);
    if (copiedTimer.current !== null) {
      window.clearTimeout(copiedTimer.current);
    }
    copiedTimer.current = window.setTimeout(() => setCopiedKey(null), 2000);
  };

  const openPlaylist = (id: string) => {
    setOpenId(id);
    setShare(null);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const openProblem = (id: string) => {
    window.dispatchEvent(
      new CustomEvent("deepforge:open-problem", { detail: { id } }),
    );
  };

  const toggleDraftProblem = (id: string) => {
    setDraftIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
  };

  const toggleInPlaylist = (playlistId: string, problemId: string) => {
    const playlist = playlists.find((item) => item.id === playlistId);
    if (!playlist) return;
    if (playlist.itemIds.includes(problemId)) {
      removeFromPlaylist(playlistId, problemId);
    } else {
      addToPlaylist(playlistId, problemId);
    }
  };

  const handleCreate = () => {
    const name = draftName.trim();
    if (!name || draftIds.length === 0) return;
    createPlaylist(name, draftIds, draftDescription);
    setDraftName("");
    setDraftDescription("");
    setDraftIds([]);
  };

  const startRename = (playlist: Playlist) => {
    setRenamingId(playlist.id);
    setRenameDraft(playlist.name);
  };

  const commitRename = (id: string) => {
    const name = renameDraft.trim();
    if (name) renamePlaylist(id, name);
    setRenamingId(null);
    setRenameDraft("");
  };

  const handleDelete = (id: string) => {
    deletePlaylist(id);
    if (renamingId === id) setRenamingId(null);
    if (openId === id) setOpenId(null);
  };

  const sharePlaylist = async (playlist: Playlist) => {
    const code = encodePlaylist(playlist);
    if (!code) return;
    const url = `${window.location.origin}${window.location.pathname}?playlist=${code}`;
    setShare({ id: playlist.id, url });
    const ok = await copyText(url);
    if (ok) markCopied(`share-${playlist.id}`);
  };

  const importFromCode = (raw: string): boolean => {
    const code = extractShareCode(raw);
    if (!code) return false;
    return forkPlaylist(code) !== null;
  };

  const importShared = () => {
    if (!shared || sharedImported) return;
    if (importFromCode(shared.code)) setSharedImported(true);
  };

  const canCreate = draftName.trim().length > 0 && draftIds.length > 0;
  const openedProgress = opened
    ? playlistProgress(opened, solvedIds)
    : { solved: 0, total: 0 };

  return (
    <section
      id="playlists"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Playlists
          </h2>
          <span className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 font-mono text-xs text-body-mid">
            {playlists.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-body-mid">
          Build your own problem lists, share them with a link, and fork lists
          from other people. Progress tracks against what you have solved.
        </p>
      </div>

      {shared && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-accent/40 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">
              Shared playlist: {shared.name} ({shared.itemIds.length} problems)
            </p>
            {shared.description && (
              <p className="mt-0.5 text-xs text-body-mid">
                {shared.description}
              </p>
            )}
            <p className="mt-0.5 text-xs text-body-mid">
              Opened from a share link. Fork it to keep your own copy.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={importShared}
              disabled={sharedImported}
              className={primaryButton}
            >
              {sharedImported ? "Forked" : "Fork to my playlists"}
            </button>
            <button
              type="button"
              onClick={() => setShared(null)}
              className={secondaryButton}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <h3 className="mb-3 text-sm font-semibold text-ink">Your playlists</h3>

      {playlists.length === 0 ? (
        <div className="rounded-lg border border-dashed border-hairline bg-canvas-card p-8 text-center">
          <p className="text-sm font-medium text-ink">No playlists yet</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-body-mid">
            Build a list below, then share the link. Anyone can fork your
            playlist into their own library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => {
            const { solved, total } = playlistProgress(playlist, solvedIds);
            const percent =
              total === 0 ? 0 : Math.round((solved / total) * 100);
            return (
              <div
                key={playlist.id}
                className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  {renamingId === playlist.id ? (
                    <form
                      className="flex min-w-0 flex-1 items-center gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        commitRename(playlist.id);
                      }}
                    >
                      <input
                        type="text"
                        value={renameDraft}
                        onChange={(event) => setRenameDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            setRenamingId(null);
                            setRenameDraft("");
                          }
                        }}
                        autoFocus
                        aria-label={`Rename ${playlist.name}`}
                        className={cn(fieldClasses, "min-w-0 flex-1 py-1.5")}
                      />
                      <button
                        type="submit"
                        disabled={!renameDraft.trim()}
                        className={primaryButton}
                      >
                        Save
                      </button>
                    </form>
                  ) : (
                    <h4 className="min-w-0 truncate text-base font-semibold text-ink">
                      {playlist.name}
                    </h4>
                  )}
                  <span className="shrink-0 font-mono text-xs text-accent">
                    {solved}/{total}
                  </span>
                </div>

                {playlist.description && (
                  <p className="text-sm leading-relaxed text-body">
                    {playlist.description}
                  </p>
                )}

                <div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-canvas-soft"
                    role="progressbar"
                    aria-label={`${playlist.name} progress`}
                    aria-valuemin={0}
                    aria-valuemax={total}
                    aria-valuenow={solved}
                  >
                    <div
                      className="h-full rounded-full bg-accent transition-[width]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-mute">
                    {percent}% solved · {total}{" "}
                    {total === 1 ? "problem" : "problems"}
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openPlaylist(playlist.id)}
                    className={primaryButton}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => startRename(playlist)}
                    className={secondaryButton}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicatePlaylist(playlist.id)}
                    className={secondaryButton}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(playlist.id)}
                    aria-label={`Delete ${playlist.name}`}
                    className={dangerButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-canvas-card p-5">
          <h4 className="text-sm font-semibold text-ink">Create a playlist</h4>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-body-mid">
                Name
              </span>
              <input
                type="text"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="e.g. Dynamic programming drill"
                className={fieldClasses}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-body-mid">
                Description
              </span>
              <input
                type="text"
                value={draftDescription}
                onChange={(event) => setDraftDescription(event.target.value)}
                placeholder="Optional"
                className={fieldClasses}
              />
            </label>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-body-mid">
                Problems
              </span>
              <span className="font-mono text-[11px] text-mute">
                {draftIds.length} selected
              </span>
            </div>

            {draftIds.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {draftIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleDraftProblem(id)}
                    aria-label={`Remove ${id}`}
                    className="rounded border border-accent/40 bg-accent/5 px-1.5 py-0.5 font-mono text-[10px] text-accent transition-opacity hover:opacity-80"
                  >
                    {id} ×
                  </button>
                ))}
              </div>
            )}

            <ProblemPicker selectedIds={draftIds} onToggle={toggleDraftProblem} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={!canCreate}
              className={primaryButton}
            >
              Save playlist
            </button>
            {!canCreate && (
              <span className="text-[11px] text-mute">
                Add a name and at least one problem.
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-hairline bg-canvas-card p-5">
          <h4 className="text-sm font-semibold text-ink">Import a playlist</h4>
          <p className="mt-1 text-xs text-body-mid">
            Paste a share link or share code to fork it into your library.
          </p>
          <div className="mt-3">
            <ImportForm onImport={importFromCode} />
          </div>
        </div>
      </div>

      {opened && (
        <div
          ref={overlayRef}
          tabIndex={-1}
          className="df-fade-in fixed inset-0 z-40 flex items-stretch justify-center bg-canvas/80 backdrop-blur-sm outline-none sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Playlist: ${opened.name}`}
        >
          <div className="flex h-full w-full flex-col overflow-hidden bg-canvas sm:h-auto sm:max-h-[85vh] sm:max-w-3xl sm:rounded-lg sm:border sm:border-hairline">
            <div className="flex items-start justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-ink">
                  {opened.name}
                </h3>
                {opened.description && (
                  <p className="mt-0.5 text-xs text-body-mid">
                    {opened.description}
                  </p>
                )}
                <p className="mt-1 font-mono text-[11px] text-mute">
                  {openedProgress.solved}/{openedProgress.total} solved ·{" "}
                  {opened.itemIds.length}{" "}
                  {opened.itemIds.length === 1 ? "problem" : "problems"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => void sharePlaylist(opened)}
                  className={secondaryButton}
                >
                  {copiedKey === `share-${opened.id}` ? "Copied" : "Share"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  aria-label="Close playlist"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {share && share.id === opened.id && (
              <div className="border-b border-hairline bg-canvas-soft px-4 py-3 sm:px-6">
                <label
                  htmlFor={`playlist-share-${opened.id}`}
                  className="mb-1 block text-xs font-medium text-body-mid"
                >
                  Share link
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    id={`playlist-share-${opened.id}`}
                    readOnly
                    value={share.url}
                    onFocus={(event) => event.currentTarget.select()}
                    className={cn(
                      fieldClasses,
                      "min-w-0 flex-1 font-mono text-[11px]",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void copyText(share.url).then((ok) => {
                        if (ok) markCopied(`share-${opened.id}`);
                      });
                    }}
                    className={secondaryButton}
                  >
                    {copiedKey === `share-${opened.id}` ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            <div className="df-scroll min-h-0 flex-1 overflow-y-auto">
              {opened.itemIds.length === 0 ? (
                <p className="px-4 py-6 text-sm text-mute sm:px-6">
                  This playlist is empty. Add problems below.
                </p>
              ) : (
                opened.itemIds.map((id, index) => {
                  const problem = problemMap.get(id);
                  if (!problem) return null;
                  const solved = solvedIds.has(id);
                  const isDragging = dragIndex === index;
                  const isDropTarget =
                    dragOverIndex === index &&
                    dragIndex !== null &&
                    dragIndex !== index;
                  return (
                    <div
                      key={id}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                        setDragOverIndex(index);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (dragIndex !== null && dragIndex !== index) {
                          reorderPlaylist(opened.id, dragIndex, index);
                        }
                        setDragIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={cn(
                        "flex items-center gap-2 border-b border-hairline px-3 py-2 last:border-b-0 sm:px-4",
                        isDragging && "opacity-50",
                        isDropTarget && "bg-accent/5",
                      )}
                    >
                      <span
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData(
                            "text/plain",
                            String(index),
                          );
                          setDragIndex(index);
                        }}
                        onDragEnd={() => {
                          setDragIndex(null);
                          setDragOverIndex(null);
                        }}
                        aria-hidden
                        title="Drag to reorder"
                        className="flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-md border border-hairline text-mute transition-colors hover:bg-canvas-soft hover:text-ink active:cursor-grabbing"
                      >
                        <GripIcon />
                      </span>

                      <button
                        type="button"
                        onClick={() => openProblem(id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                            solved
                              ? "border-accent/40 bg-accent/5 text-accent"
                              : "border-hairline text-mute",
                          )}
                        >
                          {solved ? <CheckIcon /> : index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">
                            {problem.title}
                          </span>
                          <span className="block font-mono text-[10px] text-mute">
                            {problem.id} · {problem.category}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                            difficultyClasses(problem.difficulty),
                          )}
                        >
                          {problem.difficulty}
                        </span>
                      </button>

                      <div className="flex shrink-0 flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() =>
                            reorderPlaylist(opened.id, index, index - 1)
                          }
                          aria-label={`Move ${problem.title} up`}
                          className={iconButton}
                        >
                          <ChevronIcon direction="up" />
                        </button>
                        <button
                          type="button"
                          disabled={index === opened.itemIds.length - 1}
                          onClick={() =>
                            reorderPlaylist(opened.id, index, index + 1)
                          }
                          aria-label={`Move ${problem.title} down`}
                          className={iconButton}
                        >
                          <ChevronIcon direction="down" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromPlaylist(opened.id, id)}
                        aria-label={`Remove ${problem.title} from ${opened.name}`}
                        className={iconButton}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  );
                })
              )}

              <details className="border-t border-hairline">
                <summary className="cursor-pointer select-none px-4 py-3 text-xs font-medium text-body-mid transition-colors hover:text-ink sm:px-6">
                  Add problems
                </summary>
                <div className="px-4 pb-4 sm:px-6">
                  <ProblemPicker
                    selectedIds={opened.itemIds}
                    onToggle={(problemId) =>
                      toggleInPlaylist(opened.id, problemId)
                    }
                  />
                </div>
              </details>

              <details className="border-t border-hairline">
                <summary className="cursor-pointer select-none px-4 py-3 text-xs font-medium text-body-mid transition-colors hover:text-ink sm:px-6">
                  Import a playlist
                </summary>
                <div className="px-4 pb-4 sm:px-6">
                  <ImportForm onImport={importFromCode} />
                </div>
              </details>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
