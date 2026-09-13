/**
 * Lazily-loaded handle to the remote sync engine.
 *
 * `@/lib/sync/remote` statically imports every store spec (and therefore the
 * problem bank), so UI modules must never import it at module scope. Both
 * `@/lib/auth` and `SyncPanel` route through this single cached promise so the
 * engine chunk is fetched at most once per page, and only when sync is used.
 */

type RemoteModule = typeof import("@/lib/sync/remote");

let remoteModulePromise: Promise<RemoteModule> | null = null;
let loadedRemote: RemoteModule | null = null;

export function loadRemoteSync(): Promise<RemoteModule> {
  if (remoteModulePromise === null) {
    remoteModulePromise = import("@/lib/sync/remote")
      .then((remote) => {
        loadedRemote = remote;
        return remote;
      })
      .catch((error: unknown) => {
        remoteModulePromise = null;
        throw error;
      });
  }
  return remoteModulePromise;
}

export function getLoadedRemoteSync(): RemoteModule | null {
  return loadedRemote;
}
