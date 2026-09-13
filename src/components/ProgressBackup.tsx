"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { clearAllProgress, exportProgress, importProgress } from "@/lib/backup";

interface Status {
  text: string;
  isError: boolean;
}

const PRIMARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

const SECONDARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-hairline px-3 py-1.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

function todayStamp(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function ProgressBackup() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status | null>(null);

  const handleExport = () => {
    try {
      const blob = new Blob([exportProgress()], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `deepforge-backup-${todayStamp()}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setStatus({ text: "Backup downloaded.", isError: false });
    } catch {
      setStatus({ text: "Could not create the backup file.", isError: true });
    }
  };

  const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0] ?? null;
    input.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const result = importProgress(text, { replace: false });
      if (result.error) {
        setStatus({ text: result.error, isError: true });
        return;
      }
      setStatus({
        text: `Imported ${result.imported} key${result.imported === 1 ? "" : "s"}`,
        isError: false,
      });
    };
    reader.onerror = () => {
      setStatus({ text: "Could not read that file.", isError: true });
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!window.confirm("Delete all DeepForge progress in this browser?")) {
      return;
    }
    const removed = clearAllProgress();
    setStatus({
      text: `Cleared ${removed} key${removed === 1 ? "" : "s"}`,
      isError: false,
    });
  };

  return (
    <section
      aria-label="Your data"
      className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-ink">Your data</h2>
        <p className="mt-1 text-xs text-body-mid">
          Everything is stored in your browser. Export a backup or move it to
          another device.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            aria-label="Export progress as a JSON backup file"
            className={PRIMARY_BUTTON}
          >
            Export
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Import progress from a JSON backup file"
            className={SECONDARY_BUTTON}
          >
            Import
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Delete all DeepForge progress in this browser"
            className={SECONDARY_BUTTON}
          >
            Reset
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            aria-label="Backup file to import"
            className="hidden"
          />
        </div>
        <p
          role="status"
          aria-live="polite"
          className={`mt-2 min-h-4 text-xs ${
            status?.isError ? "text-error" : "text-body-mid"
          }`}
        >
          {status?.text ?? ""}
        </p>
      </div>
    </section>
  );
}
