export type SlotKind = "file" | "env" | "cwd" | "locale" | "timezone" | "rng" | "clock";

export interface SlotSpec {
  readonly kind: SlotKind;
  readonly id: string;
  readonly baseline: string;
  readonly top: string;
  readonly sentinels?: readonly string[];
  readonly ordered?: boolean;
}

export interface SlotUniverse {
  readonly slots: readonly SlotSpec[];
}

export type Assignment = Readonly<Record<string, string>>;

export interface SlotRead {
  readonly slot: string;
  readonly value: string;
}

export interface TracedEnv {
  readFile(path: string): string;
  listDir(dir: string): readonly string[];
  exists(path: string): boolean;
  env(name: string): string;
  cwd(): string;
  locale(): string;
  timezone(): string;
  rng(): number;
  now(): number;
}

export interface KeyFuseTask {
  readonly id: string;
  readonly version: string;
  readonly declared: readonly string[];
  readonly universe: SlotUniverse;
  readonly baseline: Assignment;
}

export interface VirtualTask extends KeyFuseTask {
  readonly kind: "virtual";
  readonly run: (env: TracedEnv, ambient: Readonly<Record<string, string>>) => string;
}

export interface NodeTask extends KeyFuseTask {
  readonly kind: "node";
  readonly source: string;
  readonly entry: string;
}

export type TaskDefinition = VirtualTask | NodeTask;

export type OracleOutcome =
  | { readonly ok: true; readonly output: string }
  | { readonly ok: false; readonly reason: "error" | "nondeterministic" };

export interface OracleRun {
  readonly outcome: OracleOutcome;
  readonly reads: readonly SlotRead[];
  readonly trapped: boolean;
  readonly notes: readonly string[];
}

export type TaskOracle = (assignment: Assignment) => OracleRun;

export type ProbeStrategy =
  | "baseline-toggle" | "single-trace" | "ca" | "ca-ddmin" | "cover-with-defaults";

export interface ProbeOptions {
  readonly strategy: ProbeStrategy;
  readonly strength?: number;
  readonly budget?: number;
  readonly verifyMinimal?: boolean;
}

export interface ProbeRow {
  readonly index: number;
  readonly assignment: Assignment;
  readonly differing: readonly string[];
  readonly output: string;
  readonly changed: boolean;
}

export interface WitnessPair {
  readonly left: Assignment;
  readonly right: Assignment;
  readonly differing: readonly string[];
  readonly outputLeft: string;
  readonly outputRight: string;
  readonly originalKeyLeft: string;
  readonly originalKeyRight: string;
  readonly repairedKeyLeft: string;
  readonly repairedKeyRight: string;
  readonly keyCollision: boolean;
  readonly separated: boolean;
}

export interface MinimizedWitness {
  readonly row: ProbeRow;
  readonly support: readonly string[];
  readonly oneMinimal: boolean;
  readonly passes: number;
  readonly verifyRuns: number;
}

export interface Detection {
  readonly slot: string;
  readonly kind: SlotKind;
  readonly witness: WitnessPair;
  readonly minimized: MinimizedWitness | null;
  readonly necessary: boolean;
}

export interface RepairResult {
  readonly declared: readonly string[];
  readonly implicated: readonly string[];
  readonly repairedInputs: readonly string[];
  readonly separateWitnesses: number;
  readonly collisionWitnesses: number;
  readonly residualCollisions: readonly string[];
}

export interface AuditResult {
  readonly task: string;
  readonly version: string;
  readonly strategy: ProbeStrategy;
  readonly strength: number;
  readonly deterministic: boolean;
  readonly trapped: boolean;
  readonly probes: readonly ProbeRow[];
  readonly tracedReads: readonly string[];
  readonly detections: readonly Detection[];
  readonly repair: RepairResult;
  readonly certificate: string;
  readonly misses: readonly string[];
  readonly runs: number;
  readonly truncated: boolean;
  readonly digest: string;
}
