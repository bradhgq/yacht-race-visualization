# M2 — monolith → shell mapping (BIR 2026 chart phase)

Owner-directed shell migration, chart phase. Every monolith chart was rebuilt
— culling happens at the STOP-2 owner review, not by pre-trimming. Where a
monolith chart duplicates a shell chart, the shell version wins.

| monolith unit (src/app.js) | disposition |
|---|---|
| `renderMap` | **shell map** + config gates added for parity: `charts.map.ghostStyles` (PHRF ghosts dashed/tinted, name·division hover), `hoverCls` (division + per-point DTF hover), `fitRange` (p1–p99 lat clip + label floors), `mapAnnotations` (geo labels + starboard-rounding note); direction arrows → **overlays/arrows.js** |
| `renderDTF` | **shell dtf** (`yRange` now optional → `tozero`); act bands → **overlays/acts.js** |
| `renderRace` | **shell race** + config: `divisionScoped` (A2 corrected-never-crosses + disclosure note), `crossCourse: [Lucky]`, `startAnchor: 188.7` (R9e), `paceMinDone: 20`; DNF guard (R9k) was already shell |
| `renderUpwind` | **modules/upwind.js** (verbatim; reads stored `meta.up1bi`) |
| `renderFinstrip` | **modules/finstrip.js** (verbatim two-division beeswarm; Lucky excluded; ORC/PHRF never pooled) |
| `renderXTE` (upwind lane) | **modules/lane.js** (verbatim; own acts/events decor in its distance-sailed x-space). NOT a duplicate of shell xte — different x basis and reference line. **Both ship**: shell `xte` (routed active-leg offset, new caption) is additionally in the layout for the everything-built review |
| `renderSOG` | **shell sog** + `clipPreStart` (R9f own-gun distance start) + the R2 SOG\|VMC toggle (new for BIR, on the routed course) |
| `renderTable` (event log) | **shell events table** (NB visual authority). Monolith-CSS fixtures A9/A15/A16/R9a/R9i superseded — see fixture dispositions |
| `renderKPIs` | config `kpis` (5 cards, `{stats.*}` templated) |
| acts/`decor()` | **overlays/acts.js** via the additive `bandAnnotations` ABI hook; the lane maps acts itself |
| computed group buttons (All ORC / All PHRF / Bermuda boats / Class 6) | static name lists in presentation.js, generated from the frozen oracle. Delta: 'All ORC' now includes Inisharon (ORC DNF with a track; class-selection-includes-DNF, R2 decision 2). The monolith's 'All boats (58)' button was dropped — cull-review item |
| chips (Class-6 superset + 6 extras, clsPos tags) | shell `groups.chipExtras` + `chipRank: 'clsPos'` |
| overlay chips (event cats conditional, Ghosts, Course line) | shell pills; empty-category skip added to the shell (R9c); labels unified chips=table (R9d) via single `label` per category |
| ref select `name (cls)` | shell, gated on `race.divisionScoped` |

**New for BIR (parity with NB round 2):** SOG|VMC toggle (I14 on a routed
course; caption notes the legitimate rounding noise), dist-vs-speed scatter
(the promoted shell module), ORC ToT rating bands (I17 semantics).
**classFilter omitted deliberately**: two named divisions are already
one-click group buttons; the numeric class-input model doesn't fit non-numeric
division names. Ω-flag for the review.

## Fixture dispositions (34 monolith assertions)

- **Ported to the shared runner core** (fixtures in `tests/regression.json`):
  G1, G2 (endpoints, both modes + pace), G4 (tz probe), A3 (events=14 via
  names/counts), A5+NF2 (names absent), NF1 partial (names_meta_only).
- **Ported to `tests/extra.cjs`** (15 checks): G3+A6 (upwind labels), G5+A7
  (division bands + beeswarm shape), A2 (cross-division hiding + disclosure),
  A8 (arrows), A11 (lane geometry), A12+R9 (acts on all four time charts),
  A13+A14 (map annotation + fitted range), R9b (Max default), R9c (empty-cat
  pill), R9e (start anchor), R9f (SOG monotone), R9k (DNF guard), NF1
  (Windfall meta-only), plus new I17 (band survival, ORC-only) and I18
  (no-VMG sweep).
- **Data-level, now pipeline-guarded**: A1 (despike ≤25 kt + phantom-fix
  removal) — asserted at the M1 data phase against the re-frozen oracle; the
  raw-CSV comparison half stays possible (raw/ keeps both CSVs).
- **Superseded by NB visual authority** (monolith-CSS/layout specifics, not
  ported): A9 (.note max-width), A15 (#chart 360px heights), A16/R9i (log
  table column widths), R9a (.ctl-head flex rule), R9j's title-copy half
  (kept: the title itself ships verbatim in the finstrip module), R9g's
  injected-`data.classes` half (hover division ships via `meta.cls` instead).
- **Monolith-harness mechanics** (jsdom driver, `window.__APP__` hooks): retired
  with the monolith; the vm-mock runner covers the same surfaces.

## Endpoint-precision golden note (I16)

`config.yaml` goldens carried `276.1 / 288.6` — a coarser transcription of the
monolith suite's own asserted values (`G1: 276.07`, `G2: 288.55`). The shell
runner's ±0.05 tolerance sits exactly on the transcription error (288.55 vs
288.6), so the goldens were restored to the monolith-suite precision, citing
G1/G2 as the recorded source. No analysis value changed.
