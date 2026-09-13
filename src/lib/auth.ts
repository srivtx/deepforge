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
import { getLoadedRemoteSync, loadRemoteSync } from "@/lib/sync/remoteLazy";

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
    const remote = await loadRemoteSync();
    await remote.initRemoteSync();
    const client = await remote.getRemoteClient();
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

/**
 * `remote.ts` keeps a minimal auth surface for sync itself, so the OAuth
 * method is described locally here. Supabase does not expose per-provider
 * availability to clients: when the project is configured we offer the
 * button and any dashboard/provider error resolves through `{ error }`.
 */
interface GoogleAuthSurface {
  signInWithOAuth(args: {
    provider: "google";
    options?: { redirectTo?: string };
  }): Promise<{ error: { message?: string } | null }>;
}

/**
 * Start the Google OAuth flow. Resolves once Supabase returns the provider
 * URL; the browser then redirects. Never throws: unconfigured builds and
 * provider errors resolve through `{ error }`. Google must be enabled in the
 * Supabase dashboard (Authentication → Providers → Google).
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  if (!configured()) return { error: "Sync is not configured." };
  try {
    const remote = await loadRemoteSync();
    await remote.initRemoteSync();
    const client = await remote.getRemoteClient();
    if (!client) return { error: "Sync is not configured." };
    const auth = client.auth as typeof client.auth & GoogleAuthSurface;
    const redirect =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirect },
    });
    return { error: error?.message ?? null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Whether Google sign-in is offered in this build. Supabase does not expose
 * per-provider availability, so this mirrors "configured": the button shows
 * and a provider that is not enabled in the dashboard comes back as an
 * inline error from `signInWithGoogle`.
 */
export function isGoogleEnabled(): boolean {
  return configured();
}

export async function signOut(): Promise<void> {
  const remote = await loadRemoteSync();
  await remote.remoteSignOut();
}

/**
 * Auth changes are delivered from the remote engine's sync state. The engine
 * is loaded lazily, so subscribers are buffered locally until the module
 * resolves and the engine boots: subscription first, then `initRemoteSync`,
 * which keeps the existing "no emitted state is missed" ordering.
 */
const emailListeners = new Set<(email: string | null) => void>();
let bridgePromise: Promise<void> | null = null;
let bridgeUnsubscribe: (() => void) | null = null;

function ensureRemoteBridge(): Promise<void> {
  if (bridgePromise === null) {
    bridgePromise = loadRemoteSync()
      .then((remote) => {
        if (bridgeUnsubscribe === null) {
          bridgeUnsubscribe = remote.onSyncStateChange((state) => {
            for (const listener of [...emailListeners]) {
              try {
                listener(state.email);
              } catch {
                /* listener errors must not break the sync path */
              }
            }
          });
        }
        return remote.initRemoteSync();
      })
      .catch(() => {
        if (bridgeUnsubscribe === null) bridgePromise = null;
        /* engine reports its own failures through sync state */
      });
  }
  return bridgePromise;
}

export function onAuthChange(
  callback: (email: string | null) => void,
): () => void {
  emailListeners.add(callback);
  void ensureRemoteBridge();
  return () => {
    emailListeners.delete(callback);
  };
}

export function syncNow(): Promise<void> {
  return loadRemoteSync().then((remote) => remote.syncNow());
}

export function getSyncState(): ReturnType<
  typeof import("./sync/remote").getSyncState
> {
  const remote = getLoadedRemoteSync();
  if (remote !== null) return remote.getSyncState();
  return {
    status: "unconfigured",
    email: null,
    lastSyncedAt: null,
    error: null,
  };
}
