# Stage 0 — Intake & scope

Goal: a confirmed manifest, a parsed fleet, a verified time base, and a draft `config.yaml` — before any analysis runs. Runs in chat.

## Input manifest

**Required (Tier 1 floor):**
- Tracker export, any vendor (YB, Kattack, TracTrac, PredictWind, other). If the vendor is unrecognized, an adapter to the canonical schema gets written and recorded before anything else consumes the data — and writing a new adapter is an escalation trigger to Claude Code.
- Scratch sheet / entry list with ratings.
- Official results: elapsed + corrected + rank, per division.
- Race name and edition; course description (point-to-point endpoints, or an ordered mark list); the organizer's claimed official timezone.

**Optional — each raises what's possible:**
- Crew journal → events layer; enables Tier 2.
- Nav log (photo or transcription) → reconciliation module; enables Tier 2.
- Pre-race weather brief / routing notes → phase attribution evidence.
- Broadcast or interview transcripts → primary research sources.
- Client boat + comparison boats of interest → benchmark set.
- Watch schedule → watch-split module candidate.

Determine **tier** from inputs plus user intent — never assume. If the user's intent implies a tier the inputs can't support, say what's missing and what tier the current inputs do support.

## Procedures

1. **Vendor → canonical schema.** Map the export to `(boat_id, name, t_utc, lat, lon)`. Record ping-cadence statistics and gaps; choose `grid_minutes` (default 15; justify deviations in the CP-0 record).
2. **Name normalization.** Trim and collapse whitespace; Unicode-normalize keys while preserving display diacritics; detect duplicate names and disambiguate by sail number (display as "Name SAIL"); resolve syndicate-vs-boat-name mismatches with the user. Emit an anomalies list. Never silently drop a boat — a name-resolution miss is an anomaly, not a filter.
3. **Timezone verification.** Take one boat's official finish time, find its track crossing of the finish line, and compute the offset. Record the probe (boat, official local time, track epoch, offset). If the probe disagrees with the claimed timezone, stop and resolve before proceeding. Never assume DST behavior; never trust the claimed timezone without the probe.
4. **Course model.** Point-to-point → great-circle distance-to-finish spine. Marks → routed distance-remaining along the course line (new code; escalation trigger to Claude Code). Record the official course length from race documents when available, rather than a computed guess.
5. **Division scoping.** Corrected times are never mixed across scoring divisions. Record which division(s) are in scope and which results columns apply to each.
6. **Start-time derivation.** Default method: official finish − official elapsed. Pursuit starts, staggered multi-day starts, and shortened courses break this — verify the method against the notice of race and record it in config as `start_method`.
7. **Draft `config.yaml`** (schema in `schemas.md`) carrying everything above.

## CP-0 Scope Record — hard stop

Emit the filled CP-0 template (see `schemas.md`): fleet count + anomalies, proposed reference boats with a one-line rationale each, verified timezone + probe, course model, division scope, tier, grid cadence, scoring system + params. Ask for confirmation or edits. **End the turn.** Stages 1+ require the confirmed record as input.
