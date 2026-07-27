# ALIR 2026 — the Max cut: 30 proposed charts

**Scope**: a tier-3+ **proprietary** dashboard, visible only to Max's crew and
whoever the owner authorises. Everything here assumes that audience. Several
entries would be indefensible in a public build and are marked accordingly.

Source data: `races/alir2026/raw/max/` (see that README) and the existing
tracker/results pipeline. Findings and caveats: `max-instruments-exploration.md`.
**All boat-instrument numbers come from `max_expedition_clean.csv.gz`**, never
the raw export (§2.6 of the memo — the raw file's ghost stream produces wrong
answers).

Confidence labels follow the house convention: **[fact]** verified from data ·
**[inference]** analysis judgment · **[recall]** participant recollection ·
**[predicted]** model/harmonic output, not an observation.

Each entry gives: what it shows · source evidence · confidence · and, where it
matters, the trap that would make it dishonest.

---

## A. Wind truth — the layer the tracker never had

### C1 · The measured-wind ribbon
Continuous TWD (colour) and TWS (height) along the race clock, 46 h at 1 Hz,
banded by the seven narrative acts. The spine every other new chart hangs off.
- **Source**: `TWD`/`TWS`, 99.98% coverage, longest outage 4 m 24 s.
- **Confidence**: [fact]. It is a measurement at the boat, not a model.

### C2 · The dawn-park compass — the signature chart
Polar trace of TWD through 04:00–12:00 Friday, time as colour. **2,216° of
cumulative rotation, net −561°** — roughly one and a half full reversals — while
TWS sat under 3 kt for 3.1 of the 8 hours.
- **Source**: `TWD` unwrapped over the park window.
- **Confidence**: [fact] for the rotation; **[inference]** for the reading that
  the park cost time through *directionlessness* rather than mere calm.
- Sits directly under the ledger's **+273.4 min** row against Katara56.

### C3 · Apparent-vs-true wind phase plot
`AWA`/`AWS` against `TWA`/`TWS`, coloured by boat speed — shows how much of the
breeze on deck was made by the boat. Explains why the reaching legs *felt*
windier than the park was calm.
- **Source**: primary masthead channels vs the computed true wind.
- **Confidence**: [fact].

### C4 · Wind gradient: boat vs buoys
Max's measured wind against 44065 / 44069 / KPTN6 at matched hours, as a
difference series. The existing `nightone.js` mechanism panel uses a two-station
difference as its evidence; this adds the third point that was *in* the fleet.
- **Source**: instrument wind + NDBC (public domain, already fetched).
- **Confidence**: [fact] for the differences; **[inference]** for any claim
  about a gradient's spatial extent from three points.

### C5 · Sea-temperature transect
`SeaTemp` along the track: 23.4 °C in the harbour → **18.0 °C** off the south
shore Friday evening → 21.7 °C in the Sound.
- **Source**: `SeaTemp`, 98.8% coverage.
- **Confidence**: [fact] for the values. **Do not** assert a thermal front
  drove the wind without an independent source — that would be [inference]
  dressed as physics.

### C6 · Barometer trace
`Baro` over the race, gaps shown honestly as gaps.
- **Source**: `Baro` — **29% coverage, 1018–1023 hPa total range**.
- **Confidence**: [fact], but thin. A 5 hPa range over 46 h supports "nothing
  dramatic passed through" and nothing stronger. Include only if the gaps and
  the narrow range are visible on the chart.

---

## B. Forecast decision quality — replacing the internet-data scorecard

This is the section that changes character most. Today `forecast.js` scores
*archived* models against *buoys*: "was the model good?" These score the files
that were **on the boat** against the wind she **measured**: "was the
information the navigator had good, where he was?"

### C7 · The onboard forecast report card
Per-model bias / MAE against measured wind at Max's own position. Restricted to
observed TWS ≥ 6 kt, because direction error is meaningless when drifting.
GFS −0.9 kt / 1.6 kt / 25° · HRRR-X −2.1 / 2.2 / 25° · ECMWF −2.5 / 2.7 / 44°.
- **Source**: five onboard GRIBs interpolated to her track, n = 43 scored steps.
- **Confidence**: [fact] for the arithmetic. **[inference]**, and weak, for any
  ranking of models: n = 43 from one race is a report card on *these files*, not
  a verdict on ECMWF. Label it so on the chart.

### C8 · "The park was not forecast"
The single most important forecast panel: GFS predicted **7.6 kt** for 11:00
Friday; she measured **1.8 kt**. Overlay forecast and measured wind through the
park window.
- **Source**: `SD_GFS_23Jul26_081839.grb` vs instruments.
- **Confidence**: [fact] for the miss. **[inference]** for "this is why the
  fleet got caught" — Max's data cannot speak for 51 other boats.

### C9 · The 162° miss
The last ECMWF aboard had **1.6 kt from 243°** for 05:00 Saturday. The easterly
arrived at **8.4 kt from 045°**. A compass-rose pair, forecast vs measured.
- **Source**: `SD_ECMWF_23Jul26_191245.grb`.
- **Confidence**: [fact].

### C10 · Information age — the staleness clock
A bar running the length of the race, shaded by how old the newest forecast
aboard was at each moment. Last download **19:12 Thursday, +5.3 h after the
gun**; the remaining **40.7 h (88%)** — dawn park, Plum Gut, the entire Sound
night — sailed on data already aboard, ageing to 41 h by the finish.
- **Source**: GRIB filename download stamps (EDT; each cross-checks against when
  that model run becomes available).
- **Confidence**: [fact] **conditional on the five files being the complete
  set** (memo decision #8). Unverified — do not ship until confirmed.

### C11 · Forecast skill decay with lead time
Error against hours-since-download, all models pooled, to test whether the
ageing in C10 actually cost accuracy.
- **Source**: as C7.
- **Confidence**: **[inference]**, and I would not lead with it. n = 43 spread
  across five lead-time bins is too thin to separate decay from the fact that
  different bins cover different weather. Show it as a scatter, never a fitted
  trend line.

### C12 · The download that carried no wind
`EX_HRRR_0027` — 19 complete messages, clean terminator, **only the
u-component**. One of five files aboard could never have produced a wind vector.
- **Source**: GRIB message inventory.
- **Confidence**: [fact]. A small operational finding with real value to the
  navigator, and honest about not knowing *why*.

### C13 · Forecast vs measured, spatially
The HRRR-X 0.025° field at a chosen hour, with Max's track and her measured wind
barbs on top. Shows whether the model had the *pattern* right even where it had
the strength wrong.
- **Source**: `SD_HRRRX_23Jul26_170057.grb` (160 × 81 grid).
- **Confidence**: [fact] for the render; [inference] for pattern judgments.

---

## C. Performance against the polar

### C14 · The report card
% of VPP target by wind band: 35.8% (0–4 kt) rising to **88.7%** (12–20 kt).
- **Source**: cleaned `BSP` × k = 0.940 against the Pogo 50 VPP.
- **Confidence**: [fact] for arithmetic; the *interpretation* is fenced — the
  sub-6 kt rows must be visibly marked **not a judgment of the crew**, since VPP
  polars are notoriously optimistic in drifting conditions.

### C15 · The downwind signature — the crew-facing headline
% of target by point of sail: 84–90% upwind and reaching, **71–73% between 90°
and 150°**, where the largest single block of time (9.0 h) sits.
- **Source**: as C14.
- **Confidence**: [fact] for the numbers, **[inference]** for the cause.

### C16 · The matched-TWS control
The chart that makes C15 defensible. G1 vs A2 vs C0 within each wind band —
the ~10-point gap survives at **every** wind speed (G1 67→92%, A2 52→79%).
- **Source**: crossover chart applied to measured wind, cleaned BSP.
- **Confidence**: [fact] that the gap is not a light-air artefact.
  **[inference]** as to mechanism, with **two readings the data cannot
  separate** — the kite was up and slow, or the kite often was not up.
  **This must be on the chart, not in a footnote.**

### C17 · The measured polar
Her actual speeds by TWA × TWS, as a keepable artefact, with the VPP overlaid
and unsampled cells left visibly empty (TWS never exceeded 16.9 kt, so the
planing end is blank).
- **Source**: cleaned instruments.
- **Confidence**: [fact].

### C18 · Target-speed deficit over time
% of target as a time series against the act bands — where in the race the boat
was and was not sailed to its numbers. Best shift **92.1%** (16:00 Thu); the
light night shifts fall away.
- **Source**: as C14.
- **Confidence**: [fact] for the series; conditions dominate, so any per-shift
  reading is **[inference]** — see C25.

### C19 · Heel vs target speed
Heel angle against % of target, by point of sail — the classic trim diagnostic,
and the one most directly actionable next season.
- **Source**: `Heel` (98.9%) + polar scoring.
- **Confidence**: [fact] for the relationship; **[inference]** for an optimal
  heel band, and only where sample density supports it.

### C20 · Distance ledger: water vs ground vs course
224.4 nm through the water, 224.5 nm over the ground, against 207.0 nm of
scored course — the ~17 nm of extra sailing, and where it accrued.
- **Source**: integrated cleaned `BSP` (×k) and `SOG`.
- **Confidence**: [fact].

---

## D. Current and tide

### C21 · Measured vs predicted at Plum Gut — upgrade `plumgut.js`
The module ships a *predicted* dashed curve. Overlay what Max actually
measured through her 20:37 transit: slack ran ~20 min late, the ebb built
**2.7× harder than predicted** (−1.18 vs −0.44 kt) at 20:40, and by 21:30 the
station over-predicted by a factor of four.
- **Source**: derived current (k = 0.940) vs CO-OPS LIS1012 harmonic.
- **Confidence**: [fact] measured, **[predicted]** for the harmonic.
  **The trap**: only 1 of 52 boats has measured current. It must read as a
  hero-only annotation and must never imply the other 51 dots are measured.

### C22 · Current field along the track
Set/drift vectors on the course map: harbour 1.64 kt median, Montauk/Gut 1.54,
south shore 0.67, Sound 0.71. 11.5 h of the race carried > 1.5 kt.
- **Source**: derived current, 1-minute resolution.
- **Confidence**: [fact] for the derivation, **[inference]** in that it inherits
  the k assumption *and* has no leeway model — the −0.22 kt across-track
  residual is unmodelled leeway sitting inside these vectors. State it.

### C23 · Tidal gate timing across the fleet
Each boat's Gut crossing against predicted current (existing tracker work), with
Max's *measured* current as the one calibration point — does the harmonic's
error at 20:40 change how other boats' crossings should be read?
- **Source**: tracker gates + CO-OPS + Max's measurement.
- **Confidence**: **[inference]**, explicitly speculative. One boat's 2-hour
  measurement cannot be extrapolated across a 12-hour arrival spread. Frame as
  a question, not a correction.

---

## E. Maneuvers, helm and the plan

### C24 · The maneuver ledger
88 maneuvers (44 tacks, 44 gybes) as a strip along the race clock: **26 in the
first six hours** (the harbour), **24 between midnight and 06:00 Friday** (the
shifty park), just 2 across each powered evening reach.
- **Source**: TWA sign changes, 90 s debounce, cleaned data.
- **Confidence**: [fact] for the count under a stated rule.

### C25 · Cost per maneuver
Speed recovery curve after each tack/gybe — time to return to target. Expedition's
own `TackLossT`/`TackLossD` are empty, so this is derived.
- **Source**: cleaned `BSP` around each detected maneuver.
- **Confidence**: **[inference]**. Isolating maneuver cost from a shifting
  breeze is genuinely hard; present the distribution, not a single "cost" number.

### C26 · Helm workload by watch — **private, and the most sensitive chart here**
Rudder SD, heel SD, turn rate (derived from `HDG`, since `ROT` is unusable) and
% of target per 3-hour shift.
- **Source**: cleaned instruments, watch spans from the crew log.
- **Confidence**: watch spans are **[recall]** (owner's log, offered as
  approximate). **The constraint**: raw per-shift values are almost entirely
  weather, and the shifts that score worst are also the shifts the chart called
  for a kite — the two effects are entangled and this chart cannot separate
  them. Only the polar-normalised figure says anything about the deck, and even
  that is **[inference]**. If it cannot carry that framing, do not build it.

### C27 · The navigator's plan, and the 31 minutes of doubt
The 17 waypoint changes: one target held **25 h 55 m** down the south shore,
then **10 changes in 31 minutes at dawn Saturday** (several held 1–3 s),
resolving into a choice held 3 h 45.
- **Source**: `Mk Lat`/`Mk Lon`, position-bearing rows only.
- **Confidence**: [fact] for the sequence. **[inference]** for "doubt" — and
  note this replaces a *wrong* earlier reading (414 changes) that came from the
  ghost stream. Worth stating on the chart that the count is 17, because the
  naive number is very different.

### C28 · Depth and the beach
`Depth` along the south shore — minimum **4.5 m** Friday afternoon — showing how
close inshore the lane actually ran, against the fleet's tracks.
- **Source**: `Depth` (96%) + tracker.
- **Confidence**: [fact].

---

## F. Instrument × fleet correlation

### C29 · The corroboration panel
Max's 1 Hz track against her 766 YB fixes: **median 6.9 m** separation, p95
0.124 nm. Plus the finish: instruments put her crossing at **11:56:30**, **47 s**
from the RC's amended 11:57:18.
- **Source**: cleaned positions vs `alir2026_tracks_clean.csv`.
- **Confidence**: [fact]. Quietly the most valuable chart in the set — it
  validates the geometry every *existing* shipped number rests on, and
  independently ratifies the RC amendment.

### C30 · Was the wind Max saw the wind the fleet saw?
Max's measured wind against fleet-wide VMC in the same hour — where the fleet
sped up and slowed down relative to what she was experiencing. The bridge
between one boat's truth and 52 boats' behaviour.
- **Source**: instruments + tracker-derived fleet VMC.
- **Confidence**: **[inference]** throughout. Correlation across a fleet spread
  over 40+ nm is suggestive, never causal, and the honest version says so.
  **VMC, never VMG** (I18) for anything tracker-derived on this chart.

---

## Cross-cutting notes

**On I18 / VMG.** C3, C14–C19 and C25 are the charts that would tempt the word
VMG. The harness rejects the label and it is correct to: the invariant exists
because tracker data carries no wind. Max's log does, so VMG is now computable
for exactly one boat — but that needs an owner ruling and an explicit invariant
amendment **before** the word appears anywhere. Until then, course-referenced
speed stays VMC.

**On the audience.** C26 (helm by watch), C27 (navigational doubt) and C15/C16
(the downwind deficit) comment on identifiable people's performance. That is
defensible for a crew-only cut and would need a separate owner pass to appear
anywhere else — which is the current `privacy: build: private` declaration
working as intended.

**What I would build first**: C29 (validates everything else), then C7/C8/C10
(the forecast section is the biggest genuine upgrade over what exists), then
C14/C15/C16 (the crew-facing report card, and the only work here likely to
change how the boat is sailed).

**What I would not build without answers**: C10 (needs the complete-GRIB-set
confirmation), C26 (needs the framing to survive contact with the crew), and
anything using the word VMG.
