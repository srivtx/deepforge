#!/usr/bin/env python3
"""External-corpus census runner — a caller, not an engine.

Usage:

    python3 scripts/py_external_census.py <corpus.json> \
        [--records records.json] [--workers N] [--runs 2] [--quiet]

This script adds no methodology. It imports the analyzer the committed
Behavioral Delta Ledger gate already uses (`scripts/py_bdl_verify.py`) and runs
it over a *caller-supplied* corpus file, then writes the engine's own records.
Every definition it relies on — the probe bank, the signature states, the
mutation families, the per-exercise md5 seed, the 1e-6 deep equality, the
`small-basis` skip, the per-call timeout — lives in that module and is not
restated here. `py_bdl_verify.py` is not modified by this path, and
`tests/external-corpus.test.ts` asserts its SHA-256 is unchanged.

What this script deliberately does not do:

  * it does not sample. The internal gate substitutes a 240-problem stratified
    sample for the full census because the census engine is not committed and a
    full run is expensive. An external corpus is run in full, so
    `stratified_sample` is not used here at all — a reader can confirm that the
    external denominator is the whole corpus and not a subsample of it;
  * it does not compute rates, intervals, or verdicts. Those live in
    `src/lib/externalCorpus/stats.ts` and `compare.ts`, so the interval in a
    report and the interval in a comparison are literally the same function;
  * it does not decide what counts as analyzable. It reports the analyzer's own
    `skip` reason verbatim and lets the TypeScript layer put it in the exclusion
    ledger, so the accounting has exactly one home and the two ledgers (format
    rejections, analysis exclusions) can never be merged by accident;
  * it does not know what a corpus is. Provenance, licensing, and independence
    are the validator's business, upstream of this script.

Output: a JSON object at `--records` with the engine digests, the frozen
constants, and the analyzer's records. A one-line `EXTERNAL_CENSUS_SUMMARY` on
stdout for the runner to parse.

Two runs are made by default, because determinism is a precondition of any
comparison; `--runs 1` is available for a smoke test and the caller then records
that the determinism check did not happen rather than claiming it did.

Stdlib only. Writes only to `--records`.
"""

import argparse
import hashlib
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Importing a sibling module would write `scripts/__pycache__/`, and a
# replication run must not leave anything behind in the repository. This has to
# be set BEFORE the import, not after.
sys.dont_write_bytecode = True

import py_bdl_verify as engine  # noqa: E402  (sys.path set above; intentional)


def digest_records(records):
    """Canonical digest of one run, timing excluded — the view the gate takes."""
    payload = engine.canonical(records)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def file_digest(path):
    with open(path, "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Run the committed BDL analyzer over a caller-supplied external corpus"
    )
    parser.add_argument("corpus", help="JSON array of {id, category, difficulty, solution, testCases}")
    parser.add_argument("--records", default=None, help="write the engine records here as JSON")
    parser.add_argument("--workers", type=int, default=min(8, os.cpu_count() or 1))
    parser.add_argument("--runs", type=int, default=2, help="engine runs for the determinism check")
    parser.add_argument("--quiet", action="store_true", help="suppress the per-run lines")
    args = parser.parse_args(argv)

    with open(args.corpus, encoding="utf-8") as handle:
        corpus = json.load(handle)
    if not isinstance(corpus, list) or not corpus:
        print(
            "EXTERNAL_CENSUS_FAIL the corpus file is not a non-empty JSON array of\n"
            "  {id, category, difficulty, solution, testCases} records.\n"
            "  This is an internal stage, not a user entry point: it consumes the\n"
            "  normalised corpus that scripts/external-replication.ts writes after\n"
            "  validation, not a df-corpus/1 file. To run the methodology over your\n"
            "  own corpus use:\n"
            "      bun run scripts/external-replication.ts --corpus <your-corpus.json>",
            file=sys.stderr,
        )
        return 2
    ids = [row.get("id") for row in corpus if isinstance(row, dict)]
    if len(ids) != len(corpus) or len(set(ids)) != len(ids):
        print("EXTERNAL_CENSUS_FAIL corpus rows are not objects with unique ids", file=sys.stderr)
        return 2

    here = os.path.dirname(os.path.abspath(__file__))
    engine_path = os.path.join(here, "py_bdl_verify.py")
    workers = max(1, args.workers)
    run_count = max(1, args.runs)

    runs = []
    first_records = None
    for index in range(run_count):
        records = engine.run_engine(corpus, workers)
        if first_records is None:
            first_records = records
        digest = digest_records(records)
        runs.append({"run": index, "records_digest": digest, "records": len(records)})
        if not args.quiet:
            analyzable = sum(1 for row in records if "skip" not in row)
            print(
                "external census run %d: %d records, %d analyzable, %d excluded, digest %s"
                % (index, len(records), analyzable, len(records) - analyzable, digest[:12])
            )

    identical = len({run["records_digest"] for run in runs}) == 1
    analyzable = sum(1 for row in (first_records or []) if "skip" not in row)
    excluded = sum(
        1 for row in (first_records or []) if "skip" in row
    )

    if args.records:
        directory = os.path.dirname(os.path.abspath(args.records))
        if directory:
            os.makedirs(directory, exist_ok=True)
        with open(args.records, "w", encoding="utf-8") as handle:
            json.dump(
                {
                    "schema": "deepforge-external-records/1",
                    "corpus_path": args.corpus,
                    "corpus_sha256": file_digest(args.corpus),
                    "engine": {
                        "path": "scripts/py_bdl_verify.py",
                        "sha256": file_digest(engine_path),
                    },
                    "constants": {
                        "TOL": engine.TOL,
                        "BASIS_CAP": engine.BASIS_CAP,
                        "MIN_BASIS": engine.MIN_BASIS,
                        "MUTANT_CAP": engine.MUTANT_CAP,
                        "MUTANT_PER_KIND": engine.MUTANT_PER_KIND,
                        "CALL_TIMEOUT": engine.CALL_TIMEOUT,
                    },
                    "workers": workers,
                    "runs": runs,
                    "two_runs_byte_identical": identical,
                    "records": first_records or [],
                },
                handle,
                sort_keys=True,
            )

    print(
        "EXTERNAL_CENSUS_SUMMARY "
        + json.dumps(
            {
                "exercises": len(corpus),
                "records": len(first_records or []),
                "analyzable": analyzable,
                "excluded": excluded,
                "runs": run_count,
                "two_runs_byte_identical": identical,
                "digests": [run["records_digest"] for run in runs],
            },
            sort_keys=True,
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
