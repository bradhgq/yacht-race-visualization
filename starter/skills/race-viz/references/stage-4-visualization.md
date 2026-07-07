# Stage 4 — Visualization

Runs in chat — this stage **is** the screenshot loop, and the loop is the quality engine. Requires the confirmed CP-3 record and the CP-2 module list.

## The core five (always render)

1. **The Course** — lat/lon tracks, rhumb or course line, hourly fleet ghosts, phase labels with leader lines, event pins.
2. **The Race** — distance-remaining vs time, compact and introductory, with phase divides.
3. **Where the Race Was Won and Lost** — milestone deltas versus a selectable reference boat; handicap/elapsed toggle; Pace (min/100 nm) vs Total toggle; events overlaid; endpoints taken exactly from official results.
4. **Distance/Speed pair** — XTE and SOG on a shared, central time↔distance axis toggle.
5. **Race Log table** — every event, categorized, with position.

## Race-unique modules (1–3 per race, chosen at CP-2 — this is where the differentiating insight lives)

| Module | Detection heuristic (defaults; provisional — calibrated on one race) |
|---|---|
| Slow-zone / park table | the stage-2 zone-detection heuristic fires |
| Finish-spread strip | ≥ `min_boats` (10) finish within `noise_floor_min` (30) corrected, in-division |
| Nav-log reconciliation | a paper or electronic log was supplied |
| Current / tidal-gate analysis | the course crosses a documented current or gate AND crossing timing/geometry varies materially across the fleet |
| Two-boat duel panel | two boats within ~15 min at ≥10 consecutive milestones |
| Watch-performance split | a watch schedule was supplied (client data — private by default) |
| Squall / system crossing | evidence of a **moving** slowdown propagating through the fleet — requires a moving-frame metric, not a fixed band; treat as advanced and budget extra validation |

Propose modules from the heuristics; the user disposes at CP-2. Vetoed modules stay vetoed.

## Build protocol

- Template and state-model conventions come from the starter repo; data injects at the placeholder via the assemble step.
- v0 reality: until the shell/module split lands (REPO_SPEC, SEAM 1), the template **is** the worked example — race-unique DOM sections, copy blocks, and the client-boat key get hand-edited per race (duplicate-and-edit). Do not promise a neutral shell that doesn't exist yet.
- All chart x-values are timezone-naive local strings; never hand Date objects to the plotting layer (doctrine 3).
- Run the regression suite on every build, under a non-UTC `TZ`.

## Screenshot loop (first-class, scheduled — not "iteration if needed")

- Expect 2–4 rounds; **minimum 1 before handoff**. Each round: user screenshots + verbal notes → fixes → rebuild → suite.
- Every human-caught defect gets (a) fixed and (b) captured as a regression assertion when expressible (prime rule 5). Log the defect→assertion mapping in the CP-4 record.
- Aesthetic calls are conversation, not unilateral taste: when the decision is design rather than correctness, present options.
- Copy discipline: propose microcopy freely (labels, errors, empty states, tap notes) — never author analysis claims; those come only from synthesis and the user.

## Public cut (Tier 2 → any public artifact)

Strip private-log candor by default; re-admit items only with per-item opt-in (recorded in the CP-5 ledger). Events carry a `visibility` field in `events.yaml` — the cut itself is mechanical; the opt-ins are human decisions.

## CP-4 Screenshot Log — hard stop

Round count, the defect→assertion table, and the user's approval to hand off. Emit the template and **end the turn**.
