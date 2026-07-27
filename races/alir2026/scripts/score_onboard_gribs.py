#!/usr/bin/env python3
"""Score Max's onboard routing GRIBs against her own measured wind (ALIR 2026).

Reproduces §4 of races/alir2026/docs/max-instruments-exploration.md.

    pip install eccodes            # NOT a repo dependency — see decision #9
    .venv/bin/python races/alir2026/scripts/score_onboard_gribs.py <dir>

<dir> holds both the Expedition exp_*.csv logs and the *.grb files. Neither is
in the repo (see the memo's "Decisions needed" #1).

These are the forecasts that were ON THE BOAT, each stamped in its filename
with its download time in EDT, not archived model runs fetched afterwards. That
is what makes them worth scoring: `forecast.js` answers "was the model good?"
against buoys; this answers "was the information the navigator had good, at the
boat?" against the wind she actually measured.

EXPLORATION ONLY — nothing here feeds the build.
"""
import sys
import os
import re
import glob

import numpy as np
import pandas as pd

try:
    import eccodes
except ImportError:
    sys.exit("needs eccodes: pip install eccodes")

START = pd.Timestamp("2026-07-23 13:55:00")
FINISH = pd.Timestamp("2026-07-25 11:57:18")
EDT_OFFSET = pd.Timedelta(hours=4)
# Direction error is meaningless when the boat is drifting; below this the
# measured TWD is noise and scoring against it flatters nobody.
MIN_TWS_FOR_DIRECTION = 6.0
# Filenames look like SD_GFS_23Jul26_081839.grb / EX_HRRR_0027_23Jul26_163657.grb
NAME_RE = re.compile(r"(?:SD|EX)_([A-Z0-9]+?)(?:_\d+)?_(\d{2})[A-Za-z]{3}\d{2}_(\d{2})(\d{2})(\d{2})\.grb$")


def observed_wind(src_dir):
    """Max's measured wind on her actual track, at 10-minute resolution."""
    frames = [pd.read_csv(f, low_memory=False)
              for f in sorted(glob.glob(os.path.join(src_dir, "*exp_*.csv")))]
    df = pd.concat(frames, ignore_index=True)
    df["edt"] = pd.to_datetime(df["UTC"], unit="D", origin="1899-12-30") - EDT_OFFSET
    df = df[(df.edt >= START) & (df.edt <= FINISH)].set_index("edt").sort_index()
    return df[["Lat", "Lon", "TWS", "TWD"]].resample("10min").median().dropna()


def wind_messages(path):
    """Group 10u/10v by forecast step. Some files carry only one component."""
    steps, run = {}, None
    with open(path, "rb") as f:
        while True:
            gid = eccodes.codes_grib_new_from_file(f)
            if gid is None:
                break
            name = eccodes.codes_get(gid, "shortName")
            if name not in ("10u", "10v"):
                eccodes.codes_release(gid)
                continue
            if run is None:
                date = str(eccodes.codes_get(gid, "dataDate"))
                hour = int(eccodes.codes_get(gid, "dataTime")) // 100
                run = pd.Timestamp(f"{date[:4]}-{date[4:6]}-{date[6:]}") + pd.Timedelta(hours=hour)
            step = int(eccodes.codes_get(gid, "endStep"))
            # Carry lat/lon arrays so Lambert grids work the same as regular
            # lat/lon ones — codes_grib_find_nearest does not cover both here.
            steps.setdefault(step, {})[name] = (
                eccodes.codes_get_array(gid, "latitudes"),
                np.where(eccodes.codes_get_array(gid, "longitudes") > 180,
                         eccodes.codes_get_array(gid, "longitudes") - 360,
                         eccodes.codes_get_array(gid, "longitudes")),
                eccodes.codes_get_array(gid, "values"))
            eccodes.codes_release(gid)
    return run, steps


def nearest(field, lat, lon):
    lats, lons, vals = field
    k = np.argmin((lats - lat) ** 2 + ((lons - lon) * np.cos(np.radians(lat))) ** 2)
    return vals[k]


def main(src_dir):
    obs = observed_wind(src_dir)
    rows, skipped = [], []
    for path in sorted(glob.glob(os.path.join(src_dir, "*.grb"))):
        base = os.path.basename(path)
        m = NAME_RE.search(base)
        if not m:
            continue
        model = m.group(1)
        downloaded = pd.Timestamp(f"2026-07-{m.group(2)} {m.group(3)}:{m.group(4)}:{m.group(5)}")
        run, steps = wind_messages(path)
        usable = [s for s, d in steps.items() if "10u" in d and "10v" in d]
        if not usable:
            skipped.append((base, len(steps), sorted({k for d in steps.values() for k in d})))
            continue
        n = 0
        for step in sorted(usable):
            valid = run + pd.Timedelta(hours=step) - EDT_OFFSET
            if not (obs.index.min() <= valid <= obs.index.max()):
                continue
            i = obs.index.get_indexer([valid], method="nearest")[0]
            if abs((obs.index[i] - valid).total_seconds()) > 900:
                continue
            o = obs.iloc[i]
            u = nearest(steps[step]["10u"], o.Lat, o.Lon)
            v = nearest(steps[step]["10v"], o.Lat, o.Lon)
            rows.append(dict(
                model=model, downloaded=downloaded, valid=valid,
                lead_h=(valid - downloaded).total_seconds() / 3600,
                f_tws=np.hypot(u, v) * 1.94384, o_tws=o.TWS,
                f_twd=np.degrees(np.arctan2(-u, -v)) % 360, o_twd=o.TWD))
            n += 1
        print(f"  {base[-34:]:36s} {model:6s} run {run:%m-%d %HZ}  "
              f"downloaded {downloaded:%m-%d %H:%M} EDT  scored {n}")

    for base, nmsg, present in skipped:
        print(f"  {base[-34:]:36s} NO WIND VECTOR — {nmsg} steps carrying only {present}")

    f = pd.DataFrame(rows)
    f["tws_err"] = f.f_tws - f.o_tws
    f["twd_err"] = (f.f_twd - f.o_twd + 180) % 360 - 180

    last = f.downloaded.max()
    print(f"\nlast download {last:%m-%d %H:%M} EDT = "
          f"{(last-START).total_seconds()/3600:+.2f} h vs the gun; "
          f"{(FINISH-last).total_seconds()/3600:.2f} h "
          f"({100*(FINISH-last)/(FINISH-START):.0f}%) of the race sailed after it")

    strong = f[f.o_tws >= MIN_TWS_FOR_DIRECTION]
    print(f"\nSCORED vs measured wind at her own position (observed TWS >= "
          f"{MIN_TWS_FOR_DIRECTION:.0f} kt; {len(strong)} of {len(f)} steps)")
    print(strong.groupby("model").agg(
        n=("tws_err", "size"), tws_bias=("tws_err", "mean"),
        tws_mae=("tws_err", lambda s: s.abs().mean()),
        twd_mae=("twd_err", lambda s: s.abs().mean())).round(1).to_string())
    print(f"  pooled: bias {strong.tws_err.mean():+.1f} kt, "
          f"MAE {strong.tws_err.abs().mean():.1f} kt, "
          f"direction MAE {strong.twd_err.abs().mean():.0f} deg")

    print("\ndirection error by observed wind strength (why the filter exists):")
    print(f.groupby(pd.cut(f.o_tws, [0, 3, 6, 9, 20]), observed=True).agg(
        n=("twd_err", "size"),
        twd_mae=("twd_err", lambda s: s.abs().mean())).round(0).to_string())

    print("\nworst single misses:")
    print(f.reindex(f.tws_err.abs().sort_values(ascending=False).index).head(5)[
        ["model", "valid", "lead_h", "f_tws", "o_tws", "tws_err", "twd_err"]
    ].round(1).to_string(index=False))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1])
