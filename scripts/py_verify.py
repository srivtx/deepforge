"""
DeepForge problem verifier — runs every problem's `solution` against its
`testCases` using the exact equality semantics of the in-browser Pyodide
harness (see src/lib/pyodide.ts). Reads a JSON array of
{id, title, solution, testCases: [{input, expected}]} and prints a JSON
array of results to stdout.

Exit code is always 0 — the calling TS script decides pass/fail.
"""

import json
import math
import re
import sys

TOL = 1e-6


def _deep_eq(a, b, tol=TOL):
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        try:
            return math.isclose(float(a), float(b), rel_tol=tol, abs_tol=tol)
        except (ValueError, OverflowError):
            # Values too large for float() (e.g. ~1900-digit ints) compare
            # exactly in Python; re-raising here turned a verdict into a
            # harness error.
            return a == b
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(_deep_eq(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_deep_eq(a[k], b[k], tol) for k in a)
    if a is None or b is None:
        return a is b
    return a == b


def main():
    with open(sys.argv[1]) as f:
        data = json.load(f)

    results = []
    for p in data:
        pid = p["id"]
        ns = {}
        try:
            exec(compile(p["solution"], f"<{pid}>", "exec"), ns)
        except Exception as e:  # noqa: BLE001
            results.append({"id": pid, "ok": False, "fatal": f"{type(e).__name__}: {e}"})
            continue

        m = re.search(r"^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(", p["solution"], re.M)
        if not m:
            results.append({"id": pid, "ok": False, "fatal": "no `def` found in solution"})
            continue
        fn = ns.get(m.group(1))
        if not callable(fn):
            results.append({"id": pid, "ok": False, "fatal": f"`{m.group(1)}` is not callable"})
            continue

        fails = []
        for i, c in enumerate(p.get("testCases", [])):
            try:
                actual = fn(*c["input"])
            except Exception as e:  # noqa: BLE001
                fails.append(
                    {
                        "case": i,
                        "input": repr(c["input"]),
                        "error": f"{type(e).__name__}: {e}",
                        "expected": repr(c["expected"]),
                    }
                )
                continue
            if not _deep_eq(actual, c["expected"]):
                fails.append(
                    {
                        "case": i,
                        "input": repr(c["input"]),
                        "actual": repr(actual),
                        "expected": repr(c["expected"]),
                    }
                )

        if fails:
            results.append({"id": pid, "ok": False, "fails": fails})
        else:
            results.append({"id": pid, "ok": True})

    print(json.dumps(results))


if __name__ == "__main__":
    main()
