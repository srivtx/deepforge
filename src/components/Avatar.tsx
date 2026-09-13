"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getUserName } from "@/lib/leaderboard";
import { CHARACTER_ART } from "@/components/avatars/characters";
import {
  NftAvatarArt,
  NftAvatarSeedArt,
} from "@/components/avatars/NftAvatarArt";
import { selectAvatarTraits } from "@/lib/nftAvatar";
import {
  AVATAR_CHANGE_EVENT,
  AVATAR_PRESETS,
  generateAvatarSvg,
  getAvatar,
  resolvePresetForSeed,
  type AvatarState,
} from "@/lib/avatars";

const USERNAME_CHANGE_EVENT = "deepforge:username-change";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 80,
};

interface AvatarProps {
  /** Identity seed; omit to render the local user's own avatar. */
  seed?: string;
  size?: AvatarSize;
  className?: string;
  /** Accessible name. Without it the avatar is decorative (aria-hidden). */
  label?: string;
}

interface AvatarSnapshot {
  avatar: AvatarState;
  name: string;
}

const EMPTY_SNAPSHOT: AvatarSnapshot = { avatar: null, name: "you" };

let cached: AvatarSnapshot | null = null;

function getSnapshot(): AvatarSnapshot {
  if (!cached) cached = { avatar: getAvatar(), name: getUserName() };
  return cached;
}

function getServerSnapshot(): AvatarSnapshot {
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

/**
 * Round avatar: uploaded photo, chosen preset, or deterministic generative
 * art seeded by the username. Anonymous seeds never see the local user's
 * upload or preset; they always get stable generated art.
 */
export function Avatar({ seed, size = "md", className, label }: AvatarProps) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [failedRemoteUrl, setFailedRemoteUrl] = useState<string | null>(null);
  const px = SIZE_PX[size];

  const trimmedSeed = seed?.trim() ?? "";
  const name = snapshot.name.trim();
  const isSelf =
    trimmedSeed.length === 0 ||
    (name.length > 0 &&
      trimmedSeed.toLowerCase() === name.toLowerCase());
  const artSeed = trimmedSeed || name || "anon";

  const avatar = snapshot.avatar;
  let body: ReactNode;
  if (isSelf && avatar?.kind === "upload") {
    const remoteUrl = avatar.remoteUrl;
    const useRemote = Boolean(remoteUrl && remoteUrl !== failedRemoteUrl);
    body = (
      <img
        src={useRemote ? (remoteUrl as string) : avatar.dataUrl}
        alt={label ?? ""}
        draggable={false}
        className="h-full w-full object-cover"
        onError={() => {
          if (remoteUrl && failedRemoteUrl !== remoteUrl) {
            setFailedRemoteUrl(remoteUrl);
          }
        }}
      />
    );
  } else if (isSelf && avatar?.kind === "nft") {
    body = (
      <NftAvatarArt
        selection={selectAvatarTraits(avatar.seed, avatar.style ?? "illustrated")}
        className="block h-full w-full"
      />
    );
  } else if (isSelf && avatar?.kind === "preset") {
    const preset = AVATAR_PRESETS.find(
      (candidate) => candidate.id === avatar.presetId,
    );
    const Art = preset?.art ? CHARACTER_ART[preset.art] : undefined;
    if (Art) {
      body = <Art className="block h-full w-full" />;
    } else {
      const resolved = preset ?? resolvePresetForSeed(artSeed);
      const svg = generateAvatarSvg(artSeed, resolved);
      body = (
        <span
          className="block h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      );
    }
  } else {
    body = <NftAvatarSeedArt seed={artSeed} className="block h-full w-full" />;
  }

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-full bg-canvas-soft",
        className,
      )}
      style={{ width: px, height: px }}
    >
      {body}
    </span>
  );
}
