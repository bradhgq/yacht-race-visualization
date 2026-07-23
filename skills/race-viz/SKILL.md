---
name: race-viz
description: Turn yacht-race tracker data plus supporting documents into researched race analysis, quantitative insights, and an interactive dashboard through a staged pipeline with owner stops. Use this skill whenever the user provides a race tracker export (YB, Kattack, TracTrac, PredictWind, or similar), a scratch sheet or entry list, official race results, crew journals, or navigation logs — or asks for race analysis, a race debrief, a race dashboard or visualization, post-race commentary, "how did we do," "where did we win or lose the race," a race blog / story site, or to kick off / run race-viz on a race. Also use when resuming any stage of an existing race-viz project, or when the user provides a YB Tracking or YachtScoring race link or event id to pull data from — even if the user doesn't name the skill.
---

# race-viz — staged race analysis and visualization

Produces one of three tiers, each a strict superset of the previous:

- **Tier 1 — Fleet commentary** (public data only): fleet-level analysis page — course/fleet map, leaders' race shape, phase structure, notable duels, 1–2 race-unique metrics.
- **Tier 2 — Boat-annotated debrief** (client logs): Tier 1 plus the client boat highlighted, log events pinned to the track, log↔tracker reconciliation, benchmark comparisons, and a private debrief document.
- **Tier 3 — Story site**: Tier 2 plus a narrative post with embedded visualizations, productionized and hosted.

Worked examples in this monorepo: RAGANA / Newport Bermuda 2026 (`races/nb2026/` — point-to-point, the original) and Ragana / Block Island Race 2026 (`races/bir2026/` — marks course with routed distance-remaining, division-scoped scoring, race postprocess). Their numbers are settled pinned values — never re-derive or "correct" them.

## Vocabulary

- **Stage / stage stop** — the pipeline is six stages; each ends at a stop where the owner reviews before anything further runs.
- **Stage record** — the confirmed decision file a stop produces (`races/<race>/decisions/stage-N-*.yaml`; older races carry `CP-*.yaml` names — same thing, historical).
- **Pinned values** — the hand-pinned expected numbers (official endpoints, tz probe, counts) in config `pinned_values:` and `tests/regression.json`; the harness asserts them on every build.
- **Snapshot reference** — `races/<race>/snapshot/dashboard_data.json`, the byte-pinned payload; the build chain's **snapshot compare** diffs every rebuild against it (tie-exempt).
- **Doctrine checks** — the enforceable process rules below; each was paid for with a real bug.

## Environment

Claude Code, in this monorepo, runs everything — stage 0 (acquisition) through stage 5 (publication). State lives in the repo: `config.yaml`, `events.yaml`, `decisions/`, the build outputs. Chat appears exactly once in the process: as stage 1's optional owner-run deep-research input.

## The stop mechanic

At every stage stop:

1. Write the stage's deliverables as **clickable artifacts** — rendered pages, memos as HTML, built dashboards.
2. **Host them on a temporary localhost preview** (session-scoped side products, never committed — screenshots are never committed anywhere, not in `docs/`, not in PR bodies).
3. **Enter plan mode for the next stage**, so the owner's comments land before anything runs. Degrade to present-inline-and-wait where preview or plan mode is unavailable.

A missing stage record is a missing input, not an invitation to proceed: never begin the next stage's artifacts in the same turn that presents a stop — even when asked to "run the whole thing."

## Prime rules

1. **Exploration is free; shipped numbers come only from the pipeline.** Every number that lands in a findings memo, synthesis document, or `dashboard_data.json` is produced by the one-command chain — `.venv/bin/python starter/build_race.py races/<race>` — with the exact invocation logged in the stage record.
2. **Stage records are input dependencies.** Each stage requires the previous stop's confirmed record as a literal input (templates in `references/schemas.md`).
3. **Pinned once, then fixtures** (I16). At the stage-2 stop each race pins its expected values from official results plus one hand-verified probe; after that they are fixtures. Changing a pinned value — or the snapshot reference — requires an explicit owner instruction captured in a `decisions/` ledger entry; the re-pin and its rationale live in that record, never silently in a rebuild.
4. **Privacy: what the dashboard doesn't show is discarded.** Private inputs (crew journals, nav logs, transcripts) never enter the repo; anything derived from them ships only by a case-by-case human decision, flagged at the stage stop. Never publish claims about *other* boats' crew decisions beyond their own public statements.
5. **Every human-caught correction becomes a regression assertion** (where expressible) before stage 5 ships. The test suite is the accumulated memory of owner review.

## Stage router

Read the stage's reference file before executing it; do not load stage files ahead of need.

| Stage | Read first | Needs | Stop & deliverable |
|---|---|---|---|
| 0 Acquisition, intake & scope | `references/stage-0-acquisition.md` | raw inputs and/or race identifiers | **hard** · scope record — manifest, fleet parse, TZ probe, draft `config.yaml` |
| 1 Research | `references/stage-1-research.md` | stage-0 record | soft · research brief + claims-in-circulation list |
| 2 Analysis | `references/stage-2-analysis.md` | stage-0 record | **hard** · findings memo + module list + pinned values |
| 3 Synthesis | `references/stage-3-synthesis.md` | stage-2 record (+ research brief) | **hard** · corrections record over the narrative pack |
| 4 Visualization | `references/stage-4-visualization.md` | stage-3 record + module list | **hard** · review-round log — hosted build, ≥1 owner round |
| 5 Productionize & publish | `references/stage-5-handoff.md` | stage-4 record + green suite | publication ledger — public cut, live build |

**Tier relaxation:** Tier 1 may merge stage 3's stop into stage 2's, and stage 5's ledger into stage 4's sign-off. Stage 0, stage 2, and stage 4's minimum one review round are mandatory at every tier — stage 2 is where fixed-window-class artifacts get caught by human eyes.

**Resuming mid-project:** locate the latest confirmed record in `decisions/`, enter at the following stage. Never skip past a missing stage-0 or stage-2 record.

## Doctrine checks

Enforce these as testable predicates, not advice.

1. **Spatial phenomena → spatial metrics.** Any slow-zone / current-gate / park metric is computed over each boat's own traversal of the same distance-remaining or geographic band — never a wall-clock window. Check: stage-2 validation plus a module canary assertion in the harness. (Origin: the Gemini II "0% parked" artifact.)
2. **Endpoints come from official results.** Comparative charts end at values parsed from official elapsed/corrected; tracker-derived milestones are estimates only. Check: endpoint assertions against official results, in both scoring modes. (Origin: a DTF-20 truncation that flipped finish signs for three boats.)
3. **One verified time base, rendered timezone-naive.** Timezone verified at stage 0 by triangulating an official finish against the track; all chart x-values are naive local strings — never Date objects; the suite runs under both a non-UTC `TZ` and `TZ=UTC`. Expect participant logs to carry clock-base errors and reconcile them explicitly. Check: the tz-probe assertion.
4. **Names are dirty.** Normalize whitespace and Unicode early; disambiguate duplicate names by sail number; resolve syndicate-vs-boat-name mismatches with the user. Check: assertion that every selection-set name exists in the data keys.
5. **Loss decomposition is benchmark-dependent.** Every "lost X here" claim names its reference boat and shows arithmetic that reconciles to the official delta. Check: stage-3 sum-check on every decomposition table.
6. **Corrected margins have a noise floor** (`noise_floor_min` in config, default 30). Margins under the floor are narrated as scoring noise, and the stage-1 scoring-controversy check is mandatory before narrating any tight margin. Check: stage-3 language check.
7. **Test the stakeholder's hypothesis before building their view.** When a request arrives bundled with a claim ("show that we gained because we sailed shorter"), verify the claim against the tracker first — minutes of work — then ship the view with the verdict in its caption, whichever way it lands. A view built to confirm a wrong hypothesis is a printed error. Check: the caption of any stakeholder-requested view names the verdict. (Origin: round 2's shorter-routing hypothesis — the data reversed it; the gain was boatspeed, and the shipped caption says so.)
8. **Buy the cheapest sufficient view.** Restate every visualization request as the question it answers; if a cheaper existing surface answers it, ship that and record the deferral with rationale in `decisions/` — deferred-with-reason keeps stakeholder trust, silently dropped requests don't. Check: every deferred request has a `decisions/` entry. (Origin: a sailed-distance x-axis, near-degenerate with the DTF axis; a y-metric toggle + one scatter answered the real question at a fraction of the cost.)

Soft doctrines: **show the arithmetic** (every derived number traceable in-document) and **primary sources beat aggregators** (official notices and transcripts over press summaries; press for corroboration).

## Contracts

All formats live in `references/schemas.md`: `config.yaml`, `events.yaml`, `dashboard_data.json`, the stage-record templates, the findings-memo and discrepancy-register formats, and the stage-5 productionization checklist. This skill defines process and judgment; the starter repo defines code; `config.yaml` defines the race.

Monorepo: `github:bradhgq/yacht-race-visualization` (public). `starter/` holds the engine (shell, pipeline, adapters, acquisition, tests, the copy-me `template/`); `races/<race>/` holds each race's config + data + committed `dist/` (which is production); `docs/OPEN_THREADS.md` is the only living log. A race kicks off as a session in this repo — stage 0 carries the checklist; no kickoff template exists.
