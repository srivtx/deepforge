/**
 * Supabase Storage helpers for uploaded avatars.
 *
 * Objects live in the public `avatars` bucket at `{user_id}/avatar.jpg`, the
 * only path shape the RLS policies allow. Every helper is thin and
 * never-throwing: configuration, auth, network, and mapping failures resolve
 * to a plain `{ url | null, error }` result instead of an exception, and
 * nothing is logged. The app stays local-first — without a configured client
 * or a cached session these helpers are no-ops and callers keep using the
 * local data URL.
 */

import { getCachedSession } from "@/lib/sync/backend";
import { getRemoteClient } from "@/lib/sync/remote";

export const AVATAR_BUCKET = "avatars";
export const AVATAR_OBJECT_NAME = "avatar.jpg";

export interface AvatarStorageResult {
  url: string | null;
  error: string | null;
}

/** `{userId}/avatar.jpg` — a user's single avatar slot. */
export function avatarObjectPath(userId: string): string {
  return `${userId}/${AVATAR_OBJECT_NAME}`;
}

interface StorageErrorLike {
  message?: string;
}

interface StorageUploadOptions {
  upsert?: boolean;
  contentType?: string;
}

interface StorageBucketApi {
  upload(
    path: string,
    file: Blob,
    options?: StorageUploadOptions,
  ): Promise<{ error: StorageErrorLike | null }>;
  remove(paths: string[]): Promise<{ error: StorageErrorLike | null }>;
  getPublicUrl(path: string): { data?: { publicUrl?: string } | null };
}

interface StorageCapableClient {
  storage?: { from(bucket: string): StorageBucketApi };
}

function messageOf(error: unknown): string {
  if (typeof error === "string" && error) return error;
  if (error && typeof error === "object") {
    const value = error as { message?: unknown };
    if (typeof value.message === "string" && value.message) return value.message;
  }
  return "Storage request failed.";
}

function withCacheBuster(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;
}

async function bucketApi(): Promise<StorageBucketApi | null> {
  try {
    const client = (await getRemoteClient()) as unknown as
      | StorageCapableClient
      | null;
    const storage = client?.storage;
    if (!storage || typeof storage.from !== "function") return null;
    return storage.from(AVATAR_BUCKET);
  } catch {
    return null;
  }
}

function isSignedIn(userId: string): boolean {
  const session = getCachedSession();
  return Boolean(userId && session && session.userId === userId);
}

/**
 * Upload a downscaled JPEG data URL to `{userId}/avatar.jpg` (upsert) and
 * return its cache-busted public URL. Resolves `{ url: null, error: null }`
 * when Supabase is unconfigured or no session exists; a genuine upload
 * failure maps to an error message. Never throws.
 */
export async function uploadAvatarImage(
  dataUrl: string,
  userId: string,
): Promise<AvatarStorageResult> {
  try {
    if (!isSignedIn(userId)) return { url: null, error: null };
    const bucket = await bucketApi();
    if (!bucket) return { url: null, error: null };
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const path = avatarObjectPath(userId);
    const { error } = await bucket.upload(path, blob, {
      upsert: true,
      contentType: "image/jpeg",
    });
    if (error) return { url: null, error: messageOf(error) };
    const { data } = bucket.getPublicUrl(path);
    const publicUrl = data?.publicUrl;
    if (!publicUrl) {
      return { url: null, error: "Storage returned no public URL." };
    }
    return { url: withCacheBuster(publicUrl), error: null };
  } catch (error) {
    return { url: null, error: messageOf(error) };
  }
}

/** Best-effort delete of `{userId}/avatar.jpg`. Never throws. */
export async function removeAvatarImage(
  userId: string,
): Promise<{ error: string | null }> {
  try {
    if (!isSignedIn(userId)) return { error: null };
    const bucket = await bucketApi();
    if (!bucket) return { error: null };
    const { error } = await bucket.remove([avatarObjectPath(userId)]);
    return { error: error ? messageOf(error) : null };
  } catch (error) {
    return { error: messageOf(error) };
  }
}

/**
 * Resolve the public URL of `{userId}/avatar.jpg` without a network call —
 * `getPublicUrl` only builds a string. Returns null when Supabase is
 * unconfigured. Used to restore an avatar uploaded on another device.
 */
export async function fetchAvatarUrl(userId: string): Promise<string | null> {
  try {
    if (!userId) return null;
    const bucket = await bucketApi();
    if (!bucket) return null;
    const { data } = bucket.getPublicUrl(avatarObjectPath(userId));
    const publicUrl = data?.publicUrl;
    return publicUrl ? withCacheBuster(publicUrl) : null;
  } catch {
    return null;
  }
}
