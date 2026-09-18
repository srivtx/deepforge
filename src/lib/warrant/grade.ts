import { AdmissionError, WARRANT_MAX_GRADE, minGrade } from "./types";
import type { Append, Grade, LiveGrade, Registry, RootId, Store, ValueId } from "./types";
import { canonicalJson } from "./hash";
import { overlapRatio } from "./registry";

export interface DependencyClass {
  readonly members: readonly (readonly [RootId, RootId])[];
}

function pairKey(pair: readonly [RootId, RootId]): string {
  return canonicalJson([pair[0], pair[1]]);
}

function compareText(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function capGrade(classes: number): LiveGrade {
  if (classes >= WARRANT_MAX_GRADE) return WARRANT_MAX_GRADE;
  if (classes === 2) return 2;
  if (classes === 1) return 1;
  return 0;
}

export function survivingPairs(chain: readonly Append[]): readonly (readonly [RootId, RootId])[] {
  const seen = new Set<string>();
  const pairs: (readonly [RootId, RootId])[] = [];
  for (const append of chain) {
    if (append.attempt.outcome !== "survived") {
      continue;
    }
    const pair: readonly [RootId, RootId] = [append.attempt.refuter, append.attempt.family];
    const key = pairKey(pair);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    pairs.push(pair);
  }
  return pairs;
}

export function dependencyClasses(
  surviving: readonly (readonly [RootId, RootId])[],
  registry: Registry,
): readonly DependencyClass[] {
  const pairs: (readonly [RootId, RootId])[] = [];
  const seen = new Set<string>();
  for (const entry of surviving) {
    const pair: readonly [RootId, RootId] = [entry[0], entry[1]];
    const key = pairKey(pair);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    pairs.push(pair);
  }
  const parent = pairs.map((_, index) => index);
  const find = (start: number): number => {
    let root = start;
    while (parent[root] !== root) {
      root = parent[root];
    }
    let cursor = start;
    while (parent[cursor] !== root) {
      const next = parent[cursor];
      parent[cursor] = root;
      cursor = next;
    }
    return root;
  };
  const union = (left: number, right: number): void => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) {
      parent[rightRoot] = leftRoot;
    }
  };
  for (let i = 0; i < pairs.length; i += 1) {
    const family = pairs[i][1];
    const coverage = registry.roots.get(family)?.coverage ?? [];
    for (let j = i + 1; j < pairs.length; j += 1) {
      if (family === pairs[j][1]) {
        union(i, j);
        continue;
      }
      const other = registry.roots.get(pairs[j][1])?.coverage ?? [];
      if (overlapRatio(coverage, other) >= 1 / 2) {
        union(i, j);
      }
    }
  }
  const groups = new Map<number, (readonly [RootId, RootId])[]>();
  for (let index = 0; index < pairs.length; index += 1) {
    const root = find(index);
    const bucket = groups.get(root);
    if (bucket === undefined) {
      groups.set(root, [pairs[index]]);
    } else {
      bucket.push(pairs[index]);
    }
  }
  const classes: DependencyClass[] = [];
  for (const members of groups.values()) {
    classes.push({ members: [...members].sort((a, b) => compareText(pairKey(a), pairKey(b))) });
  }
  classes.sort((a, b) => compareText(pairKey(a.members[0]), pairKey(b.members[0])));
  return classes;
}

export function D(chain: readonly Append[], registry: Registry): number {
  return dependencyClasses(survivingPairs(chain), registry).length;
}

export function refutedInChain(chain: readonly Append[]): boolean {
  return chain.some((append) => append.attempt.outcome === "refuted");
}

export function lambda(store: Store, registry: Registry, id: ValueId): Grade {
  const memo = new Map<ValueId, Grade>();
  return lambdaMemo(store, registry, id, memo);
}

function lambdaMemo(
  store: Store,
  registry: Registry,
  id: ValueId,
  memo: Map<ValueId, Grade>,
): Grade {
  const cached = memo.get(id);
  if (cached !== undefined) {
    return cached;
  }
  const value = store.values.get(id);
  if (value === undefined) {
    throw new AdmissionError("unknown-value", `lambda: unknown value ${id}`);
  }
  let grade: Grade;
  if (refutedInChain(value.chain)) {
    grade = "dead";
  } else {
    let current: Grade = capGrade(D(value.chain, registry));
    for (const cite of value.cites) {
      current = minGrade(current, lambdaMemo(store, registry, cite, memo));
    }
    grade = current;
  }
  memo.set(id, grade);
  return grade;
}
