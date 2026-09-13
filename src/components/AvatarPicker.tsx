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
import { CHARACTER_ART } from "@/components/avatars/characters";
import { NftAvatarArt } from "@/components/avatars/NftAvatarArt";
import { rarityScore, selectAvatarTraits } from "@/lib/nftAvatar";
import {
  removeAvatarImage,
  uploadAvatarImage,
} from "@/lib/avatarStorage";
import { getCachedSession } from "@/lib/sync/backend";
import {
  AVATAR_CHANGE_EVENT,
  AVATAR_PRESETS,
  buildUploadedAvatar,
  generateAvatarSvg,
  getAvatar,
  readUpload,
  setAvatar,
  type AvatarPreset,
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

function PresetSwatch({ preset, seed }: { preset: AvatarPreset; seed: string }) {
  const Art = preset.art ? CHARACTER_ART[preset.art] : undefined;
  if (Art) return <Art className="block h-full w-full" />;
  return (
    <span
      aria-hidden
      className="block h-full w-full overflow-hidden rounded-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
      dangerouslySetInnerHTML={{ __html: generateAvatarSvg(seed, preset) }}
    />
  );
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
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [nftSeed, setNftSeed] = useState<string>("");
  const fileInput = useRef<HTMLInputElement>(null);

  const name = snapshot.name.trim() || "you";
  const avatar = snapshot.avatar;
  const characters = AVATAR_PRESETS.filter((preset) => preset.art);
  const patterns = AVATAR_PRESETS.filter((preset) => !preset.art);

  const activeSeed = nftSeed || name;
  const nftSelection = selectAvatarTraits(activeSeed);
  const nftRare = rarityScore(nftSelection);
  const nftTraits = [
    nftSelection.traits.background,
    nftSelection.traits.head,
    nftSelection.traits.eyes,
    nftSelection.traits.mouth,
    nftSelection.traits.headwear,
    nftSelection.traits.accessories,
    nftSelection.traits.clothing,
    nftSelection.traits.extras,
  ].filter((trait) => trait.id !== "none");

  const chooseNft = (seed: string) => {
    setError(null);
    setSyncNote(null);
    setAvatar({ kind: "nft", seed });
  };

  const rerollNft = () => {
    setError(null);
    setSyncNote(null);
    const uuid =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    setNftSeed(uuid);
  };

  const choosePreset = (presetId: string) => {
    setError(null);
    setSyncNote(null);
    setAvatar({ kind: "preset", presetId });
  };

  const useGenerated = () => {
    setError(null);
    setSyncNote(null);
    chooseNft(name);
  };

  const reset = () => {
    setError(null);
    setSyncNote(null);
    setAvatar(null);
    const session = getCachedSession();
    if (session) void removeAvatarImage(session.userId);
  };

  const openFilePicker = () => {
    fileInput.current?.click();
  };

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    setSyncNote(null);
    setPending(true);
    try {
      const dataUrl = await readUpload(file);
      setAvatar(buildUploadedAvatar(dataUrl));
      const session = getCachedSession();
      if (!session) {
        setSyncNote("Saved on this device — sign in to sync");
        return;
      }
      const { url } = await uploadAvatarImage(dataUrl, session.userId);
      if (url) {
        setAvatar(buildUploadedAvatar(dataUrl, url));
        setSyncNote("Synced to your account");
      } else {
        setSyncNote("Saved on this device — sign in to sync");
      }
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

      <div className="mt-5 rounded-lg border border-hairline bg-canvas p-4 sm:flex sm:items-start sm:gap-5">
        <span
          aria-hidden
          className="block h-20 w-20 shrink-0 overflow-hidden rounded-full border border-hairline bg-canvas-soft"
        >
          <NftAvatarArt
            selection={nftSelection}
            className="block h-full w-full"
          />
        </span>
        <div className="mt-3 min-w-0 sm:mt-0">
          <p className="text-xs text-body-mid">
            Generated ·{" "}
            <span className="font-mono text-[11px] text-mute">
              #{activeSeed.slice(0, 12)}
            </span>
            {nftRare > 0 && (
              <span className="ml-2 rounded-full border border-accent/40 px-1.5 py-0.5 text-[10px] text-accent">
                {nftRare} rare
              </span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {nftTraits.map((trait) => (
              <span
                key={trait.id}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px]",
                  trait.weight <= 4
                    ? "border-accent/40 text-accent"
                    : "border-hairline text-body-mid",
                )}
              >
                {trait.name}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => chooseNft(activeSeed)}
              className="inline-flex min-h-11 items-center rounded-lg border border-accent/40 bg-accent/5 px-3.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-2"
            >
              Use this avatar
            </button>
            <button
              type="button"
              onClick={rerollNft}
              className="inline-flex min-h-11 items-center rounded-lg border border-hairline px-3.5 text-xs text-body-mid transition-colors hover:bg-canvas-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0 sm:py-2"
            >
              Reroll
            </button>
            {avatar?.kind === "nft" && avatar.seed === activeSeed && (
              <span className="text-[11px] text-accent">
                Current avatar
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs text-body-mid">Characters</p>
      <div
        role="group"
        aria-label="Character avatar presets"
        className="mt-2 flex flex-wrap gap-2"
      >
        {characters.map((preset) => {
          const selected =
            avatar?.kind === "preset" && avatar.presetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={selected}
              aria-label={`Use preset ${preset.name}`}
              title={preset.name}
              onClick={() => choosePreset(preset.id)}
              className={cn(
                "inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border p-1 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
                selected
                  ? "border-accent ring-1 ring-accent/40"
                  : "border-hairline hover:border-accent/40",
              )}
            >
              <span
                aria-hidden
                className="block h-full w-full overflow-hidden rounded-full"
              >
                <PresetSwatch preset={preset} seed={name} />
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-body-mid">Patterns</p>
      <div
        role="group"
        aria-label="Pattern avatar presets"
        className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-7"
      >
        {patterns.map((preset) => {
          const selected =
            avatar?.kind === "preset" && avatar.presetId === preset.id;
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
                className="block h-full w-full overflow-hidden rounded-full"
              >
                <PresetSwatch preset={preset} seed={name} />
              </span>
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
          {pending ? "Downscaling your photo…" : syncNote ?? ""}
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
