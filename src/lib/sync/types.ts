/**
 * Local-first sync seam: shared store contracts.
 *
 * Every persisted store in `src/lib/` is described by a `StoreSpec` and
 * instantiated through `createStore`, which keeps reads synchronous and
 * local while exposing a single place to hook a future remote syncer.
 */

export type StoreId =
  | "progress"
  | "daily"
  | "collections"
  | "contests"
  | "interview"
  | "penpaper"
  | "concepts"
  | "papers"
  | "labs"
  | "research"
  | "reviews"
  | "explanations"
  | "bugHunt"
  | "agentic"
  | "username";

export interface StoreSpec<T> {
  id: StoreId;
  storageKey: string;
  event: string;
  empty: () => T;
  parse: (raw: string | null) => T;
  serialize: (v: T) => string;
  merge?: (local: T, remote: T) => T;
}

export interface Store<T> {
  get(): T;
  set(v: T): void;
  update(fn: (v: T) => T): void;
  clear(): void;
}
