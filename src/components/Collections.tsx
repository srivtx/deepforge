"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Problem } from "@/types/problem";
import { PROBLEMS } from "@/data/problems";
import { PREMADE_COLLECTIONS } from "@/data/collections";
import {
  COLLECTIONS_CHANGE_EVENT,
  decodeCollection,
  encodeCollection,
  deleteUserCollection,
  getUserCollections,
  saveUserCollection,
  updateUserCollection,
  type UserCollection,
} from "@/lib/collections";
import { getProgress, type ProgressMap } from "@/lib/progress";
import { cn, difficultyClasses } from "@/lib/utils";
import { ProblemView } from "./ProblemView";

const PROGRESS_CHANGE_EVENT = "deepforge:progress-change";
const PROBLEM_IDS = new Set(PROBLEMS.map((p) => p.id));
const PICKER_LIMIT = 60;

interface OpenCollection {
  id: string;
  name: string;
  description: string;
  problemIds: string[];
}

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

const primaryButton =
  "rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50";
const secondaryButton =
  "rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink";
const dangerButton =
  "rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-error";

export function Collections() {
  const problemMap = useMemo(
    () => new Map(PROBLEMS.map((p) => [p.id, p])),
    [],
  );

  const [progress, setProgress] = useState<ProgressMap>({});
  const [userCollections, setUserCollections] = useState<UserCollection[]>([]);
  const [openCollection, setOpenCollection] = useState<OpenCollection | null>(
    null,
  );
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copiedTimer = useRef<number | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const [sharedIds, setSharedIds] = useState<string[] | null>(null);
  const [sharedImported, setSharedImported] = useState(false);

  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState("");

  useEffect(() => {
    const load = () => setProgress(getProgress());
    load();
    window.addEventListener(PROGRESS_CHANGE_EVENT, load);
    return () => window.removeEventListener(PROGRESS_CHANGE_EVENT, load);
  }, []);

  useEffect(() => {
    const load = () => setUserCollections(getUserCollections());
    load();
    window.addEventListener(COLLECTIONS_CHANGE_EVENT, load);
    return () => window.removeEventListener(COLLECTIONS_CHANGE_EVENT, load);
  }, []);

  useEffect(() => {
    const loadShared = () => {
      try {
        const code = new URLSearchParams(window.location.search).get(
          "collection",
        );
        if (!code) return;
        const decoded = decodeCollection(code);
        if (!decoded) return;
        const known = decoded.filter((id) => PROBLEM_IDS.has(id));
        if (known.length > 0) setSharedIds(known);
      } catch {
        /* ignore malformed share links */
      }
    };
    loadShared();
  }, []);

  useEffect(() => {
    if (!openCollection) return;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    overlayRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      returnFocusRef.current?.focus();
    };
  }, [openCollection]);

  useEffect(() => {
    if (!openCollection) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !activeProblem) setOpenCollection(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCollection, activeProblem]);

  useEffect(() => {
    return () => {
      if (copiedTimer.current !== null) {
        window.clearTimeout(copiedTimer.current);
      }
    };
  }, []);

  const picker = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    const matches = q
      ? PROBLEMS.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q),
        )
      : PROBLEMS;
    return { items: matches.slice(0, PICKER_LIMIT), total: matches.length };
  }, [pickerQuery]);

  const openProblems = useMemo<Problem[]>(() => {
    if (!openCollection) return [];
    return openCollection.problemIds
      .map((id) => problemMap.get(id))
      .filter((p): p is Problem => Boolean(p));
  }, [openCollection, problemMap]);

  const solvedCount = (ids: string[]) =>
    ids.filter((id) => progress[id]?.solved).length;

  const markCopied = (key: string) => {
    setCopiedId(key);
    if (copiedTimer.current !== null) {
      window.clearTimeout(copiedTimer.current);
    }
    copiedTimer.current = window.setTimeout(() => setCopiedId(null), 2000);
  };

  const shareCollection = async (key: string, problemIds: string[]) => {
    const code = encodeCollection(problemIds);
    const url = `${window.location.origin}${window.location.pathname}?collection=${code}`;
    const ok = await copyText(url);
    if (ok) markCopied(key);
  };

  const resetForm = () => {
    setDraftName("");
    setDraftDescription("");
    setDraftIds([]);
    setEditingId(null);
    setPickerQuery("");
  };

  const startEdit = (collection: UserCollection) => {
    setEditingId(collection.id);
    setDraftName(collection.name);
    setDraftDescription(collection.description);
    setDraftIds(collection.problemIds);
    setPickerQuery("");
  };

  const handleSave = () => {
    const name = draftName.trim();
    if (!name || draftIds.length === 0) return;
    if (editingId) {
      updateUserCollection(editingId, {
        name,
        description: draftDescription,
        problemIds: draftIds,
      });
    } else {
      saveUserCollection({
        name,
        description: draftDescription,
        problemIds: draftIds,
      });
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteUserCollection(id);
    if (editingId === id) resetForm();
    if (openCollection?.id === id) setOpenCollection(null);
  };

  const toggleDraftProblem = (id: string) => {
    setDraftIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  };

  const openShared = () => {
    if (!sharedIds) return;
    setOpenCollection({
      id: "shared",
      name: "Shared collection",
      description: "Opened from a share link.",
      problemIds: sharedIds,
    });
  };

  const importShared = () => {
    if (!sharedIds || sharedImported) return;
    saveUserCollection({
      name: "Shared collection",
      description: "Imported from a share link.",
      problemIds: sharedIds,
    });
    setSharedImported(true);
  };

  const canSave = draftName.trim().length > 0 && draftIds.length > 0;

  return (
    <section
      id="collections"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Collections
        </h2>
        <p className="mt-1 text-sm text-body-mid">
          Curated sets and your own playlists. Progress saves automatically.
        </p>
      </div>

      {sharedIds && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-accent/40 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">
              Shared collection ({sharedIds.length} problems)
            </p>
            <p className="mt-0.5 text-xs text-body-mid">
              Opened from a share link. Import it to keep it in your
              collections.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={openShared} className={primaryButton}>
              Open
            </button>
            <button
              type="button"
              onClick={importShared}
              disabled={sharedImported}
              className={secondaryButton}
            >
              {sharedImported ? "Imported" : "Import to my collections"}
            </button>
          </div>
        </div>
      )}

      <h3 className="mb-3 text-sm font-semibold text-ink">
        Premade collections
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PREMADE_COLLECTIONS.map((collection) => (
          <div
            key={collection.id}
            className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-base font-semibold text-ink">
                {collection.name}
              </h4>
              <span className="shrink-0 font-mono text-xs text-accent">
                {solvedCount(collection.problemIds)}/
                {collection.problemIds.length}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-body">
              {collection.description}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  setOpenCollection({
                    id: collection.id,
                    name: collection.name,
                    description: collection.description,
                    problemIds: collection.problemIds,
                  })
                }
                className={primaryButton}
              >
                Open
              </button>
              <button
                type="button"
                onClick={() =>
                  void shareCollection(collection.id, collection.problemIds)
                }
                className={secondaryButton}
              >
                {copiedId === collection.id ? "Copied" : "Share"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="mb-3 text-sm font-semibold text-ink">
          Your collections
        </h3>

        {userCollections.length === 0 ? (
          <p className="mb-4 text-sm text-body-mid">
            No collections yet. Create one below.
          </p>
        ) : (
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {userCollections.map((collection) => (
              <div
                key={collection.id}
                className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-base font-semibold text-ink">
                    {collection.name}
                  </h4>
                  <span className="shrink-0 font-mono text-xs text-accent">
                    {solvedCount(collection.problemIds)}/
                    {collection.problemIds.length}
                  </span>
                </div>
                {collection.description && (
                  <p className="text-sm leading-relaxed text-body">
                    {collection.description}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenCollection({
                        id: collection.id,
                        name: collection.name,
                        description: collection.description,
                        problemIds: collection.problemIds,
                      })
                    }
                    className={primaryButton}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void shareCollection(collection.id, collection.problemIds)
                    }
                    className={secondaryButton}
                  >
                    {copiedId === collection.id ? "Copied" : "Share"}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(collection)}
                    className={secondaryButton}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(collection.id)}
                    aria-label={`Delete ${collection.name}`}
                    className={dangerButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-hairline bg-canvas-card p-5">
          <h4 className="text-sm font-semibold text-ink">
            {editingId ? "Edit collection" : "Create a collection"}
          </h4>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-body-mid">
                Name
              </span>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="e.g. Weekend practice"
                className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-body-mid">
                Description
              </span>
              <input
                type="text"
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
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
            <input
              type="text"
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              placeholder="Search by title or id…"
              aria-label="Search problems by title or id"
              className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
            />

            {draftIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
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

            <div className="df-scroll mt-2 max-h-64 overflow-y-auto rounded-md border border-hairline bg-canvas">
              {picker.items.length === 0 ? (
                <p className="px-3 py-4 text-xs text-mute">
                  No problems match your search.
                </p>
              ) : (
                picker.items.map((p) => {
                  const selected = draftIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleDraftProblem(p.id)}
                      aria-pressed={selected}
                      className="flex w-full items-center gap-3 border-b border-hairline px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-canvas-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          selected
                            ? "border-accent/40 bg-accent/5 text-accent"
                            : "border-hairline text-transparent",
                        )}
                      >
                        <CheckIcon />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">
                          {p.title}
                        </span>
                        <span className="block font-mono text-[10px] text-mute">
                          {p.id} · {p.category}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                          difficultyClasses(p.difficulty),
                        )}
                      >
                        {p.difficulty}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            {picker.total > picker.items.length && (
              <p className="mt-1.5 text-[11px] text-mute">
                Showing {picker.items.length} of {picker.total} matches. Refine
                your search to narrow it down.
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className={primaryButton}
            >
              {editingId ? "Save changes" : "Save collection"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className={secondaryButton}>
                Cancel
              </button>
            )}
            {editingId && (
              <button
                type="button"
                onClick={() => handleDelete(editingId)}
                className={dangerButton}
              >
                Delete
              </button>
            )}
            {!canSave && (
              <span className="text-[11px] text-mute">
                Add a name and at least one problem.
              </span>
            )}
          </div>
        </div>
      </div>

      {openCollection && (
        <div
          ref={overlayRef}
          tabIndex={-1}
          className="df-fade-in fixed inset-0 z-40 flex items-stretch justify-center bg-canvas/80 backdrop-blur-sm outline-none sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Collection: ${openCollection.name}`}
        >
          <div className="flex h-full w-full flex-col overflow-hidden bg-canvas sm:h-auto sm:max-h-[85vh] sm:max-w-5xl sm:rounded-lg sm:border sm:border-hairline">
            <div className="flex items-start justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-ink">
                  {openCollection.name}
                </h3>
                {openCollection.description && (
                  <p className="mt-0.5 text-xs text-body-mid">
                    {openCollection.description}
                  </p>
                )}
                <p className="mt-1 font-mono text-[11px] text-mute">
                  {solvedCount(openCollection.problemIds)}/
                  {openProblems.length} solved · {openProblems.length} problems
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void shareCollection(
                      openCollection.id,
                      openCollection.problemIds,
                    )
                  }
                  className={secondaryButton}
                >
                  {copiedId === openCollection.id ? "Copied" : "Share"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenCollection(null)}
                  aria-label="Close collection"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 2l10 10M12 2L2 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="df-scroll flex-1 overflow-y-auto">
              {openProblems.length === 0 ? (
                <p className="px-4 py-6 text-sm text-mute sm:px-6">
                  This collection has no problems.
                </p>
              ) : (
                openProblems.map((p, index) => {
                  const solved = Boolean(progress[p.id]?.solved);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActiveProblem(p)}
                      className="flex w-full items-center gap-3 border-b border-hairline px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-canvas-soft focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent sm:px-6"
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
                          {p.title}
                        </span>
                        <span className="block text-[11px] text-body-mid">
                          {p.category}
                        </span>
                      </span>
                      <span className="hidden shrink-0 font-mono text-[10px] text-mute sm:inline">
                        {p.id}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                          difficultyClasses(p.difficulty),
                        )}
                      >
                        {p.difficulty}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeProblem && (
        <ProblemView
          problem={activeProblem}
          onClose={() => setActiveProblem(null)}
          onProgressChange={() => setProgress(getProgress())}
        />
      )}
    </section>
  );
}
