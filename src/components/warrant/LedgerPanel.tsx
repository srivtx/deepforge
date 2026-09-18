"use client";

import type * as React from "react";
import {
  D,
  WARRANT_MAX_GRADE,
  canonicalJson,
  getValue,
  headDigest,
  lambda,
  type Append,
  type Grade,
  type Registry,
  type Store,
  type ValueId,
} from "@/lib/warrant";

export interface LedgerPanelProps {
  store: Store;
  registry: Registry;
  valueId: ValueId;
  kindLabel: string;
  publishedGrade: Grade | null;
  onChallenge: (valueId: ValueId, outcome: "survived" | "refuted") => void;
  onWhy: (valueId: ValueId) => void;
  onAudit: (valueId: ValueId) => void;
  auditSummary?: string;
}

const CARD = "rounded-lg border border-hairline bg-canvas-card p-4 sm:p-5";
const CARD_HEADING = "text-xs font-medium text-body-mid";
const FIELD_LABEL = "text-[10px] text-mute";
const FIELD_VALUE = "break-all font-mono text-xs leading-relaxed text-body";
const CHALLENGE_BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-accent/40 bg-accent/5 px-3.5 py-2 text-xs font-medium text-accent transition-colors hover:bg-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";
const READ_BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-hairline bg-canvas-soft px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:bg-canvas focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:min-h-0";

function gradeLabel(grade: Grade): string {
  return grade === "dead" ? "dead" : String(grade);
}

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function payloadText(payload: unknown): string {
  try {
    return canonicalJson(payload);
  } catch {
    return "payload is not representable under canonicalJson";
  }
}

function safeLambda(store: Store, registry: Registry, id: ValueId): Grade | null {
  try {
    return lambda(store, registry, id);
  } catch {
    return null;
  }
}

function LedgerRow({
  index,
  append,
  headPrefix,
}: {
  readonly index: number;
  readonly append: Append;
  readonly headPrefix: string;
}): React.ReactElement {
  const attempt = append.attempt;
  const refuted = attempt.outcome === "refuted";
  return (
    <li className="rounded-md border border-hairline bg-canvas-soft p-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-xs text-ink">Index {index}</span>
        <span
          className={
            refuted
              ? "rounded-full border border-accent/40 bg-accent/5 px-2 py-0.5 text-[10px] text-accent"
              : "rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-[10px] text-body-mid"
          }
        >
          {attempt.outcome}
        </span>
        <span className="break-all font-mono text-[10px] text-mute">
          seed {attempt.seed}
        </span>
      </div>
      <dl className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        <div>
          <dt className={FIELD_LABEL}>Family</dt>
          <dd className={FIELD_VALUE}>{attempt.family}</dd>
        </div>
        <div>
          <dt className={FIELD_LABEL}>Refuter</dt>
          <dd className={FIELD_VALUE}>{attempt.refuter}</dd>
        </div>
        <div>
          <dt className={FIELD_LABEL}>Admitted by</dt>
          <dd className={FIELD_VALUE}>{append.admittedBy}</dd>
        </div>
        <div>
          <dt className={FIELD_LABEL}>Prev → head (4-char prefixes)</dt>
          <dd className={FIELD_VALUE}>
            {append.prev.slice(0, 4)} → {headPrefix}
          </dd>
        </div>
      </dl>
    </li>
  );
}

export function LedgerPanel({
  store,
  registry,
  valueId,
  kindLabel,
  publishedGrade,
  onChallenge,
  onWhy,
  onAudit,
  auditSummary,
}: LedgerPanelProps): React.ReactElement {
  const value = getValue(store, valueId);
  if (value === undefined) {
    return (
      <section aria-label={`Warrant ledger for ${valueId}`} className={CARD}>
        <p className="text-xs leading-relaxed text-body-mid">
          This value is not in the store, so there is no ledger to show here.
        </p>
      </section>
    );
  }

  const chain = value.chain;
  const refutedCount = chain.filter(
    (append) => append.attempt.outcome === "refuted",
  ).length;
  const declaredClasses = D(chain, registry);
  const own: Grade =
    refutedCount > 0
      ? "dead"
      : (Math.min(WARRANT_MAX_GRADE, declaredClasses) as Grade);
  const grade = safeLambda(store, registry, valueId);
  const citations = value.cites.map((cite) => {
    const known = getValue(store, cite) !== undefined;
    const citeNow = known ? safeLambda(store, registry, cite) : null;
    return {
      cite,
      known,
      grade: citeNow,
      pins: grade !== null && citeNow !== null && citeNow === grade,
    };
  });
  const lastChallenge =
    chain.length > 0 ? `logical index ${chain.length}` : "No challenge recorded";

  return (
    <section
      aria-label={`Warrant ledger for ${valueId}`}
      className="flex flex-col gap-3"
    >
      <div className={CARD}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-hairline bg-canvas-soft px-2 py-0.5 text-[10px] text-body-mid">
            {kindLabel}
          </span>
          <span className="break-all font-mono text-xs text-ink">{valueId}</span>
        </div>
        {grade === null ? (
          <p className="mt-2 text-xs leading-relaxed text-body-mid">
            γ is not computed here because a cite of this value is not in the
            store.
          </p>
        ) : refutedCount > 0 ? (
          <p className="mt-2 text-xs leading-relaxed text-body">
            {`Refuted: grade dead (terminal); ${countLabel(refutedCount, "refutation", "refutations")} on record.`}
          </p>
        ) : grade === "dead" ? (
          <p className="mt-2 text-xs leading-relaxed text-body">
            {`Grade dead (terminal): reached through a cite; ${countLabel(refutedCount, "refutation", "refutations")} on record.`}
          </p>
        ) : (
          <p className="mt-2 text-xs leading-relaxed text-body">
            {`Survived ${countLabel(declaredClasses, "declared check-family", "declared check-families")}; ${countLabel(refutedCount, "refutation", "refutations")}; ${countLabel(chain.length, "check", "checks")} on record.`}
          </p>
        )}
      </div>

      <div className={CARD}>
        <h3 className={CARD_HEADING}>Payload</h3>
        <pre className="df-scroll mt-2 max-w-full overflow-x-auto whitespace-pre-wrap break-all rounded-md border border-hairline bg-canvas-soft p-2.5 font-mono text-xs leading-relaxed text-body">
          {payloadText(value.payload)}
        </pre>
      </div>

      <div className={CARD}>
        <h3 className={CARD_HEADING}>The grade, step by step</h3>
        <pre className="df-scroll mt-2 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-hairline bg-canvas-soft p-2.5 font-mono text-xs leading-relaxed text-body">
          γ(v) = dead if any admitted refuted append else min(K, D(chain), min
          γ(cites))
        </pre>
        <p className="mt-2 text-xs leading-relaxed text-body-mid">
          Read it as: γ is 3 at most; a cited claim can drag it lower; one
          refutation makes it dead for good.
        </p>
        <div className="mt-2 flex flex-col gap-1.5 text-xs leading-relaxed text-body">
          <p>
            {`K = ${WARRANT_MAX_GRADE} (WARRANT_MAX_GRADE); D = ${declaredClasses} declared dependency classes; current γ = ${grade === null ? "not computed here" : gradeLabel(grade)}; own part of the fold before cites = ${gradeLabel(own)}.`}
          </p>
          <p className="text-body-mid">
            {`Published advert: ${publishedGrade === null ? "none" : gradeLabel(publishedGrade)}. It is an advert only and never an input to the recomputation.`}
          </p>
          {declaredClasses >= WARRANT_MAX_GRADE && (
            <p className="text-body-mid">
              Saturation: D ≥ K, so the cap binds and further declared
              dependency classes cannot raise γ above K.
            </p>
          )}
          <p className="text-body-mid">
            Declared dependence relation: same family OR declared coverage
            overlap ≥ 1/2. This relation is syntactic; two checks that share a
            method or a blind spot can still join one declared dependency
            class, so the class count is not evidence that their failure modes
            are distinct (Knight–Leveson).
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-hairline bg-canvas-card">
        <div className="border-b border-hairline px-4 py-2.5 sm:px-5">
          <h3 className={CARD_HEADING}>Ledger</h3>
          <p className="mt-0.5 text-[11px] leading-snug text-mute">
            {`Last challenge: ${lastChallenge}. Only admitted appends appear; rejected attempts never entered the store.`}
          </p>
        </div>
        <div className="flex flex-col gap-2.5 p-4 sm:p-5">
          {chain.length === 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs leading-relaxed text-body">
                No challenge recorded.
              </p>
              <p className="text-xs leading-relaxed text-body-mid">
                Absence of attempts is not survival.
              </p>
            </div>
          )}
          {chain.length > 0 && refutedCount === 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs leading-relaxed text-body">
                No admitted refutations.
              </p>
              <p className="text-xs leading-relaxed text-body-mid">
                None were recorded and admitted, not none exist.
              </p>
            </div>
          )}
          {chain.length > 0 && (
            <ol className="flex flex-col gap-2.5">
              {chain.map((append, index) => (
                <LedgerRow
                  key={index}
                  index={index}
                  append={append}
                  headPrefix={headDigest(
                    valueId,
                    chain.slice(0, index + 1),
                  ).slice(0, 4)}
                />
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className={CARD}>
        <h3 className={CARD_HEADING}>Cites</h3>
        {citations.length === 0 ? (
          <p className="mt-2 text-xs leading-relaxed text-body-mid">
            No cites were declared for this value.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {citations.map((entry) => (
              <li
                key={entry.cite}
                className="rounded-md border border-hairline bg-canvas-soft p-2.5"
              >
                <span className={FIELD_VALUE}>{entry.cite}</span>
                <span className="mt-1 block text-xs leading-relaxed text-body">
                  {`λ = ${entry.grade === null ? "not computed here" : gradeLabel(entry.grade)}${
                    entry.grade === null
                      ? ""
                      : entry.pins
                        ? " · pins the grade here"
                        : " · does not pin the grade here"
                  }`}
                </span>
                {!entry.known && (
                  <span className="mt-0.5 block text-[11px] text-mute">
                    Not found in the store.
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={CARD}>
        <h3 className={CARD_HEADING}>Try it</h3>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className={CHALLENGE_BUTTON}
            onClick={() => onChallenge(valueId, "survived")}
          >
            Log a survival check
          </button>
          <button
            type="button"
            className={CHALLENGE_BUTTON}
            onClick={() => onChallenge(valueId, "refuted")}
          >
            Log a refutation
          </button>
          <button
            type="button"
            className={READ_BUTTON}
            onClick={() => onWhy(valueId)}
          >
            Why this grade?
          </button>
          <button
            type="button"
            className={READ_BUTTON}
            onClick={() => onAudit(valueId)}
          >
            Audit ledger
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-mute">
          These four buttons change this browser tab only; nothing is stored or
          sent. A refutation is recorded against the claim, never the person.
        </p>
        {auditSummary !== undefined && (
          <div className="mt-3 rounded-md border border-hairline bg-canvas-soft p-2.5">
            <p className={FIELD_LABEL}>Audit summary</p>
            <p className="mt-1 break-all text-xs leading-relaxed text-body">
              {auditSummary}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
