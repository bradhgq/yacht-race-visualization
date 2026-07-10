# docs/archives/

Immutable provenance for work that predates this monorepo. Nothing in here is
built or deployed; do not edit.

## ragana-dashboard.bundle (3.9 MB)

The complete git history of the original `ragana-dashboard` repo — the round-1
NB2026 productionization (single-file dashboard → `src/` + `build.py` +
`dist/`, mobile UX, a11y, test-gated builds, Nix hosting) whose commits every
round-1 document cites by hash. `docs/RETROSPECTIVE_ROUND1.md`'s line
references are pinned to its commit `5df5a19`; the starter engine was
generalized from its commit `611faf7`.

Unpack anywhere with:

```
git clone docs/archives/ragana-dashboard.bundle ragana-dashboard
```

Archived 2026-07-10 when `~/Downloads/ragana-dashboard` was decommissioned.
The pre-shell NB2026 artifacts (monolith template, `export_json.py`, the
9-assertion harness) are also checked out at `races/nb2026/legacy/` for
day-to-day archaeology without unpacking the bundle.
