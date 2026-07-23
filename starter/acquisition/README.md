# acquisition/ — race-data download tooling

Stdlib-only, self-contained scripts (keep them dependency-free). Everything
here was live-verified against four real races (nb2026, 79birace2026, alir25,
ildr2025) in the acquisition session of 2026-07-07; distilled from that
session's retrospective.

```
python3 starter/acquisition/fetch_race.py <ysEventId> --out-dir races/<race>/raw/   # the one command
python3 starter/acquisition/fetch_race.py --yb nb2026 …                             # YB-only race
python3 starter/acquisition/yb_tracker_download.py <ybRaceId> [--include-dtf]       # tracks only
python3 starter/acquisition/yachtscoring_download.py <ysEventId> [--prefix p]       # results/scratch only
python3 starter/acquisition/fetch_weather.py --window a..b …                        # optional weather evidence
```

`fetch_race.py` chains YachtScoring → `satTrackingUrl` → YB, writes a
`*_manifest.json` (ids, counts, coverage, per-division start times, sha256s)
and a **proposed** `*_name_join.csv` (normalized name + sail). Every
stage-0-relevant problem is printed loudly and recorded in the manifest. The join
is a proposal — review at the stage-0 stop, never auto-merge (doctrine 4). All of this is
NETWORK-DEPENDENT and stays out of CI; the offline decoder regression in
`tests/` is the CI-safe part.

## YB Tracking

No public documented API; the race-viewer webapp pulls from open,
unauthenticated endpoints:

```
https://cf.yb.tl/JSON/{race}/RaceSetup      boat list/metadata, start times, ratings (tcf1-3)
https://cf.yb.tl/JSON/{race}/leaderboard    standings, elapsed, finish epochs
https://cf.yb.tl/BIN/{race}/AllPositions3   FULL position history, binary
```

(`https://yb.tl/JSON/…` works too; `?t=<anything>` cache-bust is conventional,
not required.)

### AllPositions3 binary layout (all big-endian)

- byte 0: flags — bit0 altitude, bit1 dtf, bit2 lap, bit3 pc
- bytes 1–4: uint32 base epoch
- per-boat blocks: uint16 boat id, uint16 moment count, then moments.
  Moment header bit 7 set → delta record (uint16 −Δt, int16 Δlat, Δlon vs the
  previous moment); clear → absolute record (uint32 t−base, int32 lat, lon).
  lat/lon are integers ×1e5. Moments arrive **newest-first**.
- boat ids join to `RaceSetup.teams[].id` for names.

`--include-dtf` emits YB's embedded dtf channel when present — raw YB units,
**corroboration only**: the pipeline's own distance-remaining is the spine.

### Decoder provenance & license — READ BEFORE ANYTHING GOES PUBLIC

`parse_positions` is a Python port of the decoder in the open-source **decyb**
project (github.com/rahra/decyb, `html/decyb.js` → `function parse(e)`), which
itself was reverse-engineered from YB's own JS client. **decyb declares NO
license** (checked 2026-07-07: no LICENSE file, no README terms, GitHub API
license field null; author Bernhard R. Fischer <bf@abenteuerland.at>). An
unlicensed repo is all-rights-reserved by default. This project is personal and
non-commercial, so the port ships as-is (owner decision, 2026-07-08), with
attribution to the author. If it ever goes commercial, cross that bridge then —
contact the author for terms, or cleanroom-reimplement from the byte-layout notes
above (which describe a data format, not decyb's code). Tracked in docs/OPEN_THREADS.md (decyb license).

### Gotchas (all hit in practice)

- **CloudFront 503s**: `cf.yb.tl` intermittently 500/503s on cache misses;
  the scripts retry with backoff (4 attempts). Never conclude a race id is
  wrong from one 503.
- **Latin-1**: JSON endpoints are served `text/plain;charset=ISO-8859-1` and
  really contain Latin-1 bytes ("Stäuber") — decode `latin-1`, not utf-8.
- **`/JSON/{race}/AllPositions3.json` usually 500s** — use the BIN endpoint.
- **Race-id guessing is a trap**: ids are arbitrary and a valid guess can hit
  the WRONG race (`c6002026` = RORC Caribbean 600, not Around Block Island).
  Always verify: `RaceSetup.teams` names against the entry list, first track
  points against the known start area/time. Best source of truth: the
  YachtScoring `satTrackingUrl`.
- **Public YB data can be a subset of the fleet** (ildr2025: 3 of ~36 boats).
  A property of the data, not a bug — `fetch_race.py` flags it; surface at the stage-0 stop.
- The viewer HTML is a JS SPA — fetching the page tells you nothing.

### Verification ritual (repeat after any re-download)

First/last track points land in the right geography; timestamps match the
official start (ildr2025: epoch 1755272400 = Aug 15 2025 11:00 EDT); finishes
agree with the leaderboard.

## YachtScoring

React SPA over an open, unauthenticated JSON API (endpoints found by reading
the Vite bundle's lazy chunks):

```
https://api.yachtscoring.com/v1/public/event/{eventId}                    metadata (incl. satTrackingUrl!)
…/event/{eventId}/boats?page=N      entries, fixed 10/page (limit params ignored)
…/event/{eventId}/splits            divisions/classes
…/event/{eventId}/races             scored races (+ per-split start times)
…/event/{eventId}/result-detail-report?raceNumber=N     the money endpoint
…/event/{eventId}/cumulative-result
```

- `result-detail-report` per boat: `placeClass`, `placeOverall`,
  `elapsedTime`/`correctedTime` (seconds), `finishTime` (UTC ISO),
  `finishStatus` (AOK/DNF/…), `rating`, nested division/class,
  `localGMTOffset`.
- The `boats` scratch sheet has **no rating** — `yachtscoring_download.py`
  joins ratings in from the results report by `eventBoatId`. INACTIVE =
  withdrawn (kept in the CSV; `fetch_race.py` excludes them from coverage math).
- Legacy `.cfm` URLs are dead; the eventId numbering survived into
  `/emenu/<id>`. Pre-2025 events (other id range) untested.
- Newport Bermuda is NOT on YachtScoring — YB-only; results from the
  organizer's site.

## Weather evidence (optional; promoted from ALIR 2025)

**Scope guard first:** weather files are stage-1/2/3 phase-attribution and
narrative EVIDENCE only. No pipeline number may depend on them — the pipeline
consumes tracks/results/scratch exclusively, and VMC stays VMC (I18): a
wind-referenced claim cites these files as external evidence, never implies
the tracker measured wind.

```
python3 starter/acquisition/fetch_weather.py --window 2025-07-24..2025-07-26 \
    --ndbc 44065 44025 kptn6 --era5 montauk,41.05,-71.90 --coops LIS1012 \
    --tz America/New_York --out-dir races/<race>/raw/weather
python3 starter/acquisition/fetch_weather.py --window a..b --ndbc … --verify-only races/<race>/raw/weather
```

Three sources, one file layout (`ndbc/`, `openmeteo/`, `coops/` under
`races/<race>/raw/weather/` — the layout of the worked example,
`races/alir2025/raw/weather/`):

- **NDBC** — NOAA historical standard-met yearly files, public domain:
  `https://www.ndbc.noaa.gov/data/historical/stdmet/<station>h<year>.txt.gz`.
  Timestamps UTC; wind m/s, waves m. Buoys near the course give observed
  wind/sea state; shore C-MAN stations (e.g. KPTN6) give wind only.
- **Open-Meteo ERA5 archive** — model reanalysis point winds
  (`archive-api.open-meteo.com/v1/archive`, hourly wind speed/direction/gusts,
  requested in knots and race-local time). CC-BY 4.0 — attribute
  "Weather data by Open-Meteo.com; ERA5 © ECMWF/Copernicus". Open-Meteo snaps
  to the ~25 km ERA5 grid; the manifest records requested vs served
  coordinates and the drift in nm. Model data smooths micro-calms — a claim
  resting on ERA5 alone is "model-supported, never observed"; say so.
- **CO-OPS** — NOAA tidal-current **predictions** (harmonic model, not
  observations; public domain) via
  `api.tidesandcurrents.noaa.gov/api/prod/datagetter`, two cuts per station:
  hourly (`interval=60`) and the flood/ebb/slack table
  (`interval=MAX_SLACK`); end date padded a day so the last night's cycle
  completes.

### The verified-coverage ritual (mandatory — a file can exist yet be empty)

Decompress each NDBC file and count non-sentinel rows whose UTC date falls in
the race window (sentinels: WDIR 999, WSPD/GST 99.0, WVHT 99.00). ALIR 2025's
MTKN6 file existed with **zero wind observations for the entire year** —
kept, it would have read as Montauk coverage. The fetcher runs the ritual on
everything it downloads, deletes zero-coverage files rather than keeping
false coverage, and writes `weather_manifest.json` recording **positive AND
negative findings** (kept stations with row counts + min/max ranges; rejected
stations with the reason — empty all year vs empty in the window vs no file
for the year). `--verify-only` re-runs the ritual offline on already-fetched
files (re-verification after any re-download; it reproduces the ALIR
MANIFEST.md counts exactly).

The JSON manifest is the machine record; the prose judgments — which gaps
constrain which claims, which stations are too far away to inform the course
honestly (ALIR rejected 44020 at ~90 nm out) — belong in a hand-written
`MANIFEST.md` beside it, modeled on the worked example.

## Start times

Staggered per-division starts appear in YB `RaceSetup.teams[].start` and YS
`races[].startTime`; the manifest records both, and they can disagree (ILDR:
YS shows 11:50/12:00Z placeholders vs YB's 15:00Z = 11:00 EDT actual). The
config's `start_method` (default finish − elapsed) must be cross-checked
against these, and the config records which source was used.

## Stability

Both APIs are undocumented and could change or be restricted without notice.
The binary format is stable in practice, but re-verify with the ritual after
any re-download. Completed-race data persists (nb2026 two weeks post-race,
alir25 a year on) — but snapshot races you care about; don't assume retention.

## Tests

`python3 -m unittest discover -s starter/acquisition/tests  # from the repo root` — offline decoder
regression on a real 41 KB ildr2025 blob (3 boats, 5190 moments, expected
endpoints pinned from a cross-checked independent download), plus the
weather-coverage ritual against a real 44065 race-window excerpt (counts
pinned from the ALIR MANIFEST's independently verified numbers) and the
MTKN6/44097 negative-finding cases. CI-safe; the network paths above are not
in CI by design.
