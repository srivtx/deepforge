export const REPROGPU_VERSION = 1;
export const REPROGPU_MARK = "__DF_REPROGPU__";

export type KernelId = "K1" | "K2" | "K3" | "K4" | "K5";

export interface AdapterInfo {
  vendor: string;
  architecture: string;
  device: string;
  description: string;
  features: readonly string[];
  limitsSubset: Readonly<Record<string, number>>;
}

export interface ManifestRecord {
  kernel: KernelId;
  kernelVersion: number;
  wgslSha256: string;
  adapter: AdapterInfo;
  dispatch: {
    workgroups: readonly number[];
    workgroupSize: readonly number[];
  };
  outputBytes: number;
  outputSha256: string;
  status: {
    count: number;
    flags: number;
  };
  durationMs: number;
  timestampISO: string;
  userAgent: string;
  compileErrors: readonly string[];
  outcome: "pass" | "fail" | "exception" | "skip";
}

export interface Manifest {
  version: number;
  records: readonly ManifestRecord[];
  manifestSha256: string;
}

export interface ExpectedHashes {
  readonly counts: Readonly<Record<KernelId, number>>;
  /** K5 is the float negative control and has no pass/fail hash. */
  readonly hashes: Readonly<Partial<Record<KernelId, string>>>;
}

export const OUTCOME_PASS = "pass" as const;
export const OUTCOME_FAIL = "fail" as const;
export const OUTCOME_EXCEPTION = "exception" as const;
export const OUTCOME_SKIP = "skip" as const;

export type Outcome =
  | typeof OUTCOME_PASS
  | typeof OUTCOME_FAIL
  | typeof OUTCOME_EXCEPTION
  | typeof OUTCOME_SKIP;
