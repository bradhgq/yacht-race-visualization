# RETROSPECTIVE — from RAGANA NB2026 to a reusable race-viz product

Audience: (1) a fresh Claude chat session authoring a race-visualization skill, and
(2) a future Claude Code session building the reusable `dashboard-shell` repo.
This document is the seed for both. It assumes you have this repo checked out; every
claim cites a file (line numbers as of commit `5df5a19`).

The one-paragraph history: this repo productionized a working single-file dashboard
(`dashboard_template.html`, kept as the frozen reference) into `src/` + `build.py` +
`dist/`, with split lazy-loaded data, a mobile-native UX (bottom-sheet controls,
scroll-safe charts), an accessibility and UX-copy pass, node regression tests as a
build gate, and NixOS hosting as a flake input. Along the way it hit — and fixed —
exactly the classes of bugs a generic product must design against: timezone
double-shifting, default state referencing lazy-loaded data, and stale-reference
switches. Those fixes are encoded as invariants in §4.

---

## 1. Race-specific vs. generalizable audit

Classification: **(a) generic** — works for any race as-is · **(b) parameterizable** —
generic given a named config value · **(c) race-specific** — NB2026/RAGANA-only,
becomes a plugin module or per-race content.

### The data pipeline (`export_json.py`)

| Chunk | Where | Class | Notes / parameter |
|---|---|---|---|
| Haversine / bearing / cross-track math | `export_json.py:12-21` | (a) | Pure geometry. |
| Course endpoints | `export_json.py:10` (`START`, `FIN`) | (b) | `course.start`, `course.finish` lat/lon. `xte_east` (`:21`) derives from them. |
| Name normalization (whitespace, dedup) | `export_json.py:118` (`norm`) | (a) | Caught the double-space "Hissy  Fit II"; keep for every tracker export. |
| Group assignment by rank | `export_json.py:128` (`grp_for`) | (b) | `groups`: rank ranges / explicit name lists per race. |
| Per-boat series derivation (30-min SOG smoothing, DTF, XTE) | `export_json.py:169` (`series_for`) | (b) | Smoothing window and sample interval are parameters; logic generic. |
| EDT epoch helper | `export_json.py:238` (`ep`) | (b) | Hardcodes UTC−4; becomes `time.utcOffset`. |
| Event list incl. `insight` rows | `export_json.py:285-296` | (c) | Authored narrative content — per-race input file, never code. |
| Watch spans ("Brad's watches") | `export_json.py:296` | (c) | Crew-specific overlay; optional module input. |
| Nav-log reconciliation | `export_json.py:304-349` | (c) | Requires a paper nav log; whole feature is an optional module. |
| Fair park metric (DTF 180→80 traversal) | `export_json.py:351-368` | (c) | The *zone bounds* are an analysis finding for this race, not a constant of sailing. Module + per-race bounds if the race had a park at all. |
| Output assembly | `export_json.py:371-372` | (b) | Keys `boats/fleet/events/watches/recon/parkFair/stats` — the shell's data contract, §2. |

### The app (`src/app.js`, 667 lines)

| Chunk | Where | Class | Notes / parameter |
|---|---|---|---|
| Data loading, `__CORE_FETCH` handoff, error states | `app.js:11-30, 608-666`; `index.html:22-24` | (a) | |
| Lazy layers (`ensureTracks`, `loadFleet`) | `app.js:197-209` | (a) | |
| Scoped rAF-batched renderer (`BUILDERS`/`SCOPES`/`render`/`flush`) | `app.js:141-172` | (a) | Core shell machinery. |
| `react()` touch wrapper (fixedrange + no dragmode on narrow) | `app.js:87-94` | (a) | |
| Tap-to-inspect (`attachTap`) | `app.js:174-195` | (a) | |
| Controls machinery (chips, pills, more-panel, bottom sheet) | `app.js:211-357` | (a) | |
| Group palette (`GRP`) | `app.js:33-42` | (b) | `palette.groups`: per-group color ramps. Group *keys* are race semantics. |
| Event categories (`EVCAT`) | `app.js:44-49` | (b) | `eventCategories`: key → color/symbol/label. The six NB2026 categories are a good default. |
| Default state seed (`S`) | `app.js:53-59` | (b) | `defaults.boats`, `defaults.ref`, etc. **Every default boat must have its track in the core payload** (see invariant I7). |
| Quick-select groups (`QUICK_GRPS`) | `app.js:52` | (b) | Also drives the data split in `build.py:18`. |
| Group buttons literal | `app.js:258-261` | (b) | `groups.buttons`: label → boat names. Currently duplicated with pipeline grouping — unify in the refactor. |
| Hero-boat literals (`'RAGANA'`) | `app.js:64, 379, 400-417, 438-439, 496-508, 536-547, 571-583` + ~10 more | (b) | **The largest parameterization job.** `cfg.hero` + shell helpers `heroT(m)`, `heroDTFat(t)`. `ragDTFat`/`ragT`/`raceX` all pivot on the hero track. |
| Phase bands (`PHASES`) | `app.js:437` | (b)/(c) | Structure is generic (list of `[fromDTF, toDTF, label]`); the six NB2026 phases are authored narrative. |
| Race chart (won/lost vs reference) | `app.js:440-491` | (b) | Milestone step 10 nm (`:445`), rhumb 635.1 (`:459, 470`), pace threshold 50 nm — all config. Exact-endpoint logic (`:468-470`) is an invariant, keep in shell. |
| Map | `app.js:374-430` | (b) | Generic given `mapRange` (`:427-428`), start/fin labels (`:411-414`), phase leader-labels (`:420-423`, authored per race). |
| Gulf Stream band (map polygon + time band) | `app.js:121-124, 380-384` | (c) | Overlay module. Polygon from RAGANA's own temperature log. |
| Watch overlay | `app.js:117-127, 400-405` | (c) | Overlay module. |
| DTF / XTE / SOG charts | `app.js:493-534` | (b) | Y-ranges (`dtf` 680/−15 at `:511`, `sog` 0–14 at `:533`) and the park shading rects (`:527-529`) are config; park rects belong to the park module. |
| Finish-spread strip | `app.js:571-606` | (c)→(b) | Works for any fleet scored on corrected time; the −1h/−2h what-if markers and the copy are race-specific. Ship as a module with `whatIfHours` param. |
| Park table | `app.js:536-548` | (c) | Module, paired with the pipeline's `parkFair`. |
| Nav-log recon table | `app.js:559-569` | (c) | Module. |
| Event log table | `app.js:549-557` | (a) | Any race has events; shell. |
| KPI cards | `app.js:359-371` | (b)/(c) | Structure generic; the six cards' values/subtitles are authored (`kpis` config of label/value/sub, some computed from `stats`). |

### Helpers, shell HTML, styles, build, tests

| Chunk | Where | Class | Notes / parameter |
|---|---|---|---|
| `edtStr`/`fmt` | `helpers.js:13-24` | (b) | Hardcode `−4*3600`. Becomes `tzStr(ts, utcOffset)`; label "EDT" → `time.tzLabel`. The *naive-string* contract is invariant I1. |
| `parseDur`, `hitTime`, `startOf`, `wrapText` | `helpers.js:26-60` | (a) | `startOf` embeds `-04:00` (`:49`) — same `utcOffset` parameter. |
| Page skeleton, noscript, loading, sheet bar | `index.html:44-51, 76-80` | (a) | |
| Title block, result line, all `.note` narrative, footer method notes | `index.html:29-42, 84-171` | (c) | Authored per race. Template slots in the refactor. |
| Meta/OG tags, canonical URL | `index.html:8-19` | (b) | `meta.url`, `meta.title`, `meta.description`, generated `og.png`. |
| Design tokens + components | `styles.css:1-143` | (a) | The kit, §3. Only `--magenta` and copy-adjacent bits vary per boat. |
| Mobile breakpoint block | `styles.css:149-186` | (a) | |
| Data split / version stamping / standalone build | `build.py` | (b) | `QUICK_GRPS` at `:18` is the only race knowledge; the `DATA:FETCH` marker contract (`:92-96` ↔ `index.html:22-24`) is invariant I9. |
| OG generation | `scripts/make_og.py` | (a) | Headless-Chrome screenshot of a crop; works for any race. |
| Test harness | `test/regression.test.cjs` | (a)/(c) | Runner and *categories* generic; the three numbers are per-race fixtures (§4, I10). |
| Nix hosting | `nix-config:hosts/silverbox/ragana-dashboard.nix` | (b) | Vhost location + flake input per race; consider one parameterized module `hgq-fyi-subsite` if a third site appears. |

---

## 2. Proposed shell + config refactor (design only)

### Repo layout

```
race-dashboard-shell/            # the product (new repo)
  shell/
    index.template.html          # slots: {{titleblock}}, {{sections}}, {{footer}}, meta
    app/
      core.js                    # loader, scheduler, controls, sheet, tap, resize
      charts/{map,dtf,race,xte,sog}.js   # the five shell charts
      helpers.js                 # tz-parameterized, node-requirable (unchanged contract)
    tokens.css                   # §3, race-agnostic
    build.py                     # split + stamp + standalone; reads race.config
  races/
    nb2026-ragana/
      race.config.js             # everything in the (b) column above
      copy.md                    # titleblock, per-section notes, footer (structured slots)
      modules/{parkfair,finstrip,navlog}.js
      overlays/{gulfstream,watches}.js
      data/dashboard_data.json   # pipeline output, authoritative
      tests/regression.json      # per-race fixture numbers
      og.png
```

### `race.config.js` shape (values shown are this race's, i.e. the extraction target)

```js
export default {
  meta:   { title:'RAGANA · Newport Bermuda 2026', url:'https://hgq.fyi/ragana-newport-bermuda-2026/', … },
  hero:   { name:'RAGANA', color:'#C2187E' },
  time:   { utcOffset:-4, tzLabel:'EDT' },
  course: { start:[41.4868,-71.3415], finish:[32.3618,-64.6303], rhumbNm:635.1,
            mapRange:{lon:[-72,-63.6], lat:[31.9,42]},
            startLabel:'NEWPORT', finishLabel:"ST. DAVID'S" },
  phases: [[635,505,'START + HEAVY RUNNING'], …],                 // app.js:437
  groups: { palette:{…GRP…}, quick:['ragana','class',…],          // app.js:33,52
            buttons:{'SDL 3':[…], …} },                           // app.js:258
  eventCategories: {…EVCAT…},                                     // app.js:44
  defaults:{ boats:[…], ref:'Christopher Dragon', axis:'d', overlays:{gs:true,…} },
  race:   { milestoneStep:10, paceMinDone:50 },                   // app.js:445,464
  charts: { dtf:{yRange:[680,-15]}, sog:{yRange:[0,14]} },
  kpis:   [ {label:'Result', value:'46 / 86', sub:'…'}, … ],      // app.js:361-368
  mapLabels:[ [570,'START + HEAVY RUNNING',96,-6], … ],           // app.js:420-423
  modules:['parkfair','finstrip','navlog'],
  overlays:['gulfstream','watches'],
}
```

### Module interface

A module is one self-registering unit. Two kinds:

**Section modules** (park table, finish strip, nav-log recon) add a page section:

```js
export default {
  id: 'parkfair',
  deps: ['boats'],            // which render scopes re-run build() (app.js:145-153)
  section: { title:'The park, measured fairly …', note:'…', kind:'table' },
              // kind:'plot' gets a .plot div + tapnote and its layout goes
              // through the shell's react() wrapper (touch invariant I6 for free)
  build(ctx) { … }            // renders into ctx.el (kind:table) or returns
                              // {traces, layout} (kind:plot)
}
```

**Overlay modules** (Gulf Stream, watches) contribute to shell charts and get a pill:

```js
export default {
  id: 'gulfstream', pill: { label:'Gulf Stream', color:'#3E97C9', default:true },
  mapTraces(ctx),             // → traces for the map           (app.js:380-384)
  bands(ctx, mode),           // → paper-ref rect shapes for band charts (app.js:121-124)
  legendTrace(ctx),           // optional null-trace legend entry (app.js:126-128)
}
```

**`ctx` — what every module receives** (freeze it; this is the plugin ABI):

```js
ctx = {
  D,                          // loaded data (post lazy-merge)
  S,                          // live state object (read; mutate only own keys)
  cfg,                        // the race config
  el,                         // the module's DOM container (section modules)
  h: { tzStr, fmt, parseDur, hitTime, startOf, wrapText,       // helpers.js
       axVal, evX, sharedXaxis, eventDecor, watchLegend,       // app.js:70-128
       heroT, heroDTFat,                                       // hero-pivot (was ragT/ragDTFat)
       narrow, BASE, GAX, AXFONT, boatColor, hasTrack },
  render(scope),              // request re-renders (app.js:155)
}
```

Shell registers modules into `BUILDERS`/`SCOPES` at boot, so scoped re-rendering,
the hidden-tab fallback, breakpoint re-layout, and tap notes apply to plugins
without plugin code knowing about them.

### What stays shell, verbatim

Loader + error states, scheduler, controls/sheet/chips, `react()` touch wrapper,
the five charts (map/dtf/race/xte/sog) with config injected, event log table,
build pipeline, token CSS, a11y behaviors. The exact-endpoint logic in the race
chart (`app.js:468-470`) is shell — it is an invariant, not a feature.

---

## 3. Design-token kit

Extract `styles.css:1-12` + Plotly scaffolding `app.js:74-95` into `tokens.css` +
`tokens.js`, documented as:

**Palette** (chart-paper / NOAA-chart identity)

| Token | Value | Role |
|---|---|---|
| `--water` | `#EEF4F6` | page ground (the "sea" around cards) |
| `--paper` | `#FBFCFB` | title block ground |
| `--card` | `#FFFFFF` | card/chart ground |
| `--ink` | `#17293A` | primary ink, headings, active fills |
| `--ink2` | `#4C6274` | muted ink — **AA-checked at 4.5:1+ on white and `#F3F7F8`**; was `#51677A`, darkened during the a11y pass. Plotly copy of this: `AXFONT.color`, `app.js:74` — keep in sync |
| `--grid` | `#D9E4E9` | hairlines, card borders |
| `--rule` | `#B9CBD4` | dashed rules, chip borders |
| `--magenta` | `#C2187E` | **hero accent** — the hero boat's line, h1 accent, focus rings. Per-boat re-skin = change this + `hero.color` |
| `--gold`/`--green` | `#B98A00`/`#2E7D4F` | semantic (watch bands / ok badges) |

**Type**: system stacks only (no webfonts): `--mono` (SF Mono→Menlo→Consolas) for
coordinates, timestamps, labels, eyebrows — always with `letter-spacing:.08–.22em`
and uppercase for labels; `--sans` (system) for body. Body 14px/1.45; notes 12px;
chart ticks 10.5px mono.

**Motifs**:
- *Perforated title block* — `styles.css:14-17`: 1.5px ink border + repeating-linear-gradient
  tick strips top/bottom. The signature; keep on every race.
- *Chips vs pills* — dashed-border compact mono chips for dense boat rows
  (`styles.css:58`), round tinted-border pills for overlays (`:65`), solid ink
  pills for group actions (`:72-75`). On-state = filled with the item's color,
  white text, `aria-pressed`.
- *Bottom sheet + bar* — `styles.css:41-47, 156-168`: ink pill bar with magenta
  diamond, sheet with sticky header and Done.

**Plotly defaults** (`tokens.js`): `BASE()` (transparent paper, `#FDFEFD` plot,
ink hoverlabel), `GAX` gridline colors, `AXFONT`, `PLOTCFG`
(`responsive, no modebar`) — `app.js:74-95`. Never let a module hand-roll these.

**Breakpoints**: 1024 (chart heights), 960 (two-col → one), **760 = the mobile
contract** (`narrow()`, `app.js:75` — single source of truth, used by CSS and JS;
keep the media query and the JS matchMedia string identical).

---

## 4. Invariants to protect (each one was earned)

- **I1 — Timezone-naive rendering.** All chart x-values are naive `'YYYY-MM-DD HH:MM'`
  strings built with UTC getters after applying the race's fixed offset
  (`helpers.js:13-24`). Never pass a JS `Date` to a Plotly axis; a previous build
  double-shifted in US-Eastern browsers. Guarded by
  `TZ=America/New_York` + `edtStr(1782094500) === '2026-06-21 22:15'`
  (`test/regression.test.cjs:11-15`).
- **I2 — Exact official endpoints.** The won/lost chart's final point per boat comes
  from official `meta.corr`/`meta.el`, not the last tracker milestone
  (`app.js:468-470`). Guard: RAGANA vs Christopher Dragon **+94.0 min corrected /
  +155.3 min elapsed**, signs positive (`test:17-24`). A previous build truncated at
  DTF 20 and flipped three boats' signs.
- **I3 — Park is own-traversal, not wall-clock** (`export_json.py:351-368`).
  Guard: **Gemini II u4 = 31%** (`test:26-28`); she reads 0% under the wall-clock bug.
- **I4 — Name hygiene.** Whitespace-normalize tracker names (`export_json.py:118`);
  disambiguate duplicates with sail numbers (two Phoenixes). Guard: `test:30-36`.
- **I5 — State model.** One `S` object; pure `build*()` functions; `Plotly.react`
  only (via the `react()` wrapper); traces keyed by display name; every renderable
  registered in `BUILDERS` and reachable from a `SCOPES` entry (`app.js:141-153`) —
  a chart not in `SCOPES` silently never updates.
- **I6 — Touch scroll contract.** On `narrow()`, every chart gets `dragmode:false` +
  `fixedrange` on all axes via `react()` (`app.js:87-94`). New charts inherit it by
  going through `react()`; a module calling `Plotly.react` directly breaks the phone.
- **I7 — Defaults ⊆ core payload.** Every boat in `defaults.boats` (and the default
  reference) must ship in `core.json` (`build.py:63-70` puts quick-group tracks in
  core). Violation found in code review: Carina was a default but lazy — charts
  silently missing a line until "+ More" was opened.
- **I8 — Palette depends on key order.** `boatColor` assignment walks
  `Object.keys(D.boats)` insertion order (`app.js:621-626`); `build.py` must keep
  the source JSON's boat order in all payloads or colors shift between builds.
- **I9 — Build markers are contracts.** `?v=__V__` stamping and the
  `<!-- DATA:FETCH … /DATA:FETCH -->` block (`index.html:20-27` ↔ `build.py:91-103`)
  are matched by exact string/regex, asserted at build. Rename in both places or not at all.
- **I10 — Tests gate the build.** `build.py:27-35` refuses to produce `dist/` on red
  tests. Per-race fixtures move to `tests/regression.json`, but the *categories* are
  fixed: one timezone check, one exact-endpoint check, one derived-metric check,
  one name-hygiene check.
- **I11 — Hidden-tab rendering.** rAF never fires in hidden tabs; the scheduler falls
  back to `setTimeout` (`app.js:155-161`). Background-tab loads render nothing without it.
- **I12 — Relative URLs only.** The site is served from a subpath
  (`hgq.fyi/ragana-newport-bermuda-2026/`); every asset/data reference is relative
  (`index.html`, `app.js:25`). One leading slash breaks hosting.
- **I13 — Ref-switch staleness.** Switching the race-chart reference to a lazy boat
  must render only after `ensureTracks` resolves *and* re-check the selection is
  still current (`app.js:284-289`, race guard at `:443-444`).

---

## 5. Human-decision points (where a skill must stop and ask)

These were Brad's calls, not derivable from data or code:

1. **What ships publicly.** Other boats' tracks and names, crew names in events
   ("Francois and Iwona scratch"), the skipper's personal watch spans, nav-log
   details. NB2026 answer: all public, but candor trimmed by hand in v5 copy. Ask
   per race; default to asking again when crew health/names appear.
2. **Copy voice and substance.** The narrative (notes, insight events, the owned
   retraction in the park copy) is authored, has a specific first-person-crew voice,
   and is explicitly frozen ("light copyediting fine; new claims are not").
   A skill may propose microcopy (labels, errors, empty states) but must not write
   analysis claims.
3. **Analysis framings.** Phase boundaries and names (`PHASES`), the park zone bounds
   (180→80, dead core 160→140), the −1h/−2h what-if markers, the choice of
   Christopher Dragon as default reference ("rating twin") — all narrative judgment
   calls presented as fact once shipped.
4. **Default comparison set.** Which 12 boats light up on load (`app.js:53-55`)
   encodes who the crew considers rivals. Only the owner knows.
5. **Design taste.** The magenta + NOAA-chart identity was pre-existing and protected;
   within it, calls like colorful overlay pills, dropping map leader-labels on
   phones, and the bottom-sheet pattern were made interactively with Brad reviewing
   screenshots. Show before/after, don't just ship.
6. **Publication mechanics.** Repo name/visibility, hosting domain/path, and OG image
   crop were confirmed explicitly, and repo/branch pushes were pre-authorized in
   chat. Treat every publish/push as ask-first.

## 6. Marginal cost of race #2 (post-refactor estimate)

Assuming the §2 shell exists and race #2 has a YB-style tracker export:

| Work item | Who | Estimate |
|---|---|---|
| Tracker CSV → pipeline column mapping (formats vary: YB/Kattack/TracTrac) | Claude, human spot-check | 1–2 h; the only genuinely fiddly mechanical step |
| Official results + start times reconciliation (drives I2 endpoints) | Claude + human verify vs. published results | 1 h |
| `race.config.js` (course, groups, palette, defaults, KPIs, phases) | Claude drafts, human approves §5 items 3–4 | 1–2 h |
| Event log + insights + all narrative copy | **Human** (Claude can draft structure, not claims) | the real cost — days of thinking, historically |
| Module selection (park? nav-log? finish strip?) + per-race module params | Claude proposes from data shape, human decides | 0.5 h |
| Per-race regression fixtures (3–4 numbers, I10 categories) | Claude derives, human confirms against official results | 0.5 h |
| OG image, favicon accent, `--magenta` re-skin if a different boat | Claude | 0.5 h |
| Hosting: flake input + nginx location (or the generalized subsite module) | Claude, one `nixos-rebuild` by human | 0.5 h |

**Bottom line:** with the refactor, the mechanical build of race #2 is roughly half a
day of Claude-driven work with three human checkpoints (data-sharing consent, config
approval, copy). Without the refactor, every item above is entangled with RAGANA
literals across ~20 sites in `app.js` — the hero-boat parameterization (§1) is the
single highest-leverage extraction, followed by moving the three NB2026 modules
(park/finstrip/nav-log) behind the §2 interface.
