import { WARRANT_MAX_GRADE } from "./types";
import type { Append, Registry, RootId, Store, Value } from "./types";
import { canonicalJson } from "./hash";
import { D, lambda } from "./grade";

export type GraderId = "B0" | "B1" | "B2" | "B3" | "B4" | "B5" | "B6" | "B7" | "B8";

export interface Grader {
  readonly id: GraderId;
  readonly label: string;
  score(value: Value, store: Store, registry: Registry): number;
}

function survivorCount(chain: readonly Append[]): number {
  let count = 0;
  for (const append of chain) {
    if (append.attempt.outcome === "survived") {
      count += 1;
    }
  }
  return count;
}

function pinnedSurvivorCount(chain: readonly Append[]): number {
  let count = 0;
  for (let index = 0; index < chain.length; index += 1) {
    if (chain[index].attempt.outcome === "survived") {
      count += 1;
    }
  }
  return count;
}

function distinctFamilyCount(chain: readonly Append[]): number {
  const families = new Set<RootId>();
  for (const append of chain) {
    if (append.attempt.outcome === "survived") {
      families.add(append.attempt.family);
    }
  }
  return families.size;
}

function distinctAttemptTupleCount(chain: readonly Append[]): number {
  const tuples = new Set<string>();
  for (const append of chain) {
    if (append.attempt.outcome === "survived") {
      const { refuter, family, seed } = append.attempt;
      tuples.add(canonicalJson([refuter, family, seed]));
    }
  }
  return tuples.size;
}

function cap(value: number): number {
  return value >= WARRANT_MAX_GRADE ? WARRANT_MAX_GRADE : value;
}

export const GRADERS: readonly Grader[] = [
  {
    id: "B0",
    label: "B0 survivor present",
    score(value: Value): number {
      return survivorCount(value.chain) >= 1 ? 1 : 0;
    },
  },
  {
    id: "B1",
    label: "B1 raw survivor count",
    score(value: Value): number {
      return survivorCount(value.chain);
    },
  },
  {
    id: "B2",
    label: "B2 survivor share (percent)",
    score(value: Value): number {
      if (value.chain.length === 0) {
        return 0;
      }
      return (100 * survivorCount(value.chain)) / value.chain.length;
    },
  },
  {
    id: "B3",
    label: "B3 pinned survivor count",
    score(value: Value): number {
      return pinnedSurvivorCount(value.chain);
    },
  },
  {
    id: "B4",
    label: "B4 alive/dead belief",
    score(value: Value, store: Store, registry: Registry): number {
      return lambda(store, registry, value.id) === "dead" ? 0 : 1;
    },
  },
  {
    id: "B5",
    label: "B5 distinct surviving families",
    score(value: Value): number {
      return cap(distinctFamilyCount(value.chain));
    },
  },
  {
    id: "B6",
    label: "B6 distinct attempt tuples",
    score(value: Value): number {
      return cap(distinctAttemptTupleCount(value.chain));
    },
  },
  {
    id: "B7",
    label: "B7 declared dependency classes",
    score(value: Value, _store: Store, registry: Registry): number {
      return cap(D(value.chain, registry));
    },
  },
];

export function scoreAll(
  grader: Grader,
  values: readonly Value[],
  store: Store,
  registry: Registry,
): readonly number[] {
  return values.map((value) => grader.score(value, store, registry));
}

export function oracleScore(
  value: Value,
  _store: Store,
  blindSpotByFamilyRoot: ReadonlyMap<RootId, readonly number[]>,
  defectClass: number | null,
): number {
  const families = new Set<RootId>();
  for (const append of value.chain) {
    if (append.attempt.outcome === "survived") {
      families.add(append.attempt.family);
    }
  }
  if (defectClass === null) {
    return cap(families.size);
  }
  const blindSpots = new Set<string>();
  for (const family of families) {
    const blindSpot = blindSpotByFamilyRoot.get(family) ?? [];
    if (blindSpot.includes(defectClass)) {
      blindSpots.add(canonicalJson([...blindSpot].sort((a, b) => a - b)));
    }
  }
  return cap(blindSpots.size);
}
