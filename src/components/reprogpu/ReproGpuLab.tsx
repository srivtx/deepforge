"use client";

import { useCallback, useState } from "react";
import { EXPECTED_HASHES, EXPECTED_WGSL } from "@/lib/reprogpu/expected";
import type { ReproGpuRecord, ReproGpuRun } from "@/lib/reprogpu/harness";
import type { KernelId } from "@/lib/reprogpu/types";

const INTEGER_IDS: readonly KernelId[] = ["K1", "K2", "K3", "K4"];
const WGSL_IDS: readonly KernelId[] = ["K1", "K2", "K3", "K4", "K5"];

const HONESTY =
  "The CI gate verifies the reference implementations, the known-answer tests, and the pinned WGSL sources. It cannot execute WGSL or test cross-adapter equality; the browser lab is the demonstration, and no CI artifact may be cited as evidence of GPU agreement.";

const LIMITATIONS: readonly string[] = [
  "The guarantee covers only K1-K4 and only the shapes and domains declared in the spec; float is out of scope (WGSL CRD 2026-09-15 section 15.7.2, 15.7.4, 15.7.5).",
  "The gate checks the references, the known-answer tests, the pins, and source integrity; it cannot execute WGSL or test cross-adapter equality. The browser lab is the demonstration, not the CI gate.",
  "Cross-adapter results are a small, time-stamped sample on one machine; adapter.info is self-reported and not cryptographically attested; engine support is limited and may change.",
  "K1 excludes non-finite inputs (flagged and rejected); K3 documents mod-2^32 wrap on out-of-range output; none of K1-K4 covers general float.",
  "Any adapter mismatch is a fail unless it is a pre-declared, reproducible exceptions.json driver bug; exceptions are reported, not hidden.",
  "K5 divergence is permitted and expected; K5 agreement on any hardware set is not evidence of general float reproducibility.",
];

const KERNEL_LABELS: Readonly<Record<KernelId, string>> = {
  K1: "K1 - exact f32 sum, 320-bit integer superaccumulator",
  K2: "K2 - Philox4x32-10 counter RNG",
  K3: "K3 - fixed-point Q16.16 GEMM 256x256x256",
  K4: "K4 - integer SHA-256 over 1 MiB",
  K5: "K5 - float negative control (f32 matmul)",
};

const CARD = "rounded-lg border border-hairline bg-canvas-card";
const HEADER = "border-b border-hairline px-4 py-3 sm:px-5";
const BODY = "flex flex-col gap-2 px-4 py-4 text-xs leading-relaxed text-body sm:px-5";
const MONO = "font-mono text-xs break-all text-body";
const BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-accent/40 bg-accent/5 px-3.5 py-1.5 text-xs font-medium text-accent hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50";

function hashPrefix(hash: string | undefined): string {
  if (hash === undefined || hash.length === 0) return "(none)";
  return hash.slice(0, 16);
}

function outcomeTone(outcome: ReproGpuRecord["outcome"]): string {
  return outcome === "pass"
    ? "border-accent/40 bg-accent/5 text-accent"
    : "border-hairline bg-canvas-soft text-body-mid";
}

const OUTCOME_LABELS: Readonly<Record<ReproGpuRecord["outcome"], string>> = {
  pass: "PASS",
  fail: "FAIL",
  exception: "EXCEPTION",
  skip: "SKIP",
};

export function ReproGpuLab() {
  const [unsupported, setUnsupported] = useState(false);
  const [run, setRun] = useState<ReproGpuRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const onRun = useCallback(async () => {
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const harness = await import("@/lib/reprogpu/harness");
      if (!harness.webGpuSupported()) {
        setUnsupported(true);
        setRun(null);
        return;
      }
      const next = await harness.runConformance();
      setRun(next);
    } catch (caught) {
      setRun(null);
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  }, []);

  const onCopy = useCallback(async () => {
    if (run === null) return;
    try {
      const harness = await import("@/lib/reprogpu/harness");
      await navigator.clipboard.writeText(harness.manifestJson(run));
      setCopied(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }, [run]);

  const onDownload = useCallback(async () => {
    if (run === null) return;
    const harness = await import("@/lib/reprogpu/harness");
    const blob = new Blob([harness.manifestJson(run)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "reprogpu-manifest.json";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [run]);

  const byKernel = new Map<string, ReproGpuRecord>();
  if (run !== null) {
    for (const record of run.records) byKernel.set(record.kernel, record);
  }
  const k5 = byKernel.get("K5");

  return (
    <section
      aria-label="REPROGPU cross-adapter conformance lab"
      className="mx-auto w-full max-w-6xl px-4 pb-4 pt-6 sm:px-6 sm:pb-6 sm:pt-8"
    >
      <div className={`${CARD} p-4 sm:p-5`}>
        <h2 className="text-sm font-medium text-ink">
          What this proves and what it does not
        </h2>
        <div className="mt-2 flex flex-col gap-2 text-xs leading-relaxed text-body">
          <p>
            REPROGPU pins byte-identical SHA-256 outputs for a declared
            integer/fixed-point WGSL subset: K1 exact f32 summation through a
            320-bit integer superaccumulator, K2 Philox4x32-10, K3 Q16.16 GEMM,
            and K4 integer SHA-256. Only i32/u32 and bit operations, bitcast
            between i32/u32, comparisons, and host-shared buffer layout are
            relied upon.
          </p>
          <p>
            Float is outside the guarantee. WGSL section 15.7 leaves rounding
            direction, reassociation and fusion, and subnormal flushing
            unspecified, so two adapters may return different bits for the same
            f32 program. K5 is the negative control that demonstrates that
            divergence by design.
          </p>
        </div>
      </div>

      <div className={`mt-4 ${CARD}`}>
        <div className={HEADER}>
          <h2 className="text-sm font-medium text-ink">Run the harness</h2>
        </div>
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <button
            type="button"
            onClick={onRun}
            disabled={busy || unsupported}
            className={BUTTON}
          >
            {busy ? "Running..." : "Run conformance"}
          </button>
          <p className="text-xs leading-snug text-mute">
            Requests one adapter, compiles K1-K5, dispatches the pinned vectors,
            and hashes the raw output bytes in this browser. Nothing is stored
            or sent.
          </p>
        </div>
      </div>

      <div aria-live="polite" className="mt-4 flex flex-col gap-4">
        {error !== null && (
          <div className={`${CARD} p-4 sm:p-5`}>
            <p className="text-sm leading-relaxed text-body">
              The run stopped:{" "}
              <span className="font-mono text-xs break-all text-body-mid">
                {error}
              </span>
            </p>
          </div>
        )}

        <div className={`${CARD} p-4 sm:p-5`}>
          <h2 className="text-sm font-medium text-ink">
            {unsupported ? "No WebGPU here" : "Pinned references"}
          </h2>
          <div className="mt-2 flex flex-col gap-2 text-xs leading-relaxed text-body">
            <p>
              {unsupported
                ? "This browser does not expose WebGPU on navigator, so the kernels cannot be dispatched. The harness is still inspectable through the pinned CPU reference hashes and WGSL source pins below."
                : "These pinned CPU reference hashes and WGSL source hashes let you inspect the harness without a run. They are the values the gate recomputes and the lab compares against."}
            </p>
            <div>
              <p className="text-body-mid">Pinned reference output hashes</p>
              <ul className="mt-1 flex flex-col gap-1">
                {INTEGER_IDS.map((id) => (
                  <li key={id} className={MONO}>
                    {id}: {EXPECTED_HASHES.hashes[id]} (count{" "}
                    {EXPECTED_HASHES.counts[id]})
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-body-mid">Pinned WGSL source hashes</p>
              <ul className="mt-1 flex flex-col gap-1">
                {WGSL_IDS.map((id) => (
                  <li key={id} className={MONO}>
                    {id}: {EXPECTED_WGSL[id]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {run !== null && (
          <>
            <div className={CARD}>
              <div className={HEADER}>
                <h2 className="text-sm font-medium text-ink">Adapter</h2>
              </div>
              <dl className={`${BODY} grid gap-1.5 sm:grid-cols-2`}>
                <div>
                  <dt className="text-body-mid">Vendor</dt>
                  <dd className={MONO}>{run.adapter.vendor || "(empty)"}</dd>
                </div>
                <div>
                  <dt className="text-body-mid">Architecture</dt>
                  <dd className={MONO}>{run.adapter.architecture || "(empty)"}</dd>
                </div>
                <div>
                  <dt className="text-body-mid">Device</dt>
                  <dd className={MONO}>{run.adapter.device || "(empty)"}</dd>
                </div>
                <div>
                  <dt className="text-body-mid">Description</dt>
                  <dd className={MONO}>
                    {run.adapter.description || "(empty)"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-body-mid">Features</dt>
                  <dd className={MONO}>
                    {run.adapter.features.length > 0
                      ? run.adapter.features.join(", ")
                      : "(none reported)"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-body-mid">Limits subset</dt>
                  <dd className={MONO}>
                    {Object.entries(run.adapter.limitsSubset)
                      .map(([key, value]) => `${key}=${value}`)
                      .join(", ") || "(none reported)"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className={CARD}>
              <div className={HEADER}>
                <h2 className="text-sm font-medium text-ink">Kernel results</h2>
              </div>
              <div className="df-scroll max-w-full overflow-x-auto">
                <table className="w-full min-w-max border-collapse text-left text-xs">
                  <caption className="px-4 pb-2 pt-3 text-left text-xs leading-relaxed text-body-mid sm:px-5">
                    Pinned expected hash, observed hash, status count, and
                    outcome for each integer kernel. Hashes are SHA-256 over the
                    raw little-endian output bytes.
                  </caption>
                  <thead>
                    <tr className="border-b border-hairline">
                      <th scope="col" className="px-3 py-2 font-medium text-body-mid">
                        Kernel
                      </th>
                      <th scope="col" className="px-3 py-2 font-medium text-body-mid">
                        Expected
                      </th>
                      <th scope="col" className="px-3 py-2 font-medium text-body-mid">
                        Observed
                      </th>
                      <th scope="col" className="px-3 py-2 font-medium text-body-mid">
                        Count
                      </th>
                      <th scope="col" className="px-3 py-2 font-medium text-body-mid">
                        Outcome
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {INTEGER_IDS.map((id) => {
                      const record = byKernel.get(id);
                      const expected = EXPECTED_HASHES.hashes[id];
                      return (
                        <tr
                          key={id}
                          className="border-b border-hairline last:border-b-0"
                        >
                          <th
                            scope="row"
                            className="px-3 py-2 text-left font-normal text-body"
                          >
                            {KERNEL_LABELS[id]}
                          </th>
                          <td className={`px-3 py-2 ${MONO}`}>
                            {hashPrefix(expected)}
                          </td>
                          <td className={`px-3 py-2 ${MONO}`}>
                            {record === undefined
                              ? "(not run)"
                              : hashPrefix(record.outputSha256)}
                          </td>
                          <td className={`px-3 py-2 ${MONO}`}>
                            {record === undefined ? "-" : record.status.count}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${outcomeTone(
                                record?.outcome ?? "skip",
                              )}`}
                            >
                              {record === undefined
                                ? "SKIP"
                                : OUTCOME_LABELS[record.outcome]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={CARD}>
              <div className={HEADER}>
                <h2 className="text-sm font-medium text-ink">
                  K5 negative control
                </h2>
              </div>
              <div className={BODY}>
                <p>
                  K5 is the float negative control and carries no pass
                  criterion. Divergence here is permitted: different adapters
                  may differ, and one adapter may differ run to run if it
                  reassociates. Agreement would be an observation only, never
                  evidence that general float is reproducible.
                </p>
                <dl className="grid gap-1.5 sm:grid-cols-2">
                  <div>
                    <dt className="text-body-mid">Classification</dt>
                    <dd className="font-mono text-xs text-body">
                      {k5?.classification ?? "(not run)"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-body-mid">Matches CPU reference</dt>
                    <dd className="font-mono text-xs text-body">
                      {k5 === undefined
                        ? "(not run)"
                        : String(k5.k5_agreeWithReference ?? false)}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-body-mid">Reference hash</dt>
                    <dd className={MONO}>{k5?.k5_referenceSha256 ?? "(not run)"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-body-mid">Observed hash (run 1)</dt>
                    <dd className={MONO}>{k5?.outputSha256 || "(none)"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-body-mid">Observed hash (run 2)</dt>
                    <dd className={MONO}>{k5?.k5_run2Sha256 || "(none)"}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className={CARD}>
              <div className={HEADER}>
                <h2 className="text-sm font-medium text-ink">Manifest</h2>
              </div>
              <div className={BODY}>
                <p>
                  Canonical JSON with records sorted by kernel and adapter key.
                  The manifest hash below is SHA-256 over that serialization
                  without the hash field itself.
                </p>
                <p className={MONO}>{run.manifestSha256}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <button type="button" onClick={onCopy} className={BUTTON}>
                    {copied ? "Copied" : "Copy JSON"}
                  </button>
                  <button type="button" onClick={onDownload} className={BUTTON}>
                    Download JSON
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className={`${CARD} p-4 sm:p-5`}>
          <h2 className="text-sm font-medium text-ink">
            Gate honesty rule
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-body">{HONESTY}</p>
        </div>

        <div className={`${CARD} p-4 sm:p-5`}>
          <h2 className="text-sm font-medium text-ink">Limitations</h2>
          <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-4 text-xs leading-relaxed text-body-mid">
            {LIMITATIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
