# starter/ — the race-viz engine

The reusable code that turns a race's `config.yaml` + tracker export into a built
dashboard. Generalized from the RAGANA · Newport Bermuda 2026 worked example
(now `races/nb2026/`). This directory is **raw code only** — the process/judgment
layer is [`skills/race-viz/`](../skills/race-viz/SKILL.md), the docs are
[`docs/`](../docs/), and races live in [`races/`](../races/), all at the repo root.

## Layout

```
shell/        generalized dashboard shell — index.template.html, styles/tokens,
              app/ (core.js + charts/), build.py, INVARIANTS.md
pipeline/     build_data / scoring / zones / reconcile / route / assemble / compare_data
adapters/     tracker-vendor format PARSERS → canonical track schema (adapters/README.md)
acquisition/  race-data DOWNLOADERS — fetch raw data from YB / YachtScoring (network)
tests/        parameterized JS regression harness (test_dashboard.js) + route tests
requirements.txt
```

`adapters/` vs `acquisition/`: acquisition *fetches* (network → raw files); adapters
*parse* a vendor's raw format into the canonical schema `pipeline/` consumes.

## Build a race (run from the repo root)

```bash
python3 -m venv .venv && .venv/bin/pip install -r starter/requirements.txt
.venv/bin/python starter/pipeline/build_data.py races/nb2026/config.yaml   # → races/nb2026/out/
.venv/bin/python starter/shell/build.py         races/nb2026               # → races/nb2026/dist/ (gated on tests)
TZ=America/New_York node starter/tests/test_dashboard.js races/nb2026
```

`build_data.py` refuses to run fleet math until ≥2 probe boats reproduce their
official corrected times within 1 s, and writes a run log (invocation + input
hashes) next to every payload — shipped numbers come only from the pipeline
(prime rule 1). `shell/build.py` refuses to build on a red harness (I10).

## Starting a new race

Copy [`races/_template/`](../races/_template/) to `races/<race>/`, drop the tracker
export / results / scratch sheet into `raw/`, fill `config.yaml` (facts only —
narrative goes in `events.yaml`), then run the three commands. See the skill's
stage files for the checkpoint protocol; never skip CP-0 or CP-2.

Build-status docs live in [`docs/`](../docs/): `REPO_NOTES.md` (spec deltas),
`DOC_GAPS.md` (documentation audit), `GATE_A_REPORT.md` (pipeline-parity evidence),
`RETROSPECTIVE_ROUND2.md`.
