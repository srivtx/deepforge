"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/data/problems/meta";
import {
  deleteDraft,
  draftToTs,
  duplicateDraft,
  exportAllDrafts,
  getDrafts,
  importDrafts,
  runDraftTests,
  saveDraft,
  SUBMISSIONS_CHANGE_EVENT,
  validateDraft,
  type DraftTestCase,
  type DraftValidation,
  type SubmissionDraft,
} from "@/lib/submissions";
import type { TestResult } from "@/lib/pyodide";
import type { Category, Difficulty } from "@/types/problem";
import { cn, clipRepr, difficultyClasses } from "@/lib/utils";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

const PRIMARY_BUTTON =
  "inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-50";

const SECONDARY_BUTTON =
  "rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-50";

const DANGER_BUTTON =
  "rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:border-error/40 hover:bg-error/5 hover:text-error focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-50";

const FIELD_CLASS =
  "w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mute focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

const CODE_FIELD_CLASS =
  "df-code-editor df-scroll w-full resize-y rounded-lg border border-hairline bg-canvas px-3 py-2 font-mono text-xs leading-relaxed text-ink placeholder:text-mute focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40";

function blankDraft(): SubmissionDraft {
  const now = new Date().toISOString();
  return {
    id: "",
    title: "",
    category: "Algorithms",
    difficulty: "Easy",
    description: "",
    starterCode: "",
    solution: "",
    testCases: [
      { input: "", expected: "" },
      { input: "", expected: "" },
      { input: "", expected: "" },
    ],
    hint: "",
    createdAt: now,
    updatedAt: now,
    status: "draft",
  };
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function formatUpdated(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "recently";
  const diff = Date.now() - then;
  const minute = 60_000;
  const hour = 3_600_000;
  const day = 86_400_000;
  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function todayStamp(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function SubmitProblem() {
  const [drafts, setDrafts] = useState<SubmissionDraft[]>([]);
  const [form, setForm] = useState<SubmissionDraft>(() => blankDraft());
  const [validation, setValidation] = useState<DraftValidation | null>(null);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<{ text: string; isError: boolean } | null>(
    null,
  );
  const [tsSnippet, setTsSnippet] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const tsRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const load = () => setDrafts(getDrafts());
    load();
    window.addEventListener(SUBMISSIONS_CHANGE_EVENT, load);
    return () => window.removeEventListener(SUBMISSIONS_CHANGE_EVENT, load);
  }, []);

  useEffect(() => {
    if (!importOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setImportOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [importOpen]);

  const update = (patch: Partial<SubmissionDraft>) => {
    setForm((prev) => ({ ...prev, ...patch, status: "draft" }));
  };

  const cleanForm = (): SubmissionDraft => ({
    ...form,
    hint: form.hint && form.hint.trim() ? form.hint : undefined,
    testCases: form.testCases.map((entry) => ({ ...entry })),
  });

  const resetEditor = () => {
    setForm(blankDraft());
    setValidation(null);
    setResults(null);
    setRunError(null);
    setTsSnippet("");
  };

  const openDraft = (draft: SubmissionDraft) => {
    setForm({ ...draft, testCases: draft.testCases.map((entry) => ({ ...entry })) });
    setValidation(null);
    setResults(null);
    setRunError(null);
    setTsSnippet("");
    setStatus(null);
  };

  const isPersisted =
    form.id.length > 0 && drafts.some((draft) => draft.id === form.id);

  const isBlank =
    !form.title.trim() &&
    !form.description.trim() &&
    !form.starterCode.trim() &&
    !form.solution.trim() &&
    form.testCases.every(
      (entry) => !entry.input.trim() && !entry.expected.trim(),
    );

  const handleValidate = async () => {
    if (running) return;
    const draft = cleanForm();
    const check = validateDraft(draft);
    setValidation(check);
    setResults(null);
    setRunError(null);
    setTsSnippet("");
    if (check.errors.length > 0) {
      setStatus({
        text: `Fix ${plural(check.errors.length, "validation error")} before running tests.`,
        isError: true,
      });
      return;
    }
    setRunning(true);
    setStatus(null);
    try {
      const run = await runDraftTests(draft);
      if (run.error) {
        setRunError(run.error);
        setResults(run.results.length > 0 ? run.results : null);
        setStatus({ text: run.error, isError: true });
        return;
      }
      setResults(run.results);
      if (run.ok) {
        const saved = saveDraft({ ...draft, status: "validated" });
        setForm({ ...saved, testCases: saved.testCases.map((entry) => ({ ...entry })) });
        setStatus({
          text:
            check.warnings.length > 0
              ? `All ${plural(run.results.length, "test case")} passed — ${plural(check.warnings.length, "warning")} to review. Marked validated.`
              : `All ${plural(run.results.length, "test case")} passed. Marked validated.`,
          isError: false,
        });
      } else {
        const passed = run.results.filter((result) => result.ok).length;
        setStatus({
          text: `${passed}/${run.results.length} test cases passed — fix the failures and validate again.`,
          isError: true,
        });
      }
    } catch (error: any) {
      setRunError(error?.message || String(error));
      setStatus({ text: "The Python harness failed to run.", isError: true });
    } finally {
      setRunning(false);
    }
  };

  const handleSave = () => {
    if (running) return;
    const draft = cleanForm();
    const check = validateDraft(draft);
    setValidation(check);
    const saved = saveDraft(draft);
    setForm({ ...saved, testCases: saved.testCases.map((entry) => ({ ...entry })) });
    setResults(null);
    setRunError(null);
    setTsSnippet("");
    setStatus({
      text:
        check.errors.length > 0
          ? `Saved with ${plural(check.errors.length, "validation error")} — fix them before validating.`
          : "Draft saved in this browser.",
      isError: check.errors.length > 0,
    });
  };

  const handleDuplicate = () => {
    if (running) return;
    if (!isPersisted && isBlank) {
      setStatus({ text: "Nothing to duplicate yet.", isError: true });
      return;
    }
    let baseId = form.id;
    if (!isPersisted) {
      const saved = saveDraft(cleanForm());
      baseId = saved.id;
    }
    const copy = duplicateDraft(baseId);
    if (!copy) {
      setStatus({ text: "Could not duplicate this draft.", isError: true });
      return;
    }
    openDraft(copy);
    setStatus({ text: "Duplicated as a new draft.", isError: false });
  };

  const handleDelete = () => {
    if (running) return;
    if (isPersisted) {
      if (
        !window.confirm(
          `Delete "${form.title || "this draft"}"? This cannot be undone.`,
        )
      ) {
        return;
      }
      deleteDraft(form.id);
    }
    resetEditor();
    setStatus({
      text: isPersisted ? "Draft deleted." : "Editor cleared.",
      isError: false,
    });
  };

  const handleDeleteFromList = (draft: SubmissionDraft) => {
    if (
      !window.confirm(
        `Delete "${draft.title || "this draft"}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    deleteDraft(draft.id);
    if (form.id === draft.id) resetEditor();
    setStatus({ text: "Draft deleted.", isError: false });
  };

  const handleCopyTs = async () => {
    let snippet: string;
    try {
      snippet = draftToTs(cleanForm());
    } catch (error: any) {
      setStatus({
        text: error?.message || "Could not build the TS snippet.",
        isError: true,
      });
      return;
    }
    setTsSnippet(snippet);
    try {
      await navigator.clipboard.writeText(snippet);
      setStatus({
        text: "TS snippet copied — paste it into the matching problems file.",
        isError: false,
      });
    } catch {
      setStatus({
        text: "Clipboard unavailable — the snippet below is selected; press Ctrl/⌘+C.",
        isError: false,
      });
      window.setTimeout(() => {
        tsRef.current?.focus();
        tsRef.current?.select();
      }, 0);
    }
  };

  const handleExportAll = () => {
    if (drafts.length === 0) {
      setStatus({ text: "No drafts to export yet.", isError: true });
      return;
    }
    try {
      const blob = new Blob([exportAllDrafts()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `deepforge-submissions-${todayStamp()}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setStatus({
        text: `Exported ${plural(drafts.length, "draft")}.`,
        isError: false,
      });
    } catch {
      setStatus({ text: "Could not create the export file.", isError: true });
    }
  };

  const handleImport = () => {
    const result = importDrafts(importText);
    if (result.error) {
      setStatus({ text: result.error, isError: true });
      return;
    }
    setImportOpen(false);
    setImportText("");
    setStatus({
      text: `Imported ${plural(result.imported, "draft")}.`,
      isError: false,
    });
  };

  const updateCase = (index: number, patch: Partial<DraftTestCase>) => {
    update({
      testCases: form.testCases.map((entry, i) =>
        i === index ? { ...entry, ...patch } : entry,
      ),
    });
  };

  const addCase = () => {
    if (form.testCases.length >= 6) return;
    update({ testCases: [...form.testCases, { input: "", expected: "" }] });
  };

  const removeCase = (index: number) => {
    if (form.testCases.length <= 3) return;
    update({ testCases: form.testCases.filter((_, i) => i !== index) });
  };

  const allPass =
    results !== null && results.length > 0 && results.every((result) => result.ok);
  const passCount = results !== null ? results.filter((result) => result.ok).length : 0;

  return (
    <section
      id="submit-problem"
      className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Submit a Problem
        </h2>
        <p className="mt-1 text-sm text-body-mid">
          Author a problem, validate it locally against the same test runner
          that judges every problem, then paste the exported snippet into the
          repo. {plural(drafts.length, "draft")} saved in this browser — honor
          system, nothing is uploaded.
        </p>
      </div>

      <form
        className="rounded-lg border border-hairline bg-canvas-card"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="border-b border-hairline px-4 py-3 sm:px-5">
          <h3 className="text-sm font-semibold text-ink">
            {isPersisted ? "Edit draft" : "New draft"}
          </h3>
          <p className="mt-0.5 text-xs text-body-mid">
            Test cases take JSON: input is the array of positional arguments,
            expected is the return value.
          </p>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-5">
          <div>
            <label htmlFor="submit-title" className="mb-1 block text-xs font-medium text-body-mid">
              Title
            </label>
            <input
              id="submit-title"
              type="text"
              value={form.title}
              onChange={(event) => update({ title: event.target.value })}
              placeholder="Binary Search"
              className={FIELD_CLASS}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="submit-category" className="mb-1 block text-xs font-medium text-body-mid">
                Category
              </label>
              <select
                id="submit-category"
                value={form.category}
                onChange={(event) =>
                  update({ category: event.target.value as Category })
                }
                className={FIELD_CLASS}
              >
                {CATEGORIES.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="submit-difficulty" className="mb-1 block text-xs font-medium text-body-mid">
                Difficulty
              </label>
              <select
                id="submit-difficulty"
                value={form.difficulty}
                onChange={(event) =>
                  update({ difficulty: event.target.value as Difficulty })
                }
                className={FIELD_CLASS}
              >
                {DIFFICULTIES.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="submit-description" className="mb-1 block text-xs font-medium text-body-mid">
              Description
            </label>
            <textarea
              id="submit-description"
              value={form.description}
              onChange={(event) => update({ description: event.target.value })}
              rows={4}
              placeholder="State the function signature, the algorithm or formula, and any assumptions. Separate paragraphs with a blank line."
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="submit-starter" className="mb-1 block text-xs font-medium text-body-mid">
              Starter code
            </label>
            <textarea
              id="submit-starter"
              value={form.starterCode}
              onChange={(event) => update({ starterCode: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Tab") {
                  event.preventDefault();
                  const target = event.currentTarget;
                  const start = target.selectionStart;
                  const end = target.selectionEnd;
                  const next =
                    form.starterCode.slice(0, start) +
                    "    " +
                    form.starterCode.slice(end);
                  update({ starterCode: next });
                  requestAnimationFrame(() => {
                    target.selectionStart = target.selectionEnd = start + 4;
                  });
                }
              }}
              rows={6}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              placeholder={"def binary_search(arr, target):\n    # Your code here\n    pass"}
              className={CODE_FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="submit-solution" className="mb-1 block text-xs font-medium text-body-mid">
              Solution
            </label>
            <textarea
              id="submit-solution"
              value={form.solution}
              onChange={(event) => update({ solution: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Tab") {
                  event.preventDefault();
                  const target = event.currentTarget;
                  const start = target.selectionStart;
                  const end = target.selectionEnd;
                  const next =
                    form.solution.slice(0, start) +
                    "    " +
                    form.solution.slice(end);
                  update({ solution: next });
                  requestAnimationFrame(() => {
                    target.selectionStart = target.selectionEnd = start + 4;
                  });
                }
              }}
              rows={8}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              placeholder={"def binary_search(arr, target):\n    # Your implementation\n    return -1"}
              className={CODE_FIELD_CLASS}
            />
            <p className="mt-1 text-[10px] text-mute">
              Pure Python only. The first `def` is the function under test and
              must match the starter name.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-body-mid">Test cases</span>
              <span className="font-mono text-[10px] text-mute">
                {form.testCases.length}/6 · min 3
              </span>
            </div>
            {form.testCases.map((testCase, index) => (
              <div
                key={index}
                className="rounded-lg border border-hairline bg-canvas p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-mute">
                    case {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCase(index)}
                    disabled={form.testCases.length <= 3}
                    aria-label={`Remove test case ${index + 1}`}
                    className="rounded-lg px-2 py-0.5 text-[11px] text-body-mid transition-colors hover:text-error focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 disabled:opacity-40 disabled:hover:text-body-mid"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`submit-case-${index}-input`}
                      className="mb-1 block text-[10px] font-medium text-body-mid"
                    >
                      Input (JSON array)
                    </label>
                    <textarea
                      id={`submit-case-${index}-input`}
                      value={testCase.input}
                      onChange={(event) =>
                        updateCase(index, { input: event.target.value })
                      }
                      rows={2}
                      spellCheck={false}
                      autoCapitalize="off"
                      autoCorrect="off"
                      placeholder="[[1, 3, 5, 7], 5]"
                      className={CODE_FIELD_CLASS}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`submit-case-${index}-expected`}
                      className="mb-1 block text-[10px] font-medium text-body-mid"
                    >
                      Expected (JSON)
                    </label>
                    <textarea
                      id={`submit-case-${index}-expected`}
                      value={testCase.expected}
                      onChange={(event) =>
                        updateCase(index, { expected: event.target.value })
                      }
                      rows={2}
                      spellCheck={false}
                      autoCapitalize="off"
                      autoCorrect="off"
                      placeholder="2"
                      className={CODE_FIELD_CLASS}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addCase}
              disabled={form.testCases.length >= 6}
              className={SECONDARY_BUTTON}
            >
              Add test case
            </button>
          </div>

          <div>
            <label htmlFor="submit-hint" className="mb-1 block text-xs font-medium text-body-mid">
              Hint <span className="text-mute">(optional)</span>
            </label>
            <input
              id="submit-hint"
              type="text"
              value={form.hint ?? ""}
              onChange={(event) => update({ hint: event.target.value })}
              placeholder="Halve the search range each iteration."
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={handleValidate}
            disabled={running}
            className={PRIMARY_BUTTON}
          >
            {running && (
              <span
                className="df-spin h-3 w-3 rounded-full border-2 border-canvas/40 border-t-canvas"
                aria-hidden
              />
            )}
            {running ? "Loading Python…" : "Validate"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={running}
            className={SECONDARY_BUTTON}
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={handleCopyTs}
            className={SECONDARY_BUTTON}
          >
            Copy TS snippet
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={running}
            className={SECONDARY_BUTTON}
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={running}
            className={DANGER_BUTTON}
          >
            Delete
          </button>
          <p
            role="status"
            aria-live="polite"
            className={cn(
              "w-full min-h-4 text-xs sm:ml-auto sm:w-auto",
              status?.isError ? "text-error" : "text-body-mid",
            )}
          >
            {status?.text ?? ""}
          </p>
        </div>

        {validation &&
          (validation.errors.length > 0 || validation.warnings.length > 0) && (
            <div className="border-t border-hairline px-4 py-3 sm:px-5">
              {validation.errors.length > 0 && (
                <ul className="list-disc space-y-1 pl-4">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="text-xs text-error">
                      {error}
                    </li>
                  ))}
                </ul>
              )}
              {validation.warnings.length > 0 && (
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {validation.warnings.map((warning, index) => (
                    <li key={index} className="text-xs text-warning">
                      {warning}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

        {results !== null && (
          <div className="border-t border-hairline px-4 py-4 sm:px-5" aria-live="polite">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-medium text-body-mid">Results</h3>
              <span
                className={cn(
                  "font-mono text-xs",
                  allPass ? "text-accent" : "text-body-mid",
                )}
              >
                {passCount}/{results.length} passed
                {allPass && " · all green"}
              </span>
            </div>
            <div className="space-y-2">
              {runError && runError.length > 0 && (
                <div className="rounded-md border border-error/40 bg-error/5 p-2.5">
                  <div className="mb-1 text-[10px] font-medium text-error">
                    Python error
                  </div>
                  <pre className="df-scroll overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-body">
                    {runError}
                  </pre>
                </div>
              )}
              {results.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-md border p-2.5",
                    result.ok
                      ? "border-accent/40 bg-accent/5"
                      : "border-error/40 bg-error/5",
                  )}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full",
                        result.ok
                          ? "bg-accent/15 text-accent"
                          : "bg-error/15 text-error",
                      )}
                    >
                      {result.ok ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                          <path
                            d="M2 5l2 2 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                          <path
                            d="M2 2l6 6M8 2L2 8"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-mute">
                      case {index + 1}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-medium",
                        result.ok ? "text-accent" : "text-error",
                      )}
                    >
                      {result.ok ? "passed" : "failed"}
                    </span>
                  </div>
                  {result.error ? (
                    <pre className="df-scroll overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-error">
                      {result.error}
                    </pre>
                  ) : (
                    <div className="space-y-1">
                      <div className="font-mono text-[11px] text-body">
                        <span className="text-body-mid">actual: </span>
                        {clipRepr(result.actual, 240)}
                      </div>
                      {!result.ok && (
                        <div className="font-mono text-[11px] text-body-mid">
                          <span>expected: </span>
                          {clipRepr(result.expected, 240)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tsSnippet && (
          <div className="border-t border-hairline px-4 py-3 sm:px-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label
                htmlFor="submit-ts-snippet"
                className="text-xs font-medium text-body-mid"
              >
                TS snippet
              </label>
              <button
                type="button"
                onClick={() => setTsSnippet("")}
                className="text-[11px] text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40"
              >
                Hide
              </button>
            </div>
            <textarea
              id="submit-ts-snippet"
              ref={tsRef}
              value={tsSnippet}
              readOnly
              rows={12}
              aria-label="Generated TypeScript problem snippet"
              className={CODE_FIELD_CLASS}
            />
          </div>
        )}
      </form>

      <div className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-ink">
            Your drafts{" "}
            <span className="font-normal text-body-mid">({drafts.length})</span>
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportAll}
              className={SECONDARY_BUTTON}
            >
              Export all
            </button>
            <button
              type="button"
              onClick={() => setImportOpen((open) => !open)}
              aria-expanded={importOpen}
              aria-controls="submit-import-panel"
              className={SECONDARY_BUTTON}
            >
              Import
            </button>
          </div>
        </div>

        {importOpen && (
          <div
            id="submit-import-panel"
            className="mb-4 rounded-lg border border-hairline bg-canvas-card p-4"
          >
            <label
              htmlFor="submit-import"
              className="mb-1 block text-xs font-medium text-body-mid"
            >
              Paste a submissions backup (JSON)
            </label>
            <textarea
              id="submit-import"
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              rows={4}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              placeholder='{"app":"deepforge-submissions","version":1,"drafts":[]}'
              className={CODE_FIELD_CLASS}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={handleImport}
                disabled={!importText.trim()}
                className={PRIMARY_BUTTON}
              >
                Import drafts
              </button>
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className={SECONDARY_BUTTON}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {drafts.length === 0 ? (
          <div className="rounded-lg border border-hairline bg-canvas-card p-5">
            <p className="text-sm text-body-mid">
              No drafts yet. Fill in the editor above, hit Validate to run the
              tests locally, then save or export the TS snippet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border bg-canvas-card p-4",
                  form.id === draft.id ? "border-accent/40" : "border-hairline",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                    {draft.title || "Untitled draft"}
                  </h4>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      draft.status === "validated"
                        ? "border-accent/40 bg-accent/5 text-accent"
                        : "border-hairline text-body-mid",
                    )}
                  >
                    {draft.status === "validated" ? "Validated" : "Draft"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span
                    className={cn(
                      "rounded-full border px-1.5 py-0.5 font-medium",
                      difficultyClasses(draft.difficulty),
                    )}
                  >
                    {draft.difficulty}
                  </span>
                  <span className="text-body-mid">{draft.category}</span>
                  <span className="text-mute" aria-hidden>
                    ·
                  </span>
                  <span className="font-mono text-mute">
                    {plural(draft.testCases.length, "test")}
                  </span>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-mute">
                    Updated {formatUpdated(draft.updatedAt)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openDraft(draft)}
                      aria-label={`Open draft: ${draft.title || "Untitled draft"}`}
                      className={SECONDARY_BUTTON}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFromList(draft)}
                      aria-label={`Delete draft: ${draft.title || "Untitled draft"}`}
                      className={DANGER_BUTTON}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
