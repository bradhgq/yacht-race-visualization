# yacht-race-visualization

Tooling and hosted dashboards for turning yacht-race tracker data into researched,
interactive race analysis. One public home for the reusable engine, the skill that
drives it, and every race deployed from it.

## Layout

```
starter/            the reusable engine (raw code only)
  shell/            generalized dashboard shell (charts, controls, build)
  pipeline/         data pipeline (tracks → dashboard_data.json)
  adapters/         tracker-vendor format parsers → canonical schema
  acquisition/      race-data downloaders (fetch from YB / YachtScoring)
  tests/            parameterized regression harness
  requirements.txt
skills/race-viz/    the /race-viz skill — process & judgment, source of truth
docs/               REPO_SPEC, build logs, retrospectives, gate reports
races/
  _template/        copy me to start a race
  nb2026/           the worked example — also the LIVE Newport Bermuda 2026 deploy
                    (config, data, modules, overlays, committed dist/)
```

`adapters/` vs `acquisition/`: **acquisition** *fetches* raw data from a tracking
service (network); **adapters** *parse* a vendor's format into the canonical track
schema the pipeline consumes. Fetch, then adapt.

## Deployed

| Race | URL | Build |
|---|---|---|
| RAGANA · Newport Bermuda 2026 | [hgq.fyi/ragana-newport-bermuda-2026](https://hgq.fyi/ragana-newport-bermuda-2026/) | `races/nb2026/dist/` |

Hosting is on silverbox via `nix-config` (the repo is a `flake = false` input; nginx
aliases each race's URL to its committed `dist/`). The deployed `dist/` is committed
(force-added past the global `dist/` ignore) because the flake input serves straight
from the git tree.

## Build a race

```
python3 starter/pipeline/build_data.py races/<race>/config.yaml   # tracks → dashboard_data.json
python3 starter/shell/build.py races/<race>                        # → races/<race>/dist (gated on tests)
TZ=America/New_York node starter/tests/test_dashboard.js races/<race>
```

See [`starter/README.md`](starter/README.md) for the engine doctrines and
[`docs/REPO_SPEC_v1.1.md`](docs/REPO_SPEC_v1.1.md) for the full spec. The `/race-viz`
skill in [`skills/race-viz/`](skills/race-viz/SKILL.md) is the authoritative process layer.
