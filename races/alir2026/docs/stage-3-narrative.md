# ALIR 2026 — Stage-3 Narrative Pack (DRAFT for the corrections stop)

Built on the stage-0 REDO data (all 52 ALI boats resolved) and the stage-1/2
records. Confidence labels: **[fact]** verified-fact (pipeline/official/observed) ·
**[recall]** participant recollection · **[testimony]** third-party account ·
**[inference]** analysis judgment. Visual form of the acts and case studies: the
module storyboard (session artifact); machine data: `out/dashboard_data.json`.

## 1. The acts (each boundary is a data divide)

1. **The harbor** (gun → Ambrose R"14", 13:55–16:55 Thu) — boundary: the turn east
   at the course's one mandatory mark. [fact]
2. **The evening reach** (16:55–23:00 Thu) — boundary: fleet-median VMC collapses
   below half the race median as Thursday's gradient dies. Max is the fastest boat
   of the 40 within her water. [fact]
3. **Night one** (23:00 Thu – 04:00 Fri) — boundary at 23:00: Katara56's offshore
   peel begins, the cluster's lanes split. Max last of 11 spatial peers. [fact]
4. **The dawn park** (04:00–12:00 Fri) — boundary at 08:00 inside the act: the
   observed cross-shore wind gradient flips offshore (44065−44069). [fact, with
   the bay-station caveat on magnitudes]
5. **The rebuild and the corner** (12:00–20:35 Fri) — boundary: sea breeze arrival
   observed inshore (44069, 120–150° building) ~12:00; act ends at Max's Plum Gut
   passage ~90 min before predicted peak ebb. Max fastest of her cohort. [fact]
6. **The Sound night** (20:35 Fri – 04:00 Sat) — boundary: the western-Sound
   collapse observed at KPTN6 (10 kn → 1.4 kn by 23:00). Entry order through the
   Gut, not Sound side, orders the outcomes. [fact]
7. **The Saturday run** (04:00 – finish) — boundary: KPTN6's easterly rebuild from
   070° after 01:00 reaching the mid-Sound fleet ~02:30–04:00. Max sails it alone,
   no boat within 3 nm. [fact]

## 2. Loss decompositions (doctrine 5 — each names its benchmark; gate-based,
##    summing to the official elapsed delta)

Gate times are each boat's own crossing of the same distance-to-finish gate, so
these tables compare the same WATER at possibly different TIMES — the honest
same-instant view is the phase table in the findings memo; this form is the one
that reconciles to official numbers. Both are shown because they answer
different questions.

### vs Katara56 (X-56, IDENTICAL −18 rating) — official delta +171.3 min elapsed,
### +171.3 min corrected, ON THE AMENDED RESULTS (the RC corrected Max's finish to
### 11:57:18; equal gaps by construction; each boat's own corrected is elapsed + 62:06)

| segment (course gates) | Max lost/gained | running |
|---|---|---|
| start → Red 14 | −13.0 min | −13.0 |
| Red 14 → night falls (148 nm) | −28.0 | −41.0 |
| night falls → dawn (141) | −8.5 | −49.5 |
| dawn → park exit (129) | **+273.4** | +224.0 |
| park exit → Montauk approach (95) | −177.0 | +47.0 |
| Montauk approach → Plum Gut (66) | +34.1 | +81.1 |
| Plum Gut → mid-Sound (48) | **+261.5** | +342.6 |
| mid-Sound → final approach (15) | −162.5 | +180.1 |
| final approach → finish | −8.7 | **+171.4** |
| **reconciliation vs official** | | **+171.3 (residual −0.1)** |

Reading [inference]: the two "+260/+270" segments are the same water crossed in
different wind — Max crossed the park water while parked and the Sound-east water
during the Friday-night collapse; Katara56 crossed each in breeze she reached by
being positioned better in the PRECEDING act. The negative segments are the
mirror image (Max recrossing in the rebuilt breeze). That is why the same-instant
phase table, not this table, carries the "where was it decided" claim — and both
agree on the answer.

### vs Zammermoos (ClubSwan 42, −15; the division winner) — official delta
### +329.1 min elapsed (amended); corrected +339.4 = elapsed + 3 s/mi × 207 nm (+10.35)

| segment | Max lost/gained | running |
|---|---|---|
| start → Red 14 | +17.7 | +17.7 |
| Red 14 → night falls | +17.2 | +34.9 |
| night falls → dawn | **+157.4** | +192.3 |
| dawn → park exit | **+121.6** | +313.9 |
| park exit → Montauk approach | −183.7 | +130.2 |
| Montauk approach → Plum Gut | +39.6 | +169.8 |
| Plum Gut → mid-Sound | **+298.5** | +468.3 |
| mid-Sound → final approach | −128.0 | +340.3 |
| final approach → finish | −14.4 | +325.9 |
| **reconciliation vs official** | | **+329.1 (residual +3.2, gate interpolation)** |

Different benchmark, different story [inference]: against Zammermoos the damage
starts a segment earlier — she crossed the night-one water before it died (she was
simply ahead), which the gate form books as a night-one loss. The two tables
bracket the truth the phase table states plainly: the fleet's outcomes were set
by who reached which water before each shutdown.

## 3. Discrepancy register (stage-1 claims + the owner's accounts vs the track)

| claim | source | track says | verdict |
|---|---|---|---|
| "Not great choices on the first night" | owner [recall] | Night one cost ~1.5 nm directly (11/11 among peers) and set up the −9.7 nm dawn window — the choice mattered, mostly through its consequence | **partial → refined**: the owner's own reframing ("positioned ourselves to lose at the build") is the supported form |
| K56 went offshore night 1, we didn't | owner [recall] | 2.5→9.7 nm off between 23:00–02:00 vs Max ~6 then back inshore | **confirmed** |
| "Caught a lot of boats" on the reach | owner [recall] | 14 boats ahead at Red 14 → 3 at 23:00; rank 1/40 among water peers | **confirmed** |
| More wind on the CT side that night (worth crossing?) | owner [recall], undecided aboard | Side signal null in the entry cohort (partial +0.07); entry order carried it | **contradicted as a decisive factor** (the debated choice wasn't the decisive one) |
| ~2.8 kt adverse past the Plums | owner [recall] | CO-OPS predicted −2.16 kt at Max's 21:40 position, peak −2.36 at 22:06 (prediction class) | **corroborated** (prediction slightly under the felt set) |
| 10 crew-log weather claims | owner [recall] | see stage-1 brief §6 table | **corroborated** on every observable; 3 claims model-scoped only (coverage gaps) |
| USCG LNM: ~70-vessel fleet | primary [fact] | 53 starters | pre-race planning figure; not a discrepancy in results |
| Navy repeat of 2025 line honors | organizer framing [testimony] | Zammermoos first home 06:28:13 Sat; Poseidon second | **contradicted** (provisional) |
| WindCheck "two courses first time" headline | unread source [testimony] | article dates to the 2025 edition | excluded from 2026 narrative |
| Official finish 12:38:03 for Max | official [fact] vs owner [recall] + tracker | line marker + crossing 11:57:24 | **RESOLVED — official AMENDED to 11:57:18** (third fetch), six seconds from the marker; DUET/MARIE/Ripple gaps remain open |

## 4. Case studies (ordered by lesson value)

1. **The half-commitment** (night 1). The cluster's lanes split at 23:00. Full
   commitment offshore (Katara56, Lioness, Della Aurora) bought the dawn gradient;
   staying in (Crocodile) at least bought the land breeze; halfway (Max, Beagle)
   bought neither. The two halfway boats posted the two worst dawn runs in the
   cluster. [fact for the outcomes; inference for the framing]
2. **The forecast split** (Thursday evening). HRRR d1: NE fill 9.4 kn by 08:00 —
   direction verified, pressure +60%. ECMWF d1: park continues — pressure right,
   trend wrong. The navigator's log read HRRR correctly [recall]; the models
   disagreed on the decision variable itself. Lesson: when models disagree on the
   variable you'd act on, the disagreement IS the forecast. [inference]
3. **The compounding gate** (Friday evening). Plum Gut passage order 18:30–22:30
   maps almost monotonically onto night-2 progress; the new easterly reached the
   leaders first. Being 90 min later at the gate cost hours, not minutes. [fact]
4. **The boat you brought** (whole race). Largest powered/light split in the
   fleet (49-boat clock-window basis, corrected at stage 4 — the earlier 27-boat
   panel silently excluded pre-noon finishers): powered #4, light #35, a 31-place
   swing. The same crew sailing the same boat was
   simultaneously the fleet's best and nearly its worst, sorted purely by wind
   band. Any lessons drawn must survive this base rate. [fact]

## 5. Lessons (team-facing cut)

1. In a forecast-split light-air race, position for the model whose error mode
   you can afford: HRRR being wrong cost boats that trusted it ~nothing at dawn;
   ECMWF being wrong cost the beach-huggers the morning.
2. Half-commitment on a positional bet pays neither side's return. If the crew
   names the right side at 04:25, the review question is what would have made
   committing three hours earlier feel affordable.
3. Gates compound in stop-start races: a gap at a tidal gate is repriced by the
   next wind arrival. Passage order at Plum Gut was worth more than any Sound-side
   choice made after it.
4. Know the boat's phase signature before assigning credit or blame: this hull
   converts pressure to rank like nothing else in the fleet, and gives it back in
   glass. Crew both to its strength (send it in the powered phases — they did)
   and against its weakness (buy position for the parks earlier than feels
   necessary).
5. The log habit paid: every observable claim in it verified within ~1 kn. Trust
   the log's observations; audit only its self-blame. [inference from §3]

## 6. Standing corrections owned in this pack

- The stage-0 "night 1 was fine / dead level at 04:00" aggregate is RETIRED — an
  aggregation artifact the owner caught; the phase table replaces it.
- "Corrected = elapsed" phrasing for the Max–Katara56 pair is RETIRED — the GAPS
  are equal; each boat's absolute corrected is elapsed + 62:06 (owner correction,
  propagated to config/fixture comments and copy).
- "Time limit noon Sunday" is RETIRED — the SI line is a notification duty;
  Sunday-afternoon finishers scored AOK (stage-0 redo ledger).
- The stage-0 h3 ("CT side paid") is RETIRED (stage-2 F3) and its burial is shown
  visually (storyboard M5).
