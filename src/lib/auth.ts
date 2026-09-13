/**
 * Thin auth API for optional Supabase sync.
 *
 * The UI imports only these functions; every one is safe when Supabase is
 * not configured or the network is unavailable. No top-level network calls:
 * the remote engine boots lazily when the UI subscribes (or signs in).
 */

import {
  getCachedSession,
  isSupabaseConfigured as configured,
} from "@/lib/sync/backend";
import {
  getRemoteClient,
  getSyncState as getRemoteSyncState,
  initRemoteSync,
  onSyncStateChange,
  remoteSignOut,
  syncNow as runSyncNow,
} from "@/lib/sync/remote";

export function isSupabaseConfigured(): boolean {
  return configured();
}

export function getAuthEmail(): string | null {
  const session = getCachedSession();
  return session?.email ?? null;
}

export async function signInWithEmail(
  email: string,
): Promise<{ error: string | null }> {
  const address = email.trim();
  if (!address) return { error: "Enter your email address." };
  if (!configured()) return { error: "Sync is not configured." };
  try {
    await initRemoteSync();
    const client = await getRemoteClient();
    if (!client) return { error: "Sync is not configured." };
    const redirect =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await client.auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: redirect },
    });
    return { error: error?.message ?? null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function signOut(): Promise<void> {
  await remoteSignOut();
}

export function onAuthChange(
  callback: (email: string | null) => void,
): () => void {
  const unsubscribe = onSyncStateChange((state) => callback(state.email));
  void initRemoteSync().catch(() => {
    /* engine reports its own failures through sync state */
  });
  return unsubscribe;
}

export function syncNow(): Promise<void> {
  return runSyncNow();
}

export function getSyncState(): ReturnType<
  typeof import("./sync/remote").getSyncState
> {
  return getRemoteSyncState();
}
