"use client";

import type * as React from "react";
import {
  cone,
  getValue,
  lambda,
  type Grade,
  type Registry,
  type Store,
  type ValueId,
} from "@/lib/warrant";

export interface BlastRadiusProps {
  store: Store;
  registry: Registry;
  challengedId: ValueId;
  before: ReadonlyMap<ValueId, Grade>;
  onClose: () => void;
}

function gradeLabel(grade: Grade): string {
  return grade === "dead" ? "dead" : String(grade);
}

function safeLambda(store: Store, registry: Registry, id: ValueId): Grade | null {
  try {
    return lambda(store, registry, id);
  } catch {
    return null;
  }
}

export function BlastRadius({
  store,
  registry,
  challengedId,
  before,
  onClose,
}: BlastRadiusProps): React.ReactElement {
  let demoted: readonly ValueId[] = [];
  try {
    demoted = cone(store, challengedId).filter((id) => id !== challengedId);
  } catch {
    demoted = [];
  }

  return (
    <section
      aria-label="Blast radius"
      className="rounded-lg border border-hairline bg-canvas-card"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline px-4 py-2.5 sm:px-5">
        <h3 className="text-xs font-medium text-body-mid">Blast radius</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close blast radius"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-hairline bg-canvas-soft px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0"
        >
          Close
        </button>
      </div>
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        <p className="text-xs leading-relaxed text-body-mid">
          Challenged:{" "}
          <span className="break-all font-mono text-xs text-ink">
            {challengedId}
          </span>
        </p>
        <p className="text-sm leading-relaxed text-body">
          exact demotion: these and only these
        </p>
        <p className="text-xs leading-relaxed text-body-mid">
          The list is the dependents-only reachable set through frozen cites;
          it is the test of I3', not an estimate.
        </p>
        {demoted.length === 0 ? (
          <p className="text-xs leading-relaxed text-body">
            No dependents were demoted; the refuted claim is terminal on its
            own.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {demoted.map((id) => {
              const previous = before.get(id);
              const now = safeLambda(store, registry, id);
              const cites = getValue(store, id)?.cites ?? [];
              return (
                <li
                  key={id}
                  className="rounded-md border border-hairline bg-canvas-soft p-3"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-2">
                    <span className="break-all font-mono text-xs text-ink">
                      {id}
                    </span>
                    <span className="font-mono text-xs text-body-mid">
                      {`λ ${previous === undefined ? "not recorded" : gradeLabel(previous)} → ${now === null ? "not computed here" : gradeLabel(now)}`}
                    </span>
                  </div>
                  <p className="mt-1.5 break-all font-mono text-[11px] leading-relaxed text-mute">
                    {`cites: ${cites.length === 0 ? "none" : cites.join(", ")}`}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
