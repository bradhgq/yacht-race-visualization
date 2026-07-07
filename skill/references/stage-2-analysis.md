# Stage 2 — Analysis

Chat orchestrates; the pipeline executes. Default execution is the chat container. Execute in Claude Code **from the start** when an escalation trigger fires: fleet > ~150 boats, raw pings > ~1M, a marks course requiring new routed-DTF code, or a new tracker-vendor adapter (new code wants a real test loop). Requires the confirmed CP-0 record.

Prime rule 1 applies throughout: explore freely in ad-hoc code, but every number that ships re-derives through the repo pipeline against `config.yaml`, and the exact invocation is logged for the handoff.

## Pipeline steps (the repo implements these; this is the contract)

1. Vendor adapter → canonical `(boat_id, name, t_utc, lat, lon)` → regular grid at `grid_minutes`.
2. Derived channels: SOG (centered 30-minute window), distance-remaining (great-circle for point-to-point; routed along the course line for marks), XTE versus the rhumb/course line.
3. Start times per the config `start_method` (default: official finish − official elapsed).
4. **Scoring probe — must pass before any fleet math.** Reproduce at least two boats' official corrected times exactly (≤1 s rounding) with the configured scoring function. Time-on-time multiplies elapsed by a factor; time-on-distance subtracts rating × distance — but sign and unit conventions vary by system and region, so the probe, not the formula's plausibility, is the gate. `corrected(elapsed, boat, distance)` stays pluggable.
5. Milestone deltas versus each reference boat at 10-nm distance-remaining steps, corrected via the scoring function.
6. **Zone detection.** Compute fleet-median SOG per `band_nm` distance-remaining band. A candidate slow zone is a maximal run of bands where the median falls below `collapse_frac` × race-median SOG and the median boat's traversal of the run is ≥ `min_traversal_hours`. For each candidate zone, compute per-boat traversal metrics on **each boat's own crossing**: enter time, hours in zone, mean SOG, % under 4 kt, % under 2 kt, mean XTE. Wall-clock windows are forbidden for spatial phenomena (doctrine 1).
7. **Nav-log reconciliation** (when a log is supplied): match every log fix against the track; expect clock-base errors (the worked example's paper log ran UTC−5 against a UTC−4 race); classify rows ok / warn / error with distances and a note per row.
8. Finish-spread density (boats within `noise_floor_min` corrected of each other, in-division) and hypothetical-rank sensitivity.
9. **Validation suite — all must pass before the findings memo ships:**
   - every selection-set name exists in the data keys;
   - chart endpoint deltas equal official results within tolerance, in both scoring modes;
   - the timezone probe renders correctly under a non-UTC `TZ` environment;
   - the zone-module canary matches its frozen golden (when the module is active);
   - the distance-remaining chart never plots distance on both axes.
10. **Freeze goldens** (first full run only): tz probe, endpoint deltas versus the primary reference, module canaries, finish-strip count. Write them into `config.yaml goldens:`. From this point they are fixtures (prime rule 3) — regenerate only on explicit, recorded user instruction.

## Output — findings memo (format in `schemas.md`)

Candidate insights (each with claim, evidence pointer, confidence, and a benchmark-dependence note), proposed race-unique modules with the detection heuristic that fired and its evidence, data-quality anomalies, and open questions for the user.

## CP-2 Findings & Modules Record — hard stop

The user picks/vetoes modules, confirms the reference set, flags factual corrections, and confirms the goldens are frozen. Emit the CP-2 template and **end the turn**. This checkpoint exists because human eyes on candidate findings is where fixed-window-class artifacts die — do not compress it, at any tier.
