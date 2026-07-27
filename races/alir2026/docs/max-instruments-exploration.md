# ALIR 2026 — Max's Expedition instrument export: exploration + supplement proposals

Exploration memo, 2026-07-26. Sources, all supplied by the owner:

- `exp_0723.csv`, `exp_0724.csv`, `exp_0725.csv` — Expedition instrument logs
- `Pogo_50_VPP_Expedition_v2.txt` — the design VPP polar
- `SailChart_MaxUSA75050v1.txt` — the sail crossover chart
- five `.grb` files — the routing forecasts downloaded **onboard** (§4)

**None of these are in the repo** — see "Decisions needed" #1. Every number
below is reproducible with
`races/alir2026/scripts/explore_expedition.py <dir> [polar.txt]`.

Confidence labels follow the stage-2/3 convention: **[fact]** verified from the
data · **[inference]** analysis judgment.

Max is a **Pogo 50**, sail USA75050, PHRF −18, Spinnaker Division 9, elapsed
46:02:18, official finish 11:57:18 (the RC-amended time).

---

## 1. What is in the export

| | |
|---|---|
| files / size | 3 × CSV, 66 MB total |
| rows / columns | 192,001 × 194 |
| cadence | 1.04 s median (≈1 Hz) |
| full span | 2026-07-22 23:59 → 07-25 13:03 EDT (61.05 h) |
| pre-race gap | one 6.6 h gap ending 07-23 07:49 EDT — instruments off overnight, irrelevant |
| **race window** | **13:55 Thu → 11:57:18 Sat = 46.04 h, 162,901 rows** |
| in-race gaps | 3 gaps > 60 s (128 s, 92 s, 73 s); 4.9 min lost total |

**38 of 194 columns carry data.** The other 156 are Expedition's superset for
canting keels, foils, load cells, engine telemetry — hardware Max does not have.

Live channels, by family (coverage = % of the race window):

- **Navigation** — `Lat` `Lon` (95.9%), `COG` `SOG` `HDG` (98.9%)
- **Speed & wind** — `BSP` (97.5%), `AWA` `AWS` `TWA` `TWS` `TWD` (98.9%),
  `TWSGradient`, `TWD±90`
- **Attitude** — `Heel` `Trim` (97.5%), `Rudder` `ROT` (98.8%)
- **Environment** — `SeaTemp` (98.8%), `Depth` (96.0%), `Baro` (**28.9% only**)
- **Routing** — `Mk Lat` / `Mk Lon`, the active waypoint (100%)
- **Line geometry** — `DistToLn` `BelowLn` `Port/Stbd lat/lon` — populated but
  **stale**, see §2.5
- **GPS quality** — `GpQual` `GpsNum` (6.3%), `HPE` (90 samples)

The empty columns include `Set`, `Drift` and `Leeway` — the current channels
were never configured, so current has to be derived (§2.3). `TackLossT` /
`TackLossD` are also empty, so maneuver cost must be derived too.

### 1.1 Continuity of the wind and speed channels

The channels that matter most are effectively **continuous 1 Hz for the whole
race** — not a sampled subset [fact]:

| channel | samples | coverage | gaps > 60 s | longest gap | total missing |
|---|---|---|---|---|---|
| `AWA` `AWS` | 161,082 | **98.88%** | 9 | 263 s | 24.6 min |
| `TWA` `TWS` | 161,082 | **98.88%** | 9 | 263 s | 24.6 min |
| `TWD` | 161,113 | 98.90% | 9 | 263 s | 24.6 min |
| `BSP` | 158,901 | **97.54%** | 9 | 264 s | 24.7 min |
| `HDG` | 161,095 | 98.89% | 9 | 263 s | 24.6 min |
| `SOG` `COG` | 161,065 | 98.87% | 8 | 263 s | 23.3 min |
| `Heel` | 158,760 | 97.46% | 9 | 264 s | 24.7 min |

Every channel shares the same nine dropouts, so the losses are logger-wide, not
per-sensor. **The longest single outage in 46 h of racing is 4 minutes 24
seconds**, and the worst clock hour still holds 85% coverage (16:00 Thursday).
For any purpose in this memo the wind and speed record is unbroken.

---

## 2. Data-quality findings

### 2.1 The export corroborates the YB tracker to 6.9 metres [fact]

Interpolating the 1 Hz Expedition track onto each of the 766 YB fixes for Max:

| separation | value |
|---|---|
| median | **0.0037 nm (6.9 m)** |
| p95 | 0.124 nm |
| max | 0.324 nm |

The p95/max are the fast reaching legs, where a 5-minute tracker gap spans
~0.8 nm and the interpolation cuts the corner. This is an independent
validation of the tracker geometry every shipped ALIR number rests on.

### 2.2 The finish crossing lands 47 s from the RC's amended time [fact]

Max's closest approach to the Glen Cove breakwater light (40.8619, −73.6603) is
**11:56:30 EDT at 0.055 nm**. The RC's amended official finish is **11:57:18** —
a 47 s difference, i.e. about one boat-length-per-second of run-in at her 6.8 kt.

This is a **third independent source** agreeing with the amendment (owner
recollection + YB line marker were the first two), and it retires the last of
the doubt around the original 12:38:03 entry.

### 2.3 Boat speed over-reads 6.0% — and the calibration falls out of the data [inference]

**What *k* is.** `BSP` is boat speed through the water, measured by a paddlewheel
or sonic transducer in the hull. Those instruments drift — fouling, calibration
age, flow disturbance — and read a few percent high or low. *k* is the single
multiplicative correction that fixes it: **true boat speed = k × logged BSP**.
k = 1.000 would mean the instrument was perfect; **k = 0.940 means it read 6.0%
faster than the boat was actually going**, so a logged 10.0 kt was really 9.4.

It matters because BSP is an input to almost everything downstream — the true
wind solution, the current derivation, and every "% of polar target" number. A
6% error left uncorrected would flatter the boat's performance by 6% and
manufacture a phantom half-knot of current.

Naively integrating `BSP` gives 238.7 nm through the water against 224.5 nm over
the ground (`SOG` integral). Scaling BSP by *k* and solving for the *k* that
zeroes the median along-heading component of the derived current gives:

> **k = 0.940** — and at that scale, distance through water = **224.4 nm**
> against 224.5 nm over the ground.

Two criteria land on the same number. The assumption is that net along-track
current averages to ~zero across a 46 h race spanning roughly four tide cycles;
that is reasonable here but it *is* an assumption, and any shipped current
number inherits it. k is stable under cleaning (§2.6): computed on the raw
export and on the cleaned file it lands on 0.940 both times, because the
estimator is median-based and the spikes are 0.012% of samples.

Residual after calibration: median drift **0.80 kt**, p90 1.90 kt, and a
persistent **−0.22 kt across-track** term — the leeway signature, consistent
with `Leeway` never having been configured.

Also note `BSP` max = 35.0 kt and `ROT` pinned in a 166–196 band: both carry
sensor spikes that need clipping before any chart.

**The over-read does NOT materially contaminate the logged true wind** [fact].
This matters, because `TWA`/`TWS`/`TWD` are *computed* onboard from the primary
masthead measurements (`AWA`/`AWS`) plus boat speed and heading — so a 6% boat
speed error propagates into them. Recomputing true wind from `AWA`/`AWS`
reproduces the logged `TWS` to −0.03 kt and `TWA` to +0.1°, which confirms both
the standard formula and that nothing exotic was configured. Substituting the
calibrated boat speed then moves true wind by:

| | TWS | TWA |
|---|---|---|
| median | −0.07 kt | −1.2° |
| p90 \|diff\| | 0.31 kt | 3.1° |
| upwind | +0.15 kt | −2.3° |
| downwind | −0.15 kt | −0.7° |

So the wind channels are usable **as logged**. The one place to carry the
correction is polar work, where a 2.3° upwind TWA shift is small but not
nothing. Note this is the boat's *own* true-wind solution: it is not corrected
for heel, masthead upwash or rig twist, and the Expedition calibration-table
columns are all empty, so no such correction was configured.

### 2.4 Use the SOG integral, not the GPS polyline [fact]

Summing 1 Hz haversine segments gives 237.3 nm; the SOG integral gives 224.4 nm.
At 1 Hz, GPS jitter inflates a polyline by ~6%. The existing pipeline's
decimated tracker geometry is unaffected — this is a warning for any new
instrument-derived distance.

### 2.5 The line-geometry channels reference the wrong line [fact]

Through the start sequence, the stored line ends are **40.9105/−73.7019** and
**40.9121/−73.7000** — Hempstead Harbour, ~15 nm from the Ellis Island start and
not the Glen Cove finish either. It looks like a club line left loaded from a
previous day. `DistToLn`, `TmToLn` and `BelowLn` are therefore **unusable as
shipped**; `BelowLn` drifts monotonically from −2.9 to +3.4 across the whole
race, which is the tell.

Consequence: **no start-line analysis is possible** from these channels. The
finish crossing in §2.2 comes from GPS, not from the line channels.

Minor: the start waypoint the navigator had loaded was 40.7022/−74.0326,
**0.19 nm east** of the SI's 40.7028/−74.0367.

### 2.6 The export carries a second, interleaved data stream [fact]

Found on the cleaning pass, and the most consequential defect in the file.
**4.09% of race-window rows (6,664) are not Max.** They carry no position fix,
a stale active waypoint, and a boat state flatly inconsistent with the row
either side of them. At 07:03:44 Saturday two rows share the same millisecond:

| | BSP | SOG | HDG | COG | position | active waypoint |
|---|---|---|---|---|---|---|
| real | 5.7 | 6.5 | 274° | 278° | 41.0347, −73.1042 | Glen Cove approach |
| ghost | 1.1 | 0.2 | 343° | 12.7° | **none** | **Montauk** (passed 36 h earlier) |

They alternate row by row for the whole race — 16:08 Thursday to 11:57
Saturday, 300–600 rows per three-hour block — so this is a persistent second
source (a backup instrument feed or a second Expedition instance), not a
one-off glitch. It also fully explains the 164 duplicate timestamps: they are
the two streams colliding, and they vanish once the ghost is dropped.

**This corrupted a finding in the first draft of this memo.** The ghost's stale
waypoint alternating with the real one produced **414 apparent waypoint
changes**, which was read as a navigator cycling routes at dawn. Filtered to
position-bearing rows the true count is **17** — and the real story is better
(§3.8).

The other three defects and how they are handled are documented in
`scripts/clean_expedition.py`: boat-speed spikes (~20 samples, one 13-second
burst at 22–24 kt while SOG held 3.4), 994 GPS fixes implying up to 534 kt, and
`ROT`, which is dropped rather than cleaned — it is offset ~180 and correlates
only r = 0.32 with the observed heading rate, so turn rate is derived from
`HDG` instead.

**Every headline number in this memo survives cleaning unchanged** — k, the
polar deficit, the matched-TWS sail control — because they are median-based.
Wind-channel coverage *rises* to 99.99%, since the dropped rows were the ones
missing wind. Use `raw/max/max_expedition_clean.csv.gz`, never the raw exports.

---

## 3. What the export knows that the tracker never could

### 3.1 True wind at the boat — 46 h at 1 Hz, 98.9% coverage

Every wind statement in the shipped dashboard is either a **buoy 10–40 nm away**
(44065, 44069, KPTN6) or an **archived model** (the forecast report card). This
is the wind Max actually sailed in, at her exact position, all race.

Hourly medians trace the whole narrative: 10–13 kt SW building to 26° of heel
Thursday afternoon · the collapse to 3–5 kt overnight · the directionless dawn ·
the sea breeze filling at 11:00 Friday · the easterly rebuild from 040–050°
before dawn Saturday · 12.4 kt at TWA 159 for the run to the line.

**The dawn park's headline number** [fact]: between 04:00 and 12:00 Friday —
the segment where the ledger books **+273.4 min** against Katara56 — TWD swung
through **2,216° of cumulative rotation, a net −561°**. It was not merely light
(TWS < 3 kt for 3.1 of the 8 h, BSP < 1.5 kt for 1.4 h); it was *directionless*.

### 3.2 Measured current, including at Plum Gut

Calibrated derived current (§2.3), by region:

| region | median drift | p90 | median set |
|---|---|---|---|
| harbor / NY Bight | 1.64 kt | 2.47 | 028° |
| south shore | 0.67 kt | 1.64 | 276° |
| Montauk / the Gut | 1.54 kt | 2.20 | 053° |
| the Sound | 0.71 kt | 1.70 | 242° |

11.5 h of the race carried > 1.5 kt of drift; 0.7 h carried > 2.5 kt.

**At the Gut** [fact]: closest approach to the gate waypoint 20:37:09 Friday at
0.149 nm, SOG 5.8 kt against an indicated BSP of 7.8 kt. Projecting the
calibrated current onto the LIS1012 flood axis, against the same harmonic
prediction the shipped `plumgut.js` module draws:

| time | measured (flood axis) | LIS1012 predicted |
|---|---|---|
| 19:30 | +0.76 | +0.67 |
| 20:20 | +0.04 | −0.44 |
| **20:40** | **−1.18** | **−0.44** |
| 21:30 | −0.45 | −1.79 |

Slack ran ~20 minutes late at her position, the ebb then built roughly **2.7×
harder than predicted** at 20:40, and by 21:30 the station was over-predicting
the ebb by a factor of four. The station harmonic and the water Max actually
crossed disagree in both directions within a single hour. [inference]

### 3.3 Point of sail, and 88 maneuvers

| \|TWA\| | share of race |
|---|---|
| < 40° pinching | 1.3% |
| 40–60 close-hauled | 13.6% |
| 60–90 reaching | 22.4% |
| 90–120 broad | 17.8% |
| 120–150 running | 38.0% |
| 150+ dead downwind | 6.9% |

**88 maneuvers** (TWA sign flips ≥ 90 s apart): 44 tacks, 44 gybes. The
distribution is the story — **26 in the first six hours** (the harbor), **24
between midnight and 06:00 Friday** (the shifty park), and just **2** across
each of the two powered evening reaches.

### 3.4 A measured polar for a Pogo 50

Median BSP by TWA × TWS bin, from 46 h of racing (cells with ≥ 30 samples):

| \|TWA\| | 0–4 kt | 4–6 | 6–8 | 8–10 | 10–12 | 12–20 |
|---|---|---|---|---|---|---|
| 45–60 | 2.6 | 4.3 | 6.6 | 7.4 | 8.0 | 8.9 |
| 60–75 | 2.6 | 4.6 | 6.9 | 7.9 | 8.7 | 9.7 |
| 75–90 | 2.5 | 4.2 | 6.9 | 7.5 | 9.5 | 9.9 |
| 90–110 | 1.8 | 3.9 | 6.4 | 8.0 | 9.2 | 9.8 |
| 110–130 | 1.5 | 3.4 | 5.9 | 7.4 | 8.2 | 9.1 |
| 130–150 | 1.6 | 3.0 | 4.8 | 6.4 | 7.6 | 8.5 |
| 150–180 | 1.4 | 2.7 | 4.2 | 5.4 | 6.6 | 7.5 |

The race never gave her the breeze a Pogo 50 wants — TWS topped out at 16.9 kt
and SOG at 10.7 kt, so the planing end of the polar is simply unsampled.

### 3.5 Scored against the Pogo 50 VPP — and the downwind signature

With the design polar supplied, the measured table becomes a report card.
**Calibrated** BSP (k = 0.940) against VPP target at the actual sailed TWA:

| TWS band | hours | VPP target | actual | **% of target** |
|---|---|---|---|---|
| 0–4 kt | 9.4 | 5.5 | 1.8 | 35.8% |
| 4–6 | 10.6 | 5.9 | 3.2 | 54.2% |
| 6–8 | 8.2 | 8.0 | 5.3 | 69.1% |
| 8–10 | 7.8 | 8.9 | 6.9 | 77.1% |
| 10–12 | 5.6 | 9.3 | 7.6 | 82.8% |
| 12–20 | 3.9 | 9.8 | 8.7 | **88.7%** |

The sub-6 kt rows are **not a fair judgment of anyone** — VPP polars are
notoriously optimistic in drifting conditions, and a boat sitting in 2 kt of
breeze with leftover slop cannot approach them. Above 6 kt, where sailing to
polar is possible, she covered **171.8 nm against 223.0 nm of target across
25.6 h — a 23.0% deficit**.

**The shape is more interesting than the total** [fact]:

| \|TWA\| (TWS ≥ 6) | hours | % of target |
|---|---|---|
| 0–45 | 0.5 | 90.0% |
| 45–60 | 4.2 | 83.9% |
| 60–90 | 5.7 | 85.0% |
| 90–120 | 4.2 | **73.3%** |
| 120–150 | 8.9 | **71.3%** |
| 150–180 | 2.2 | 77.8% |

She sailed her upwind and reaching numbers well and her downwind numbers
poorly — and 8.9 h, the single largest block of scored time, sits in the worst
bin.

### 3.6 The crossover chart: the deficit tracks the sail, not the wind

The sail chart maps TWS × TWA onto J1 / G1 / C0 / A2 / WS. Applied to the
measured wind, it reconstructs what the chart *called for*, second by second —
**12 prescribed sail changes** after a 10-minute hold filter (1,458 raw
transitions before debouncing, which is itself a measure of how unsettled the
breeze was).

| prescribed | hours | median TWS | % of target |
|---|---|---|---|
| G1 (genoa) | 16.1 | 8.6 | **80.0%** |
| A2 (running kite) | 16.2 | 6.2 | **63.7%** |
| C0 (Code 0) | 9.3 | 7.0 | 65.4% |
| WS (windseeker) | 4.0 | 2.5 | 30.2% |

The obvious objection is that A2 time was simply lighter and darker. **It was
not the whole story** — controlling for wind speed, the gap survives in every
band [fact]:

| median % of target | 4–6 kt | 6–8 | 8–10 | 10–12 | 12–20 |
|---|---|---|---|---|---|
| **G1** | 67 | 77 | 82 | 88 | **92** |
| **A2** | 52 | 66 | 72 | 77 | 79 |
| **C0** | 50 | 66 | 75 | 77 | — |

**Roughly ten points of target speed, at every wind speed, whenever the chart
called for a downwind sail.** Day/night splits the same way (A2 74.1% by day
vs 64.0% at night) but does not explain it either.

**The limitation that governs how this can be used** [inference]: the sail
selection columns Expedition provides (`J1`–`J4`, `Reacher`, `Blade`,
`Staysail`, `Solent`) are **all empty**, so this is the *prescribed* sail, never
the observed one. The finding is therefore "she was slow in the conditions where
the chart called for a kite," which is consistent with two very different
readings — the kite was up and underperforming, or the kite often was not up at
all — and **the data cannot distinguish them**.

The owner has confirmed (2026-07-26) that the only record of what was actually
hoisted is **his crew log, explicitly offered as recollection and not
necessarily accurate**. That settles the evidence class: an actual-sail track is
**[recall]**, and by prime rule 4 it enters through `events.yaml` item by item
on owner opt-in, never as a measured channel and never as raw log.

**The consequence is a hard design constraint, not a caveat**: a [recall] sail
track may *annotate* the report card — marking where memory says the kite went
up — but it must never *drive* the judgment, because scoring a crew against
their own fallible memory of what they did manufactures precision that does not
exist. The 10-point gap in §3.6 is measured against the *chart*, which is a
fixed document; that is the version that can ship.

### 3.7 Helm signal per watch

Per 3 h shift (owner's watch starts 19/01/07/13), `Heel` and `Rudder` standard
deviations read as steadiness and workload. Examples: shift 1 (16:00 Thu) ran
9.3 kt in 12.3 kt TWS at heel SD **14.9** and **92.1% of target**, the best
shift of the race; shift 13 (04:00 Sat) ran 6.4 kt in 9.3 kt at heel SD 1.27 for
73.7%. Conditions dominate raw values — see P5's caveat.

### 3.8 Depth, sea temperature, and the navigator's intent

- **Sea temp** traces the passage: 23.4 °C in the harbor → **18.0 °C** off the
  south shore Friday evening → 21.7 °C in the Sound.
- **Depth** minima: **4.5 m** off the south shore Friday afternoon; 7.1 m near
  the Gut. How close to the beach the inshore lane actually went.
- **Active waypoint** — the plan, as loaded. **17 changes** across the race
  (corrected from 414; see §2.6):

  | from | waypoint | held |
  |---|---|---|
  | 13:55 Thu | start pin | 1 h 03 |
  | 14:58 | Verrazzano | 58 m |
  | 15:56 | Ambrose R"14" | 59 m |
  | 16:55 | **Montauk** | **25 h 55** |
  | 18:50 Fri | Plum Gut | 7 h 17 |
  | 02:07 Sat | finish | 3 h 50 |
  | **05:58–06:29 Sat** | **10 changes in 31 min** | some held 1–3 s |
  | 06:29 | mid-Sound 40.9610, −73.4878 | **3 h 45** |
  | 10:14 | final approach | to the finish |

  The shape is the story: one waypoint held for 26 hours down the whole south
  shore, then a compact **31-minute flurry at dawn Saturday** — ten changes,
  several lasting seconds — that resolves into a choice held for the next
  3 h 45. A dateable moment of navigational doubt and its resolution.

---

## 4. The onboard forecasts — what the navigator actually had

Five GRIB files, and they are a **different class of evidence from anything in
the repo**. `forecast.js` today scores *archived* model runs against *buoys*.
These are the files that were on the boat, each stamped with its download time.

| file | model | run | downloaded (EDT) | grid | out to |
|---|---|---|---|---|---|
| SD_GFS_22Jul | GFS | 07-22 18Z | **Wed 23:05:59** | 0.25° | +120 h |
| SD_GFS_23Jul | GFS | 07-23 06Z | **Thu 08:18:39** | 0.25° | +96 h |
| EX_HRRR_0027 | HRRR | 07-23 19Z | **Thu 16:36:57** | Lambert | +18 h |
| SD_HRRRX | HRRR-X | 07-23 18Z | **Thu 17:00:57** | **0.025°** | +32 h |
| SD_ECMWF | ECMWF | 07-23 12Z | **Thu 19:12:45** | 0.25° | +51 h |

All cover roughly 39–42 N, 75–71 W — the course box — carrying `10u`/`10v`,
`msl` and (GFS) `prate`. The filename stamps decode as **EDT**, and each one
is consistent with when that model run actually becomes available; that
agreement is itself a check that the stamps mean what they appear to.

**Two structural findings** [fact]:

1. **The last download was 19:12 Thursday — 5.3 h after the gun. The remaining
   40.7 h, 88% of the race, was sailed on forecasts already aboard.** The dawn
   park, the sea-breeze rebuild, Plum Gut and the entire Sound night were all
   navigated on Thursday-evening data. *Caveat: this assumes the five files are
   the complete set — worth confirming before it is ever stated publicly.*
2. **`EX_HRRR_0027` contains only the u-component.** Nineteen complete
   messages, clean `7777` terminator, not truncated — but no `10v` anywhere, so
   the file cannot yield a wind vector at all. A request-configuration artifact
   rather than corruption, and worth knowing: one of the five downloads could
   never have produced wind.

### Scored against Max's own measured wind, at her own position

Interpolating each forecast to Max's actual track and comparing to her
instruments — restricted to observed TWS ≥ 6 kt, because direction error is
meaningless in drifting air (below 6 kt the direction MAE is 59–75°, above
9 kt it is 22°):

| model | n | TWS bias | TWS MAE | direction MAE |
|---|---|---|---|---|
| GFS | 18 | −0.9 kt | **1.6 kt** | **25°** |
| HRRR-X | 16 | −2.1 kt | 2.2 kt | 25° |
| ECMWF | 9 | −2.5 kt | 2.7 kt | 44° |
| **pooled** | **51** | **−1.7 kt** | **2.1 kt** | **29°** |

**Every model under-forecast the breeze**, and the coarse global GFS scored
best of the three — the high-resolution HRRR-X did not buy accuracy here.

The individual misses are where the race turns [fact]:

| valid | model | forecast | measured | miss |
|---|---|---|---|---|
| **Fri 11:00** | GFS | 7.6 kt | **1.8 kt** | **+5.8 kt** |
| Sat 05:00 | ECMWF | 1.6 kt @ 243° | 8.4 kt @ **045°** | −6.8 kt **and 162°** |
| Sat 11:00 | ECMWF | 4.6 kt | 11.7 kt | −7.1 kt |

The first row is the whole story of the dawn park in one line: **the park was
not forecast.** The model had 7.6 kt at the hour she was making 1.8. The second
row is worse than a speed miss — the last ECMWF aboard had 1.6 kt from the
southwest at the hour the Saturday easterly actually arrived at 8.4 kt from the
opposite side of the compass.

## 5. Proposals

Ranked by value per unit of work. Nothing here is built; each needs an owner
call, and several need a decision from §5 first.

**P1 — Corroboration note (cheapest, highest credibility).** Ship §2.1 and §2.2
as a provenance statement, not a chart: the tracker geometry is independently
confirmed to 6.7 m, and the amended finish to 47 s. Retires the finish thread.

**P2 — "What Max actually saw": a measured-wind ribbon.** A TWD/TWS band along
the existing phase timeline, replacing inference-from-buoys with observation at
the boat. Natural companion to `forecast.js`: it adds an *at-the-boat* row to
model scoring, where today every score is against a buoy. Lead number: the
dawn park's 2,216° of rotation (§3.1) sitting under the +273 min ledger row.

**P3 — Measured current at the Gut → upgrade `plumgut.js`.** The module ships a
dashed *predicted* curve; overlay Max's *measured* current at her transit
(§3.2). Design problem to solve first: only one of 52 boats has this, so it must
read as a hero-only annotation and never imply the other dots are measured.

**P4 — The polar report card. Now the strongest candidate in this list.** With
the VPP and crossover chart supplied, §3.5–3.6 support a real module: % of
target by wind band and by point of sail, with the downwind signature as the
finding. This is the one chart that answers a question the crew actually argues
about, and it is the only one here that could change how the boat is sailed next
year. Build it with the sub-6 kt rows visibly fenced off as not-a-judgment, and
with the prescribed-vs-observed limitation stated *on the chart*, not in a
footnote.

**P4b — The sail-plan timeline.** The 17 prescribed changes (§3.6) as a
stacked band along the race clock, under the wind ribbon from P2. Reads as "what
the chart wanted" against "what the breeze did". Cheap once P2 exists, and it is
the natural place to host the prescribed-vs-observed caveat.

**P5 — Instrumented watch performance → upgrade `watchperf.js` (private cut).**
Today the module compares tracker miles against 3-nm spatial peers. Instruments
add per-shift % of target, heel SD, rudder SD and maneuver count. **The existing
module's own caveat applies harder here**: raw per-shift values are almost
entirely weather. Only the polar-normalized figure (P4) says anything about the
deck, and this is the module most likely to read as a judgment on named crew —
it stays in the private cut. Note the two effects are entangled: the shifts that
score worst are also the shifts the chart called for a kite.

**P6 — Maneuver ledger.** 88 maneuvers as a small bar strip on the timeline
(§3.3); the 26-in-six-hours harbor leg and the 24 overnight in the park are
visible facts about how hard the boat was worked. Per-maneuver cost has to be
derived — Expedition's own `TackLoss*` channels are empty.

**P7 — Passage texture.** Depth-to-the-beach on the south shore and the
sea-temp transect (§3.6). Small, cheap, and they make the course map read as a
passage rather than a plot.

**P8 — Navigator's-intent layer.** The waypoint sequence and the Saturday-dawn
burst (§3.8). Unusually honest material: it shows the plan *and* the moment of
indecision. Sensitive for the same reason — private cut.

**P9 — "What the navigator knew" → the successor to `forecast.js`.** Rank this
second only to P4. The existing report card scores archived models against
buoys, which answers "was the model good?" §4 answers the question the race
actually turned on: **"was the information on the boat good, at the boat?"**
Same chart grammar, strictly better evidence — the forecasts that were aboard,
scored against the wind she measured. The dawn-park row (7.6 kt forecast,
1.8 kt measured) belongs directly under the ledger's +273 min segment, and the
"last download 19:12 Thursday" fact reframes the whole second half of the race
as sailed on ageing data. Note the honest limit: n = 51 scored steps is a
report card on *this race's files*, not a general verdict on any model.

---

## 6. Decisions needed before any of this is built

1. **Where does the raw data live?** 66 MB of CSV. CLAUDE.md sends big binaries
   to a GitHub release (`archives-2026-07` precedent), not into the tree. A
   trimmed, race-window, downsampled derivative (say 10 s cadence, 20 live
   columns ≈ a few MB) could reasonably be committed instead. The polar and
   sail chart are 4 KB each and can simply be committed — but see #6. Owner
   call.
2. **I18 / the VMG question.** INVARIANTS.md I18 reads "Course-referenced speed
   is VMC, never VMG. Tracker data carries no wind; **the harness rejects a VMG
   label**." Max's log *does* carry wind, so VMG is now computable — for exactly
   one boat. This needs an owner ruling and an explicit amendment (e.g. I18
   continues to bind tracker-derived speed; an instrument-derived VMG is
   permitted only on a hero-only chart, labelled as such). **Do not start using
   the word first** — the harness will reject the build, and correctly.
3. **Public vs private cut.** This build is already the declared private cut.
   Instrument data is more exposing than tracker data — P5 and P8 in particular
   comment on crew performance and navigational doubt. Which of P1–P8 survive
   into the public cut is a separate owner pass.
4. **A calibration ledger entry.** k = 0.940 is derived, not measured. Every
   current number in P3 depends on it. If any of it ships, the constant belongs
   in a `decisions/` entry with its derivation, and probably in `pinned_values:`.
5. **Where does the code live?** An Expedition reader is generalizable and
   belongs in `starter/acquisition/` (alongside the YB decoder), not in
   `races/alir2026/`. Race-specific findings stay here.
6. **Polar and sail-chart provenance.** The VPP is labelled `v2` and the
   crossover `v1`, neither with an attribution. A shipped report card needs to
   say whether these are the builder's published VPP, an Expedition-generated
   table, or owner-tuned from sailing the boat — the three carry very different
   authority, and P4's headline number ("23% off target") is only as good as
   its reference. New evidence class either way; the existing evidence-constants
   pattern (`squall.js`, `forecast.js`) is the precedent for how to label it.
7. **Ask the crew before P4 ships.** §3.6's downwind deficit has two readings
   and the data cannot choose between them. The owner's crew log is the only
   record, and is [recall] — so the answer improves the *annotation*, never the
   judgment (§3.6). Worth having before the module is designed.
8. **Is the GRIB set complete?** The "89% of the race sailed on Thursday-evening
   data" finding (§4) rests on these five files being everything that came
   aboard. If more were downloaded and not exported, the claim collapses. Cheap
   to confirm, and nothing in P9 should ship until it is.
9. **A new dependency, if P9 ships.** Reading GRIB needs `eccodes`, which is
   not in `starter/requirements.txt` (pandas/numpy/pyyaml only). Either add it
   to the acquisition-side requirements, or decode once and commit a small
   extracted JSON of forecast-at-track-point values as an evidence constant —
   the latter matches the existing `forecast.js` pattern and keeps the build
   dependency-free. Recommend the latter.
