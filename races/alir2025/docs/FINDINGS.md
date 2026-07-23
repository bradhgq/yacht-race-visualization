# ALIR 2025 — Stage-2 Findings Memo

Pipeline invocation for every shipped number:
`.venv/bin/python starter/build_race.py races/alir2025` (chain green, 13/13 under
both TZs; probe: Max 0.0 s, Daffodil 0.0 s error). Exploration beyond the payload is
marked as such. Dual-focus doctrine applies throughout: Daffodil and Max are narrated
in parallel, never against each other.

---

## 1. Headline candidates

**H1 — Three boats beat the weather; Max was the last of them. CONFIRMED, high.**
When the squall line entered the western Sound (15:36 EDT Friday, Kings Point onset),
exactly three boats had finished: Wahoo (12:26), Avalanche (14:11), **Max (14:15) — by
80 minutes**. The next four (Cougar, Acadia, Habiru YCC, Ohana) were 3–6 nm from the
line and took the squall, then the dying breeze, in their final miles. Evidence:
payload DTF at 15:36 EDT per boat. Benchmark-dependence: none — this is a clock fact.
*Caption discipline: Max's 4:05 corrected margin over Phantom is inside the 10-min
noise floor and is never narrated as sailed superiority; the honest claim is the exit
before the door closed. The counterweight is real and ships with it: the boats behind
got squall pressure Max never saw (C6: for Daffodil it was "a very needed push").*

**H3 — The door closed at ~5 pm Friday and reopened Saturday morning. CONFIRMED, high.**
Time to cover the final 15 nm, by when a boat entered them (payload DTF traversal):
entries before 14:00 Friday → 2.2–3.2 h (Max 2.5, Habiru 3.2). Entries 14:30–21:30
Friday → 4.5–6.7 h, worst 6.65 h. Entries after midnight → back to 3.7–4.7 h.
**Daffodil entered at 14:30 Friday, 2¾ h behind Max, and took 5.78 h** — the door
swung shut between them. This kills the "spatial park zone" framing: the zone detector
correctly proposes nothing (no distance band's fleet median collapses, race-median
5.97 kt), because the same water was fast at noon and dead at 22:00. The park was a
closing door in time, not a place. Doctrine 1 is satisfied by construction — each
boat's own traversal clock.

**H4 — Daffodil's reach was real: 4th of 43 through the ocean leg. CONFIRMED, high.**
Traversal of DTF 190→95 (R14 to the Montauk approach): Avalanche 7.75 h, **Max 8.00,
Wahoo 8.00, Daffodil 8.25** — then Habiru 9.00 and everyone else ≥9.25; fleet median
12.00 h. A 31-ft trimaran holding the pace of three 40–50-ft flyers, 3.75 h faster
than the fleet median, is the "built for this" claim confirmed. Benchmark: the whole
fleet's own traversals of the same band.

**H5 — "I sailed too low / too far north" — PARTIALLY CONTRADICTED, medium.**
On the night leg Montauk→Plum Gut (DTF 88→70, entered 23:45 Thursday): Daffodil
sailed ~18.4 nm against the fleet-median ~17.0 on an 18.0 nm leg — about 1.4 nm
(~14 min at her leg speed) of extra distance, mean cross-track 0.66 nm north of the
leg line. But **Max sailed the same leg with a LARGER mean northerly offset (1.02 nm,
peaking 2.4)** and Habiru matched Daffodil's 0.66. Verdict: the northerly bow-down
was real but modest, and the class leaders did the same or more. The recollected sin
does not survive as a decisive loss; the door (H3), not the night leg, is where
Daffodil's finish time went. *Owner's hypothesis, tested per doctrine 7; verdict
ships in the caption whichever chart displays this leg.*

**H6 — The Sound's Great / Towhee split is real. CONFIRMED, high.**
Across the central Sound (lon −73.3..−72.6), Sound's Great held mean lat 41.048
(Long Island shore); Towhee 41.123 (Connecticut side) — ~4.5 nm apart, exactly as
Lenoble described. The *causal* half of C9 (Towhee's halyard breakage deciding the
division) stays testimony — a track cannot see a halyard.

**H2 — The squall propagated west→east across the fleet. SUPPORTED, medium-low.**
Per-boat maximum SOG step inside 14:30–18:30 EDT Friday orders loosely by longitude
(western boats 15:45–16:30, eastern 17:30–18:15; fitted drift eastward), matching the
NWS line timing. But the signal is weak: 5-min pings cannot resolve a 2-min squall,
and the strongest responders were dousing sail (Daffodil's own step is just +1.3 kt
for exactly that reason). A per-boat "the squall hit X at HH:MM" table would
overclaim. Module recommendation below reflects this.

**H7 — Where the seven retirements ended (facts only, causes unknowable).**
Scarlett: Thu 14:55, off the Rockaways (earliest, before the reach). Ricky Bobby:
Fri 11:45, eastern Sound. Kitli: Fri 15:30 entering the Sound — right at squall
onset. Vamonos: Sat 02:45, ~5 nm from the finish, then a mooring. **Nereus (Sat
03:35) and PATHFINDER (Sat 05:25) reached the finish area yet are scored RET** —
the results say RET, the track shows the harbor; we ship the scoring, note the
anomaly, and assert no cause (C7's dismasting hearsay stays unsourced).

## 2. Proposed race-unique modules (owner picks/vetoes at this stop)

1. **`door` — the closing door (RECOMMEND).** Scatter: x = when the boat entered the
   final 15 nm, y = hours to cross them; hero/focus/spotlight highlighted, squall
   band and park night shaded. This is H1+H3 in one picture and the race's
   differentiating insight. Custom module (registerModule), data via a small
   postprocess step; canary: Daffodil (enter 14:30 EDT Fri, 5.78 h).
2. **`squall` — as an OVERLAY, not a per-boat claim (RECOMMEND, reduced scope).**
   Verified station gust timeline (KPTN6 24.5 kt 15:36 → 44065 31.9 kt 16:40 →
   44025 23.5 kt 17:30) drawn as map/time annotations, plus the two eyewitness
   accounts as events. The full moving-frame per-boat crossing analysis is the
   skill's "advanced, budget extra validation" case — H2's signal doesn't yet
   support it; propose deferring it (decisions/ entry if vetoed permanently).
3. **Unified-ladder rank strip (RECOMMEND as presentation, not module).** The
   owner-approved unofficial cross-circle ladder (Daffodil 30/43) likely needs only
   the existing ranked list scoped to the unified scale + an "unofficial" caption —
   cheapest sufficient view (doctrine 8). Resolves the three-boats-ranked-#1 issue.
   VETO CANDIDATE: a Daffodil-vs-Max anything — excluded by narrative_framing.

## 3. Data-quality anomalies (new at stage 2)

- **Ricky Bobby's tracker drove home down Long Island at ~60 kt** on Saturday toward
  the finish, defeating the min-DTF trim rule for retirees; fixed with two added
  cuts (sustained-stationary ≥3 h; vehicle-speed >25 kt). trim_tracks.py updated;
  re-trimmed 21,666→21,185 rows; fleet max SOG fell 56.9→14.0 kt (Avalanche,
  plausible).
- **Scarlett ships no fleet ghost** (49 racing pings < `fleet.min_points` after
  hourly resample) — she appears in per-boat views only. Recorded, not fixed.
- **Two engine generalizations were required by this race** (both landed in
  `starter/`, all three races' chains green, nb/bir snapshots identical):
  (a) the race chart's corrected view assumed time-on-time; ALIR is the first ToD
  race, so `race.correctedModel: 'tod'` now subtracts (rating − refRating) × distance
  done (`shell/app/charts/race.js`); (b) the finstrip harness check now skips when
  `finstrip_count` is 0 — ALIR's largest in-division finish cluster is 3 boats, so
  the finish-spread heuristic legitimately never fires.
- 5-min ping cadence under-resolves the ~2-min squall (limits H2 forever).

## 4. Open questions for the owner

1. Module picks/vetoes above — especially whether the squall stays overlay-scope.
2. Pinned values + snapshot: confirm the pins (config `pinned_values` +
   `tests/regression.json`, derivations in its `_comment`) and authorize freezing
   `snapshot/dashboard_data.json` from this build.
3. H5's verdict contradicts your recollection in an interesting way — comfortable
   shipping "the night leg was fine; the door was the story"?
4. Phases for the charts (stage 3/4): proposed acts = Harbor & ocean reach /
   Montauk corner / the Sound & the squall / the door. Naming welcome.

## 5. Stage-2 record (draft — confirm to proceed)

```yaml
# stage-2 — Findings & Modules Record — ALIR 2025 — DRAFT
modules_selected: [door, squall_overlay, unified_ladder_presentation]   # owner edits
modules_vetoed: [squall_moving_frame_per_boat (deferred), any hero-vs-focus duel (framing)]
reference_set_confirmed: true    # Max, Habiru YCC, Wahoo, Phantom, Dolcezza (+ SG/Towhee as story)
corrections: []
values_pinned: true              # config pinned_values == tests/regression.json; snapshot frozen on confirm
pipeline_invocation: ".venv/bin/python starter/build_race.py races/alir2025"
confirmed_by: ""
date: ""
```
