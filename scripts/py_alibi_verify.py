"""
DeepForge Silent Bug Hunt gate (v2) — independent Python checker for the frozen
alibi bank.

Usage:

    python3 scripts/py_alibi_verify.py <bank.json>

`bank.json` is a JSON array of
{id, reference, ghost, func, tests: [{input, expected}], witness,
 unionProbes?, unionPassed?, heldOutProbes?, heldOutPassed?, survived?,
 resistanceTier?, probesRun?, probesPassed?, firstDivergentProbe?}. For every
record it asserts:

  1. the reference passes every shipped test;
  2. the ghost passes every shipped test;
  3. the ghost diverges from the reference at `witness` — an exception or a
     timeout counts as divergence, and returned values must agree under the
     same 1e-6 deep-equality as scripts/py_verify.py (including the huge-int
     overflow fix: ints too large for float() compare exactly);
  4. the reference/ghost text diff is exactly one removed plus one added line;
  5. ZERO divergence over the FULL UNION suite and ZERO divergence over the
     independently parameterised HELD-OUT suite. Both suites are built from
     the VISIBLE shipped tests only and seeded by the puzzle id:

       UNION    = verifier S2/S3 sequences (their md5(id)-derived seeds),
                  a deterministic seed grid of the same generators,
                  systematic common-value/boundary single edits,
                  plus the repository lazy suite UNCAPPED.
       HELD-OUT = different seed family and generator mix (random in-domain
                  draws, pairwise arg perturbations, magnitude scaling,
                  structured container edits absent from the union).

     Every probe runs on fresh deep copies of the arguments for each program.

A record with a divergence in either suite is a gate failure, as is any
record whose optional unionProbes/unionPassed/heldOutProbes/heldOutPassed
metadata disagrees with the recomputation. Calls are bounded by a 1.0 s wall
alarm (hardware-tolerant; the census engines replayed at 0.25 s) and a
400,000-line tracing budget. Prints one line per puzzle and a
machine-readable `ALIBI_GATE_SUMMARY {...}` line, and exits non-zero on any
failure.
"""

import ast
import copy
import difflib
import hashlib
import io
import json
import math
import random
import signal
import sys
from contextlib import redirect_stdout

TOL = 1e-6
CALL_TIMEOUT = 1.0  # hardware-tolerant gate budget; census engines replayed at 0.25 s
LINE_BUDGET = 400_000
LAZY_PROBE_CAP = 128
LAZY_DEPTH = 3
LAZY_REPR_MAX = 2000

UNION_SEEDS = 16
UNION_PER_SEED = 100
UNION_REPR_MAX = 4000


class _AlibiTimeout(Exception):
    pass


class _AlibiLineBudget(BaseException):
    pass


def _alarm(signum, frame):
    raise _AlibiTimeout()


if hasattr(signal, "SIGALRM"):
    signal.signal(signal.SIGALRM, _alarm)


def _deep_eq(a, b, tol=TOL):
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        try:
            return math.isclose(float(a), float(b), rel_tol=tol, abs_tol=tol)
        except (ValueError, OverflowError):
            # Huge ints (and int/float mixes) cannot be squeezed through
            # float(); Python compares them exactly, which is the correct
            # semantics for values too large for the tolerance scale.
            return a == b
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(_deep_eq(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_deep_eq(a[k], b[k], tol) for k in a)
    if a is None or b is None:
        return a is b
    return a == b


def _load(source, entry, label):
    ns = {}
    try:
        exec(compile(source, "<%s>" % label, "exec"), ns)
    except BaseException as exc:  # noqa: BLE001
        return None, "%s: %s" % (type(exc).__name__, exc)
    fn = ns.get(entry)
    if not callable(fn):
        return None, "`%s` is not callable" % entry
    return fn, None


def _call(fn, args, state):
    def _tracer(frame, event, arg):
        if event == "line":
            state[0] += 1
            if state[0] > LINE_BUDGET:
                raise _AlibiLineBudget()
        return _tracer

    state[0] = 0
    out = io.StringIO()
    if hasattr(signal, "SIGALRM"):
        signal.setitimer(signal.ITIMER_REAL, CALL_TIMEOUT)
    sys.settrace(_tracer)
    try:
        with redirect_stdout(out):
            value = fn(*args)
        return "ok", value
    except _AlibiLineBudget:
        return "timeout", None
    except _AlibiTimeout:
        return "timeout", None
    except BaseException as exc:  # noqa: BLE001
        return "error", "%s: %s" % (type(exc).__name__, exc)
    finally:
        sys.settrace(None)
        if hasattr(signal, "SIGALRM"):
            signal.setitimer(signal.ITIMER_REAL, 0)


def _run_tests(fn, cases, state):
    """Return a list of failure strings; empty means every shipped test passes."""
    fails = []
    for index, case in enumerate(cases):
        args = case.get("input")
        if not isinstance(args, (list, tuple)):
            args = [args]
        kind, value = _call(fn, copy.deepcopy(list(args)), state)
        if kind != "ok":
            fails.append("case %d: %s" % (index, value if kind == "error" else kind))
            continue
        if not _deep_eq(value, case.get("expected")):
            fails.append("case %d: got %r want %r" % (index, value, case.get("expected")))
    return fails


def _witness_args(text):
    value = ast.literal_eval(text)
    if isinstance(value, (list, tuple)):
        return list(value)
    return [value]


def _line_diff(reference, ghost):
    """Return (changed_regions, removed_lines, added_lines) for the two sources."""
    ops = [
        op
        for op in difflib.SequenceMatcher(
            None, reference.split("\n"), ghost.split("\n"), autojunk=False
        ).get_opcodes()
        if op[0] != "equal"
    ]
    removed = sum(i2 - i1 for _, i1, i2, _, _ in ops)
    added = sum(j2 - j1 for _, _, _, j1, j2 in ops)
    return len(ops), removed, added


# ---------------------------------------------------------------------------
# Repository lazy-probe suite (visible shipped tests only, deterministic)
# ---------------------------------------------------------------------------


def lazy_probe_seed(pid):
    return int(hashlib.md5(pid.encode("utf-8")).hexdigest()[:8], 16)


def _container_sizes(value, depth=0):
    """Lengths of every container reachable from `value` within the depth cap."""
    out = []
    if depth > LAZY_DEPTH:
        return out
    if isinstance(value, (list, tuple, str)):
        out.append(len(value))
        for item in value:
            out.extend(_container_sizes(item, depth + 1))
    elif isinstance(value, dict):
        out.append(len(value))
        for item in value.values():
            out.extend(_container_sizes(item, depth + 1))
    return out


def _walk_numbers(value, depth=0):
    out = []
    if depth > LAZY_DEPTH:
        return out
    if isinstance(value, bool):
        return out
    if isinstance(value, (int, float)):
        out.append(value)
    elif isinstance(value, (list, tuple)):
        for item in value:
            out.extend(_walk_numbers(item, depth + 1))
    elif isinstance(value, dict):
        for item in value.values():
            out.extend(_walk_numbers(item, depth + 1))
    return out


def _map_numbers(value, fn, depth=0):
    if depth > LAZY_DEPTH:
        return value
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return fn(value)
    if isinstance(value, (list, tuple)):
        return type(value)(_map_numbers(item, fn, depth + 1) for item in value)
    if isinstance(value, dict):
        return {key: _map_numbers(item, fn, depth + 1) for key, item in value.items()}
    return value


def _mutations(value, sizes, depth=0):
    """Single-change mutants of one argument (numeric, structural, trivial)."""
    out = []
    if isinstance(value, bool):
        return [not value]
    if isinstance(value, int):
        out.extend([value + 1, value - 1, value + 2, value - 2, value * 2, -value, 0, 1, -1])
        out.extend(sizes)
        out.extend(size + 1 for size in sizes)
        return out
    if isinstance(value, float):
        return [value + 0.5, value - 0.5, value + 1.0, value - 1.0, -value, 0.0, 1.0, -1.0]
    if isinstance(value, str):
        out.extend(
            ["", " ", "a", value.upper(), value.lower(), value + value, value[::-1], value + "x", "x" + value]
        )
        if value:
            out.extend([value[1:], value[:-1]])
        return out
    if isinstance(value, (list, tuple)):
        out.append([])
        out.append(value[::-1])
        if len(value) <= 16:
            out.append(value + value)
        if value:
            out.extend([value[:-1], value[1:], [value[-1]], value + [value[-1]], [value[0]] + value])
            if all(isinstance(item, (int, float)) and not isinstance(item, bool) for item in value):
                out.append(sorted(value))
                out.append(sorted(value, reverse=True))
            out.append([0] * len(value))
        if len(value) >= 2:
            swapped = list(value)
            swapped[0], swapped[1] = swapped[1], swapped[0]
            out.append(swapped)
        if depth < LAZY_DEPTH:
            for index, item in enumerate(value):
                for mutated in _mutations(item, sizes, depth + 1):
                    changed = list(value)
                    changed[index] = mutated
                    out.append(changed)
        return out
    if isinstance(value, dict):
        out.append({})
        if value:
            keys = list(value.keys())
            out.append({key: 0 for key in keys})
            out.append({key: value[key] for key in reversed(keys)})
            if depth < LAZY_DEPTH:
                for key in keys:
                    for mutated in _mutations(value[key], sizes, depth + 1):
                        changed = dict(value)
                        changed[key] = mutated
                        out.append(changed)
        return out
    if value is None:
        return [0, 1]
    return []


def lazy_probe_suite(tests, pid, cap=LAZY_PROBE_CAP):
    """Deterministic lazy-probe suite built from the visible shipped tests."""
    rnd = random.Random(lazy_probe_seed(pid))
    raw = []

    def add(args):
        raw.append(list(args))

    for case in tests or []:
        args = case.get("input")
        if not isinstance(args, (list, tuple)):
            args = [args]
        args = list(args)
        add(args)
        for index, arg in enumerate(args):
            sizes = _container_sizes(arg)
            mutations = _mutations(arg, sizes)
            for transform in (
                lambda n: n + 1,
                lambda n: n - 1,
                lambda n: -n,
                lambda n: 0,
            ):
                mapped = _map_numbers(arg, transform)
                if mapped != arg:
                    mutations.append(mapped)
            for mutated in mutations:
                candidate = list(args)
                candidate[index] = mutated
                add(candidate)

    seen = set()
    unique = []
    for candidate in raw:
        try:
            key = repr(candidate)
        except Exception:  # noqa: BLE001
            continue
        if len(key) > LAZY_REPR_MAX or key in seen:
            continue
        seen.add(key)
        unique.append(candidate)
    rnd.shuffle(unique)
    return unique if cap is None else unique[:cap]


# ---------------------------------------------------------------------------
# Union suite generators (visible shipped tests only, deterministic)
# ---------------------------------------------------------------------------


def _pid_seed(pid, salt=""):
    return int(hashlib.md5((pid + salt).encode("utf-8")).hexdigest()[:8], 16)


def _visible_tests(record):
    out = []
    for case in record.get("tests") or []:
        args = case.get("input")
        out.append(list(args) if isinstance(args, (list, tuple)) else [args])
    return out


def _is_num(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


# --- verifier S2 semantics (probe_difficulty.gen_probes_s2) -----------------

_BOUNDARY = [0, 1, -1, 2, 0.5, -0.5, 100, True, False, "", "a", [], [0], [1], None]


def _mutate(v, rng, depth=0):
    if isinstance(v, bool):
        return not v
    if v is None:
        return rng.choice([0, 1, "", [], False])
    if isinstance(v, int):
        mode = rng.random()
        if mode < 0.5:
            return v + rng.choice([-3, -2, -1, 1, 2, 3])
        if mode < 0.8:
            return v + rng.randint(-10, 10)
        return rng.choice(_BOUNDARY)
    if isinstance(v, float):
        mode = rng.random()
        if mode < 0.5:
            return v + rng.choice([-1.0, -0.5, -0.1, 0.1, 0.5, 1.0])
        if mode < 0.8:
            return round(v * rng.choice([0.5, 0.9, 1.1, 2.0]), 6)
        return rng.choice([0.0, 1.0, -1.0, 0.5])
    if isinstance(v, str):
        pts = list(v)
        if not pts:
            return rng.choice(["a", "0", "$"])
        op = rng.random()
        if op < 0.25 and len(pts) <= 8:
            rng.shuffle(pts)
            return "".join(pts)
        if op < 0.5:
            pts[rng.randrange(len(pts))] = rng.choice(list("abcdefghijklmnopqrstuvwxyz"))
            return "".join(pts)
        if op < 0.7:
            del pts[rng.randrange(len(pts))]
            return "".join(pts)
        if op < 0.85:
            pts.append(rng.choice(list("abcxyz0")))
            return "".join(pts)
        return rng.choice(["", "zzz", v + v])
    if isinstance(v, (list, tuple)):
        out = list(v)
        if depth < 3 and out and rng.random() < 0.45:
            i = rng.randrange(len(out))
            out[i] = _mutate(out[i], rng, depth + 1)
        elif rng.random() < 0.5 or not out:
            if out and rng.random() < 0.5:
                out.insert(rng.randrange(len(out) + 1), rng.choice(out))
            elif out:
                del out[rng.randrange(len(out))]
        else:
            out = rng.choice([[], [0], [1], [v]])
        return out
    if isinstance(v, dict):
        out = dict(v)
        if out:
            k = rng.choice(list(out))
            out[k] = _mutate(out[k], rng, depth + 1)
        return out
    return rng.choice(_BOUNDARY)


def _mutate_args(args, rng):
    out = [_mutate(a, rng) for a in args]
    if len(out) > 1 and rng.random() < 0.3:
        i = rng.randrange(len(out))
        out[i] = _mutate(out[i], rng, 1)
    if rng.random() < 0.08 and len(out) > 1:
        out.pop(rng.randrange(len(out)))
    return out


def _domain_pool(record):
    pools = []
    for args in _visible_tests(record):
        for i, a in enumerate(args):
            while len(pools) <= i:
                pools.append([])
            pools[i].append(a)
    return pools


def _gen_s2(record, rng, n):
    tests = _visible_tests(record)
    pools = _domain_pool(record)
    probes = []
    for k in range(n):
        args = list(tests[k % len(tests)]) if tests else [None]
        if pools and rng.random() < 0.5:
            i = rng.randrange(len(pools))
            if pools[i] and i < len(args):
                args[i] = rng.choice(pools[i])
        probes.append(_mutate_args(args, rng))
    return probes


# --- verifier S3 semantics (s3.single_jitter) -------------------------------

def _single_jitter(args, rng):
    out = [_mutate(a, rng) for a in args]
    if not out:
        return out
    i = rng.randrange(len(out))
    a = args[i]
    if isinstance(a, bool):
        out[i] = not a
    elif isinstance(a, int):
        out[i] = a + rng.choice([-1, 1])
    elif isinstance(a, float):
        out[i] = a + rng.choice([-1.0, 0.1, -0.1])
    elif isinstance(a, str) and a:
        s = list(a)
        j = rng.randrange(len(s))
        s[j] = rng.choice("abcdefghijklmnopqrstuvwxyz")
        out[i] = "".join(s)
    elif isinstance(a, list):
        if a:
            b = list(a)
            j = rng.randrange(len(b))
            b[j] = _mutate(b[j], rng, 1)
            out[i] = b
        else:
            out[i] = [0]
    return out


def _gen_s3(record, rng, n):
    tests = _visible_tests(record)
    probes = []
    for k in range(n):
        if not tests:
            probes.append([None])
            continue
        probes.append(_single_jitter(list(tests[k % len(tests)]), rng))
    return probes


# --- systematic common values + boundaries ----------------------------------

_COMMON_INT = list(range(-2, 13)) + [100, -100]
_COMMON_FLOAT = [0.0, 1.0, -1.0, 0.5]
_COMMON_STR = ["", " ", "a", "A", "abc", "ABC", "xyz", "0", "$"]


def _common_values(v):
    out = [None, True, False]
    if isinstance(v, bool):
        out += [not v]
    elif isinstance(v, int):
        out += list(_COMMON_INT)
    elif isinstance(v, float):
        out += list(_COMMON_FLOAT)
    elif isinstance(v, str):
        out += list(_COMMON_STR) + [v.upper(), v.lower(), v[::-1], v + v, v + "x", "x" + v]
        if v:
            out += [v[1:], v[:-1]]
    elif isinstance(v, (list, tuple)):
        out += [[], [0], [1], [-1], list(v)[::-1] if v else [], list(v)[:-1], list(v)[1:]]
        if v:
            out += [[v[-1]], [v[0]] + list(v), list(v) + [v[-1]]]
            if all(_is_num(x) for x in v):
                out += [sorted(v), sorted(v, reverse=True), [0] * len(v)]
        if len(v) >= 2:
            sw = list(v)
            sw[0], sw[1] = sw[1], sw[0]
            out.append(sw)
    elif isinstance(v, dict):
        out += [{}, {k: 0 for k in v}, dict(reversed(list(v.items())))]
    return out


def _boundary_values(container_len):
    return [0, 1, -1, 2, container_len - 1, container_len, container_len + 1, -container_len]


def _set_path(root, path, value):
    if not path:
        return value
    out = list(root) if isinstance(root, (list, tuple)) else dict(root)
    node = out
    for p in path[:-1]:
        nxt = copy.deepcopy(node[p])
        node[p] = nxt
        node = nxt
    node[path[-1]] = value
    return out


def _leaves(v, path=()):
    if isinstance(v, bool) or isinstance(v, (int, float, str)):
        yield path, v
    elif isinstance(v, (list, tuple)):
        for i, item in enumerate(v):
            yield from _leaves(item, path + (i,))
    elif isinstance(v, dict):
        for k, item in v.items():
            yield from _leaves(item, path + (k,))


def _collect_lengths(v, out, depth=0):
    if depth > 3:
        return
    if isinstance(v, (list, tuple, str)):
        out.append(len(v))
        for item in v:
            _collect_lengths(item, out, depth + 1)
    elif isinstance(v, dict):
        out.append(len(v))
        for item in v.values():
            _collect_lengths(item, out, depth + 1)


def _systematic_probes(record):
    """Whole-argument common replacements + per-leaf common/boundary edits."""
    probes = []
    for args in _visible_tests(record):
        n = len(args)
        for pos in range(n):
            arg = args[pos]
            for nv in _common_values(arg):
                cand = list(args)
                cand[pos] = nv
                probes.append(cand)
        lengths = []
        for arg in args:
            _collect_lengths(arg, lengths)
        for pos in range(n):
            arg = args[pos]
            for path, val in _leaves(arg):
                for nv in _common_values(val):
                    cand = list(args)
                    cand[pos] = _set_path(copy.deepcopy(arg), path, nv)
                    probes.append(cand)
                if isinstance(val, (int, float)) and not isinstance(val, bool):
                    for b in _boundary_values(val if isinstance(val, int) else int(val)):
                        cand = list(args)
                        cand[pos] = _set_path(copy.deepcopy(arg), path, b)
                        probes.append(cand)
    return probes


def _add_probe(out, seen, args):
    try:
        key = repr(args)
    except Exception:  # noqa: BLE001
        return
    if len(key) > UNION_REPR_MAX or key in seen:
        return
    seen.add(key)
    out.append(args)


def _build_union(tests, pid):
    """Full union suite: verifier seeds + seed grid + systematic + lazy uncapped."""
    record = {"tests": tests or []}
    out, seen = [], set()

    seed = _pid_seed(pid)
    for p in _gen_s2(record, random.Random(seed ^ 0x5F3759DF), 25):
        _add_probe(out, seen, p)
    for p in _gen_s3(record, random.Random(seed ^ 0x1234), 25):
        _add_probe(out, seen, p)
    for k in range(3):
        for p in _gen_s2(record, random.Random(seed + 1000 * k), 100):
            _add_probe(out, seen, p)
    for k in range(2):
        for p in _gen_s3(record, random.Random((seed ^ 0x5F3759DF) + 7919 * k), 100):
            _add_probe(out, seen, p)

    for k in range(UNION_SEEDS):
        rng = random.Random(_pid_seed(pid, ":u2:%d" % k))
        for p in _gen_s2(record, rng, UNION_PER_SEED):
            _add_probe(out, seen, p)
    for k in range(UNION_SEEDS):
        rng = random.Random(_pid_seed(pid, ":u3:%d" % k))
        for p in _gen_s3(record, rng, UNION_PER_SEED):
            _add_probe(out, seen, p)

    for p in _systematic_probes(record):
        _add_probe(out, seen, p)

    for p in lazy_probe_suite(tests, pid, cap=None):
        _add_probe(out, seen, p)
    return out


# ---------------------------------------------------------------------------
# Held-out suite (independent seeds and generator mix; post-selection filter)
# ---------------------------------------------------------------------------


def _mag_or_jitter(val, rng):
    if isinstance(val, bool):
        return not val
    if isinstance(val, int):
        return rng.choice([val * 2, val * 3, val + 7, val - 7, int(val / 2)])
    if isinstance(val, float):
        return rng.choice([val * 1.5, val * 2.0, val + 0.25, val - 0.25, round(val / 2.0, 6)])
    if isinstance(val, str):
        if not val:
            return rng.choice(["b", "Z", "12"])
        i = rng.randrange(len(val))
        return val[:i] + rng.choice("Wq7") + val[i + 1:]
    return val


def _replace_numbers(v, rng, depth=0):
    if depth > 4:
        return v
    if isinstance(v, bool):
        return v
    if isinstance(v, int):
        return rng.choice([v * 2, v * 3, v * 10, v + 13, v - 13])
    if isinstance(v, float):
        return rng.choice([round(v * 1.5, 6), round(v * 2.5, 6), round(v + 3.25, 6), round(v - 3.25, 6)])
    if isinstance(v, (list, tuple)):
        return type(v)(_replace_numbers(x, rng, depth + 1) for x in v)
    if isinstance(v, dict):
        return {k: _replace_numbers(x, rng, depth + 1) for k, x in v.items()}
    return v


def _container_edit(v, rng):
    if isinstance(v, list):
        out = list(v)
        if not out:
            return [rng.choice([0, 1, -1])]
        op = rng.randrange(6)
        if op == 0 and len(out) >= 2:
            i = rng.randrange(len(out))
            return out[i:] + out[:i]
        if op == 1 and len(out) >= 2:
            i, j = rng.sample(range(len(out)), 2)
            out[i], out[j] = out[j], out[i]
            return out
        if op == 2 and len(out) >= 1:
            i = rng.randrange(len(out))
            return out[:i] + [out[i]] + out[i:]
        if op == 3:
            return out + out[:2]
        if op == 4 and len(out) >= 2:
            return out[1:-1]
        i = rng.randrange(len(out))
        out[i] = _mag_or_jitter(out[i], rng)
        return out
    if isinstance(v, tuple):
        return tuple(_container_edit(list(v), rng))
    if isinstance(v, dict):
        if not v:
            return {"y": 1}
        out = dict(v)
        keys = list(out)
        k = rng.choice(keys)
        out[k] = _mag_or_jitter(out[k], rng)
        return out
    return _mag_or_jitter(v, rng)


def _build_heldout(tests, pid, union_keys=None):
    record = {"tests": tests or []}
    probes = _visible_tests(record)
    pools = _domain_pool(record)
    out, seen = [], set(union_keys or ())

    def leaf_paths(v, path=()):
        if isinstance(v, dict):
            for k, item in v.items():
                yield from leaf_paths(item, path + (k,))
        elif isinstance(v, (list, tuple)):
            for i, item in enumerate(v):
                yield from leaf_paths(item, path + (i,))
        else:
            yield path, v

    for k in range(300):
        rng = random.Random(_pid_seed(pid, ":h1:%d" % k))
        if not probes:
            _add_probe(out, seen, [None])
            continue
        base = list(probes[k % len(probes)])
        for i in range(len(base)):
            if pools and i < len(pools) and pools[i] and rng.random() < 0.7:
                base[i] = rng.choice(pools[i])
            elif _is_num(base[i]):
                base[i] = base[i] + rng.randint(-2, 2)
        _add_probe(out, seen, base)

    for k in range(300):
        rng = random.Random(_pid_seed(pid, ":h2:%d" % k))
        if not probes:
            _add_probe(out, seen, [None])
            continue
        args = list(probes[k % len(probes)])
        if len(args) >= 2:
            i, j = rng.sample(range(len(args)), 2)
            for pos in (i, j):
                leaves = list(leaf_paths(args[pos]))
                if leaves:
                    path, val = rng.choice(leaves)
                    nv = _mag_or_jitter(val, rng)
                    args[pos] = _set_path(copy.deepcopy(args[pos]), path, nv)
        else:
            args = [_mutate(args[0], rng, 1)] if args else args
        _add_probe(out, seen, args)

    for k in range(300):
        rng = random.Random(_pid_seed(pid, ":h3:%d" % k))
        if not probes:
            _add_probe(out, seen, [None])
            continue
        args = list(probes[k % len(probes)])
        pos = rng.randrange(len(args))
        args[pos] = _replace_numbers(args[pos], rng)
        _add_probe(out, seen, args)

    for k in range(300):
        rng = random.Random(_pid_seed(pid, ":h4:%d" % k))
        if not probes:
            _add_probe(out, seen, [None])
            continue
        args = list(probes[k % len(probes)])
        pos = rng.randrange(len(args))
        args[pos] = _container_edit(args[pos], rng)
        _add_probe(out, seen, args)
    return out


# ---------------------------------------------------------------------------
# Divergence over a suite (fresh deep copies per program)
# ---------------------------------------------------------------------------


def _first_divergence(ref_fn, ghost_fn, probes, state):
    """(1-based index, kind) of the first divergent probe, or (None, None)."""
    for index, args in enumerate(probes, 1):
        ref_kind, ref_value = _call(ref_fn, copy.deepcopy(args), state)
        if ref_kind != "ok":
            continue
        ghost_kind, ghost_value = _call(ghost_fn, copy.deepcopy(args), state)
        if ghost_kind != "ok":
            return index, "error"
        if not _deep_eq(ref_value, ghost_value):
            return index, "value"
    return None, None


def main():
    if len(sys.argv) != 2:
        print("usage: python3 scripts/py_alibi_verify.py <bank.json>", file=sys.stderr)
        return 2
    with open(sys.argv[1]) as handle:
        records = json.load(handle)

    failures = []
    counts = {"crash": 0, "value": 0, "timeout": 0, "resistant": 0, "warmup": 0}
    union_failures = []
    heldout_failures = []
    metadata_mismatches = []
    state = [0]

    for record in records:
        pid = record["id"]
        entry = record["func"]
        cases = record.get("tests") or []

        ref_fn, ref_err = _load(record["reference"], entry, "%s-ref" % pid)
        ghost_fn, ghost_err = _load(record["ghost"], entry, "%s-ghost" % pid)
        if ref_err:
            failures.append("%s: reference did not load (%s)" % (pid, ref_err))
            continue
        if ghost_err:
            failures.append("%s: ghost did not load (%s)" % (pid, ghost_err))
            continue

        regions, removed, added = _line_diff(record["reference"], record["ghost"])
        if regions != 1 or removed != 1 or added != 1:
            failures.append(
                "%s: reference/ghost diff is not exactly one changed line "
                "(regions=%d, -%d, +%d)" % (pid, regions, removed, added)
            )
            continue

        ref_fails = _run_tests(ref_fn, cases, state)
        if ref_fails:
            failures.append("%s: reference fails shipped tests: %s" % (pid, ref_fails[0]))
            continue
        ghost_fails = _run_tests(ghost_fn, cases, state)
        if ghost_fails:
            failures.append("%s: ghost fails shipped tests: %s" % (pid, ghost_fails[0]))
            continue

        try:
            args = _witness_args(record["witness"])
        except BaseException as exc:  # noqa: BLE001
            failures.append("%s: witness is not a Python literal (%s)" % (pid, exc))
            continue

        ref_kind, ref_value = _call(ref_fn, copy.deepcopy(args), state)
        if ref_kind != "ok":
            failures.append("%s: reference did not return at witness (%s)" % (pid, ref_kind))
            continue
        ghost_kind, ghost_value = _call(ghost_fn, copy.deepcopy(args), state)
        if ghost_kind == "timeout":
            counts["timeout"] += 1
            outcome = "timeout"
        elif ghost_kind == "error":
            counts["crash"] += 1
            outcome = "crash"
        elif _deep_eq(ref_value, ghost_value):
            failures.append(
                "%s: ghost matches reference at witness %s (%r)" % (pid, record["witness"], ref_value)
            )
            continue
        else:
            counts["value"] += 1
            outcome = "value"

        union = _build_union(cases, pid)
        union_keys = {repr(p) for p in union}
        heldout = _build_heldout(cases, pid, union_keys)
        union_index, union_kind = _first_divergence(ref_fn, ghost_fn, union, state)
        if union_index is not None:
            union_failures.append(
                "%s: union suite diverges on probe %d/%d (%s)" % (pid, union_index, len(union), union_kind)
            )
            continue
        heldout_index, heldout_kind = _first_divergence(ref_fn, ghost_fn, heldout, state)
        if heldout_index is not None:
            heldout_failures.append(
                "%s: held-out suite diverges on probe %d/%d (%s)"
                % (pid, heldout_index, len(heldout), heldout_kind)
            )
            continue

        if "unionProbes" in record and record["unionProbes"] != len(union):
            metadata_mismatches.append(
                "%s: recorded unionProbes=%s but recomputed %d" % (pid, record["unionProbes"], len(union))
            )
            continue
        if "unionPassed" in record and record["unionPassed"] != len(union):
            metadata_mismatches.append(
                "%s: recorded unionPassed=%s but recomputed %d" % (pid, record["unionPassed"], len(union))
            )
            continue
        if "heldOutProbes" in record and record["heldOutProbes"] != len(heldout):
            metadata_mismatches.append(
                "%s: recorded heldOutProbes=%s but recomputed %d"
                % (pid, record["heldOutProbes"], len(heldout))
            )
            continue
        if "heldOutPassed" in record and record["heldOutPassed"] != len(heldout):
            metadata_mismatches.append(
                "%s: recorded heldOutPassed=%s but recomputed %d"
                % (pid, record["heldOutPassed"], len(heldout))
            )
            continue

        counts["resistant"] += 1
        print(
            "ok   %s  %-9s tests=%-2d witness=%s union=%d/%d heldout=%d/%d"
            % (
                pid,
                record.get("difficulty", "?"),
                len(cases),
                outcome,
                len(union),
                len(union),
                len(heldout),
                len(heldout),
            )
        )

    total_failures = len(failures) + len(union_failures) + len(heldout_failures) + len(metadata_mismatches)
    summary = {
        "total": len(records),
        "verified": len(records) - total_failures,
        "failed": total_failures,
    }
    summary.update(counts)
    summary["unionFailures"] = len(union_failures)
    summary["heldOutFailures"] = len(heldout_failures)
    summary["metadataMismatches"] = len(metadata_mismatches)
    for failure in failures:
        print("FAIL %s" % failure)
    for failure in union_failures:
        print("FAIL %s" % failure)
    for failure in heldout_failures:
        print("FAIL %s" % failure)
    for failure in metadata_mismatches:
        print("FAIL %s" % failure)
    print("ALIBI_GATE_SUMMARY " + json.dumps(summary, sort_keys=True))
    ok = not failures and not union_failures and not heldout_failures and not metadata_mismatches
    if not ok:
        print(
            "GATE FAILED: %d/%d verified, %d union failure(s), %d held-out failure(s), %d metadata mismatch(es)"
            % (
                len(records) - len(failures),
                len(records),
                len(union_failures),
                len(heldout_failures),
                len(metadata_mismatches),
            )
        )
        return 1
    print("GATE PASSED: %d/%d verified (all union + held-out clean)" % (len(records), len(records)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
