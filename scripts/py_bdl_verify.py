#!/usr/bin/env python3
"""DeepForge Behavioral Delta Ledger (wave 42) — independent offline gate.

Usage:

    python3 scripts/py_bdl_verify.py <corpus.json> \
        [--census census_clean.jsonl] [--sample N] [--seed S] \
        [--workers N] [--scratch DIR] \
        [--harnesses harness-fixtures.json] [--harness-results results.json]

The gate re-implements the BDL probe-basis and signature semantics from the
frozen wave-42 definitions (fresh deep copies per call, 1e-6 deep equality
with the integer-overflow guard, raise/timeout = state 2, md5-seeded probe
shuffle), re-runs the analyzer on a deterministic stratified sample of the
real corpus, and certifies:

  1. the sample reproduces the published headline rates inside sample-size-
     aware tolerances. Tolerance rule: tol = 3 * sqrt(se_sample^2 +
     se_corpus^2), where se_sample is a cluster-robust standard error
     (per-problem contributions, so within-problem mutant correlation is
     respected) and se_corpus is the published corpus 95% CI half-width /
     1.96. The rule is stated per row in the output; nothing is hard-coded to
     PASS;
  2. the committed spot records (`al-345`, `ds-074`) reproduce their embedded
     canonical sha256 digests and pinned fields (churn_rename 0, n_mut 31/11
     and 27/3) — this replaces the machine-local census dependency;
  3. determinism: two independent engine runs produce byte-identical
     canonical result payloads, 0 reference flakes, 0 cosmetic or rename
     churn on the sample;
  4. when `--harnesses` is given, the emitted shipped Python harnesses are
     executed under CPython end to end and checked for agree / wrong-value /
     raise / reference-timeout / sleep-budget / line-budget / wall-budget /
     duplicate-marker behavior. When `--harness-results` is given the
     captured stdout of each fixture is written there so the TypeScript gate
     can run the shipped parser over real marker output.

The census argument is optional: when provided it re-enables the exact
census-artifact consistency checks and the sample-vs-census record equality
check (the original machine-local certification); when absent the gate is
fully self-contained on committed constants and spot digests.

Prints a table and a machine-readable `BDL_GATE_SUMMARY {...}` line; exits
non-zero on any failure. Stdlib only, no repo writes outside the scratch
directory it is given. The committed digests were produced with CPython 3.13.
"""

import argparse
import ast
import builtins
import copy
import hashlib
import json
import math
import multiprocessing as mp
import os
import random
import re
import signal
import subprocess
import sys
import time
from collections import Counter

TOL = 1e-6
CALL_TIMEOUT = 0.25
BASIS_CAP = 48
MIN_BASIS = 5
MUTANT_CAP = 24
MUTANT_PER_KIND = 4
DEFAULT_SAMPLE = 240
DEFAULT_SEED = "deepforge-bdl-gate-v1"
SIGMA = 3.0
Z_95 = 1.96

PROJECTION_KEYS = (
    "skip",
    "basis_n",
    "prov",
    "ref_sig",
    "determinism_flake",
    "churn_cosmetic",
    "churn_rename",
    "n_mut",
    "n_invisible",
    "mutants",
)

CENSUS_COUNTS = {
    "rows": 5730,
    "analyzable": 5682,
    "skipped": 48,
    "mutants": 88357,
    "invisible": 9041,
    "test_passing": 14534,
    "hidden_visible": 6574,
    "problems_test_passing_mutant": 3600,
    "problems_visible_slip": 2523,
    "zero_mutant_problems": 55,
    "all_visible_problems": 2818,
    "all_visible_denominator": 5627,
    "reference_flakes": 0,
    "cosmetic_churn_bad": 0,
    "rename_applied": 4680,
    "rename_churn_bad": 0,
    "invariant_bad": 0,
}

# Expected corpus rate + published 95% CI half-width (blueprint E3 table).
HEADLINE_RATES = {
    "analyzable": (5682 / 5730, 0.0),
    "mutants_per_problem": (88357 / 5682, 0.0),
    "invisible": (9041 / 88357, 0.0020),
    "test_passing": (14534 / 88357, 0.00245),
    "hidden_visible": (6574 / 14534, 0.0081),
    "problems_visible_slip": (2523 / 5682, 0.0129),
}

BDL_MARK = "__DF_BDL__"

# Committed spot-record checksums and pinned fields, generated from the clean
# CPython 3.13 run. The digest is sha256 over the canonical projection of the
# independent analyzer's record (json.dumps(sort_keys=True, separators=(",",":")));
# these replace the machine-local census read so the gate runs from a clean
# checkout.
SPOT_RECORDS = {
    "al-345": {
        "digest": "5076786428d8554fefcf64a8611aeaea0387de6d257045100bc302e3b941f74e",
        "fields": {
            "skip": None,
            "basis_n": 15,
            "churn_rename": 0,
            "churn_cosmetic": 0,
            "n_mut": 31,
            "n_invisible": 11,
            "determinism_flake": 0,
        },
    },
    "ds-074": {
        "digest": "58e3bcbebd0edd19e990cdd92635bd3a28399bdc09106c44e881fb50eab17eca",
        "fields": {
            "skip": None,
            "basis_n": 21,
            "churn_rename": 0,
            "churn_cosmetic": 0,
            "n_mut": 27,
            "n_invisible": 3,
            "determinism_flake": 0,
        },
    },
}

HARNESS_FIXTURE_TIMEOUT = 30.0


class _CallTimeout(Exception):
    pass


def _alarm(signum, frame):
    raise _CallTimeout()


if hasattr(signal, "SIGALRM"):
    signal.signal(signal.SIGALRM, _alarm)


# ---------------------------------------------------------------------------
# Execution semantics (the platform's Pyodide harness equality / fresh copies)
# ---------------------------------------------------------------------------


def deep_eq(a, b, tol=TOL):
    """1e-6 deep equality, same as scripts/py_verify.py.

    The overflow guard returns exact `a == b` for ints too large to convert
    to float (the corrected semantics; the old scratch engine re-raised on
    that path and would have crashed the record instead).
    """
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        try:
            return math.isclose(float(a), float(b), rel_tol=tol, abs_tol=tol)
        except (ValueError, OverflowError):
            return a == b
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(deep_eq(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(deep_eq(a[k], b[k], tol) for k in a)
    if a is None or b is None:
        return a is b
    return a == b


def call(fn, args, timeout=CALL_TIMEOUT):
    """Fresh deep copy per call; a 0.25 s alarm bounds each call."""
    if hasattr(signal, "SIGALRM"):
        signal.setitimer(signal.ITIMER_REAL, timeout)
    try:
        return ("ok", fn(*copy.deepcopy(list(args))))
    except _CallTimeout:
        return ("timeout",)
    except RecursionError:
        return ("err", "RecursionError", "")
    except Exception as exc:  # noqa: BLE001
        return ("err", type(exc).__name__, str(exc)[:80])
    finally:
        if hasattr(signal, "SIGALRM"):
            signal.setitimer(signal.ITIMER_REAL, 0)


# ---------------------------------------------------------------------------
# Probe basis (deterministic single-argument perturbations, md5-seeded)
# ---------------------------------------------------------------------------


def _is_num(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _perturb_list(value):
    out = [
        ([], "empty"),
        ([0], "zero1"),
        (value[::-1], "reverse"),
        (value + value[:1], "extend"),
        (value[:-1], "short"),
        (value[1:], "drop"),
        ([0] * len(value), "zeros"),
    ]
    if len(value) <= 4:
        out.append((value + value, "dup"))
    if value and all(_is_num(x) for x in value):
        out += [
            ([x + 1 for x in value], "inc"),
            ([-x for x in value], "neg"),
            (sorted(value), "sort"),
            (sorted(value, reverse=True), "rsort"),
        ]
    if value and isinstance(value[0], list):
        if all(isinstance(row, list) for row in value):
            if all(len(row) == len(value[0]) for row in value):
                out.append(([list(col) for col in zip(*value)], "transpose"))
            out.append(([list(reversed(row)) for row in value], "rowrev"))
            out.append((value + [list(value[0])], "rowdup"))
    return out


def _perturb(value):
    if isinstance(value, bool):
        return [(not value, "flip")]
    if isinstance(value, int):
        return [
            (0, "zero"),
            (1, "one"),
            (-1, "negone"),
            (value + 1, "inc"),
            (value - 1, "dec"),
            (2 * value, "dbl"),
            (-value, "neg"),
            (value + 2, "inc2"),
        ]
    if isinstance(value, float):
        return [
            (0.0, "zero"),
            (1.0, "one"),
            (-1.0, "negone"),
            (value + 0.5, "inc"),
            (value - 0.5, "dec"),
            (-value, "neg"),
        ]
    if isinstance(value, str):
        return [
            ("", "sempty"),
            ("a", "sone"),
            (value + value, "sdup"),
            (value.upper(), "supper"),
            (value[::-1], "srev"),
            (value + "x", "sext"),
            (value[:-1], "sshort"),
        ]
    if isinstance(value, list):
        return _perturb_list(value)
    if isinstance(value, dict):
        out = [({}, "dempty"), (dict(value), "dcopy")]
        if value:
            out.append(({k: 0 for k in value}, "dzeros"))
        return out
    return []


def probe_bank(test_inputs, cap=BASIS_CAP, seed=0):
    """Shuffled, deduped, shipped-input-excluded perturbation probes."""
    rnd = random.Random(seed)
    shipped = set()
    for test in test_inputs:
        try:
            shipped.add(repr(list(test)))
        except Exception:  # noqa: BLE001
            pass
    candidates = []
    for test in test_inputs[:3]:
        for arg_index in range(len(test)):
            for perturbed, kind in _perturb(test[arg_index]):
                candidates.append(
                    (
                        [perturbed if j == arg_index else test[j] for j in range(len(test))],
                        "a%d:%s" % (arg_index, kind),
                    )
                )
    rnd.shuffle(candidates)
    out = []
    seen = set()
    for args, provenance in candidates:
        try:
            key = repr(args)
        except Exception:  # noqa: BLE001
            continue
        if key in seen or key in shipped or len(key) >= 4000:
            continue
        seen.add(key)
        out.append((args, provenance))
        if len(out) >= cap:
            break
    return out


def signature(fn, basis):
    """State per basis probe: 0 agree, 1 wrong value, 2 raise/timeout."""
    states = []
    for args, reference_value in basis:
        result = call(fn, args)
        if result[0] != "ok":
            states.append(2)
        elif deep_eq(result[1], reference_value):
            states.append(0)
        else:
            states.append(1)
    return tuple(states)


def churn(first, second):
    return sum(1 for a, b in zip(first, second) if a != b and a != -1 and b != -1)


# ---------------------------------------------------------------------------
# Mutants (wave-41 edit families, md5-seeded target shuffle)
# ---------------------------------------------------------------------------

CMP_SWAP = {
    ast.Lt: ast.LtE,
    ast.LtE: ast.Lt,
    ast.Gt: ast.GtE,
    ast.GtE: ast.Gt,
    ast.Eq: ast.NotEq,
    ast.NotEq: ast.Eq,
}
BIN_SWAP = {
    ast.Add: ast.Sub,
    ast.Sub: ast.Add,
    ast.FloorDiv: ast.Div,
    ast.Div: ast.FloorDiv,
    ast.Mod: ast.FloorDiv,
    ast.Mult: ast.Add,
}
AUG_SWAP = {ast.Add: ast.Sub, ast.Sub: ast.Add, ast.Mult: ast.Add}
FUNC_SWAP = {"min": "max", "max": "min"}


def mut_targets(tree):
    out = []

    def rec(node, path):
        if isinstance(node, ast.Compare):
            if any(type(op) in CMP_SWAP for op in node.ops):
                out.append(("cmp", path))
            out.append(("notins", path))
        if isinstance(node, ast.BoolOp):
            out.append(("bool", path))
        if isinstance(node, ast.BinOp) and type(node.op) in BIN_SWAP:
            out.append(("bin", path))
        if isinstance(node, ast.AugAssign) and type(node.op) in AUG_SWAP:
            out.append(("aug", path))
        if isinstance(node, ast.Constant) and isinstance(node.value, int) and not isinstance(node.value, bool):
            out.append(("int", path))
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not):
            out.append(("notdel", path))
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "len" and not node.keywords:
            out.append(("lenshift", path))
        if isinstance(node, ast.Subscript) and isinstance(node.slice, ast.expr) and not isinstance(node.slice, ast.Tuple):
            out.append(("idx", path))
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in FUNC_SWAP and len(node.args) >= 1:
            out.append(("func", path))
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
            out.append(("negdel", path))
        for index, child in enumerate(ast.iter_child_nodes(node)):
            rec(child, path + [index])

    rec(tree, [])
    return out


def _get_node(tree, path):
    node = tree
    for index in path:
        node = list(ast.iter_child_nodes(node))[index]
    return node


def _replace_child(parent, old, new):
    for field_name, field_value in ast.iter_fields(parent):
        if field_value is old:
            setattr(parent, field_name, new)
            return True
        if isinstance(field_value, list):
            for index, item in enumerate(field_value):
                if item is old:
                    field_value[index] = new
                    return True
    return False


def _build_mutant(tree, target, which):
    tree = copy.deepcopy(tree)
    node = _get_node(tree, target[1])
    kind = target[0]
    replacement = None
    if kind == "cmp":
        node.ops = [CMP_SWAP[type(node.ops[0])]()]
    elif kind == "bool":
        node.op = ast.Or() if isinstance(node.op, ast.And) else ast.And()
    elif kind == "bin":
        node.op = BIN_SWAP[type(node.op)]()
    elif kind == "aug":
        node.op = AUG_SWAP[type(node.op)]()
    elif kind == "int":
        node.value = node.value + (1 if which == 0 else -1)
    elif kind == "notdel":
        replacement = node.operand
    elif kind == "lenshift":
        replacement = ast.BinOp(
            left=copy.deepcopy(node),
            op=(ast.Sub() if which == 0 else ast.Add()),
            right=ast.Constant(value=1),
        )
        ast.copy_location(replacement, node)
    elif kind == "idx":
        slice_node = node.slice
        new_slice = ast.BinOp(
            left=slice_node,
            op=(ast.Sub() if which == 0 else ast.Add()),
            right=ast.Constant(value=1),
        )
        ast.copy_location(new_slice, slice_node)
        node.slice = new_slice
    elif kind == "func":
        node.func = ast.Name(id=FUNC_SWAP[node.func.id], ctx=ast.Load())
        ast.copy_location(node.func, node)
    elif kind == "notins":
        replacement = ast.UnaryOp(op=ast.Not(), operand=node)
        ast.copy_location(replacement, node)
    elif kind == "negdel":
        replacement = node.operand
    if replacement is not None:
        parent = _get_node(tree, target[1][:-1])
        if not _replace_child(parent, node, replacement):
            return None
    try:
        return ast.fix_missing_locations(tree)
    except Exception:  # noqa: BLE001
        return None


def generate_mutants(source, cap=MUTANT_CAP, seed=1, per_kind=MUTANT_PER_KIND):
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return []
    targets = mut_targets(tree)
    rnd = random.Random(seed)
    rnd.shuffle(targets)
    per = Counter()
    chosen = []
    for target in targets:
        if per[target[0]] >= per_kind:
            continue
        per[target[0]] += 1
        chosen.append(target)
        if len(chosen) >= cap:
            break
    out = []
    for index, target in enumerate(chosen):
        kinds = (
            (0,)
            if target[0] in ("cmp", "bool", "bin", "aug", "notdel", "func", "notins", "negdel")
            else (0, 1)
        )
        for which in kinds:
            mutated = _build_mutant(tree, target, which)
            if mutated is None:
                continue
            try:
                mutated_source = ast.unparse(mutated)
                compile(mutated_source, "<c>", "exec")
            except Exception:  # noqa: BLE001
                continue
            out.append(
                ("%s%s@%d" % (target[0], "+" if which == 0 else "-", index), target[0], mutated_source)
            )
    return out


# ---------------------------------------------------------------------------
# Source transforms (must preserve behavior: churn 0)
# ---------------------------------------------------------------------------


def make_cosmetic(source):
    return "# note 1\n# note 2\n" + source + "\n\n", "comments"


def make_rename(source):
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return None
    locals_ = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.arg):
            locals_.add(node.arg)
        if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
            locals_.add(node.id)
    counts = Counter()
    for node in ast.walk(tree):
        if isinstance(node, ast.Name):
            counts[node.id] += 1
    candidates = [name for name in locals_ if counts[name] >= 3 and not hasattr(builtins, name)]
    if not candidates:
        return None
    old = sorted(candidates)[0]
    new = old + "_r"
    if new in counts:
        return None

    class Renamer(ast.NodeTransformer):
        def visit_Name(self, node):
            if node.id == old:
                node.id = new
            return node

        def visit_arg(self, node):
            if node.arg == old:
                node.arg = new
            return node

        def visit_Nonlocal(self, node):
            node.names = [new if name == old else name for name in node.names]
            return node

        def visit_Global(self, node):
            node.names = [new if name == old else name for name in node.names]
            return node

    transformed = Renamer().visit(tree)
    ast.fix_missing_locations(transformed)
    return ast.unparse(transformed), "rename"


# ---------------------------------------------------------------------------
# Analyzer (one record per problem)
# ---------------------------------------------------------------------------


def entry_fn(source):
    match = re.search(r"^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(", source, re.M)
    return match.group(1) if match else None


def eval_program(source, entry):
    namespace = {}
    try:
        exec(compile(source, "<m>", "exec"), namespace)
    except Exception:  # noqa: BLE001
        return None
    fn = namespace.get(entry)
    return fn if callable(fn) else None


def test_bitmask(fn, tests):
    mask = []
    for case in tests:
        result = call(fn, case["input"])
        mask.append(1 if (result[0] == "ok" and deep_eq(result[1], case["expected"])) else 0)
    return mask


def _analyze(problem):
    started = time.time()
    pid = problem["id"]
    record = {
        "id": pid,
        "category": problem["category"],
        "difficulty": problem["difficulty"],
        "lines": len(problem["solution"].splitlines()),
        "n_tests": len(problem["testCases"]),
    }
    try:
        tree = ast.parse(problem["solution"])
        source = ast.unparse(tree)
    except Exception:  # noqa: BLE001
        record["skip"] = "unparse"
        return record
    entry = entry_fn(source)
    reference = eval_program(source, entry)
    if reference is None:
        record["skip"] = "no-entry"
        return record
    tests = problem["testCases"]
    if not all(test_bitmask(reference, tests)):
        record["skip"] = "ref-fails-own-tests"
        return record

    seed = int(hashlib.md5(pid.encode()).hexdigest()[:8], 16)
    probes = probe_bank([case["input"] for case in tests], cap=BASIS_CAP, seed=seed)
    basis = []
    provenance = []
    for args, prov in probes:
        result = call(reference, args)
        if result[0] == "ok":
            basis.append((args, result[1]))
            provenance.append(prov)
    if len(basis) < MIN_BASIS:
        record["skip"] = "small-basis"
        record["basis_n"] = len(basis)
        return record
    record["basis_n"] = len(basis)
    record["prov"] = provenance

    sig_first = signature(reference, basis)
    sig_second = signature(reference, basis)
    record["determinism_flake"] = churn(sig_first, sig_second)
    record["ref_sig"] = list(sig_first)

    cosmetic_source, _ = make_cosmetic(source)
    cosmetic_fn = eval_program(cosmetic_source, entry)
    record["churn_cosmetic"] = churn(sig_first, signature(cosmetic_fn, basis)) if cosmetic_fn else None
    renamed = make_rename(source)
    if renamed:
        rename_fn = eval_program(renamed[0], entry)
        record["churn_rename"] = churn(sig_first, signature(rename_fn, basis)) if rename_fn else None
    else:
        record["churn_rename"] = None

    mutant_rows = []
    for label, family, mutant_source in generate_mutants(source, seed=seed):
        fn = eval_program(mutant_source, entry)
        if fn is None:
            continue
        mask = test_bitmask(fn, tests)
        mutant_rows.append(
            {
                "label": label,
                "fam": family,
                "churn": churn(sig_first, signature(fn, basis)),
                "pass": sum(mask),
                "ntest": len(mask),
            }
        )
    record["mutants"] = mutant_rows
    record["n_mut"] = len(mutant_rows)
    record["n_invisible"] = sum(1 for row in mutant_rows if row["churn"] == 0)
    record["secs"] = round(time.time() - started, 3)
    return record


def process_problem(problem):
    try:
        return _analyze(problem)
    except Exception as exc:  # noqa: BLE001
        return {"id": problem.get("id"), "skip": "crash:%s:%s" % (type(exc).__name__, exc)}


# ---------------------------------------------------------------------------
# Sampling and engine runs
# ---------------------------------------------------------------------------


def stratified_sample(corpus, size, seed):
    """Proportional-by-category sample; deterministic, MT-based, seeded."""
    by_category = {}
    for problem in corpus:
        by_category.setdefault(problem["category"], []).append(problem["id"])
    total = len(corpus)
    size = min(size, total)
    quotas = {}
    remainders = []
    for category, ids in by_category.items():
        exact = size * len(ids) / total
        quotas[category] = int(exact)
        remainders.append((exact - int(exact), category))
    remaining = size - sum(quotas.values())
    for _, category in sorted(remainders, key=lambda item: (-item[0], item[1])):
        if remaining <= 0:
            break
        quotas[category] += 1
        remaining -= 1
    picked = []
    for category in sorted(by_category):
        ids = sorted(by_category[category])
        rnd = random.Random("%s:%s" % (seed, category))
        order = sorted(range(len(ids)), key=lambda _: rnd.random())
        picked.extend(ids[index] for index in order[: quotas[category]])
    return picked


def run_engine(problems, workers):
    if workers <= 1:
        return [process_problem(problem) for problem in problems]
    if "fork" in mp.get_all_start_methods():
        context = mp.get_context("fork")
    else:
        context = mp.get_context()
    with context.Pool(workers) as pool:
        return pool.map(process_problem, problems, chunksize=1)


def canonical(results):
    """Stable view of a run: identical work must serialize identically (timing excluded)."""
    return json.dumps(
        [{key: value for key, value in row.items() if key != "secs"} for row in results],
        sort_keys=True,
        separators=(",", ":"),
    )


def project(record):
    return {key: record.get(key) for key in PROJECTION_KEYS}


def sha256_text(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def spot_digest(record):
    """Canonical sha256 of a spot record; must match the committed constant."""
    payload = json.dumps(project(record), sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


# ---------------------------------------------------------------------------
# Shipped-harness fixtures (emitted by scripts/verify-bdl.ts)
# ---------------------------------------------------------------------------


def _fixture_marker(line):
    """Mirror of the shipped duplicate-rejection rule: one marker per line.

    Returns None when the line is not a marker, otherwise
    {"valid": bool, "sig": str|None, "mask": str|None}.
    """
    line = line.strip()
    if not line.startswith(BDL_MARK):
        return None
    try:
        payload = json.loads(line[len(BDL_MARK):].strip())
    except Exception:  # noqa: BLE001
        return {"valid": False, "sig": None, "mask": None}
    if not isinstance(payload, dict) or set(payload.keys()) != {"v", "sig", "mask"}:
        return {"valid": False, "sig": None, "mask": None}
    if payload.get("v") != 1:
        return {"valid": False, "sig": None, "mask": None}
    sig = payload.get("sig")
    mask = payload.get("mask")
    if not isinstance(sig, str) or not isinstance(mask, str):
        return {"valid": False, "sig": None, "mask": None}
    if len(sig) > 48 or len(mask) > 64:
        return {"valid": False, "sig": None, "mask": None}
    if re.fullmatch(r"[012x]*", sig) is None or re.fullmatch(r"[01]*", mask) is None:
        return {"valid": False, "sig": None, "mask": None}
    return {"valid": True, "sig": sig, "mask": mask}


def fixture_markers(stdout):
    return [
        entry
        for entry in (_fixture_marker(line) for line in stdout.splitlines())
        if entry is not None
    ]


def run_harness_fixture(fixture, scratch):
    """Execute one emitted harness under CPython; collect stdout and timing."""
    name = fixture["name"]
    safe_name = re.sub(r"[^A-Za-z0-9_.-]", "_", name)
    path = os.path.join(scratch, "fixture_%s.py" % safe_name)
    with open(path, "w") as handle:
        handle.write(fixture["python"])
    if fixture.get("runner") == "twice":
        wrapper = "import runpy\nfor _ in range(2):\n    runpy.run_path(%r)\n" % path
        command = [sys.executable, "-c", wrapper]
    else:
        command = [sys.executable, path]
    started = time.perf_counter()
    try:
        proc = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=HARNESS_FIXTURE_TIMEOUT,
        )
        stdout = proc.stdout
        stderr = proc.stderr
        status = proc.returncode
    except subprocess.TimeoutExpired as exc:
        stdout = exc.stdout.decode("utf-8", "replace") if isinstance(exc.stdout, bytes) else (exc.stdout or "")
        stderr = exc.stderr.decode("utf-8", "replace") if isinstance(exc.stderr, bytes) else (exc.stderr or "")
        status = "timeout"
    elapsed = time.perf_counter() - started
    return {
        "name": name,
        "stdout": stdout,
        "stderr": stderr[-400:],
        "elapsed": round(elapsed, 3),
        "status": status,
        "markers": fixture_markers(stdout),
    }


def run_harness_fixtures(harnesses_path, results_path, scratch, metrics):
    with open(harnesses_path) as handle:
        fixtures = json.load(handle)
    if not os.path.isdir(scratch):
        os.makedirs(scratch, exist_ok=True)
    results = []
    for fixture in fixtures:
        result = run_harness_fixture(fixture, scratch)
        expect = fixture.get("expect", {})
        problems = []
        if result["status"] == "timeout":
            problems.append("fixture process did not exit within the runner timeout")
        markers = result["markers"]
        expected_markers = expect.get("markers")
        if expected_markers is not None and len(markers) != expected_markers:
            problems.append("marker count %d != expected %d" % (len(markers), expected_markers))
        for label, key in (("sig", "sigs"), ("mask", "masks")):
            expected_values = expect.get(key) or []
            if not expected_values:
                continue
            if len(markers) != len(expected_values):
                problems.append(
                    "%s expectations cover %d markers but %d were emitted"
                    % (key, len(expected_values), len(markers))
                )
                continue
            for index, value in enumerate(expected_values):
                if not markers[index]["valid"] or markers[index][label] != value:
                    problems.append(
                        "marker %d %s %r != expected %r"
                        % (index, label, markers[index][label], value)
                    )
        if expect.get("all_valid"):
            for index, marker in enumerate(markers):
                if not marker["valid"]:
                    problems.append("marker %d is not a valid marker" % index)
        max_seconds = expect.get("max_seconds")
        if max_seconds is not None and result["elapsed"] > max_seconds:
            problems.append(
                "elapsed %.3fs exceeds max_seconds %.3f" % (result["elapsed"], max_seconds)
            )
        result["pass"] = not problems
        result["problems"] = problems
        results.append(result)

    if results_path:
        with open(results_path, "w") as handle:
            json.dump(results, handle)

    passed = sum(1 for result in results if result["pass"])
    details = []
    for result in results:
        if result["pass"]:
            details.append("%s=%.2fs" % (result["name"], result["elapsed"]))
        else:
            details.append("%s: %s" % (result["name"], "; ".join(result["problems"])))
    metrics.append(
        metric(
            "harness.fixtures",
            "%d/%d" % (len(results), len(results)),
            "%d/%d" % (passed, len(results)),
            "exact",
            passed == len(results),
            "; ".join(details),
        )
    )
    return results


# ---------------------------------------------------------------------------
# Metric helpers
# ---------------------------------------------------------------------------


def metric(name, expected, observed, tolerance, passed, detail=""):
    return {
        "name": name,
        "expected": expected,
        "observed": observed,
        "tolerance": tolerance,
        "pass": bool(passed),
        "detail": detail,
    }


def exact_metric(name, expected, observed, detail=""):
    return metric(name, str(expected), str(observed), "exact", observed == expected, detail)


def rate_rows(results):
    """(pairs, counts) per metric; pairs feed the cluster-robust SE."""
    analyzable = [row for row in results if "skip" not in row]
    pairs = {}
    pairs["analyzable"] = [(1 if "skip" not in row else 0, 1) for row in results]
    pairs["mutants_per_problem"] = [(row["n_mut"], 1) for row in analyzable]
    pairs["invisible"] = [(row["n_invisible"], row["n_mut"]) for row in analyzable]
    pairs["test_passing"] = [
        (sum(1 for m in row["mutants"] if m["pass"] == m["ntest"]), row["n_mut"]) for row in analyzable
    ]
    pairs["hidden_visible"] = [
        (
            sum(1 for m in row["mutants"] if m["pass"] == m["ntest"] and m["churn"] > 0),
            sum(1 for m in row["mutants"] if m["pass"] == m["ntest"]),
        )
        for row in analyzable
    ]
    pairs["problems_visible_slip"] = [
        (
            1
            if any(m["pass"] == m["ntest"] and m["churn"] > 0 for m in row["mutants"])
            else 0,
            1,
        )
        for row in analyzable
    ]
    return analyzable, pairs


def rate_metric(name, pairs, expected, ci_half):
    numerator = sum(a for a, _ in pairs)
    denominator = sum(b for _, b in pairs)
    observed = numerator / denominator if denominator else float("nan")
    if denominator:
        variance = sum((a - expected * b) ** 2 for a, b in pairs)
        se_sample = math.sqrt(variance) / denominator
    else:
        se_sample = float("inf")
    se_corpus = ci_half / Z_95 if ci_half else 0.0
    tolerance = SIGMA * math.sqrt(se_sample * se_sample + se_corpus * se_corpus)
    passed = denominator > 0 and abs(observed - expected) <= tolerance
    return metric(
        name,
        "%.2f%%" % (100 * expected),
        "%.2f%%" % (100 * observed) if denominator else "n/a",
        "±%.2fpp" % (100 * tolerance) if denominator else "n/a",
        passed,
        "n=%d, cluster SE %.2fpp, corpus CI ±%.2fpp" % (denominator, 100 * se_sample, 100 * ci_half),
    )


def count_metric(name, pairs, expected_per_unit, units, ci_half):
    numerator = sum(a for a, _ in pairs)
    denominator = sum(b for _, b in pairs)
    expected = expected_per_unit * units
    if denominator:
        variance = sum((a - expected_per_unit * b) ** 2 for a, b in pairs)
        se_sample = math.sqrt(variance)
    else:
        se_sample = float("inf")
    se_corpus = ci_half / Z_95 * units if ci_half else 0.0
    tolerance = SIGMA * math.sqrt(se_sample * se_sample + se_corpus * se_corpus)
    passed = denominator > 0 and abs(numerator - expected) <= tolerance
    return metric(
        name,
        "%.0f" % expected,
        str(numerator),
        "±%.0f" % tolerance if denominator else "n/a",
        passed,
        "pooled per unit %.3f; cluster SE %.1f" % (expected_per_unit, se_sample),
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def parse_args(argv):
    parser = argparse.ArgumentParser(description="DeepForge BDL corpus gate")
    parser.add_argument("corpus", help="JSON array of problems")
    parser.add_argument(
        "--census",
        default=None,
        help="optional census_clean.jsonl; re-enables the exact census-artifact checks",
    )
    parser.add_argument("--sample", type=int, default=DEFAULT_SAMPLE)
    parser.add_argument("--seed", default=DEFAULT_SEED)
    parser.add_argument("--workers", type=int, default=min(8, os.cpu_count() or 1))
    parser.add_argument("--scratch", default=None)
    parser.add_argument(
        "--harnesses",
        default=None,
        help="harness fixtures JSON emitted by scripts/verify-bdl.ts",
    )
    parser.add_argument(
        "--harness-results",
        default=None,
        help="write per-fixture stdout/stderr/timing to this JSON path",
    )
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv if argv is not None else sys.argv[1:])
    total_started = time.time()

    if args.scratch:
        os.makedirs(args.scratch, exist_ok=True)

    with open(args.corpus) as handle:
        corpus_text = handle.read()
    corpus = json.loads(corpus_text)

    census_records = []
    census_text = ""
    if args.census:
        with open(args.census) as handle:
            for line in handle:
                census_text += line
                line = line.strip()
                if line:
                    census_records.append(json.loads(line))
    census_by_id = {row["id"]: row for row in census_records}

    metrics = []

    # ---- Census artifact internal consistency (exact; optional) ----------
    if args.census:
        analyzable = [row for row in census_records if "skip" not in row]
        skipped = [row for row in census_records if "skip" in row]
        ids = [row["id"] for row in census_records]
        corpus_ids = [problem["id"] for problem in corpus]
        mutants = [m for row in analyzable for m in row["mutants"]]
        invisible = sum(1 for m in mutants if m["churn"] == 0)
        test_passing = [m for m in mutants if m["pass"] == m["ntest"]]
        hidden_visible = sum(1 for m in test_passing if m["churn"] > 0)
        slip = sum(1 for row in analyzable if any(m["pass"] == m["ntest"] and m["churn"] > 0 for m in row["mutants"]))
        zero_mutant = sum(1 for row in analyzable if row["n_mut"] == 0)
        all_visible = sum(1 for row in analyzable if row["n_mut"] > 0 and row["n_invisible"] == 0)
        rename_applied = [row for row in analyzable if row["churn_rename"] is not None]
        invariant_bad = sum(
            1
            for row in analyzable
            if row["n_mut"] != len(row["mutants"])
            or row["n_invisible"] != sum(1 for m in row["mutants"] if m["churn"] == 0)
            or row["n_mut"] < row["n_invisible"]
            or row["basis_n"] != len(row["prov"])
            or row["basis_n"] != len(row["ref_sig"])
            or row["basis_n"] < MIN_BASIS
        )
        id_mismatch = len(set(corpus_ids) ^ set(ids))

        metrics += [
            exact_metric("census.rows", CENSUS_COUNTS["rows"], len(census_records)),
            exact_metric("census.unique_ids", len(corpus), len(set(ids))),
            exact_metric("census.id_set_matches_corpus", 0, id_mismatch),
            exact_metric("census.analyzable", CENSUS_COUNTS["analyzable"], len(analyzable)),
            exact_metric("census.skipped", CENSUS_COUNTS["skipped"], len(skipped)),
            exact_metric(
                "census.skipped_small_basis",
                CENSUS_COUNTS["skipped"],
                sum(1 for row in skipped if row.get("skip") == "small-basis"),
            ),
            exact_metric("census.mutants", CENSUS_COUNTS["mutants"], len(mutants)),
            exact_metric("census.invisible", CENSUS_COUNTS["invisible"], invisible),
            exact_metric("census.test_passing", CENSUS_COUNTS["test_passing"], len(test_passing)),
            exact_metric("census.hidden_visible", CENSUS_COUNTS["hidden_visible"], hidden_visible),
            exact_metric(
                "census.problems_test_passing_mutant",
                CENSUS_COUNTS["problems_test_passing_mutant"],
                sum(1 for row in analyzable if any(m["pass"] == m["ntest"] for m in row["mutants"])),
            ),
            exact_metric("census.problems_visible_slip", CENSUS_COUNTS["problems_visible_slip"], slip),
            exact_metric("census.zero_mutant_problems", CENSUS_COUNTS["zero_mutant_problems"], zero_mutant),
            exact_metric("census.all_visible_problems", CENSUS_COUNTS["all_visible_problems"], all_visible),
            exact_metric(
                "census.all_visible_denominator", CENSUS_COUNTS["all_visible_denominator"], len(analyzable) - zero_mutant
            ),
            exact_metric(
                "census.reference_flakes",
                CENSUS_COUNTS["reference_flakes"],
                sum(row["determinism_flake"] for row in analyzable),
            ),
            exact_metric(
                "census.cosmetic_churn_nonzero",
                CENSUS_COUNTS["cosmetic_churn_bad"],
                sum(1 for row in analyzable if row["churn_cosmetic"] not in (0, None)),
            ),
            exact_metric("census.rename_applied", CENSUS_COUNTS["rename_applied"], len(rename_applied)),
            exact_metric(
                "census.rename_churn_nonzero",
                CENSUS_COUNTS["rename_churn_bad"],
                sum(1 for row in rename_applied if row["churn_rename"] != 0),
            ),
            exact_metric("census.record_invariants", CENSUS_COUNTS["invariant_bad"], invariant_bad),
        ]

    # ---- Committed spot records (always; replaces the census read) -------
    by_id = {problem["id"]: problem for problem in corpus}
    spot_details = []
    spot_digests = {}
    spot_all_clean = True
    for pid, expected in SPOT_RECORDS.items():
        problem = by_id.get(pid)
        if problem is None:
            spot_all_clean = False
            spot_details.append("%s:MISSING" % pid)
            continue
        record = _analyze(problem)
        digest = spot_digest(record)
        spot_digests[pid] = digest
        clean = digest == expected["digest"]
        if clean:
            for field_name, expected_value in expected["fields"].items():
                if record.get(field_name) != expected_value:
                    clean = False
                    break
        spot_all_clean = spot_all_clean and clean
        spot_details.append("%s:%s" % (pid, "clean" if clean else "STALE"))
    metrics.append(
        metric("spot.records", "clean", ", ".join(spot_details), "exact", spot_all_clean)
    )

    # ---- Shipped-harness fixtures (optional; generated by the TS gate) ---
    if args.harnesses:
        run_harness_fixtures(
            args.harnesses,
            args.harness_results,
            args.scratch or os.path.dirname(os.path.abspath(args.harnesses)),
            metrics,
        )

    # ---- Deterministic stratified sample + two engine runs ---------------
    sample_ids = stratified_sample(corpus, args.sample, args.seed)
    sample = [by_id[pid] for pid in sample_ids]
    if args.scratch:
        with open(os.path.join(args.scratch, "sample.json"), "w") as handle:
            json.dump(sample, handle)

    run_started = time.time()
    first_run = run_engine(sample, args.workers)
    first_seconds = time.time() - run_started
    run_started = time.time()
    second_run = run_engine(sample, args.workers)
    second_seconds = time.time() - run_started

    first_payload = canonical(first_run)
    second_payload = canonical(second_run)
    identical = first_payload == second_payload
    metrics.append(
        metric("run.two_runs_byte_identical", "true", "true" if identical else "false", "exact", identical)
    )

    analyzable_run, pairs = rate_rows(first_run)
    sample_exact = 0
    sample_mismatch = []
    if args.census:
        for row in first_run:
            expected = census_by_id.get(row["id"])
            if expected is not None and project(row) == project(expected):
                sample_exact += 1
            else:
                sample_mismatch.append(row["id"])
        metrics.append(
            exact_metric("sample.records_match_census", len(sample), sample_exact, ",".join(sample_mismatch[:5]))
        )

    units = len(analyzable_run)
    metrics.append(
        count_metric(
            "sample.analyzable",
            pairs["analyzable"],
            HEADLINE_RATES["analyzable"][0],
            len(first_run),
            HEADLINE_RATES["analyzable"][1],
        )
    )
    metrics.append(
        count_metric(
            "sample.mutants",
            pairs["mutants_per_problem"],
            HEADLINE_RATES["mutants_per_problem"][0],
            units,
            HEADLINE_RATES["mutants_per_problem"][1],
        )
    )
    for name in ("invisible", "test_passing", "hidden_visible", "problems_visible_slip"):
        expected, ci_half = HEADLINE_RATES[name]
        metrics.append(rate_metric("sample." + name, pairs[name], expected, ci_half))

    sample_flakes = sum(row["determinism_flake"] for row in analyzable_run)
    sample_cosmetic_bad = sum(1 for row in analyzable_run if row["churn_cosmetic"] not in (0, None))
    sample_rename_applied = [row for row in analyzable_run if row["churn_rename"] is not None]
    sample_rename_bad = sum(1 for row in sample_rename_applied if row["churn_rename"] != 0)
    metrics += [
        exact_metric("run.reference_flakes", 0, sample_flakes),
        exact_metric("run.cosmetic_churn_nonzero", 0, sample_cosmetic_bad),
        exact_metric(
            "run.rename_churn_nonzero",
            0,
            sample_rename_bad,
            "applied %d" % len(sample_rename_applied),
        ),
    ]

    # ---- Report ----------------------------------------------------------
    width = max(len(m["name"]) for m in metrics) + 2
    print("BDL gate — independent re-implementation of the wave-42 corpus claims")
    print("corpus   %s  (%d problems, sha256 %s)" % (args.corpus, len(corpus), sha256_text(corpus_text)[:12]))
    if args.census:
        print("census   %s  (%d records)" % (args.census, len(census_records)))
    else:
        print("census   not provided — self-contained mode (committed constants + spot digests + fixtures)")
    print(
        "sample   %d problems (stratified by category, seed %r), %d analyzable, workers %d"
        % (len(sample), args.seed, units, args.workers)
    )
    print()
    print("%-*s %12s %12s %12s %6s" % (width, "metric", "expected", "observed", "tolerance", "result"))
    print("-" * (width + 50))
    for m in metrics:
        print(
            "%-*s %12s %12s %12s %6s"
            % (width, m["name"], m["expected"], m["observed"], m["tolerance"], "PASS" if m["pass"] else "FAIL")
        )
    print()
    if args.census:
        print(
            "sample provenance: %d/%d records reproduce their census record exactly; %d mismatch(es)%s"
            % (
                sample_exact,
                len(sample),
                len(sample_mismatch),
                (": " + ", ".join(sample_mismatch[:10])) if sample_mismatch else "",
            )
        )
    print(
        "determinism: two runs byte-identical %s; reference flakes %d; cosmetic churn %d; rename churn %d"
        % ("yes" if identical else "NO", sample_flakes, sample_cosmetic_bad, sample_rename_bad)
    )

    failures = [m for m in metrics if not m["pass"]]
    summary = {
        "ok": not failures,
        "checks": len(metrics),
        "failures": [m["name"] for m in failures],
        "metrics": metrics,
        "sample": {
            "size": len(sample),
            "seed": args.seed,
            "analyzable": units,
            "workers": args.workers,
            "records_match_census": sample_exact if args.census else None,
            "mismatches": sample_mismatch,
        },
        "determinism": {
            "byte_identical": identical,
            "digest": sha256_text(first_payload),
            "reference_flakes": sample_flakes,
            "cosmetic_churn_nonzero": sample_cosmetic_bad,
            "rename_churn_nonzero": sample_rename_bad,
            "run_seconds": [round(first_seconds, 2), round(second_seconds, 2)],
        },
        "census": {
            "path": args.census,
            "sha256": sha256_text(census_text) if args.census else None,
            "records": len(census_records),
        },
        "spot": {
            "digest": spot_digests,
            "clean": spot_all_clean,
        },
        "corpus": {
            "path": args.corpus,
            "sha256": sha256_text(corpus_text),
            "problems": len(corpus),
        },
        "runtime_seconds": round(time.time() - total_started, 2),
    }
    print()
    if failures:
        print("GATE FAILED: %d/%d checks failed (%s)" % (len(failures), len(metrics), ", ".join(m["name"] for m in failures)))
    else:
        print("GATE PASSED: %d/%d checks passed" % (len(metrics), len(metrics)))
    print("BDL_GATE_SUMMARY " + json.dumps(summary, sort_keys=True))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
