import type { AuditResult } from "@/lib/keyfuse";

const CAVEAT =
  "Detection is not soundness. A miss can only be reported, and a key repaired from detections is conservative, not complete.";
const REPAIR_LABEL =
  "Repaired key (conservative over-approximation of detected dependence): declared ∪ implicated.";
const CERTIFICATE_LINE = "No detected ≤t-support effect at covered tuples.";
const NONDETERMINISM_CARD =
  "This oracle is not deterministic here, so KeyFuse reports nothing rather than guessing.";

function SlotList({
  names,
  empty,
}: {
  readonly names: readonly string[];
  readonly empty: string;
}) {
  if (names.length === 0) {
    return <span className="text-body-mid">{empty}</span>;
  }
  return (
    <span className="inline-flex flex-wrap gap-1 align-middle">
      {names.map((name) => (
        <span
          key={name}
          className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 font-mono text-[10px] text-body"
        >
          {name}
        </span>
      ))}
    </span>
  );
}

export function WitnessPanel({ result }: { readonly result: AuditResult | null }) {
  if (!result) {
    return <p className="text-xs leading-relaxed text-body-mid">{CAVEAT}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {!result.deterministic ? (
        <div className="rounded-lg border border-hairline bg-canvas-soft p-3.5 sm:p-4">
          <p className="text-sm leading-relaxed text-body">
            {NONDETERMINISM_CARD}
          </p>
        </div>
      ) : (
        <>
          <section
            aria-label="Detections"
            className="rounded-lg border border-hairline bg-canvas-card"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline px-4 py-2.5 sm:px-5">
              <h3 className="text-xs font-medium text-body-mid">Detections</h3>
              <span className="font-mono text-[10px] text-mute">
                {result.detections.length} detected · {result.probes.length} rows
                · {result.runs} runs
              </span>
            </div>
            {result.detections.length === 0 ? (
              <p className="px-4 py-3.5 text-xs leading-relaxed text-body-mid sm:px-5">
                No detections on this run. That is a statement about the probes
                that ran, not about every input the task could read.
              </p>
            ) : (
              <ul className="flex flex-col gap-2.5 p-3 sm:p-4">
                {result.detections.map((detection) => (
                  <li
                    key={detection.slot}
                    className="rounded-md border border-hairline bg-canvas-soft p-2.5"
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="rounded-full border border-hairline bg-canvas-card px-2 py-0.5 text-[10px] text-body-mid">
                        {detection.kind}
                      </span>
                      <span className="font-mono text-xs text-ink">
                        {detection.slot}
                      </span>
                      <span className="text-[10px] text-mute">
                        {detection.necessary
                          ? "necessary at this context"
                          : "not necessary at this context"}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-col gap-0.5 text-xs leading-relaxed text-body">
                      <p>
                        Witness pair over{" "}
                        <span className="font-mono text-[11px]">
                          {detection.witness.differing
                            .map(
                              (slot) =>
                                `${slot}: ${detection.witness.left[slot] ?? ""} → ${detection.witness.right[slot] ?? ""}`,
                            )
                            .join("; ")}
                        </span>
                      </p>
                      <p>
                        Outputs:{" "}
                        <span className="font-mono text-[11px]">
                          {detection.witness.outputLeft} →{" "}
                          {detection.witness.outputRight}
                        </span>
                      </p>
                      <p>
                        Minimality:{" "}
                        {detection.minimized ? (
                          <>
                            1-minimal ok:{" "}
                            {detection.minimized.oneMinimal ? "yes" : "no"} ·
                            verify runs:{" "}
                            <span className="font-mono text-[11px]">
                              {detection.minimized.verifyRuns}
                            </span>{" "}
                            · support:{" "}
                            <span className="font-mono text-[11px]">
                              {detection.minimized.support.join(", ")}
                            </span>
                          </>
                        ) : (
                          "1-minimal check not run on this arm"
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            aria-label="Repaired key"
            className="rounded-lg border border-hairline bg-canvas-card"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline px-4 py-2.5 sm:px-5">
              <h3 className="text-xs font-medium text-body-mid">
                Repaired key
              </h3>
              <span className="font-mono text-[10px] text-mute">
                {result.repair.repairedInputs.length} inputs
              </span>
            </div>
            <div className="flex flex-col gap-2 px-4 py-3.5 text-xs leading-relaxed text-body sm:px-5">
              <p className="text-sm">{REPAIR_LABEL}</p>
              <p>
                Declared:{" "}
                <SlotList names={result.repair.declared} empty="none" />
              </p>
              <p>
                Implicated:{" "}
                <SlotList names={result.repair.implicated} empty="none" />
              </p>
              <p>
                Repaired inputs:{" "}
                <SlotList names={result.repair.repairedInputs} empty="none" />
              </p>
              <p>
                Separations:{" "}
                <span className="font-mono text-[11px]">
                  {result.repair.separateWitnesses}
                </span>{" "}
                of{" "}
                <span className="font-mono text-[11px]">
                  {result.repair.collisionWitnesses}
                </span>{" "}
                collision witnesses have different repaired keys.
              </p>
              {result.repair.residualCollisions.length > 0 && (
                <p>
                  Residual collisions still reported:{" "}
                  <span className="font-mono text-[11px]">
                    {result.repair.residualCollisions.join(", ")}
                  </span>
                </p>
              )}
              {result.detections.length > 0 && (
                <div className="mt-1 flex flex-col gap-1.5 rounded-md border border-hairline bg-canvas-soft p-2.5">
                  <p className="text-[11px] text-body-mid">
                    Witness keys under declared inputs vs repaired inputs
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {result.detections.map((detection) => (
                      <li
                        key={detection.slot}
                        className="text-[11px] leading-relaxed text-body"
                      >
                        <span className="font-mono text-body-mid">
                          {detection.slot}
                        </span>
                        : original{" "}
                        <span className="font-mono">
                          {detection.witness.originalKeyLeft}
                        </span>{" "}
                        /{" "}
                        <span className="font-mono">
                          {detection.witness.originalKeyRight}
                        </span>{" "}
                        (
                        {detection.witness.keyCollision
                          ? "same original key, different output"
                          : "original keys differ"}
                        ) · repaired{" "}
                        <span className="font-mono">
                          {detection.witness.repairedKeyLeft}
                        </span>{" "}
                        /{" "}
                        <span className="font-mono">
                          {detection.witness.repairedKeyRight}
                        </span>{" "}
                        (
                        {detection.witness.separated
                          ? "separated"
                          : "not separated"}
                        )
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <section
        aria-label="Certificate and misses"
        className="rounded-lg border border-hairline bg-canvas-card"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline px-4 py-2.5 sm:px-5">
          <h3 className="text-xs font-medium text-body-mid">
            Certificate and misses
          </h3>
          <span className="font-mono text-[10px] text-mute">
            {result.strategy} · strength {result.strength}
          </span>
        </div>
        <div className="flex flex-col gap-2 px-4 py-3.5 text-xs leading-relaxed text-body sm:px-5">
          <p className="text-sm">
            {result.truncated ? result.certificate : CERTIFICATE_LINE}
          </p>
          {result.truncated && (
            <p className="text-body-mid">
              This run stopped early, so the certificate above is the stop
              condition. The detections and the repaired key cover only the
              probes that ran.
            </p>
          )}
          {!result.deterministic && (
            <p className="text-body-mid">
              No probe rows were run: the oracle failed the determinism gate
              before probing.
            </p>
          )}
          <div>
            <p className="text-body-mid">Misses recorded</p>
            {result.misses.length === 0 ? (
              <p>No misses recorded on this run.</p>
            ) : (
              <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-4">
                {result.misses.map((miss) => (
                  <li key={miss} className="font-mono text-[11px]">
                    {miss}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p>
            Traced reads:{" "}
            {result.tracedReads.length === 0 ? (
              <span className="text-body-mid">none recorded</span>
            ) : (
              <span className="font-mono text-[11px]">
                {result.tracedReads.join(", ")}
              </span>
            )}
          </p>
        </div>
      </section>

      <p className="text-xs leading-relaxed text-body-mid">{CAVEAT}</p>
    </div>
  );
}
