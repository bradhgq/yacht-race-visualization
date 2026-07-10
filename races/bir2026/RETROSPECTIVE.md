# RETROSPECTIVE — BIR 2026, the second race through the pattern

Companion to the repo-level [`RETROSPECTIVE.md`](../../RETROSPECTIVE.md), which
predicted (its §6) the marginal cost of race #2 after a shell refactor that never
actually happened. This is the empirical readout: what productionizing a *second*
race cost when the shell was still a worked example, not an extracted library.
Every claim cites a file.

The one-paragraph history: the BIR handoff arrived as a CP-4-approved monolith
(`dashboard_template.html`, 699 lines, data injected at `{{DATA}}`) plus a FROZEN
oracle payload. The job was productionization only — codify the assertions, split
the payload, mobile, a11y, host. It shipped as `src/` + `build.py` + a split `dist/`
with a 23-test gate, mobile bottom sheet, an a11y pass, a public/private build split,
and NixOS hosting wired as a flake input — the same shape NB2026 reached, reproduced
for a race whose chart set only partly overlaps.

---

## 1. The central finding: the engine diverged, so I did NOT generalize

The repo retrospective's §2 imagined one shell whose `race.config.js` parameterizes a
single chart engine across races. The prompt (JOB 2) offered shell migration as
"optional but preferred." I declined it, and that was the load-bearing decision.

The BIR monolith and the NB2026 `src/app.js` share DNA — `edtStr`, the `S` state
object, `Plotly.react`, act bands — but their **module sets are different**:

| | NB2026 (`../../src/app.js`) | BIR (`dashboard_template.html`) |
|---|---|---|
| upwind-distance bars (`meta.up1bi`) | — | `renderUpwind` |
| two-division beeswarm | one band | `renderFinstrip`, ORC+PHRF bands |
| upwind-lane (signed offset, dist-x) | — | `renderXTE` |
| Gulf-Stream / park / recon / nav-log | present | — (Tier 2, no paper log) |
| corrected handicap | F-TCF (ToT) | ORC ToT, cross-division **hard-hidden** |

Merging these into one config-driven engine — the "preferred" migration — is a large
refactor gated by an oracle that must reproduce byte-for-byte AND 16 human-caught
assertions. The expected value is negative: high risk of drifting the *approved*
artifact, for a generality no third race has yet demanded. So I kept every BIR chart
builder **verbatim** and grafted them onto NB2026's proven *scaffolding* (async boot,
lazy loaders, rAF-batched `render(scope)`, the bottom sheet, tap-to-inspect, ARIA).
The scaffolding generalized cleanly; the chart engine did not, and shouldn't be forced
to until a third race shows which modules are actually common.

**Lesson for the real shell extraction:** the shell boundary is *not* "one engine."
It's the **scaffolding** (data-split loader, render dispatch, mobile sheet, a11y,
error states, build) — race-agnostic and worth extracting now — wrapped around a
**per-race module bag** where each `renderX` is a plugin. The repo retrospective's
§2 module interface is right; its assumption that all races draw from one fixed chart
list is what BIR falsifies.

## 2. Race-#2 actuals vs. the §6 prediction

The repo retro §6 estimated race #2 at "a config file + authored content + a few
per-race modules." Actuals, since the shell was never extracted:

- **Reused with zero edits:** the mobile CSS system, the a11y button/aria pattern,
  the tap-to-inspect logic, the three-payload split *strategy*, the standalone
  inliner, the OG-card generator (retargeted to the BIR course in `scripts/make_og.py`).
- **Rewritten per-race (unavoidable this time):** the whole chart engine (grafted, not
  merged), because there is no shell to plug into yet.
- **New, general, belongs in the shell:** the CP-5 publish gate (`build.py --public`
  + `publish_allowlist.txt`) — every future race with private events needs it.

Net: without the extraction, race #2 cost ≈ a full frontend port, not the "config +
content" the estimate promised. That gap **is** the argument for doing the extraction
before race #3.

## 3. Testing: how 16 screenshot-caught defects became a runnable gate

CP-4's assertions were verified in-chat with one-off Playwright scripts. Porting them
(`test/regression.test.cjs` + `test/harness.cjs`) split cleanly in two:

- **Data/logic** (helpers + the FROZEN oracle, no DOM): G1–G5, A1–A6, the fleet/
  Daffodil/events counts. G1/G2 are checked twice — once as arithmetic on
  `meta.corr`/`meta.el`, once as the actual chart endpoint the app emits.
- **Render/DOM**: the app driven under **jsdom** with a **Plotly-capturing stub** —
  the render functions run for real and the test asserts on the captured figure specs
  (traces, `layout.shapes`, annotations). Plotly is stubbed, so a claim about *pixel
  geometry* (a 360px height, a 1048px note width) is verified by its **driver** — the
  CSS rule or layout field that produces it — rather than by a fragile screenshot.

Two jsdom gotchas worth recording for the shell's test kit:
- **Cross-realm equality**: arrays the app builds live in jsdom's realm and have a
  different `Array.prototype`; `assert.deepStrictEqual` fails on equal contents. Compare
  element-wise (`test/regression.test.cjs`, the A11 y-range check).
- **Async DOM rebuild**: `buildControls` replaces chip nodes wholesale, so a captured
  node reference goes stale after a toggle. Assert against a fresh query, not the old
  handle.

Real-browser verification (headless Chrome via the preview tools) then confirmed what
jsdom can't: plotly-**basic** does render `marker.symbol:'arrow'` with
`angleref:'previous'` (A8), the bars, and the beeswarm; the load order is
core → fleet(after paint) → more(once, on demand); note width computes to exactly
1048px; and the mobile bottom sheet slides, scrims, and hits ~44px targets.

## 4. New invariants earned this session (prime rule 5)

Each is now a named test:

- **NF1 — Windfall is a stale golden.** The FROZEN oracle injects `Windfall`
  meta-only (a PHRF finisher with `corr`/`el` but empty track arrays). `goldens.json`
  and `config.yaml` still list Windfall under `names_absent` — but **G5's PHRF band = 23
  requires it**; without Windfall it's 22. The oracle wins (prime rule 3); the golden
  file is stale. Do not "fix" the payload to match the golden — fix the golden.
- **NF2 — the display-name override is applied.** The payload uses `Zélée`
  (`name_overrides.display`); `goldens.json.names_present` still shows the raw `Zèlèe`.
  A test that asserts the golden's literal string would fail against the real artifact.
- **Trackless ≠ absent.** Windfall ships `t: []`, not a missing key — truthy in JS.
  `hasTrack` must check `.length` (it does); the build routes meta to core and the empty
  series to more without ever rendering a phantom (`build.py`, `has_track`).
- **The despiked CSV still contains fast segments.** despike removes only teleport
  pings; post-finish tracker car-rides (25–60 kt) survive in `tracks_clean.csv` and are
  trimmed later, in the payload. So the "no implied speed >25 kt" invariant belongs on
  the **payload** tracks, not the raw cleaned CSV (A1a). A test on the CSV would red-flag
  legitimate data.
- **The footer's "16 phantom pings" is narrative, not a count.** The Fri 20:00 EDT
  cluster is actually 29 rows / 14 boats removed (A1b asserts ≥16, the robust floor).

## 5. Publication (CP-5) — the one place a machine must not decide

All 16 events are `visibility: private`. Brad's instruction was "host exactly like the
nb2026 board" — public, full narrative. I honored it **except** the two groundings
(Loki, Full Tilt): prime rule 4 marks them non-publishable *regardless* — firsthand-
confirmed incidents about **other boats**, not in the public record. Asked directly,
Brad confirmed the carve-out ("the rule is sound and let's keep it out"), so
`build.py` hard-blocks the two labels (`NEVER_PUBLIC`) and the public build ships the
other 14; the event bodies exist only in the private client record. The decision and
the deploy path are in [`decisions/CP-5.yaml`](decisions/CP-5.yaml).

This is the general shape for any future public race board: the client (private) build
is the default; the public build is an opt-in *subtraction*, with a hard floor the
allowlist can't override.

## 6. Recommendations for the shell extraction (do before race #3)

1. Extract the **scaffolding** (`loader`, `render(scope)`, mobile sheet, a11y, tap,
   error states, `build.py` split + standalone + `--public` gate) into `shell/`. It is
   already race-agnostic; BIR proved it by reuse.
2. Make each `renderX` a **module** with a `{mount, scope, needs}` interface (repo
   retro §2 is close). Ship a race by declaring which modules it uses — BIR would list
   `[map, dtf, race, upwind, finstrip, lane, sog, log]`; NB2026 swaps in `[park, recon]`.
3. Fold the **publish gate** into the shell — it is not race-specific.
4. Keep the **jsdom + Plotly-capture harness** as the shell's test kit; per-race tests
   supply only the goldens + the assertion list. Record the two gotchas in §3 as kit docs.
5. Reconcile `goldens.json`/`config.yaml` with the oracle at freeze time (NF1/NF2) so the
   golden file can't drift from the payload it's supposed to guard.

## 7. R9 — what the first post-launch owner round taught (2026-07-09)

The board went live and Brad's first real-use pass produced eleven fixes
([`decisions/R9-owner-review.yaml`](decisions/R9-owner-review.yaml); every one a
named `R9_*` test — the suite is now 34). Three lessons worth carrying forward:

- **§1's divergence argument applies *within* one build.** The monolith had three
  separate decor code paths (`actBandsTime`, `actBandsDist`, `eventDecor`) and they
  had already drifted: the lane chart had no acts or events at all, and SOG's event
  markers were drawn at y=13 on a fixed [0,11] axis — present in the figure spec,
  invisible on screen. The fix (one `decor(xOf)` with a per-chart x-mapper) is the
  same medicine as the shell extraction: shared scaffolding, thin per-chart adapters.
- **Spec-level tests can't see "invisible."** The jsdom/Plotly-capture harness
  verified the SOG marker trace *existed* — it never asserted the markers sat inside
  the chart's y-range. That class of check (`marker.y within layout.yaxis.range`) is
  now part of the shared A12 test and belongs in the shell's test kit.
- **Coverage combinatorics beat screenshot rounds.** 8 human rounds never clicked
  "All boats + Total view"; the R9 code review did, and found a pre-existing crash
  (Inisharon, DNF, `parseHMS(undefined)`). Cheap adversarial passes over the state
  space (every toggle × every view) catch what curated screenshots structurally miss.

Also at R9: prime rule 4 was questioned, explained (it comes from the skill, not
from Brad), and **reconfirmed by the owner**; the `private/never_public.txt`
indirection was reverted to the simpler hardcoded `NEVER_PUBLIC`; and the NF1/NF2
stale golden name-lists were reconciled in `config.yaml` with a ledger entry.

## 8. Wishlist — further work

Recorded here so a future round can pick items with fresh consent; none of these
change shipped analysis numbers without a new checkpoint.

### 8a. Visual
- **Synced hover / time-scrubber across charts.** One hovered moment highlighting
  map position, DTF, race gap, and SOG simultaneously — the single biggest
  readability win available. (Plotly `hoversubplots` doesn't span separate divs;
  needs a small shared-cursor layer over the existing `decor()` mappers.)
- **Basemap under the course.** A light coastline (Long Island, the CT shore,
  Block Island itself) as an inline SVG layer would ground the map without
  breaking the no-CDN rule. The island's outline would also make the starboard
  annotation self-evident.
- **Pace-view y-clamp** (deferred since CP-4): min/100nm amplifies as remaining
  distance → 0; clamp the last ~20 nm or add a note. Now that the start anchor
  exists the asymmetry is more visible.
- **Leader-line labels on the map** at the DTF milestones (the nb2026
  `mapLabels` pattern) instead of hover-only identification.
- **Print/story mode**: a one-column, chart-per-viewport scroll layout with the
  act narrative interleaved — the FINDINGS memo as a guided tour of the same
  figures.
- **Dark mode** via the existing CSS variables (the palette is already
  tokenized; mostly a `prefers-color-scheme` block + Plotly template swap).

### 8b. Research integration
- **Wind field.** The biggest analytical gap: no wind data on the board (the LIS
  buoys were down for the window — footer already says so). NOAA NDBC station
  44039/44060 archives, ASOS coastal stations (GON, BID), or ERA5 reanalysis
  could give an hourly wind barb strip under the SOG chart and would let the
  Act-3 "building breeze" narrative be shown, not asserted.
- **Current/tide gates.** The Race and Plum Gut are current gates; NOAA tidal
  current predictions for the race window would explain the Friday-night
  compression visible in the DTF chart and belong as a shaded overlay on the
  DTF/SOG time axes.
- **1BI charted coordinate** (open since CP-4): pin from NOAA chart 13215/13217
  or the USCG Light List; then rounding *timestamps* can ship via route.py's
  stateful leg logic (the +4.7 nm distance is already robust to this).
- **Per-leg decomposition table.** The register already supports it: elapsed and
  corrected deltas vs CD per act (out / sound→1BI / rounding+home), replacing the
  single "Act 3 alone +182 min" line in FINDINGS with a small table module.
- **Polars/target overlay** (needs owner data): Ragana's ORC speed guide vs
  achieved SOG by leg would turn "the rest is pace" into "which pace, where."
- **Crew narrative depth**: the events layer could link each log row to a
  fuller story panel (transcript excerpts are already in events.yaml `txt`);
  a click-to-expand row keeps the table compact while surfacing the research.
- **Fleet analytics**: lane-vs-outcome scatter (south-max vs corrected finish
  across Class 6/all ORC) — the round-3 stress-test finding as its own chart
  rather than prose in the upwind note.
