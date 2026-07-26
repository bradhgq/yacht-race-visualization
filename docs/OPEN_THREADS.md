# OPEN_THREADS — the repo's only living log

Everything open, undecided, or to-do lives here; nothing else does (owner
doctrine, 2026-07-16/23: compact, don't append — when a thread closes, delete
it; when a decision becomes a rule, encode it in CLAUDE.md, the skill,
INVARIANTS.md, or a code comment and delete it here. Git history is the
archive; the pre-merge REPO_NOTES/DOC_GAPS ledgers end at this file's
introduction).

- **decyb license** (YB binary decoder port): no declared license upstream;
  owner-adjudicated fine for this personal/non-commercial use with author
  attribution. Revisit before any commercial use — terms from the author, or
  cleanroom-reimplement from `starter/acquisition/README.md`'s byte-layout
  notes. (2026-07-08)
- **`docs/OPINIONS_NB/` deletion**: executes when main is next merged into
  the `nb2026-opinions` branch (PR #1); `verdict_mobile.png` can go
  immediately (nothing references it).
- **Finish-line coordinate provenance (NB2026)**: footer copy says
  "triangulated from six boats' official finish times" but no document
  records which six or the method; coordinates were taken from legacy code as
  given. Needs owner input (or a re-derivation exercise) to close.
- **consistency_check covers only the NB-shaped pinned keys** (review,
  2026-07-23): `starter/shell/build.py` cross-checks tz_probe, the three
  endpoint keys, and `module_canaries.park` — BIR's `names_meta_only` and
  `module_canaries.upwind_excess` can drift between config and
  tests/regression.json unchecked. Fix: iterate whatever keys both sides
  carry instead of a hardcoded list.
- **ALIR 2026 post-publication maintenance list** (updated at stage 5,
  2026-07-26 evening; the in-progress-snapshot thread is RESOLVED — three
  fetches, all ALI boats terminal, and the RC AMENDED Max's finish to 11:57:18
  after this project's query): (a) stage-1 REDO with the press, interviews and
  commentaries that appear post-race (nothing existed as of Sunday morning;
  awards were 17:00 Sunday) — fold into a results-ratification re-pin when
  YachtScoring flips off 'Preliminary'; (b) DUET +68/MARIE +28/Ripple +8 min
  finish-time gaps remain unamended — ask the RC when convenient; (c) NDBC
  realtime2 re-fetch before ~2026-09-08 (45-day retention) for the last-day
  tail; ERA5 after ~2026-08-03; (d) the Captains Meeting PDF (image-only)
  still unread — needs a PDF renderer or manual read; (e) route-model start-leg
  projection: the gridded DTF reads ~200 nm at the ALIR gun vs the 205.8
  polyline start — harmless to every shipped number (the harness's I14 basis
  recovers to 0.01 kt) but worth an engine look before the next marks race.
- **Open-Meteo `best_match` silently substitutes models inside the reanalysis
  lag** (found on ALIR 2026, 2026-07-26): the 2025-pattern archive-API URL
  carries no `models` param, and for a race inside the ERA5 lag it returned a
  full 96/96 hours of "ERA5" that were actually ECMWF IFS — including hours
  still in the FUTURE at fetch time. Caught only by probing explicit model
  ids; the mislabeled files were deleted. `starter/acquisition/fetch_weather.py`
  should pass an explicit `models=` and fail loudly rather than accept a
  substituted series, and the stage-0 reference should carry the lesson: a
  full-looking series is not evidence of the model you asked for.
- **Promote `trim_tracks.py` into `starter/pipeline/`** — the second race has
  now exercised it (supersedes the 2026-07-23 entry below, which asked for
  exactly this trigger). ALIR 2026 forced two GENERIC fixes that the ALIR 2025
  copy lacks: (a) scan for the end-cut only at/after `start_cut`, or a
  pre-start GPS spike cuts a boat's end before its start and drops a boat that
  raced; (b) require THREE consecutive over-threshold intervals for the
  vehicle-speed rule, because a sub-minute cadence tier makes ordinary GPS
  jitter read as 26-91 kt and truncated five still-racing boats mid-race.
  Move the code once, carrying both fixes, rather than letting two race-local
  copies drift.
- **Tier-1 (fleet-only) builds need a hero today** (review, 2026-07-23):
  `build_data.py` pivots stats/groups/series on `client_boat` unconditionally
  — a null client_boat crashes at the stats step, so true fleet-commentary
  builds aren't possible yet. Docs now state the requirement (pick an
  analysis pivot); a guarded hero-less path is the real fix.
