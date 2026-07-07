# race-viz-starter

Reusable yacht-race visualization pipeline + dashboard, generalized from the
RAGANA · Newport Bermuda 2026 worked example. **Private repo**: `races/<race>/`
may contain client journals and nav logs; public artifacts are exported builds
only, after the CP-5 ledger cut.

The process and judgment layer lives in [`skill/race-viz/`](skill/race-viz/SKILL.md)
(single source of truth, versioned with the code it governs). The six doctrines
in `SKILL.md` are enforced as testable predicates — each one was paid for with
a real bug in the worked example.

## Quickstart — build the worked example

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python pipeline/build_data.py races/nb2026/config.yaml
.venv/bin/python pipeline/assemble.py  races/nb2026/config.yaml
# regression harness (Phase 3): TZ=America/New_York node tests/test_dashboard.js …
```

`build_data.py` refuses to run fleet math until ≥2 probe boats reproduce their
official corrected times within 1 s, and writes a run log (invocation + input
hashes) next to every payload — shipped numbers come only from the pipeline
(prime rule 1).

## Starting a new race

Copy `races/_template/` to `races/<race>/`, drop the tracker export / results /
scratch sheet into `raw/`, fill `config.yaml` (facts only — narrative goes in
`events.yaml`), then run the three commands. See the skill's stage files for
the checkpoint protocol; never skip CP-0 or CP-2.

## Layout

```
adapters/          tracker-vendor adapters + canonical schema (contract: adapters/README.md)
pipeline/          build_data / scoring / zones / reconcile / assemble / compare_data
template/          v0 dashboard template + SEAMS.md (shell split lands in Phase 2)
tests/             parameterized JS harness + per-race goldens (Phase 3)
races/_template/   copy me to start a race
races/nb2026 -> examples/nb2026
examples/nb2026/   the frozen worked example: config, events, navlog, results,
                   presentation.js + copy.md extractions, frozen/ reference
                   payload, legacy/ original script
```

Build-status docs: `REPO_NOTES.md` (spec deltas), `DOC_GAPS.md` (documentation
audit), `GATE_A_REPORT.md` (pipeline-parity evidence).
