# Contracts & templates

Boundary rule: **facts about the race → `config.yaml`; judgment about races → the skill; code → the repo.** Narrative content is data (`events.yaml`), never pipeline code.

## config.yaml — per-race facts

```yaml
race: { name: "", edition: 2026, organizer_url: "" }
tracker: { vendor: yb, path: raw/tracks.csv }        # vendor: auto → adapter detect()
official_results:
  path: raw/results.csv
  columns: { rank: , name: , sail: , rating: , elapsed: , corrected: , type: , finish_local: , division: }
entries: { path: raw/scratch.csv }                   # optional scratch sheet
course:
  type: point_to_point          # point_to_point | marks
  start: [lat, lon]
  finish: [lat, lon]
  official_length_nm: 635.1     # from official documents when available
  marks: []                     # ordered; required when type: marks
time:
  official_tz: America/New_York
  tz_probe:                     # REQUIRED — stage-0 verified, never assumed
    boat: ""
    official_finish_local: "YYYY-MM-DD HH:MM:SS"
    track_epoch_utc: 0
scoring:
  system: tot                   # tot | tod | custom
  params: {}                    # rating column, units, etc.
  probe_boats: ["", ""]         # official corrected must reproduce exactly before fleet math
start_method: finish_minus_elapsed   # finish_minus_elapsed | pursuit | staggered | custom (document it)
divisions_in_scope: []
client_boat: null               # null for Tier 1
reference_boats: []
name_overrides: {}              # per-race display/disambiguation (duplicate names → by sail number)
tier: 1                         # 1 | 2 | 3
grid_minutes: 15
zone_detection: { band_nm: 10, collapse_frac: 0.5, min_traversal_hours: 6 }
finish_spread: { window_min: 30, min_boats: 10 }
noise_floor_min: 30             # per-race; scoring-system dependent
modules: []                     # filled from CP-2
privacy: { default: private }
paths: { out_dir: out/ }
goldens:                        # frozen at CP-2; changing one requires a recorded user instruction
  tz_probe: { epoch: 0, rendered: "YYYY-MM-DD HH:MM" }
  endpoints: { ref: "", corrected_min: 0.0, elapsed_min: 0.0, pace_min_per_100: 0.0 }
  module_canaries: {}           # e.g. { park: { boat: "Gemini II", u4: "31%" } }
  finstrip_count: 0
```

## events.yaml — narrative as data

```yaml
- t: "2026-06-20 03:30"         # official-TZ local, naive string
  cat: crew                     # crew | systems | sail | tactics | insight | milestone
  label: ""
  txt: ""
  source: journal               # journal | navlog | transcript | analysis
  visibility: private           # private | public — public requires a CP-5 opt-in
```

## dashboard_data.json — canonical pipeline output

```
{
  start: [lat, lon], fin: [lat, lon],
  boats: { <displayName>: { t:[epochUTC...], lat:[], lon:[], dtf:[], xte:[], sog:[],
           meta: { grp, typ, sail, tcf, el:"4d 01:34:52", corr:"2d 10:00:43",
                   fin:"YYYY-MM-DD HH:MM:SS", sdl:<rank>, retireReason? } } },
  fleet: [ { name, lat:[], lon:[] } ],           // hourly ghost layer, all boats
  events: [ { t, cat, label, txt } ],            // from events.yaml, post privacy cut
  watches: [ [t0,t1], ... ],
  parkFair: { <name>: { enter, hrs, mean, u4, u2, xte } },
  recon: [ { t, matched_local, log:[lat,lon], trk:[lat,lon], d, speed, course, wind,
             temp, verdict: ok|warn|error, note } ],
  mil: { milestones:[...], series:{...} },
  stats: { dist_sailed, rhumb, extra, avg_sog, max_sog, pct_under3, pct_under5,
           max_xte_e, max_xte_w }
}
```

## Decision-record templates — `decisions/CP-*.yaml`

Emit as a fenced YAML block in chat, filled as a draft for the user to confirm or edit; the confirmed block is the artifact. When a repo exists, write confirmed records to `decisions/`.

```yaml
# CP-0 — Scope Record
fleet_count: 0
anomalies: []                   # every name-resolution miss, gap, duplicate
reference_boats: [ { name: "", why: "" } ]
tz: { official: "", probe: { boat: "", official_finish_local: "", track_epoch_utc: 0, offset: "" } }
course_model: point_to_point    # or marks (escalation trigger)
divisions_in_scope: []
tier: 1
grid_minutes: 15
scoring: { system: tot }
confirmed_by: ""                # user
date: ""
```

```yaml
# CP-2 — Findings & Modules Record
modules_selected: []
modules_vetoed: []
reference_set_confirmed: true
corrections: []                 # factual flags raised at review
goldens_frozen: true
pipeline_invocation: ""         # exact command that produced the shipped numbers
confirmed_by: ""
date: ""
```

```yaml
# CP-3 — Corrections Record
corrections:                    # may be empty, but the record must exist and say so
  - { before: "", after: "", source: "", propagated_to: [] }
spine_approved: true
confirmed_by: ""
date: ""
```

```yaml
# CP-4 — Screenshot Log
rounds: 0                       # minimum 1
defects:
  - { found: "", fix: "", assertion: "" }   # assertion: test id, or "not expressible"
approved_for_handoff: true
confirmed_by: ""
date: ""
```

```yaml
# CP-5 — Publication Ledger
public_items:                   # each log-derived item going public, individually opted in
  - { item: "", opted_in: true }
private_confirmed: true         # everything not listed stays private
regression: green
artifact: { hash: "", url: "" }
confirmed_by: ""
date: ""
```

## Findings-memo format (stage-2 output)

1. **Headline candidates** — for each: claim / evidence pointer (chart or values) / confidence / benchmark-dependence note.
2. **Proposed race-unique modules** — which heuristic fired, with its evidence.
3. **Data-quality anomalies.**
4. **Open questions** for the user.
5. The CP-2 form, ready to confirm.

## Discrepancy-register row (stage-3 output)

| claim | source | what the track shows | verdict | note |
Verdicts: confirmed / contradicted / partial / unresolvable.

## Claude Code PROMPT.md skeleton (stage-5 handoff)

```markdown
# <RACE> dashboard — productionize

## Context
<race, edition, tier, client boat, where the project stands, repo layout>

## Invariants — violating any of these is a failed handoff
- Timezone-naive rendering: chart x-values are naive local strings; never Date objects.
- Chart endpoints are exact official-results values.
- State-model conventions: <one state object, pure build*() re-renders, axis helpers>.
- The shell invariant list (shell/INVARIANTS.md, I1–I13) — I5–I13 govern productionization work.
- Golden values (frozen): <paste the config goldens block>.
- <anything added during CP-4 rounds>

## Do not touch
Golden values; dashboard_data.json semantics; module math.

## Jobs
Mobile breakpoints; lazy-loading; performance budget; hosting; accessibility.

## Protocol
Run `TZ=America/New_York node tests/test_dashboard.js <built.html>` BEFORE starting and
AFTER finishing — all green both times. Any newly human-caught defect becomes a new assertion.
```
