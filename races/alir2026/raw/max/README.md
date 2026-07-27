# Max's onboard data — ALIR 2026

Supplied by the owner 2026-07-26/27. **Private data**: this is a single boat's
instrument record and her crew's performance, committed under the build's
`privacy: build: private` declaration. It does not enter any public cut.

| file | what it is |
|---|---|
| `exp_0723.csv` `exp_0724.csv` `exp_0725.csv` | raw Expedition logs, ~1 Hz, 194-column superset (38 populated), as exported |
| `max_expedition_clean.csv.gz` | **the analysis file** — race window, ghost stream removed, despiked; produced by `scripts/clean_expedition.py` |
| `Pogo_50_VPP_Expedition_v2.txt` | design VPP polar, Expedition format. Provenance unattributed — see memo decision #6 |
| `SailChart_MaxUSA75050v1.txt` | sail crossover chart, TWS x TWA -> J1/G1/C0/A2/A4/WS |
| `gribs/*.grb` | the five routing forecasts downloaded ONBOARD, filenames stamped with EDT download time |

**Use the cleaned file, not the raw exports.** The raw export carries a second
interleaved data stream (4.09% of rows, no position, stale waypoint) that turns
17 real waypoint changes into 414, plus boat-speed spikes to 35 kt and GPS
outliers implying 534 kt. `clean_expedition.py` documents every rule and why.

Regenerate:

    .venv/bin/python races/alir2026/scripts/clean_expedition.py \
        races/alir2026/raw/max races/alir2026/raw/max/max_expedition_clean.csv
