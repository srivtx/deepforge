/**
 * REPROGPU browser conformance harness (K1-K5).
 *
 * Browser-only. This module never touches `navigator` at import time: every
 * entry point checks the environment first, so a client component can import
 * it (statically or dynamically) without breaking SSR.
 *
 * The harness compiles the pinned WGSL sources, dispatches each declared
 * integer kernel over the pinned vectors, reads the output buffer bytes back
 * (copyBufferToBuffer -> mapAsync -> copy -> unmap), and hashes those raw
 * bytes with Web Crypto SHA-256. It records adapter info, dispatch shape,
 * status canaries, and outcomes into a canonical manifest.
 *
 * It does not grade, store, or send anything; the DOM never sees raw GPU
 * handles. The CI gate checks the CPU references and the WGSL source pins and
 * cannot execute WGSL; the honesty of the claim rests on that separation
 * (see the amended spec, section 4).
 */

import { EXPECTED_HASHES } from "./expected";
import { canonicalize, manifestSha256, wgslSha256 } from "./hashes";
import { KERNEL_WGSL } from "./kernels";
import { lcg32, k1Words, k4Message, q16SeedMatrices } from "./vectors";
import {
  REPROGPU_VERSION,
  type AdapterInfo,
  type KernelId,
  type Manifest,
  type ManifestRecord,
} from "./types";

/* ─────────────────────────── public record shapes ───────────────────────── */

/** Same shape as `ManifestRecord`, plus the K5 negative-control fields. */
export interface ReproGpuRecord extends ManifestRecord {
  /** K5 only: how the two dispatches relate to the CPU float reference. */
  readonly classification?: "divergent" | "run-to-run-only" | "agreeing";
  /** K5 only: first and second dispatch both matched the CPU reference. */
  readonly k5_agreeWithReference?: boolean;
  /** K5 only: SHA-256 of the serial CPU float reference bytes. */
  readonly k5_referenceSha256?: string;
  /** K5 only: SHA-256 of the second dispatch (run-to-run probe). */
  readonly k5_run2Sha256?: string;
  /** Set when a kernel threw before producing output bytes. */
  readonly error?: string;
}

export interface ReproGpuRun {
  readonly adapter: AdapterInfo;
  readonly records: readonly ReproGpuRecord[];
  readonly manifestSha256: string;
}

/* ───────────────────── minimal local WebGPU surface ────────────────────── */
/* lib.dom ships no WebGPU types and the project has no @webgpu/types dep, so
 * the harness declares exactly the surface it uses. These are intentionally
 * local (not `declare global`) to avoid clashing with any future ambient
 * WebGPU typings. */

interface GpuShaderModule {
  getCompilationInfo?(): Promise<{
    messages: ReadonlyArray<{ type: string; message: string }>;
  }>;
}

interface GpuBuffer {
  destroy?(): void;
  mapAsync(mode: number): Promise<void>;
  getMappedRange(): ArrayBuffer;
  unmap(): void;
}

interface GpuComputePass {
  setPipeline(pipeline: unknown): void;
  setBindGroup(index: number, bindGroup: unknown): void;
  dispatchWorkgroups(workgroupsX: number, workgroupsY?: number, workgroupsZ?: number): void;
  end(): void;
}

interface GpuCommandEncoder {
  copyBufferToBuffer(
    source: GpuBuffer,
    sourceOffset: number,
    destination: GpuBuffer,
    destinationOffset: number,
    size: number,
  ): void;
  beginComputePass(): GpuComputePass;
  finish(): unknown;
}

interface GpuQueue {
  writeBuffer(
    buffer: GpuBuffer,
    bufferOffset: number,
    data: ArrayBufferView,
    dataOffset?: number,
    size?: number,
  ): void;
  submit(commands: readonly unknown[]): void;
  onSubmittedWorkDone(): Promise<void>;
}

interface GpuDevice {
  readonly features?: Iterable<string>;
  readonly limits?: Record<string, number>;
  readonly queue: GpuQueue;
  createShaderModule(descriptor: { code: string }): GpuShaderModule;
  createBuffer(descriptor: { size: number; usage: number }): GpuBuffer;
  createComputePipeline(descriptor: {
    layout: string;
    compute: { module: GpuShaderModule; entryPoint: string };
  }): { getBindGroupLayout(index: number): unknown };
  createBindGroup(descriptor: {
    layout: unknown;
    entries: ReadonlyArray<{ binding: number; resource: { buffer: GpuBuffer } }>;
  }): unknown;
  createCommandEncoder(): GpuCommandEncoder;
  pushErrorScope(scope: string): void;
  popErrorScope(): Promise<{ message: string } | null>;
  destroy?(): void;
}

interface GpuAdapterInfoShape {
  vendor?: string;
  architecture?: string;
  device?: string;
  description?: string;
}

interface GpuAdapter {
  readonly info?: GpuAdapterInfoShape;
  readonly features?: Iterable<string>;
  readonly limits?: Record<string, number>;
  requestDevice(descriptor?: unknown): Promise<GpuDevice>;
}

interface GpuNavigator {
  readonly gpu?: {
    requestAdapter(options?: unknown): Promise<GpuAdapter | null>;
  };
}

const GPU_BUFFER_USAGE = {
  MAP_READ: 0x0001,
  COPY_SRC: 0x0004,
  COPY_DST: 0x0008,
  STORAGE: 0x0080,
} as const;

const GPU_MAP_MODE_READ = 0x0001;

const LIMIT_KEYS = [
  "maxComputeWorkgroupStorageSize",
  "maxComputeInvocationsPerWorkgroup",
  "maxComputeWorkgroupSizeX",
  "maxComputeWorkgroupSizeY",
  "maxComputeWorkgroupSizeZ",
  "maxBufferSize",
  "maxStorageBufferBindingSize",
  "maxComputeWorkgroupsPerDimension",
] as const;

const INTEGER_IDS: readonly KernelId[] = ["K1", "K2", "K3", "K4"];

const K5_SEED = 0x13579bdf;
const K5_SIZE = 256;
const K5_COUNT = K5_SIZE * K5_SIZE;

/* ───────────────────────────── environment ─────────────────────────────── */

function getGpu(): GpuNavigator["gpu"] | undefined {
  if (typeof navigator === "undefined") return undefined;
  if (!("gpu" in navigator)) return undefined;
  return (navigator as unknown as GpuNavigator).gpu;
}

/** True only when this environment exposes WebGPU on `navigator`. */
export function webGpuSupported(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

/* ───────────────────────────── small helpers ───────────────────────────── */

function compareStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function adapterKey(adapter: AdapterInfo): string {
  return [adapter.vendor, adapter.architecture, adapter.device, adapter.description].join("|");
}

function collectFeatures(features: Iterable<string> | undefined): string[] {
  if (features === undefined) return [];
  const out: string[] = [];
  for (const feature of features) out.push(String(feature));
  out.sort(compareStrings);
  return out;
}

function pickLimits(limits: Record<string, number> | undefined): Record<string, number> {
  const out: Record<string, number> = {};
  if (limits === undefined) return out;
  for (const key of LIMIT_KEYS) {
    const value = limits[key];
    if (typeof value === "number") out[key] = value;
  }
  return out;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function toHex(bytes: Uint8Array): string {
  const HEX = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i];
    out += HEX[(byte >>> 4) & 0xf] + HEX[byte & 0xf];
  }
  return out;
}

async function sha256HexBytes(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const digest = await crypto.subtle.digest("SHA-256", copy);
  return toHex(new Uint8Array(digest));
}

function readU32(bytes: Uint8Array, wordIndex: number): number {
  const offset = wordIndex * 4;
  if (offset + 4 > bytes.byteLength) return 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint32(offset, true);
}

function f32ToBytesLE(values: Float32Array): Uint8Array {
  const out = new Uint8Array(values.length * 4);
  const view = new DataView(out.buffer);
  for (let i = 0; i < values.length; i += 1) {
    view.setFloat32(i * 4, values[i], true);
  }
  return out;
}

async function collectCompileErrors(shaderModule: GpuShaderModule): Promise<string[]> {
  if (typeof shaderModule.getCompilationInfo !== "function") return [];
  const info = await shaderModule.getCompilationInfo();
  const errors: string[] = [];
  for (const message of info.messages) {
    if (message.type === "error") errors.push(message.message);
  }
  return errors;
}

/* ───────────────────────────── kernel plans ────────────────────────────── */

interface KernelPlan {
  readonly inputs: ReadonlyArray<ArrayBufferView>;
  /** Size in bytes of the output buffer handed to the kernel. */
  readonly outputByteLength: number;
  /** Bytes hashed as the output serialization (K3 excludes the status word). */
  readonly outputBytes: number;
  readonly workgroups: number;
  readonly workgroupSize: number;
  /** Index of the u32 count canary in the output, or null when there is one. */
  readonly countWord: number | null;
  readonly flagsWord: number | null;
}

function kernelPlan(id: KernelId): KernelPlan {
  switch (id) {
    case "K1": {
      return {
        inputs: [k1Words()],
        outputByteLength: 12 * 4,
        outputBytes: 12 * 4,
        workgroups: 1,
        workgroupSize: 256,
        countWord: 11,
        flagsWord: 10,
      };
    }
    case "K2": {
      return {
        inputs: [],
        outputByteLength: (1 + 4 * 65536) * 4,
        outputBytes: (1 + 4 * 65536) * 4,
        workgroups: 257,
        workgroupSize: 256,
        countWord: 0,
        flagsWord: null,
      };
    }
    case "K3": {
      const { a, b } = q16SeedMatrices(K5_SIZE);
      return {
        inputs: [a, b],
        outputByteLength: (K5_COUNT + 1) * 4,
        // The reference serialization hashes only the 256 x 256 i32 matrix;
        // the trailing status word is a canary and is read separately.
        outputBytes: K5_COUNT * 4,
        workgroups: 257,
        workgroupSize: 256,
        countWord: K5_COUNT,
        flagsWord: null,
      };
    }
    case "K4": {
      return {
        inputs: [k4Message()],
        outputByteLength: 9 * 4,
        outputBytes: 9 * 4,
        workgroups: 1,
        workgroupSize: 1,
        countWord: 0,
        flagsWord: null,
      };
    }
    case "K5": {
      const next = lcg32(K5_SEED);
      const a = new Float32Array(K5_COUNT);
      const b = new Float32Array(K5_COUNT);
      for (let i = 0; i < K5_COUNT; i += 1) {
        a[i] = Math.fround((next() / 0xffffffff) * 8 - 4);
      }
      for (let i = 0; i < K5_COUNT; i += 1) {
        b[i] = Math.fround((next() / 0xffffffff) * 8 - 4);
      }
      return {
        inputs: [a, b],
        outputByteLength: K5_COUNT * 4,
        outputBytes: K5_COUNT * 4,
        workgroups: K5_COUNT / 256,
        workgroupSize: 256,
        countWord: null,
        flagsWord: null,
      };
    }
  }
}

/* ───────────────────────────── GPU dispatch ────────────────────────────── */

interface DispatchResult {
  readonly bytes: Uint8Array;
  readonly compileErrors: readonly string[];
  readonly durationMs: number;
}

async function dispatchKernel(
  device: GpuDevice,
  id: KernelId,
  plan: KernelPlan,
): Promise<DispatchResult> {
  const started = performance.now();
  const shaderModule = device.createShaderModule({ code: KERNEL_WGSL[id] });
  const compileErrors = await collectCompileErrors(shaderModule);
  if (compileErrors.length > 0) {
    return { bytes: new Uint8Array(0), compileErrors, durationMs: Math.round(performance.now() - started) };
  }

  const inputBuffers = plan.inputs.map((data) => {
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage: GPU_BUFFER_USAGE.STORAGE | GPU_BUFFER_USAGE.COPY_DST,
    });
    device.queue.writeBuffer(buffer, 0, data);
    return buffer;
  });

  const outputBuffer = device.createBuffer({
    size: plan.outputByteLength,
    usage:
      GPU_BUFFER_USAGE.STORAGE |
      GPU_BUFFER_USAGE.COPY_SRC |
      GPU_BUFFER_USAGE.COPY_DST,
  });
  const sentinel = new Uint32Array(plan.outputByteLength / 4);
  sentinel.fill(0xdeadbeef);
  device.queue.writeBuffer(outputBuffer, 0, sentinel);

  const pipeline = device.createComputePipeline({
    layout: "auto",
    compute: { module: shaderModule, entryPoint: "main" },
  });

  const entries = inputBuffers.map((buffer, index) => ({
    binding: index,
    resource: { buffer },
  }));
  entries.push({ binding: inputBuffers.length, resource: { buffer: outputBuffer } });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries,
  });

  device.pushErrorScope("validation");
  device.pushErrorScope("out-of-memory");

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginComputePass();
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(plan.workgroups);
  pass.end();
  device.queue.submit([encoder.finish()]);
  await device.queue.onSubmittedWorkDone();

  const outOfMemory = await device.popErrorScope();
  const validation = await device.popErrorScope();
  if (validation !== null || outOfMemory !== null) {
    const detail = validation ?? outOfMemory;
    throw new Error(`GPU error scope reported: ${detail?.message ?? "unknown error"}`);
  }

  const staging = device.createBuffer({
    size: plan.outputByteLength,
    usage: GPU_BUFFER_USAGE.MAP_READ | GPU_BUFFER_USAGE.COPY_DST,
  });
  const copyEncoder = device.createCommandEncoder();
  copyEncoder.copyBufferToBuffer(outputBuffer, 0, staging, 0, plan.outputByteLength);
  device.queue.submit([copyEncoder.finish()]);
  await device.queue.onSubmittedWorkDone();

  await staging.mapAsync(GPU_MAP_MODE_READ);
  const mapped = staging.getMappedRange();
  const bytes = new Uint8Array(mapped.slice(0));
  staging.unmap();

  staging.destroy?.();
  outputBuffer.destroy?.();
  for (const buffer of inputBuffers) buffer.destroy?.();

  return {
    bytes,
    compileErrors,
    durationMs: Math.round(performance.now() - started),
  };
}

/* ───────────────────────────── kernel records ──────────────────────────── */

interface RecordBase {
  readonly kernel: KernelId;
  readonly kernelVersion: number;
  readonly wgslSha256: string;
  readonly adapter: AdapterInfo;
  readonly dispatch: { workgroups: readonly number[]; workgroupSize: readonly number[] };
  readonly timestampISO: string;
  readonly userAgent: string;
}

function recordBase(id: KernelId, plan: KernelPlan, adapter: AdapterInfo): RecordBase {
  return {
    kernel: id,
    kernelVersion: REPROGPU_VERSION,
    wgslSha256: wgslSha256(KERNEL_WGSL[id]),
    adapter,
    dispatch: { workgroups: [plan.workgroups], workgroupSize: [plan.workgroupSize] },
    timestampISO: new Date().toISOString(),
    userAgent: typeof navigator === "undefined" ? "" : navigator.userAgent,
  };
}

async function runIntegerKernel(
  device: GpuDevice,
  id: KernelId,
  adapter: AdapterInfo,
  plan: KernelPlan,
): Promise<ReproGpuRecord> {
  const base = recordBase(id, plan, adapter);
  try {
    const result = await dispatchKernel(device, id, plan);
    const hashed = result.bytes.slice(0, plan.outputBytes);
    const outputSha256 = hashed.length > 0 ? await sha256HexBytes(hashed) : "";
    const count = plan.countWord === null ? result.bytes.byteLength / 4 : readU32(result.bytes, plan.countWord);
    const flags = plan.flagsWord === null ? 0 : readU32(result.bytes, plan.flagsWord);
    const expectedSha256 = EXPECTED_HASHES.hashes[id] ?? "";
    const expectedCount = EXPECTED_HASHES.counts[id];

    let outcome: ManifestRecord["outcome"];
    if (result.compileErrors.length > 0) {
      outcome = "skip";
    } else if (outputSha256 === expectedSha256 && count === expectedCount) {
      outcome = "pass";
    } else {
      outcome = "fail";
    }

    return {
      ...base,
      outputBytes: plan.outputBytes,
      outputSha256,
      status: { count, flags },
      durationMs: result.durationMs,
      compileErrors: result.compileErrors,
      outcome,
    };
  } catch (error) {
    return {
      ...base,
      outputBytes: 0,
      outputSha256: "",
      status: { count: 0, flags: 0 },
      durationMs: 0,
      compileErrors: [],
      outcome: "exception",
      error: messageOf(error),
    };
  }
}

/** Serial CPU float matmul: the same accumulation order the K5 kernel uses. */
function k5Reference(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(K5_COUNT);
  for (let i = 0; i < K5_SIZE; i += 1) {
    for (let j = 0; j < K5_SIZE; j += 1) {
      let acc = Math.fround(0);
      for (let k = 0; k < K5_SIZE; k += 1) {
        acc = Math.fround(acc + Math.fround(a[i * K5_SIZE + k] * b[k * K5_SIZE + j]));
      }
      out[i * K5_SIZE + j] = acc;
    }
  }
  return out;
}

async function runNegativeControl(
  device: GpuDevice,
  adapter: AdapterInfo,
  plan: KernelPlan,
): Promise<ReproGpuRecord> {
  const base = recordBase("K5", plan, adapter);
  const a = plan.inputs[0] as Float32Array;
  const b = plan.inputs[1] as Float32Array;
  const referenceSha256 = await sha256HexBytes(f32ToBytesLE(k5Reference(a, b)));

  try {
    const first = await dispatchKernel(device, "K5", plan);
    if (first.compileErrors.length > 0) {
      return {
        ...base,
        outputBytes: plan.outputBytes,
        outputSha256: "",
        status: { count: K5_COUNT, flags: 0 },
        durationMs: first.durationMs,
        compileErrors: first.compileErrors,
        outcome: "skip",
        classification: "divergent",
        k5_agreeWithReference: false,
        k5_referenceSha256: referenceSha256,
        k5_run2Sha256: "",
      };
    }

    const second = await dispatchKernel(device, "K5", plan);
    const firstSha256 = await sha256HexBytes(first.bytes);
    const secondSha256 = await sha256HexBytes(second.bytes);
    const agreeWithReference = firstSha256 === referenceSha256 && secondSha256 === referenceSha256;
    const classification: "divergent" | "run-to-run-only" | "agreeing" =
      firstSha256 !== secondSha256
        ? "run-to-run-only"
        : firstSha256 === referenceSha256
          ? "agreeing"
          : "divergent";

    return {
      ...base,
      outputBytes: plan.outputBytes,
      outputSha256: firstSha256,
      status: { count: K5_COUNT, flags: 0 },
      durationMs: first.durationMs + second.durationMs,
      compileErrors: first.compileErrors,
      outcome: "skip",
      classification,
      k5_agreeWithReference: agreeWithReference,
      k5_referenceSha256: referenceSha256,
      k5_run2Sha256: secondSha256,
    };
  } catch (error) {
    return {
      ...base,
      outputBytes: 0,
      outputSha256: "",
      status: { count: 0, flags: 0 },
      durationMs: 0,
      compileErrors: [],
      outcome: "exception",
      classification: "divergent",
      k5_agreeWithReference: false,
      k5_referenceSha256: referenceSha256,
      k5_run2Sha256: "",
      error: messageOf(error),
    };
  }
}

/* ───────────────────────────── manifest ────────────────────────────────── */

export function toManifest(run: ReproGpuRun): Manifest {
  return {
    version: REPROGPU_VERSION,
    records: run.records,
    manifestSha256: run.manifestSha256,
  };
}

/** Canonical (sorted-key) UTF-8 JSON for copying or downloading. */
export function manifestJson(run: ReproGpuRun): string {
  return canonicalize(toManifest(run));
}

/**
 * Run every kernel on the default adapter and return the canonical manifest
 * hash. One adapter gets one record per kernel; the K5 negative control runs
 * twice to expose run-to-run divergence.
 */
export async function runConformance(): Promise<ReproGpuRun> {
  const gpu = getGpu();
  if (gpu === undefined) {
    throw new Error("WebGPU is not exposed on navigator in this browser.");
  }

  const adapter = await gpu.requestAdapter();
  if (adapter === null) {
    throw new Error("The browser did not return a WebGPU adapter.");
  }

  const device = await adapter.requestDevice();
  const info = adapter.info ?? {};
  const adapterInfo: AdapterInfo = {
    vendor: info.vendor ?? "",
    architecture: info.architecture ?? "",
    device: info.device ?? "",
    description: info.description ?? "",
    features: collectFeatures(adapter.features ?? device.features),
    limitsSubset: pickLimits(adapter.limits ?? device.limits),
  };

  const records: ReproGpuRecord[] = [];
  for (const id of INTEGER_IDS) {
    records.push(await runIntegerKernel(device, id, adapterInfo, kernelPlan(id)));
  }
  records.push(await runNegativeControl(device, adapterInfo, kernelPlan("K5")));
  records.sort(
    (left, right) =>
      compareStrings(left.kernel, right.kernel) ||
      compareStrings(adapterKey(left.adapter), adapterKey(right.adapter)),
  );

  const manifestSha256Value = manifestSha256({ version: REPROGPU_VERSION, records });
  device.destroy?.();

  return { adapter: adapterInfo, records, manifestSha256: manifestSha256Value };
}
