#!/usr/bin/env python3
"""Clean Max's Expedition export into an analysis-ready race-window file.

    .venv/bin/python races/alir2026/scripts/clean_expedition.py <raw_dir> <out.csv>

Every downstream number in races/alir2026/docs/max-instruments-exploration.md
comes from this file's output, not from the raw export. The raw export has four
defects that each silently corrupt a different class of analysis, so the
cleaning is not cosmetic:

1. A SECOND INTERLEAVED DATA STREAM. 4.09% of race-window rows carry no
   position, a stale active waypoint, and boat state inconsistent with the
   adjacent row (at 07:03:44 Sat, SOG 0.2/HDG 343 alternating row-by-row with
   SOG 6.5/HDG 274). Left in, it turns 17 real waypoint changes into 414 and
   invents a "navigator cycling routes at dawn" that never happened. Identified
   by the absence of a position fix, which is the one thing the ghost never
   carries. Scalar wind/speed medians are unaffected either way.
2. DUPLICATE TIMESTAMPS (164 rows, almost all in exp_0725.csv) — the two
   streams colliding on the same millisecond.
3. BOAT-SPEED SPIKES. ~20 samples of 162,819 (0.012%): one 13-second burst at
   11:33 Fri reading 22-24 kt while SOG held 3.4, plus a single 35.0 kt sample
   and a handful of isolated ones. A paddlewheel artefact, not sailing.
4. GPS OUTLIERS. 0.63% of fixes imply an impossible speed over ground.

Two channels are flagged UNUSABLE rather than cleaned, because no filter
rescues them: `ROT` (offset ~180 and correlating only r=0.32 with the observed
heading rate — turn rate is derived from HDG here instead) and the line-geometry
group `DistToLn`/`BelowLn`/`Port|Stbd lat|lon` (they reference a line at
Hempstead Harbour, not the ALIR start or finish).
"""
import sys
import os
import glob

import numpy as np
import pandas as pd

START = pd.Timestamp("2026-07-23 13:55:00")
FINISH = pd.Timestamp("2026-07-25 11:57:18")
EDT_OFFSET = pd.Timedelta(hours=4)

# A Pogo 50's VPP tops out at 12.22 kt inside this race's wind range (TWS never
# exceeded 16.9 kt), and measured SOG peaked at 10.7. 14 kt is comfortably
# outside anything sailed and comfortably inside the 22-35 kt spikes.
BSP_ABSOLUTE_MAX = 14.0
BSP_DESPIKE_WINDOW = 31          # samples (~30 s at 1 Hz)
BSP_DESPIKE_TOLERANCE = 4.0      # kt from the local rolling median
MAX_GROUND_SPEED = 15.0          # kt implied between consecutive GPS fixes

UNUSABLE = ["ROT", "DistToLn", "BelowLn", "TmToLn", "RchTmToLn", "RchDtToLn",
            "Port lat", "Port lon", "Stbd lat", "Stbd lon"]


def load_raw(src_dir):
    files = sorted(glob.glob(os.path.join(src_dir, "*exp_*.csv")))
    if not files:
        sys.exit(f"no exp_*.csv in {src_dir}")
    df = pd.concat([pd.read_csv(f, low_memory=False) for f in files], ignore_index=True)
    df["t"] = pd.to_datetime(df["UTC"], unit="D", origin="1899-12-30") - EDT_OFFSET
    return df.sort_values("t").reset_index(drop=True)


def clean(df, report=print):
    n0 = len(df)
    df = df[(df.t >= START) & (df.t <= FINISH)].copy()
    report(f"  race window          {n0:>7d} -> {len(df):>7d} rows")

    # (1) the ghost stream: no position fix, ever. Drop before deduping, so a
    # colliding timestamp resolves to the real row rather than by luck of order.
    ghost = df.Lat.isna() | df.Lon.isna()
    df = df[~ghost]
    report(f"  drop ghost stream    {ghost.sum():>7d} rows removed ({100*ghost.mean():.2f}%)")

    # (2) duplicate timestamps
    dup = df.t.duplicated(keep="first")
    df = df[~dup].set_index("t")
    report(f"  drop duplicate ts    {dup.sum():>7d} rows removed")

    # (3) boat-speed spikes: absolute ceiling plus a local-median despike, so a
    # sustained-but-wrong burst dies as well as a single sample.
    bsp = df.BSP.copy()
    local = bsp.rolling(BSP_DESPIKE_WINDOW, center=True, min_periods=5).median()
    bad = (bsp > BSP_ABSOLUTE_MAX) | ((bsp - local).abs() > BSP_DESPIKE_TOLERANCE)
    df.loc[bad.fillna(False), "BSP"] = np.nan
    report(f"  despike BSP          {int(bad.sum()):>7d} samples nulled "
           f"(max was {bsp.max():.1f} kt, now {df.BSP.max():.1f})")

    # (4) GPS outliers: an implied speed no 50-footer reaches means a bad fix.
    lat, lon = df.Lat.values, df.Lon.values
    dt = np.diff(df.index.values).astype("timedelta64[ms]").astype(float) / 3.6e6
    step = np.hypot(np.diff(lat), np.diff(lon) * np.cos(np.radians(lat[:-1]))) * 60
    implied = np.divide(step, dt, out=np.full_like(step, np.nan), where=dt > 0)
    bad_fix = np.concatenate([[False], implied > MAX_GROUND_SPEED])
    df.loc[bad_fix, ["Lat", "Lon"]] = np.nan
    report(f"  drop GPS outliers    {int(bad_fix.sum()):>7d} fixes nulled "
           f"(implied up to {np.nanmax(implied):.0f} kt)")

    # (5) sundries
    zero_depth = int((df.Depth == 0).sum())
    df.loc[df.Depth == 0, "Depth"] = np.nan
    report(f"  null zero depths     {zero_depth:>7d} samples")

    present = [c for c in UNUSABLE if c in df.columns]
    df = df.drop(columns=present)
    report(f"  drop unusable        {len(present)} channels: {', '.join(present)}")

    # Turn rate, since ROT could not be trusted.
    hdg_rate = ((df.HDG.diff() + 180) % 360 - 180) / \
        (df.index.to_series().diff().dt.total_seconds() / 60)
    df["TurnRate"] = hdg_rate.replace([np.inf, -np.inf], np.nan).clip(-90, 90)

    live = [c for c in df.columns if df[c].notna().any()]
    return df[live]


def main(src_dir, out_path):
    print("CLEANING")
    df = clean(load_raw(src_dir))
    df.to_csv(out_path)
    print(f"\nwrote {out_path}  ({len(df)} rows x {df.shape[1]} channels, "
          f"{os.path.getsize(out_path)/1e6:.1f} MB)")
    key = ["AWA", "AWS", "TWA", "TWS", "TWD", "BSP", "HDG", "SOG", "COG", "Heel", "Lat"]
    print("\ncoverage of the channels that matter, after cleaning:")
    for c in key:
        s = df[c]
        print(f"  {c:<5s} {s.notna().sum():>7d}  {100*s.notna().mean():6.2f}%"
              f"   range {s.min():8.2f} .. {s.max():7.2f}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
