# yacht-race-visualization

Tooling and hosted dashboards for turning yacht-race tracker data into researched,
interactive race analysis. One public home for the reusable engine, the skill that
drives it, and every race deployed from it.

## Layout

```
starter/            the reusable product — the race-viz engine
  shell/            generalized dashboard shell (charts, controls, build)
  pipeline/         data pipeline (tracks → dashboard_data.json)
  adapters/         tracker-vendor adapters (YB, YachtScoring, …)
  acquisition/      race-data downloaders
  skills/race-viz/  the /race-viz skill — process & judgment, source of truth
  tests/            parameterized regression harness
  docs/             REPO_SPEC and design docs
  examples/nb2026/  the worked example — also the LIVE Newport Bermuda 2026 deploy
  races/            per-race configs (_template/, nb2026 → examples/nb2026)
races/
  archive/          retired builds kept for deploy rollback (deleted once verified)
```

`starter/` is nested as one unit so its internal relative paths hold; a new race is
a new `starter/races/<race>/` config plus its built `starter/examples/<race>/dist/`.

## Deployed

| Race | URL | Build |
|---|---|---|
| RAGANA · Newport Bermuda 2026 | [hgq.fyi/ragana-newport-bermuda-2026](https://hgq.fyi/ragana-newport-bermuda-2026/) | `starter/examples/nb2026/dist/` |

Hosting is on silverbox via `nix-config` (the repo is a `flake = false` input; nginx
aliases each race's URL to its committed `dist/`). The deployed `dist/` is committed
(force-added past the global `dist/` ignore) because the flake input serves straight
from the git tree.

## Build a race

```
cd starter
python3 pipeline/build_data.py races/<race>/config.yaml   # tracks → dashboard_data.json
python3 shell/build.py races/<race>                        # → examples/<race>/dist (gated on tests)
TZ=America/New_York node tests/test_dashboard.js races/<race>
```

See `starter/README.md` for the doctrines and `starter/docs/REPO_SPEC_v1.1.md` for the
full spec. The `/race-viz` skill in `starter/skills/race-viz/` is the authoritative
process layer.
