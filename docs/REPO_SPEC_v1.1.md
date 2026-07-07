# race-viz starter repo — build spec (v1.1)

Status: **v1.1 — reconciled against RETROSPECTIVE.md** (Claude Code retrospective, repo commit `5df5a19`);
**GATE A adjudicated** — tie-exemption encoded in `compare_data.py`; zone detection **proposes**
candidates, shipped bounds are CP-2 judgment.
Both seams are resolved by its §2 (module interface) and §3 (token kit). Important context: the
retrospective audits the *productionized* repo (`src/` + `build.py` + `dist/`, mobile, a11y,
tests-gate-build, Nix hosting), which has already evolved past the starter monolith that v0's line
numbers referenced — the shell refactor starts from that repo, not from `dashboard_template.html`.
Where classifications differed, the retro won on code-level facts; the two deltas it missed are in
the reconciliation block below.

## Definition of done

The repo is "built" when the generalized pipeline, pointed at `races/nb2026/config.yaml`, reproduces
the shipped worked example: `dashboard_data.json` semantically identical to the frozen original —
byte-identical not required; exact-quantum rounding ties are exempted mechanically by
`compare_data.py` (GATE A: 39 half-quantum interpolation ties accepted as 1-ulp platform rounding) —
and the race's regression fixtures run green through the **authoritative runner** under
`TZ=America/New_York`. The legacy `test_dashboard.js` assertions (tz probe, corrected + elapsed +
pace endpoints, park canary, finstrip count, DTF axis guard, selection-name hygiene) are ported into
the runner as NB2026 fixtures; the file itself retires to `examples/nb2026/legacy/`. **The worked
example is the refactor's regression test.**

## Layout

```
race-viz-starter/                  (private repo — see Privacy)
├── README.md                      # quickstart, the six doctrines, pointers
├── skill/race-viz/                # the skill, versioned with the code it governs (single source of truth)
│   ├── SKILL.md
│   └── references/
├── acquisition/                   # data acquisition, verified live against four races
│   ├── yb_tracker_download.py     # YB AllPositions3 binary → tracks CSV (decyb-ported parser)
│   ├── yachtscoring_download.py   # YS public API → scratch sheet + results CSVs; prints satTrackingUrl
│   ├── fetch_race.py              # one command: YS id → YB id → both downloads → manifest.json
│   └── README.md                  # endpoints, binary layout, gotchas, verification ritual, license note
├── adapters/
│   ├── README.md                  # the adapter contract (below)
│   ├── canonical.py               # canonical schema + validators + gap report
│   ├── yb.py                      # implemented; verified on the 252k-ping NB2026 export, zero name misses
│   └── kattack.py / tractrac.py / predictwind.py   # stubs — see Open items
├── pipeline/
│   ├── build_data.py              # config-driven replacement for export_json.py
│   ├── scoring.py                 # pluggable corrected() + probe enforcement
│   ├── zones.py                   # slow-zone detection + per-boat traversal metrics
│   ├── reconcile.py               # nav-log ↔ tracker reconciliation
│   └── assemble.py                # config-aware injection build (keeps the </ escaping)
├── shell/                         # RETROSPECTIVE §2, adopted (SEAM 1 resolved)
│   ├── index.template.html        # slots: {{titleblock}}, {{sections}}, {{footer}}, meta
│   ├── app/core.js                # loader, scheduler, controls, bottom sheet, tap, resize
│   ├── app/charts/{map,dtf,race,xte,sog}.js   # the five shell charts, config-injected
│   ├── app/helpers.js             # tz-parameterized (time.utcOffset), node-requirable
│   ├── tokens.css + tokens.js     # RETROSPECTIVE §3, adopted (SEAM 2 resolved)
│   ├── INVARIANTS.md              # I1–I13 from RETROSPECTIVE §4 — the do-not-break list
│   └── build.py                   # split + version stamp + standalone; refuses dist/ on red (I10)
├── tests/                         # shell test runner (from test/regression.test.cjs); fixture
│                                  # categories fixed per I10: timezone, exact-endpoint,
│                                  # derived-metric, name-hygiene — per-race numbers live in
│                                  # races/<race>/tests/regression.json
├── races/
│   └── _template/                 # copy this to start a race
│       ├── config.yaml            # analysis source of record (skill references/schemas.md)
│       ├── events.yaml
│       ├── copy.md                # titleblock, section notes, footer — authored, structured slots
│       ├── presentation.js        # phases, KPI copy, map leader-labels, palette overrides
│       ├── raw/                   # tracker export, results, scratch sheet
│       ├── tests/regression.json  # per-race fixtures (I10 categories)
│       └── decisions/             # confirmed CP-*.yaml land here
└── examples/nb2026/               # the worked example, frozen (the retro's races/nb2026-ragana)
    ├── config.yaml, events.yaml, copy.md, presentation.js, official_results.csv, decisions/
    ├── modules/{parkfair,finstrip,navlog}.js · overlays/{gulfstream,watches}.js
    ├── out/dashboard_data.json · tests/regression.json · og.png
    └── legacy/                    # export_json.py, dashboard_template.html, test_dashboard.js —
                                   # the pre-productionization one-off, unmodified, for archaeology
```

## Adapter contract (`adapters/`)

Every `adapters/<vendor>.py` exposes:

```python
def detect(path) -> bool                      # cheap sniff: can this adapter read this file?
def load(path, cfg) -> DataFrame              # canonical schema, below
ADAPTER = {"vendor": "yb", "notes": "..."}
```

Canonical schema: `boat_id:str, name:str, t_utc:datetime64[UTC], lat:float, lon:float`.
`canonical.py` validates: required columns present; timestamps tz-aware UTC; lat ∈ [−90, 90],
lon ∈ [−180, 180]; per-boat time sorted and deduplicated; and emits a **ping-gap report** that feeds
the CP-0 anomalies list. Selection: `tracker.vendor` in config, explicit; `auto` runs `detect()` across
adapters and errors on ambiguity rather than guessing.

## Pipeline contracts (`pipeline/`)

- **build_data.py** — reads `config.yaml`, the official-results file, `events.yaml`, and the tracker via
  its adapter; emits `races/<race>/out/dashboard_data.json`, `out/goldens.json`, and a **run log**
  (exact invocation + input file hashes) satisfying prime rule 1. No literal paths, boat names, course
  lengths, or narrative text anywhere in this file.
- **scoring.py** — `corrected(elapsed_s, boat, distance_nm, cfg) -> seconds`; implementations `tot`,
  `tod`, `custom` hook. **Probe enforcement:** refuses all fleet math until ≥2 `probe_boats` reproduce
  their official corrected times within 1 s.
- **zones.py** — detection per the skill's stage-2 §6 **proposes candidate zones** and logs the full
  band-median table to the run log; the shipped band is a CP-2 judgment recorded in config —
  GATE A proved no threshold reproduces NB2026's authored 180→80 (the 180–190 band's median sits
  below the 80–90 band's). The goldens canary pins the per-boat traversal metric on the recorded band.
- **reconcile.py** — log-fix matching with clock-base handling, ok/warn/error rows.
- **assemble.py** — template path, data path, output name all from config.

Build flow, three commands:

```
python3 pipeline/build_data.py races/<race>/config.yaml
python3 pipeline/assemble.py  races/<race>/config.yaml
TZ=America/New_York node tests/test_dashboard.js races/<race>/out/<race>_dashboard.html tests/goldens/<race>.json
```

## config.yaml — additions to the skill schema

Schema of record is the skill's `references/schemas.md`, which now carries these repo keys (folded in
this session); reproduced here for the repo builder:

```yaml
tracker: { vendor: yb, path: raw/tracks.csv }      # vendor: auto → adapter detect()
official_results:
  path: raw/results.csv
  columns: { rank: , name: , sail: , rating: , elapsed: , corrected: , type: , finish_local: , division: }
entries: { path: raw/scratch.csv }                 # optional
name_overrides: {}                                 # per-race display/disambiguation (e.g. Phoenix → by sail)
paths: { out_dir: out/ }
```

This kills the inline 100-row results table (export_json.py:26–124) and every literal path
(:3 input, :374 output).

**Two-config drift, resolved:** `config.yaml` remains the single analysis source of record.
`build.py` derives the overlapping keys (course, hero, time, defaults, groups) from it into the
shell's JS race config at build time; presentation-only judgment (phases, KPI copy, map
leader-labels, palette overrides) is authored per race in `presentation.js` + `copy.md`. One source;
a build-time consistency check fails on divergence.

## Shell — both seams resolved (RETROSPECTIVE §2–§3 adopted)

**Module interface (SEAM 1).** Two kinds, self-registering into the shell's `BUILDERS`/`SCOPES`
scheduler, so plugins inherit scoped re-rendering, the hidden-tab fallback, breakpoint re-layout,
and the touch contract without knowing about them:

- **Section modules** (park table, finish strip, nav-log recon): `{ id, deps:[scopes],
  section:{title, note, kind: table|plot}, build(ctx) }` — `kind:plot` goes through the shell's
  `react()` wrapper, so invariant I6 comes free.
- **Overlay modules** (Gulf Stream, watches): `{ id, pill:{label,color,default}, mapTraces(ctx),
  bands(ctx,mode), legendTrace(ctx) }`.
- **`ctx` is the frozen plugin ABI:** `{ D, S, cfg, el, h:{tzStr, fmt, parseDur, hitTime, startOf,
  wrapText, axVal, evX, sharedXaxis, eventDecor, watchLegend, heroT, heroDTFat, narrow, BASE, GAX,
  AXFONT, boatColor, hasTrack}, render(scope) }`. Modules read `S`, mutate only their own keys.
- **ABI amendments:** additive optional fields are permitted with a logged REPO_NOTES entry (e.g.
  the overlay `mapLayer: under|over|top` accepted at GATE B); breaking changes require gate
  adjudication.

What stays shell verbatim: loader + error states, scheduler, controls/sheet/chips, the `react()`
touch wrapper, the five charts with config injected, the event-log table, build pipeline, token CSS,
a11y behaviors — and the exact-endpoint logic in the race chart, which is an invariant, not a feature.

**Token kit (SEAM 2)** → `shell/tokens.css` + `tokens.js`: the chart-paper/NOAA palette (`--water`,
`--paper`, `--card`, `--ink`, the AA-checked `--ink2`, `--grid`, `--rule`, hero accent `--magenta`,
semantic `--gold`/`--green`); system font stacks only (mono for labels/timestamps with letter-spacing,
sans for body); the perforated title block as the product signature; chip/pill semantics; Plotly
defaults (`BASE`, `GAX`, `AXFONT`, `PLOTCFG` — modules never hand-roll these); breakpoints 1024/960
and the **760px mobile contract** single-sourced between CSS and JS. Per-boat re-skin = `--magenta`
+ `hero.color`.

**Migration order (retro §6):** hero-boat extraction first (~20 literal sites in `app.js` — the
highest-leverage single change), then the three NB2026 modules behind the ctx ABI, then
`time.utcOffset` parameterization (kills the hardcoded UTC−4 in `ep()` and `helpers.js`), then config
injection for the remaining (b)-column values. The v0 duplicate-and-edit protocol is superseded:
new races target the shell; the monolith is a frozen reference in `examples/nb2026/legacy/`.

## Tests & CI

The shell repo's runner (from `test/regression.test.cjs`) is authoritative; the monolith-era
`test_dashboard.js` retires to `examples/nb2026/legacy/`. Per-race fixtures live in
`races/<race>/tests/regression.json`, emitted by `build_data.py` from the config goldens (Node stays
YAML-free). Fixture categories are fixed per invariant I10 — one timezone check, one exact-endpoint
check, one derived-metric check, one name-hygiene check — and the build gate is I10 itself:
**`build.py` refuses to produce `dist/` on red tests.** GitHub Action on every push: build
`examples/nb2026` and run under `TZ=America/New_York`; red blocks merge. Every screenshot-round
defect lands here as an assertion (prime rule 5).

## Generalizes vs parameterizable vs race-specific (verified refs)

| Class | Item | Where today | Disposition |
|---|---|---|---|
| generic | grid interpolation, SOG, great-circle DTF, XTE | export_json.py | pipeline/build_data.py |
| generic | name-normalization mechanics (whitespace, diacritics, sail disambiguation) | export_json.py ~:126–156 | adapters/canonical.py; mappings → config `name_overrides` |
| generic | injection build + `</` escaping | assemble.py | pipeline/assemble.py, paths from config |
| generic | harness mechanics (script extraction, DOM/Plotly mocks, approx) | test_dashboard.js | tests/, goldens externalized |
| generic (pattern) | state model `S`, pure `build*()`, sharedXaxis/axVal/evX, `edtStr()` | dashboard_template.html | shell, post-SEAM-1 |
| parameterizable | tracker path :3, output path :374 | export_json.py | `tracker.path`, `paths.out_dir` |
| parameterizable | official results table :26–124 | export_json.py | `official_results` file + column map |
| parameterizable | rhumb 635.1 :344 | export_json.py | `course.official_length_nm` |
| parameterizable | corrected-time math (TCF multiply) | export_json.py | scoring.py + `scoring` config |
| parameterizable | reference set, SDL3_DISP :156, CLUB_RANKS :126, division scoping | export_json.py | config lists |
| parameterizable | park band 180→80 :351–361 | export_json.py | zones.py **detects**; band recorded in goldens |
| race-specific | events + watches narrative layer :239–297 | export_json.py | examples/nb2026/events.yaml (logic stays generic) |
| race-specific | nav-log rows + reconciliation data | export_json.py | examples/nb2026 (logic → reconcile.py) |
| race-specific | park/finstrip/recon DOM + baked-in prose + `parkFair['RAGANA']` | dashboard_template.html :127, :192, :211, :221–223, :463 | modules/ post-SEAM-1; v0 duplicate-and-edit |
| race-specific | golden values (GOLD object) | test_dashboard.js | tests/goldens/nb2026.json |

### Reconciliation vs RETROSPECTIVE §1

Adopted wholesale — it is finer-grained and audits the productionized repo (`src/app.js` etc.), which
explains line-ref drift against the starter snapshot in the table above. Its upgrades: the `ep()`
helper hardcodes UTC−4 (→ `time.utcOffset`); the finish-spread strip is promoted (c)→(b) — generic
for any corrected-time fleet, with a `whatIfHours` parameter; group-by-rank, KPI structure, and phase
structure are (b) with authored content; and ~20 hero-boat literal sites in `app.js` are the single
highest-leverage extraction. Two deltas the retro missed, both verified in this session: the
pipeline's hardcoded absolute output path (`export_json.py:374` — killed by `paths.out_dir`), and
the authored events block actually starting at `:239` (its `:285–296` cites only the insight
subset). Neither changes any classification.

## Privacy

Repo private by default. `races/<race>/` may contain client journals and nav logs — the repo is never
made public wholesale; public artifacts are exported builds only, after the CP-5 ledger cut.
`events.yaml visibility` drives the public build.

## Marginal cost of race #2 — reconciled

Retro §6, post-refactor: the mechanical build is roughly half a day of Claude-driven work with three
human touchpoints (data-sharing consent, config approval, copy), and the only fiddly mechanical step
is tracker-format column mapping. The real cost is the narrative — events, insights, copy — which is
human-authored by design (days, historically). That matches this spec's split: pipeline + config +
fixtures are cheap; research, CP decisions, screenshot rounds, and synthesis copy stay human-paced.
Race #2 targets the shell, and the hero extraction is the prerequisite ticket.

## Open items

- ~~Reconcile this spec against the CC retrospective~~ — done; this document is v1.
- **Build ticket:** stand up `shell/` from repo commit `5df5a19` per RETROSPECTIVE §2. First PR =
  hero-boat extraction (~20 sites), then the three NB2026 modules behind the ctx ABI, then
  `time.utcOffset` parameterization. Acceptance unchanged: NB2026 reproduced and fixtures green —
  now built through the shell.
- Acquisition tooling lands via the Phase-5 add-on prompt (scripts verified against four live races).
  **Check decyb's upstream license** before this repo or the service ships code beyond Brad — the YB
  binary parser is a port of decyb's decoder, and license terms may follow the derivative.
- Kattack / TracTrac / PredictWind adapters: interfaces speculative until one real export each is in
  hand — PROCESS_NOTES' claims about their schemas are unverified.
- Routed-DTF course model for mark courses: unwritten by design; building it is an escalation-to-CC
  trigger per the skill.
- ~~Fold the config additions above into the skill's `references/schemas.md`~~ — done previously.
