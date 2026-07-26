# ALIR 2026 — Stage-2 Findings Memo (for the hard stop)

Pipeline invocation for every number here:
`.venv/bin/python starter/build_race.py races/alir2026` (chain green under both
TZ=America/New_York and TZ=UTC, 10/10 checks, snapshot compare active; grid,
routed DTF and VMC from `out/dashboard_data.json`). Ad-hoc exploration figures
from stage 0/1 were re-derived on the pipeline grid before entering this memo;
where an exploratory number differed it is gone. PRELIMINARY DATA caveat stands
throughout (mid-race snapshot; owner re-fetch pending).

## 1. Headline candidates

**F1 — The two-window race, with the position taken the night before.**
Claim: Max lost 212 official minutes to Katara56, and the loss concentrates in
two windows — the Friday dawn transition and the Sound night — but the dawn loss
was set up by the night-one cross-shore choice. Evidence: natural-phase ledger on
the 15-min grid (peers = boats within 3 nm at phase start): P3 night one **11/11**
(−1.5 nm vs peer median), P4 dawn **4/6** (−3.9), P6 Sound night **3/3** (−8.2),
against P2 reach **1/40** (+6.7) and P5 rebuild-to-Plum-Gut **1/6** (+8.8).
Katara56 diverged offshore 23:00→02:00 (2.5 → 9.7 nm off while Max stopped at ~6
and jibed back); the night itself cost ~1.5 nm, the position paid +9.7 more at
dawn. Benchmark-dependence: Katara56 (identical −18 rating; elapsed gap ==
corrected gap by construction). Confidence: HIGH on the shape; peer-radius
sensitivity (3/5/8 nm) still to be run before captions quote exact per-phase nm.

**F2 — Offshore paid at dawn, not overnight, and the observations say why.**
Claim: at the Friday dawn transition every mile offshore was worth ~+0.2 kt made
good (+0.213 kt/nm, partial corr +0.633 controlling along-course position, n=35,
grid-derived); over the night itself the sign is negative. The two NDBC stations
bracketing the fleet cross-shore (44065 offshore minus 44069 in-bay) show the
wind advantage reversing at ~08:00 — a land-breeze-to-gradient transition —
matching the fleet regression's flip hour. Confidence: HIGH for the fleet
effect; the station gradient ships only with the bay-station caveat (44069 is
inside Great South Bay; the sign and timing are defensible, the magnitude is
not). Evidence classes: tracker (positions) + observed wind.

**F3 — The night-2 "wrong side" story is DEAD; entry timing killed it.**
Claim: within the Sound-entry cohort (through Plum Gut 18:30–22:30 Fri, n=13),
cross-Sound position does not predict progress (partial corr +0.067); what
predicts it is being early — the front cohort met Saturday's easterly first and
compounded. Max additionally ran a −3.2 nm residual her position doesn't explain
(current line along the LI shore? mode? — OPEN). Confidence: HIGH for the null;
the residual attribution is unresolved and must not be narrated as navigation
error without stage-3 work. This retires stage-0's h3 permanently.

**F4 — The boat-character share is the largest in the fleet.**
Claim: across the 27 boats with full-phase grid coverage, Max ranks **1st in the
powered phases and 18th in the light phases — a +17 rank split, the fleet's
largest**. A Pogo 50 is built for exactly the phases she won. Consequence for
every caption: the light-air losses are part physics, part placement; the memo's
navigation findings (F1–F3) must always share the stage with this one.
Confidence: HIGH (grid-derived, whole-fleet).

**F5 — The navigator's models disagreed, and each was half right.**
Claim: Thursday evening's HRRR had the dawn N→NE fill on the table (9.4 kn at
08:00; verified direction, ~60% over on pressure vs buoy 44065); the same
evening's ECMWF said the park continues (right on morning pressure, wrong on
trend and direction). The crew's 04:25 log reading of HRRR was a fair reading of
real guidance. Evidence class: archived forecast + observed; full tables in the
stage-1 brief. Confidence: HIGH as forecast history; any "should have known"
framing is a stage-3 editorial decision, not a data finding.

**F6 — The crew sailed the powered race as well as anyone afloat.**
Claim: rank 1 of 40 water peers on the Thursday reach ("caught a lot of boats"
is literal: 14 ahead at Red 14, 3 by 23:00), rank 1 of 6 from the sea-breeze
rebuild through Montauk and Plum Gut, beating Katara56 by 2.2 nm through P5 in
the same water. Confidence: HIGH. This is the counterweight the story needs.

## 2. Proposed modules (stage-4 builds; the stop picks)

- **M1 · park (standard zone module).** Authored zone proposal: `upper_nm 155,
  lower_nm 128` — "the Friday park". Detection at default knobs finds NO
  candidate (band-median table in §4): the two single-band collapses (140–150 at
  2.0 kt, 80–90 at 2.1 kt) never form a qualifying run because the park was
  temporally coherent but spatially smeared across the staggered fleet. The
  authored band covers the hero cluster's actual parking water; parkFair then
  measures each boat's own traversal (doctrine 1). Canary pins on adoption.
- **M2 · night-one divergence map** (race-unique): tracks 23:00→08:00 colored by
  dawn outcome; Katara56's peel and Max's 03:00 jibe annotated from the events
  layer once pruned. THE tier-3 centerpiece candidate.
- **M3 · phase ledger** (race-unique): the P1–P7 rank strip — Max vs her water
  peers per phase; the "1st/1st powered, last/last light" shape in one glance.
- **M4 · dawn reversal panel** (race-unique, weather-evidence): the two-station
  gradient flip beside fleet VMC small multiples at 05/08/11. Scope guard: the
  weather series are evidence overlays; no pipeline number depends on them.
- **M5 · Sound-entry cohort strip** (race-unique): gate time vs progress — the
  visual that retires the "wrong side" story honestly.
- **M6 · forecast-vs-reality panel** (race-unique, the tier-3 signature): the
  navigator's-eve tables (HRRR d1 vs ECMWF d1 vs what verified) for both nights.
- Standard set already wired and building: map (+courseline overlay), dtf, race,
  distspeed, xte/sog with VMC toggle.

## 3. Data-quality anomalies (carried to the stop)

1. Four official finish times sit 8–68 min after the boats' tracker line
   crossings (Max +40.6; owner confirms ~11:57 crossing; RC contacted). Official
   values used throughout; disclosed in copy.
2. WANDERER finished (tracker line marker 18:33:59 Fri) but is unscored at the
   snapshot — she'll join the results at the re-fetch.
3. The 2026 feed's ~1-min cadence tier broke the inherited trimmer twice
   (pre-start spike; single-interval "vehicle" spikes) — both fixed and recorded;
   promotion of the trimmer into starter/ is queued in OPEN_THREADS.
4. Mid-race corrected traces use one model (`correctedModel: 'tod'`); the six
   ORC boats' traces are ~4% high mid-race (endpoints exact). Options at the
   stop: per-boat dispatch in the shell race chart, or an ORC caption.

## 4. Zone-detection record (doctrine: detector proposes, the stop decides)

Race-median SOG 4.30 kt (grid); collapse threshold 2.15. Band medians (10 nm):
200-210: 2.4 · 190-200: 4.7 · 160-190: 6.5-7.7 · **150-160: 2.9 · 140-150: 2.0 ·
130-140: 2.3** · 120-130: 4.1 · 90-120: 5.9-6.25 · **80-90: 2.1** · 0-80:
5.0-6.1. No consecutive-band run passes both gates ⇒ detector returns none; the
authored Friday-park band (155–128) is a stage-2 human judgment for the owner to
confirm, and the Sound park is deliberately NOT a zone (spatially smeared;
handled by M5's cohort construction instead).

## 5. Open questions for the owner (the stage-2 stop)

1. Confirm the preliminary pins + snapshot ledger (decisions/stage-2-snapshot-ledger.yaml).
2. Adopt the authored park zone (155–128)? (adds parkFair + a canary pin)
3. Module picks/vetoes from M1–M6; which one leads the tier-3 story.
4. Milestone-chart reference: Katara56 (identical rating) is wired as default —
   confirm or switch to Zammermoos (division winner).
5. ORC mid-race trace handling: shell dispatch (small engine change) or caption.
6. The night-2 residual (−3.2 nm): spend stage-3 effort attributing it (current
   predictions along the LI shore vs mid-Sound), or park it as "unattributed"?
7. Events: prune the internal draft so the tier-2 layer (and M2's annotations)
   can land.
