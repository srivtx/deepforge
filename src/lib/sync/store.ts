/**
 * Local-first store factory.
 *
 * `get()` is always synchronous and reads localStorage, so SSR and first
 * paint behave exactly as before. `set` / `clear` write locally, dispatch
 * the store's existing `deepforge:*-change` event for same-tab listeners,
 * and then notify the (optional) remote backend, which debounces any push.
 */

import { removeRaw, readRaw, writeRaw } from "@/lib/sync/localAdapter";
import { notifyLocalWrite } from "@/lib/sync/backend";
import type { Store, StoreSpec } from "@/lib/sync/types";

export function createStore<T>(spec: StoreSpec<T>): Store<T> {
  function dispatch(): void {
    try {
      if (typeof window === "undefined") return;
      if (typeof CustomEvent !== "function") return;
      window.dispatchEvent(new CustomEvent(spec.event));
    } catch {
      /* events unavailable — ignore */
    }
  }

  const store: Store<T> = {
    get(): T {
      return spec.parse(readRaw(spec.storageKey));
    },
    set(v: T): void {
      writeRaw(spec.storageKey, spec.serialize(v));
      dispatch();
      notifyLocalWrite(spec.id);
    },
    update(fn: (v: T) => T): void {
      store.set(fn(store.get()));
    },
    clear(): void {
      removeRaw(spec.storageKey);
      dispatch();
      notifyLocalWrite(spec.id);
    },
  };

  return store;
}
