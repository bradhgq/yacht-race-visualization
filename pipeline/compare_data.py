#!/usr/bin/env python3
"""Semantic JSON comparison for GATE A: key-order-insensitive, float-tolerant,
reports EVERY diff with its path.

    python3 pipeline/compare_data.py <candidate.json> <reference.json> \
        [--tol 1e-6] [--max-print 100] [--report out.txt]

Exit 0 iff no diffs.
"""
import argparse
import json
import sys
from collections import Counter


def walk(a, b, path, diffs, tol):
    if isinstance(a, dict) and isinstance(b, dict):
        for k in a.keys() | b.keys():
            p = f'{path}.{k}' if path else str(k)
            if k not in a:
                diffs.append((p, f'missing in candidate (reference has {trunc(b[k])})'))
            elif k not in b:
                diffs.append((p, f'extra in candidate (candidate has {trunc(a[k])})'))
            else:
                walk(a[k], b[k], p, diffs, tol)
        return
    if isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            diffs.append((path, f'list length {len(a)} != {len(b)}'))
        for i, (x, y) in enumerate(zip(a, b)):
            walk(x, y, f'{path}[{i}]', diffs, tol)
        return
    if isinstance(a, bool) or isinstance(b, bool):   # bool is int in Python — exact match only
        if a is not b:
            diffs.append((path, f'{a!r} != {b!r}'))
        return
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        if abs(a - b) > tol:
            diffs.append((path, f'{a!r} != {b!r} (|Δ|={abs(a-b):.3g})'))
        return
    if a != b:
        diffs.append((path, f'{trunc(a)} != {trunc(b)}'))


def trunc(v, n=80):
    s = repr(v)
    return s[:n] + '…' if len(s) > n else s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('candidate')
    ap.add_argument('reference')
    ap.add_argument('--tol', type=float, default=1e-6)
    ap.add_argument('--max-print', type=int, default=100)
    ap.add_argument('--report', help='write the full diff list to this file')
    args = ap.parse_args()

    a = json.load(open(args.candidate))
    b = json.load(open(args.reference))
    diffs = []
    walk(a, b, '', diffs, args.tol)

    if not diffs:
        print(f'IDENTICAL (semantic, tol={args.tol}): {args.candidate} == {args.reference}')
        return
    by_top = Counter(p.split('.')[0].split('[')[0] for p, _ in diffs)
    print(f'{len(diffs)} diff(s) [tol={args.tol}] — by top-level key: {dict(by_top)}')
    for p, msg in diffs[:args.max_print]:
        print(f'  {p}: {msg}')
    if len(diffs) > args.max_print:
        print(f'  … {len(diffs) - args.max_print} more (use --report for the full list)')
    if args.report:
        with open(args.report, 'w') as f:
            for p, msg in diffs:
                f.write(f'{p}: {msg}\n')
        print(f'full report: {args.report}')
    sys.exit(1)


if __name__ == '__main__':
    main()
