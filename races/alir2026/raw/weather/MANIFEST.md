# ALIR 2026 weather data — provenance manifest — **DRAFT, pending owner review at the stage-0 stop**

Fetched 2026-07-26 01:13–01:19 EDT (stage 0), while the race was still inside
its time limit — 7 boats racing, limit 12:00 EDT the same day. **Scope guard:
these files are stage-1/2/3 phase-attribution and narrative EVIDENCE only. No
pipeline number may depend on them; the pipeline consumes
tracks/results/scratch exclusively. VMC stays VMC (I18) — any wind-referenced
claim must cite these files as external evidence, never imply the tracker
measured wind. The coops/ files are predictions and the hrrr_*/ecmwf_* files
are archived forecasts — neither is an observation, and captions must say
which class they rest on.**

Race window: 2026-07-23 13:00 EDT first warning (tracker live 12:00 EDT) →
2026-07-25 18:09 EDT last scored finisher; time limit 2026-07-26 12:00 EDT.
Observation-counting window: 2026-07-23 16:00Z → 2026-07-26 16:00Z.

## Evidence classes this year

| class | source | dirs/files |
|---|---|---|
| observed | NDBC realtime2 | ndbc/*_realtime2.txt |
| archived forecast (model) — **new class this race** | Open-Meteo historical-forecast + previous-runs APIs | openmeteo/hrrr_*, ecmwf_*, *_prev_* |
| model reanalysis | ERA5 — **ABSENT at fetch** (lag not closed; negative finding below) | none yet |
| predicted current | NOAA CO-OPS harmonic predictions | coops/*.json |

## ndbc/ — NOAA NDBC realtime2 observations (public domain)

The yearly historical files (`<station>h2026.txt.gz`) do not exist for the
in-progress year — **probed all ten stations, all HTTP 404** — so this race
uses the realtime2 rolling 45-day files (kept whole as fetched; span
2026-06-11 → fetch time). Format: rows newest-first, timestamps UTC, wind
m/s, waves m, missing sentinel `MM`.

Race-window coverage below was VERIFIED by parsing each file and counting
rows in 2026-07-23 16:00Z .. 2026-07-26 16:00Z with non-missing WDIR/WSPD
(wind) and non-missing WVHT (waves); counts independently reproduced with a
second counter (awk), exact match on all five kept files. **Fetch-time
truncation: every kept series ends 04:10–04:50Z on 07-26** — all scored
finishers are fully covered; the last ~11 h of the formal window (the 7
boats still racing toward the noon limit) are not yet. Re-fetch before
~2026-09-08 (45-day retention) to extend coverage to 16:00Z.

| file | station | location | race-window coverage (verified) |
|---|---|---|---|
| 44065_realtime2.txt | 44065 | NY Harbor Entrance (15 nm SE of Breezy Pt; ~25 nm SE of the start) | 361 rows · wind 360 rows, 1.0–9.0 m/s, dir 10–350° · waves 174 rows, 0.5–1.3 m |
| 44025_realtime2.txt | 44025 | 30 nm S of Islip (south-shore reach) | 97 rows · **waves only, 0.6–1.4 m — anemometer dead since 2026-07-14 10:40Z; do NOT cite for wind** |
| 44097_realtime2.txt | 44097 | Block Island CDIP buoy, ~33 nm E of Montauk Pt | 119 rows · **waves only, 0.7–1.6 m; no wind channel by design** — nearest sea state to the Montauk corner |
| kptn6_realtime2.txt | KPTN6 | Kings Point, western Sound, ~6 nm W of the finish approach | 606 rows · wind 603 rows, 0.0–6.2 m/s, dir 10–360° · no waves (shore station) |
| 44069_realtime2.txt | 44069 | Great South Bay — **inside the bay behind Fire Island**, ~7 nm N of the south-shore model point | 236 rows · wind 236 rows, 1.0–9.0 m/s, dir 20–360° · no waves |

**Stations tried and rejected (record-worthy negatives):**
- **44017 (Montauk buoy)** — no realtime2 file at all (HTTP 404): not
  reporting within the last 45 days. Dead in 2025 too.
- **MTKN6 (Montauk Point shore station)** — realtime2 file EXISTS with 8,552
  rows across the full 45-day span and **every wind and wave field `MM`**.
  Second straight year the platform transmits nothing usable. Fetched,
  verified empty, deleted rather than kept as false coverage.
- **44039 / 44040 / 44022 (Central Sound, Western Sound, Execution Rocks)** —
  no realtime2 files (HTTP 404). **Long Island Sound has zero offshore buoys
  reporting this year**; the Sound's only observation platform is the KPTN6
  shore anemometer at its far western end.

**Observation gaps, and what they constrain (the 2025 gaps both persist):**
1. **Montauk corner: NO observed wind again** — 44017 absent, MTKN6 dead.
   44097 supplies sea state only, from ~33 nm east. Any wind claim at the
   corner is archived-forecast-supported (model) until ERA5 lands, and must
   say so.
2. **Central Long Island Sound: no platform of any kind** — 44039/44040/44022
   all silent, and no wave source exists anywhere in the Sound. Wind and sea
   state there are model-only. (In 2025 this was exactly where the fleet
   parked; whether 2026 repeated that is stage-1 work, not asserted here.)
3. **South-shore offshore reach: observed wind thinner than 2025** — 44025's
   anemometer died nine days before the start (waves survive). Observed wind
   along the ocean leg comes only from 44065 at its western end; 44069 is new
   coverage this year but sits inside sheltered Great South Bay — inshore
   evidence, never open-ocean truth.
4. **Forecast-vs-observed comparison** (this year's new axis) is honest only
   at 44065 (harbor), KPTN6 (west Sound shore) and 44069 (bay, with its
   caveat). At Montauk and mid-Sound the archived forecasts are uncorroborated
   by any observation.

## openmeteo/ — model evidence via Open-Meteo (CC-BY 4.0, attribution required)

Five course points, same names/coordinates as 2025: harbor 40.60,−74.03 ·
southshore 40.58,−73.10 · montauk 41.05,−71.90 · midsound 41.05,−72.60 ·
westsound 40.90,−73.55. All series: hourly 10 m wind speed/direction/gusts in
KNOTS, 2026-07-23 → 2026-07-26, timezone America/New_York.

### ERA5 reanalysis — NEGATIVE FINDING (lag), plus a trap worth recording

At fetch (07-26 01:18 EDT) the archive API with **explicit `models=era5`
served 0/96 non-null hours** for the window (`era5_seamless` likewise 0/96):
the ERA5/ERA5T publication lag had not closed. The 2025-pattern URL (no
`models` param → `best_match` default) **returned 96/96 non-null anyway — by
silently substituting ECMWF IFS** (identical grid and values to
`models=ecmwf_ifs`), including hours still in the future at fetch time. Five
`era5_*.json` files fetched that way carried zero actual ERA5 and were
**deleted as a mislabeled evidence class** rather than kept as false
coverage. **Lesson: inside the reanalysis lag, the plain archive-API URL is
not ERA5.**

**Pending:** re-fetch ~2026-08-03 or later with explicit
`&models=era5_seamless`, verify non-null in-window rows, and only then
restore `era5_*.json` files and update this manifest + hashes.

### Archived forecasts — what the models said during the race (new class)

Two endpoints, both `wind_speed_unit=kn&timezone=America%2FNew_York`, models
`ncep_hrrr_conus` (NOAA HRRR, ~3 km, native hourly) and `ecmwf_ifs025`
(ECMWF IFS open data, 0.25°) — both model ids accepted on the first attempt.

**(a) historical-forecast API** (`historical-forecast-api.open-meteo.com/v1/forecast`)
— the shortest-lead archived forecast for each hour (per-hour run id not
exposed by the API). All ten files verified 96/96 non-null wind hours.

| file | served grid (drift nm) | wind range kn | file | served grid (drift nm) | wind range kn |
|---|---|---|---|---|---|
| hrrr_harbor.json | 40.606,−74.029 (0.36) | 0.2–12.1 | ecmwf_harbor.json | 40.75,−74.00 (9.10) | 0.3–6.9 |
| hrrr_southshore.json | 40.582,−73.082 (0.82) | 1.2–18.4 | ecmwf_southshore.json | 40.75,−73.00 (11.17) | 1.7–11.9 |
| hrrr_montauk.json | 41.062,−71.907 (0.78) | 1.0–11.4 | ecmwf_montauk.json | 41.00,−72.00 (5.43) | 0.8–12.7 |
| hrrr_midsound.json | 41.045,−72.619 (0.91) | 0.5–20.0 | ecmwf_midsound.json | 41.00,−72.50 (5.43) | 1.6–14.2 |
| hrrr_westsound.json | 40.902,−73.558 (0.38) | 0.5–14.2 | ecmwf_westsound.json | 40.75,−73.50 (9.28) | 0.6–7.0 |

**(b) previous-runs API** (`previous-runs-api.open-meteo.com/v1/forecast`) —
the fixed-lead view: `*_previous_day1` ≈ what the model said ~24 h before
validity, `*_previous_day2` ≈ 48 h. Files `hrrr_prev_<pt>.json`,
`ecmwf_prev_<pt>.json`, same grids/drifts as above. Verified per file:
**ECMWF day1 96/96 AND day2 96/96 at all five points; HRRR day1 96/96 but
day2 served all-null at all five points** (variable present, zero non-null) —
the HRRR lead-time view is day-1 only; a 48 h lead exists only from ECMWF.

**Caveats that stick to any claim resting on these files:**
- They are FORECASTS, archived — not observations, not reanalysis. Captions
  say "archived forecast (model)".
- **Three ECMWF 0.25° cells center over land** — harbor → 40.75,−74.00
  (Manhattan), southshore → 40.75,−73.00 (inland Brookhaven), westsound →
  40.75,−73.50 (central Nassau); montauk/midsound sit at the coastal margin.
  Expect a low bias vs open water; prefer HRRR (all five cells on water,
  drift ≤ 0.91 nm) where the two disagree on marine wind.
- ECMWF IFS open data is published at 3-hourly steps; Open-Meteo serves an
  interpolated hourly series — treat sub-3-hourly ECMWF structure as
  interpolation, not model signal. HRRR is natively hourly.

Attribution: Weather data by Open-Meteo.com (CC-BY 4.0); HRRR © NOAA NCEP;
ECMWF IFS open data © ECMWF (CC-BY 4.0).

## coops/ — NOAA CO-OPS tidal current PREDICTIONS (public domain)

Harmonic/subordinate current predictions (not observations), 2026-07-23 →
2026-07-27 (end padded one day so the last night's cycle completes), local
time (lst_ldt), knots. Two cuts per station: `interval=60` (hourly, 120 rows
each, verified) and `interval=MAX_SLACK` (flood/ebb/slack table). Source:
`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=currents_predictions&station=<id>&begin_date=20260723&end_date=20260727&time_zone=lst_ldt&units=english&format=json&interval=<60|MAX_SLACK>`

| station | name | relevance | maxslack rows |
|---|---|---|---|
| LIS1012 | Plum Gut | primary eastern gate into the Sound | 39 |
| LIS1001 | The Race | alternate eastern gate | 39 |
| LIS1035 | Matinecock Point | finish approach | 50 |
| LIS1036 | Execution Rocks | western Sound | 41 |

Predicted Plum Gut peaks across the middle race nights (which boats met
which phase is stage-1 work, not asserted here): ebb −2.36 kt at 07-24
22:06, flood +1.27 at 07-25 06:13, ebb −1.98 at 10:37, flood +1.29 at 18:07,
ebb −2.40 at 23:05 (all local; slack times in the file).

## sha256 (as fetched)

```
af8deda231b0bb3f5430102b1a69ff281af85815678563848882668b1494478c  coops/LIS1001_currents_hourly.json
ac09c9d202cdbcba7eebd51ca81a1e1cfbc9f310a6ab4329899653c80683ccda  coops/LIS1001_currents_maxslack.json
672dd767c3da7358f25b6d60993fa7f77deb9a3e6a5d64e160ff5a76dc81377d  coops/LIS1012_currents_hourly.json
0a839f81465503f75213f11a62b49559624229730872fee4d23092db0abc829a  coops/LIS1012_currents_maxslack.json
8cefb56c05b0a0cddf0d0e31c3b1fca7807dc4a6e7c15948e8340b192b48b8bc  coops/LIS1035_currents_hourly.json
73bb182ba76018c586d52883955a46106a9aed441080218711fd6c60438f3f1a  coops/LIS1035_currents_maxslack.json
9e799d470f25f07bc3087bb9e02eed85d74b33c4d878bd1fd85ae1f644d3a4ae  coops/LIS1036_currents_hourly.json
973abbe412c718a16f823caa03dec8a680866f8575cedddbf43a431b9c6f296b  coops/LIS1036_currents_maxslack.json
ed9575adb145d350fb22bb479f2139d733d4c3b45db6ce8395dda0334bfe2261  ndbc/44025_realtime2.txt
eebfe9596bd3bbd890b354cb3bb73d176f927290486a7e70dec50df5dac90d12  ndbc/44065_realtime2.txt
d99185b76cd0632c6244511e86043cb8a39ebb2d4cbfd53466e02668fae7c45f  ndbc/44069_realtime2.txt
d59a2fe9c0bdda1ac1d4cdc78d0b269819acac6b5f25900ca0fb9d552b4db122  ndbc/44097_realtime2.txt
2e6ab9d04978a61ec87aa5a01782ad86c12c412bc67bf5e754d3747223973802  ndbc/kptn6_realtime2.txt
04ce5a76e668df8357aea3d224bcfedbd7ab86e2249e907480bfa3e17eb209a7  openmeteo/ecmwf_harbor.json
fc9fc1508fd16dda3d3fc22c70e312e31a66b91a2ca8a70ffa18464a56ef0bc0  openmeteo/ecmwf_midsound.json
4b219835e12493e416310210622e11a46ab126e5886ea03e43903111ca09bd2f  openmeteo/ecmwf_montauk.json
7c922405efc2232c0ef49822c9c65f0466204140a4eae23f2a0f282e11a08475  openmeteo/ecmwf_prev_harbor.json
07d319f1785719b152a571c6c06c5e1c832b91e06f35c6619d5de4e98bdabdc3  openmeteo/ecmwf_prev_midsound.json
e6974f4c94b88f5194f23f91680077eb4761cceae30216382b1eae57b7ee3148  openmeteo/ecmwf_prev_montauk.json
1fe515a5990404ddbd9abeda2d2cd10b9da39fd61aef76d6c412227d9526b6ea  openmeteo/ecmwf_prev_southshore.json
9fa266cb5846da9f44738c3682e5a1fa47d623bf31d328b5505605718e62595f  openmeteo/ecmwf_prev_westsound.json
6d4a5d2b861474817f1c7bf3a2d7fc3ed91fe40c140635cde895df8f1efdfc1d  openmeteo/ecmwf_southshore.json
2c6811a959a3c6ec91e0e29cf4f68c58f8096c48b744faff7baff59ed3c37bdb  openmeteo/ecmwf_westsound.json
0ae34b1361014ff55e7abdfee15d2a893a3b38997f085f7d13a43392f490a4ee  openmeteo/hrrr_harbor.json
65d81aff4d5a3bc8018a6d57fb3c64ba568ce287b2f56d9a1e779174f85256bc  openmeteo/hrrr_midsound.json
24fe4e5aa6b6a8c18a064d51f2043096d1e1e716302ad1fe592c8da42e5896dc  openmeteo/hrrr_montauk.json
dc739a67dcc2a915e1ce8a9fd7229bf5312dca1af3d5aa33f3b138797a192e54  openmeteo/hrrr_prev_harbor.json
d3017f2adc70cad0abc675f8ecff3a320eb288ae4fe083247e4c013f2251c2d6  openmeteo/hrrr_prev_midsound.json
1fb6b4175d112a7e97cc8c9ea9677a6b193e12738653ccad238d31b3271ebed6  openmeteo/hrrr_prev_montauk.json
d4666bdd609f712915baa1a2efa6bb9a9e1403cc02d0495c886515a1efaecd2a  openmeteo/hrrr_prev_southshore.json
2fbe25c80ffd58b5063b43b8cf6dfb377cb1461063ae09a4e3434802f82e9c7e  openmeteo/hrrr_prev_westsound.json
f118d47e90fea924bfb4d56331963359f0b7a320625ad4ff0b9f5cbf1f53aca9  openmeteo/hrrr_southshore.json
22ec702599f129c89d7bd87b968fbc8f05f97b753d28d7656ce5833afaa4a39c  openmeteo/hrrr_westsound.json
```
