# ALIR 2025 weather data — provenance manifest

Fetched 2026-07-23 ~02:50 EDT (stage 0, experimental capability — first race to
carry a weather layer). **Scope guard: these files are stage-1/2 phase-attribution
and narrative EVIDENCE only. No pipeline number may depend on them; the pipeline
consumes tracks/results/scratch exclusively. VMC stays VMC (I18) — any
wind-referenced claim must cite these files as external evidence, never imply
the tracker measured wind.**

Race window: 2025-07-24 ~11:00 EDT (first warning) → 2025-07-26 ~14:37 EDT
(last in-scope finisher).

## ndbc/ — NOAA NDBC historical standard-met, yearly 2025 files (public domain)

Full-year files kept as fetched; extract the race window during analysis.
Source pattern: https://www.ndbc.noaa.gov/data/historical/stdmet/<station>h2025.txt.gz

| file | station | location | notes |
|---|---|---|---|
| 44065h2025.txt.gz | 44065 | NY Harbor entrance | wind verified for race window (S 5–11 m/s Jul 24–25, NE shift Jul 26); waves: check :10/:40 rows |
| 44025h2025.txt.gz | 44025 | 33 nm S of Islip | wind verified (SW 8–10 m/s Jul 25); waves PRESENT on :10/:40 rows (~1.15 m Jul 25) |
| mtkn6h2025.txt.gz | MTKN6 | Montauk Point shore station | substitute — buoy 44017 (Montauk) is dead for 2025 (last file h2023) |
| kptn6h2025.txt.gz | KPTN6 | Kings Point, western LI Sound | substitute for defunct western-Sound buoys (44040/44022/44069: no 2025 data) |

**Known gap (record-worthy): no 2025 observation platform exists in the CENTRAL
Long Island Sound — exactly where the fleet parked on the night of Jul 25–26.
Buoys 44039/44040/44017 all dead for 2025. ERA5 reanalysis is the only gridded
source there, and its ~25 km grid smooths the micro-calms that matter. Treat
park-zone wind claims as model-supported, not observed.**

## openmeteo/ — ERA5 reanalysis via Open-Meteo archive API (CC-BY 4.0, attribution required)

Hourly 10 m wind speed/direction/gusts in KNOTS, 2025-07-24 → 2025-07-26,
timezone America/New_York. Source:
`https://archive-api.open-meteo.com/v1/archive?latitude=<lat>&longitude=<lon>&start_date=2025-07-24&end_date=2025-07-26&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=America%2FNew_York&wind_speed_unit=kn`

| file | point | lat, lon |
|---|---|---|
| era5_harbor.json | NY Harbor / start | 40.60, −74.03 |
| era5_southshore.json | mid south shore | 40.58, −73.10 |
| era5_montauk.json | Montauk corner | 41.05, −71.90 |
| era5_midsound.json | central Sound (park zone) | 41.05, −72.60 |
| era5_westsound.json | western Sound / finish approach | 40.90, −73.55 |

Attribution: Weather data by Open-Meteo.com (CC-BY 4.0); ERA5 © ECMWF/Copernicus.

## coops/ — NOAA CO-OPS tidal current PREDICTIONS (public domain)

Harmonic/subordinate current predictions (not observations), 2025-07-24 →
2025-07-27, local time (lst_ldt), knots. Two cuts per station: `interval=60`
(hourly) and `interval=MAX_SLACK` (flood/ebb/slack table). Source:
`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=currents_predictions&station=<id>&begin_date=20250724&end_date=20250727&time_zone=lst_ldt&units=english&format=json&interval=<60|MAX_SLACK>`

| station | name | relevance |
|---|---|---|
| LIS1012 | Plum Gut | the fleet's Sound entry gate (43/45 finishers); ebb peaks ~−3.0 kt race night |
| LIS1001 | The Race | alternate gate (only two RETired boats crossed it) |
| LIS1035 | Matinecock Point | finish approach |
| LIS1036 | Execution Rocks | western Sound / park zone |

## sha256 (as fetched)

```
3d4cdd447e9cbd1bcfdb46c28e4bee65184e8d071bad3691f6d88a75b0eb6e38  coops/LIS1001_currents_hourly.json
eba0fa6b6926d5ff3fad1a713f9e445199e675e5396de5a98e91ec86b9890c36  coops/LIS1001_currents_maxslack.json
92bb09bb0a47df1912a98ce08f0eef7586cc0604dfea1cc363bc23eda674a5e5  coops/LIS1012_currents_hourly.json
b8fae1a0fb254196aa117b7db0dbe5d5ecb59696c7b0d99bb583116d6ea2833e  coops/LIS1012_currents_maxslack.json
b8b83e1ca3be6fa07b2bcfadb9797f4b4b1049a3180cc671c8eccdfd81a83094  coops/LIS1035_currents_hourly.json
ac9963865981271efcca0af931d0548d023b82ec9f91c762d6b6f015fe645a03  coops/LIS1035_currents_maxslack.json
e137dba93e5da4d43bc9bfb598c6f7cf385efaacec21a82f37a00ccf208d307c  coops/LIS1036_currents_hourly.json
ac40c8420adec7d09779dbcd9d057c92535a2566f346317dd2fd69ba4da06c5a  coops/LIS1036_currents_maxslack.json
250322a42f136cee5e1c40e4658188e09c0664dc5460bc61733542cb0c25940b  ndbc/44025h2025.txt.gz
fca75ab4926c9fc6f44d4155db55c25259b3f95cb88ebfdce890cc0f18f460f4  ndbc/44065h2025.txt.gz
ca4622fb9fabcc476b2b36c34953bc811fe7ee4c2612302cbd10d0385f4700d8  ndbc/kptn6h2025.txt.gz
632c7033bbe6ed1bc505fa1a3e2ca2ab14943309656e813fb781222004178a3c  ndbc/mtkn6h2025.txt.gz
4db2b9f0e3072f3e245edf837819c4423f974fb02ca29ea5609eb1b6060bc575  openmeteo/era5_harbor.json
b5dfbf3c5820af6a4aa93b33ef91b76fae4ca82e768e23f1d47ea827799254ea  openmeteo/era5_midsound.json
864f771a2cda12df41647daeeb1edb4f32d8ab72af2cb8c105a4dc5242cd3f10  openmeteo/era5_montauk.json
796ba422833dde603dc1bc4ce5e93c3aed12a04f00febac7b23db20ccc9fab9c  openmeteo/era5_southshore.json
b76f7a7e7ee19e61c8fe5b7490aca0bb01eebecbc1ca28b9e5b1546ee32b558d  openmeteo/era5_westsound.json
```
