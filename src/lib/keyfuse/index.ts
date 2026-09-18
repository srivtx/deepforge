/**
 * KeyFuse public surface — one frozen entry point for the cache-key auditor.
 *
 * Re-exports only: every function and constant lives in its engine module
 * (types, hash, slots, cover, trace, probe, minimize, repair, audit) and is
 * re-exported here so consumers import from `@/lib/keyfuse` alone. The two
 * constants with no engine home live here: KEYFUSE_VERSION (the audit payload
 * version) and KEYFUSE_MARK (the evidence/gate JSON marker). Each constant is
 * defined exactly once across the directory.
 *
 * Deliberately absent: `tasks.ts` (the built-in corpus) and `nodeAdapter.ts`
 * (the Node-only facade). The pure core never imports either, and the
 * browser bundle must not pull Node's fs module in through this barrel. Everything
 * reachable from this file is pure: no clock, no randomness, no storage, no
 * DOM, no network, and no import from outside the keyfuse directory.
 */

export const KEYFUSE_VERSION = 1;
export const KEYFUSE_MARK = "__DF_KEYFUSE__";

export { auditDigest, canonicalJson, fnv1a32, keyfuseHash } from "./hash";
export {
  assignmentWith,
  baselineAssignment,
  collapse,
  differingSlots,
  slotName,
  slotValues,
  validateUniverse,
  KEYFUSE_MAX_SLOTS,
} from "./slots";
export {
  buildCoveringArray,
  buildCoverWithDefaults,
  hammingBallSize,
  verifyCoverage,
} from "./cover";
export { createVirtualOracle, readSlotNames } from "./trace";
export {
  runProbe,
  KEYFUSE_DEFAULT_STRENGTH,
  KEYFUSE_EXACT_MAX_ROWS,
  KEYFUSE_MAX_RUNS,
  KEYFUSE_MAX_STRENGTH,
} from "./probe";
export { checkNecessity, minimizeRowSupport } from "./minimize";
export { buildRepair, keyfuseKey } from "./repair";
export {
  auditTask,
  KEYFUSE_CERTIFICATE,
  KEYFUSE_CERTIFICATE_TRUNCATED,
  KEYFUSE_FIXPOINT_PASSES,
} from "./audit";
export type { ProbeOutcome } from "./probe";
export type {
  Assignment,
  AuditResult,
  Detection,
  KeyFuseTask,
  MinimizedWitness,
  NodeTask,
  OracleOutcome,
  OracleRun,
  ProbeOptions,
  ProbeRow,
  ProbeStrategy,
  RepairResult,
  SlotKind,
  SlotRead,
  SlotSpec,
  SlotUniverse,
  TaskDefinition,
  TaskOracle,
  TracedEnv,
  VirtualTask,
  WitnessPair,
} from "./types";
