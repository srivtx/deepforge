"use client";

import {
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
} from "react";
import { cn } from "@/lib/utils";
import { getUserName } from "@/lib/leaderboard";
import { Avatar } from "@/components/Avatar";
import {
  AVATAR_CHANGE_EVENT,
  AVATAR_PRESETS,
  generateAvatarSvg,
  getAvatar,
  readUpload,
  resolvePresetForSeed,
  setAvatar,
  type AvatarState,
} from "@/lib/avatars";

const USERNAME_CHANGE_EVENT = "deepforge:username-change";

interface PickerSnapshot {
  avatar: AvatarState;
  name: string;
}

const EMPTY_SNAPSHOT: PickerSnapshot = { avatar: null, name: "you" };

let cached: PickerSnapshot | null = null;

function getSnapshot(): PickerSnapshot {
  if (!cached) cached = { avatar: getAvatar(), name: getUserName() };
  return cached;
}

function getServerSnapshot(): PickerSnapshot {
  return EMPTY_SNAPSHOT;
}

function subscribe(onStoreChange: () => void): () => void {
  const onChange = () => {
    cached = null;
    onStoreChange();
  };
  window.addEventListener(AVATAR_CHANGE_EVENT, onChange);
  window.addEventListener(USERNAME_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(AVATAR_CHANGE_EVENT, onChange);
    window.removeEventListener(USERNAME_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function statusLabel(avatar: AvatarState): string {
  if (avatar?.kind === "upload") return "custom photo";
  if (avatar?.kind === "preset") return "chosen preset";
  return "auto from your name";
}

/**
 * Inline "Your look" card: preset gallery, photo upload, name-generated
 * option, and reset. Every control writes straight to the avatar store,
 * which fires the change event the header and leaderboard avatars listen to.
 */
export function AvatarPicker() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const name = snapshot.name.trim() || "you";
  const avatar = snapshot.avatar;
  const generated = resolvePresetForSeed(name);

  const choosePreset = (presetId: string) => {
    setError(null);
    setAvatar({ kind: "preset", presetId });
  };

  const useGenerated = () => {
    setError(null);
    setAvatar({ kind: "preset", presetId: generated.id });
  };

  const reset = () => {
    setError(null);
    setAvatar(null);
  };

  const openFilePicker = () => {
    fileInput.current?.click();
  };

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    setPending(true);
    try {
      const dataUrl = await readUpload(file);
      setAvatar({ kind: "upload", dataUrl });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Couldn't read that image — try another file.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <section
      aria-labelledby="avatar-picker-heading"
      className="rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar size="xl" label={`Current avatar for ${name}`} />
          <div className="min-w-0">
            <h3
              id="avatar-picker-heading"
              className="text-sm font-medium text-ink"
            >
              Your look
            </h3>
            <p className="mt-0.5 text-xs leading-relaxed text-body-mid">
              Pick a preset, generate one from your name, or upload a photo.
            </p>
            <p className="mt-1 font-mono text-[11px] text-mute">
              {name} · {statusLabel(avatar)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={useGenerated}
            className="inline-flex min-h-11 items-center rounded-lg border border-hairline px-3.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-2"
          >
            Use generated from my name
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-xs text-body-mid transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-2"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        role="group"
        aria-label="Avatar presets"
        className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-7"
      >
        {AVATAR_PRESETS.map((preset) => {
          const selected =
            avatar?.kind === "preset" && avatar.presetId === preset.id;
          const svg = generateAvatarSvg(name, preset);
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={selected}
              aria-label={`Use preset ${preset.name}`}
              title={preset.name}
              onClick={() => choosePreset(preset.id)}
              className={cn(
                "inline-flex aspect-square min-h-11 min-w-11 items-center justify-center overflow-hidden rounded-full border p-0.5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
                selected
                  ? "border-accent ring-1 ring-accent/40"
                  : "border-hairline hover:border-accent/40",
              )}
            >
              <span
                aria-hidden
                className="block h-full w-full overflow-hidden rounded-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openFilePicker}
          disabled={pending}
          aria-label="Upload a profile photo"
          className="inline-flex min-h-11 items-center rounded-lg border border-accent/40 bg-accent/5 px-3.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10 disabled:cursor-default disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-2"
        >
          {pending ? "Processing…" : "Upload photo"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
        <span
          role="status"
          aria-live="polite"
          className="text-xs text-body-mid"
        >
          {pending ? "Downscaling your photo…" : ""}
        </span>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-error/40 bg-error/5 px-3 py-2 text-xs text-error"
        >
          {error}
        </p>
      )}
    </section>
  );
}
