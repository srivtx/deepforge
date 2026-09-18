import { WARRANT_VERSION } from "./types";
import type {
  Append,
  Attempt,
  ContextId,
  Digest,
  Identity,
  Op,
  RootId,
  ValueId,
  VerifierId,
  VersionId,
} from "./types";
import { canonicalJson, warrantHash } from "./hash";

export function contextGenesis(context: ContextId): Digest {
  return warrantHash(`warrant:ctx:${context}:${WARRANT_VERSION}`);
}

export function valueIdOf(
  op: Op,
  kind: string,
  payload: unknown,
  cites: readonly ValueId[],
  context: ContextId,
  genesis: Digest,
): ValueId {
  return warrantHash(canonicalJson({ op, kind, payload, cites, context, genesis }));
}

export function rootIdOf(authorRoot: Identity, specDigest: Digest, coverage: readonly string[]): RootId {
  return warrantHash(canonicalJson({ authorRoot, coverage, specDigest, v: WARRANT_VERSION }));
}

export function versionIdOf(rootId: RootId, specDigest: Digest, seq: number): VersionId {
  return warrantHash(canonicalJson({ root: rootId, seq, spec: specDigest }));
}

export function attemptDigest(a: Attempt): Digest {
  return warrantHash(
    canonicalJson({
      refuter: a.refuter,
      family: a.family,
      seed: a.seed,
      outcome: a.outcome,
      cost: a.cost,
      witness: a.witness,
      submittedBy: a.submittedBy,
    }),
  );
}

export function replaySig(admittedBy: VerifierId, prev: Digest, a: Attempt): Digest {
  return warrantHash(`warrant:sig:${admittedBy}:${prev}:${attemptDigest(a)}`);
}

export function chainGenesis(id: ValueId): Digest {
  return warrantHash(`warrant:chain:${id}`);
}

export function headDigest(id: ValueId, chain: readonly Append[]): Digest {
  let head = chainGenesis(id);
  for (const append of chain) {
    head = warrantHash(
      canonicalJson({
        admittedBy: append.admittedBy,
        attempt: attemptDigest(append.attempt),
        prev: head,
        sig: append.sig,
      }),
    );
  }
  return head;
}
