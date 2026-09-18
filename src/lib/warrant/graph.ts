import { AdmissionError } from "./types";
import type { Store, ValueId } from "./types";

function requireValue(store: Store, id: ValueId, source: string) {
  const value = store.values.get(id);
  if (value === undefined) {
    throw new AdmissionError("unknown-cite", `${source}: unknown cite ${id}`);
  }
  return value;
}

export function ancestors(store: Store, id: ValueId): readonly ValueId[] {
  const order: ValueId[] = [];
  const visited = new Set<ValueId>();
  const stack: { id: ValueId; next: number }[] = [];
  requireValue(store, id, "ancestors");
  visited.add(id);
  stack.push({ id, next: 0 });
  while (stack.length > 0) {
    const frame = stack[stack.length - 1];
    const value = requireValue(store, frame.id, "ancestors");
    if (frame.next < value.cites.length) {
      const cite = value.cites[frame.next];
      frame.next += 1;
      if (!visited.has(cite)) {
        requireValue(store, cite, "ancestors");
        visited.add(cite);
        stack.push({ id: cite, next: 0 });
      }
      continue;
    }
    stack.pop();
    order.push(frame.id);
  }
  return order;
}

export function cone(store: Store, id: ValueId): readonly ValueId[] {
  const dependents = new Map<ValueId, ValueId[]>();
  for (const value of store.values.values()) {
    for (const cite of value.cites) {
      const bucket = dependents.get(cite);
      if (bucket === undefined) {
        dependents.set(cite, [value.id]);
      } else {
        bucket.push(value.id);
      }
    }
  }
  const reached = new Set<ValueId>([id]);
  const queue: ValueId[] = [id];
  for (let head = 0; head < queue.length; head += 1) {
    const bucket = dependents.get(queue[head]);
    if (bucket === undefined) {
      continue;
    }
    for (const dependent of bucket) {
      if (!reached.has(dependent)) {
        reached.add(dependent);
        queue.push(dependent);
      }
    }
  }
  return [...reached].sort();
}

export function assertAcyclic(store: Store): void {
  const ACTIVE = 1;
  const DONE = 2;
  const state = new Map<ValueId, number>();
  const path: ValueId[] = [];
  const visit = (id: ValueId): void => {
    const status = state.get(id);
    if (status === DONE) {
      return;
    }
    if (status === ACTIVE) {
      const start = path.indexOf(id);
      const cycle = start === -1 ? [...path, id] : [...path.slice(start), id];
      throw new Error(`assertAcyclic: cycle in cite graph ${cycle.join(" -> ")}`);
    }
    const value = requireValue(store, id, "assertAcyclic");
    state.set(id, ACTIVE);
    path.push(id);
    for (const cite of value.cites) {
      visit(cite);
    }
    path.pop();
    state.set(id, DONE);
  };
  for (const value of store.values.values()) {
    visit(value.id);
  }
}
