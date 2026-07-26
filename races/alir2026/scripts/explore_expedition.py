#!/usr/bin/env python3
"""Profile Max's Expedition instrument exports (ALIR 2026 exploration).

Reproduces every number in races/alir2026/docs/max-instruments-exploration.md.
The raw exports are NOT in the repo (66 MB; see that memo's "Decisions needed"
#1) — point this at whatever directory holds them:

    .venv/bin/python races/alir2026/scripts/explore_expedition.py <dir> [polar.txt] [sailchart.txt]

<dir> is scanned for exp_*.csv; the optional second argument is the Pogo 50
VPP in Expedition polar format and the third is the sail crossover chart, which
between them enable the target-speed scoring and the prescribed sail plan.

Expedition writes its UTC column as an Excel serial day number (origin
1899-12-30), ~1 Hz, with a 194-column superset of which this boat populates 38.

EXPLORATION ONLY — nothing here feeds the build. No pipeline module imports it,
and no shipped number is derived from it. Kept in the repo so the memo's
findings stay auditable rather than being scratchpad claims.
"""
import sys
import glob
import os

import numpy as np
import pandas as pd

# Race window: Division 9 gun (warning 13:50 + 5) to Max's RC-amended finish.
START = pd.Timestamp("2026-07-23 13:55:00")
FINISH = pd.Timestamp("2026-07-25 11:57:18")
EDT_OFFSET = pd.Timedelta(hours=4)          # the race sits wholly inside EDT
NM_PER_RAD = 3440.065                       # earth radius in nautical miles
BREAKWATER = (40.8619, -73.6603)            # Glen Cove light — the finish
PLUM_GUT = (41.1680, -72.2189)              # the gate waypoint
FLOOD_AXIS_DEG = 291.0                      # LIS1012 mean flood direction


def read_polar(path):
    """Parse an Expedition polar file: one row per TWS, then TWA/BSP pairs."""
    tws, twa, speeds = [], None, []
    for line in open(path):
        line = line.strip()
        if not line or line.startswith("!"):
            continue
        vals = [float(x) for x in line.split()]
        tws.append(vals[0])
        if twa is None:
            twa = vals[1::2]
        speeds.append(vals[2::2])
    return np.array(tws), np.array(twa), np.array(speeds)


def polar_target(tws_axis, twa_axis, grid, tws, twa):
    """Bilinear lookup of target boat speed. Hand-rolled rather than pulling in
    scipy — starter/requirements.txt stays at pandas/numpy/pyyaml."""
    tws = np.clip(tws, tws_axis[0], tws_axis[-1])
    twa = np.clip(twa, twa_axis[0], twa_axis[-1])
    i = np.clip(np.searchsorted(tws_axis, tws) - 1, 0, len(tws_axis) - 2)
    j = np.clip(np.searchsorted(twa_axis, twa) - 1, 0, len(twa_axis) - 2)
    ft = (tws - tws_axis[i]) / (tws_axis[i+1] - tws_axis[i])
    fa = (twa - twa_axis[j]) / (twa_axis[j+1] - twa_axis[j])
    return ((1-ft)*(1-fa)*grid[i, j] + (1-ft)*fa*grid[i, j+1]
            + ft*(1-fa)*grid[i+1, j] + ft*fa*grid[i+1, j+1])


def read_sailchart(path):
    """Crossover chart: rows TWS, columns TWA, cells the prescribed sail."""
    sc = pd.read_csv(path, sep="\t", index_col=0)
    sc.columns = [float(c) for c in sc.columns]
    sc.index = [float(i) for i in sc.index]
    return sc.sort_index()


def prescribe(sc, tws, twa):
    """Nearest-cell lookup — a crossover chart is categorical, so no interpolation."""
    rows = np.array(sc.index)
    cols = np.array(sc.columns)
    i = np.abs(rows[:, None] - np.clip(tws, rows.min(), rows.max())).argmin(0)
    j = np.abs(cols[:, None] - np.clip(twa, cols.min(), cols.max())).argmin(0)
    return sc.values[i, j]


def separation_nm(lat1, lon1, lat2, lon2):
    """Equirectangular separation — exact enough at these scales, and it is what
    the rest of the engine uses."""
    dlat = np.radians(lat1 - lat2)
    dlon = np.radians(lon1 - lon2)
    mid = np.radians((lat1 + lat2) / 2)
    return NM_PER_RAD * np.sqrt(dlat ** 2 + (np.cos(mid) * dlon) ** 2)


def load(src_dir):
    files = sorted(glob.glob(os.path.join(src_dir, "*exp_*.csv")))
    if not files:
        sys.exit(f"no exp_*.csv found in {src_dir}")
    frames = []
    for f in files:
        d = pd.read_csv(f, low_memory=False)
        print(f"  {os.path.basename(f):24s} rows={len(d):6d} cols={d.shape[1]} "
              f"{os.path.getsize(f)/1e6:5.1f} MB")
        frames.append(d)
    df = pd.concat(frames, ignore_index=True)
    df["edt"] = pd.to_datetime(df["UTC"], unit="D", origin="1899-12-30") - EDT_OFFSET
    return df.sort_values("edt").reset_index(drop=True)


def derived_current(w, k=1.0):
    """Current vector from the ground track minus the water track.

    Set/Drift/Leeway were never configured on this boat, so current has to come
    from SOG/COG against k*BSP/HDG. k is the boat-speed calibration (see
    calibrate()); leeway is unmodelled and shows up as an across-track residual.
    """
    gx = w.SOG * np.sin(np.radians(w.COG))
    gy = w.SOG * np.cos(np.radians(w.COG))
    bx = k * w.BSP * np.sin(np.radians(w.HDG))
    by = k * w.BSP * np.cos(np.radians(w.HDG))
    cx, cy = gx - bx, gy - by
    hdg = np.radians(w.HDG)
    return pd.DataFrame({
        "drift": np.hypot(cx, cy),
        "set": np.degrees(np.arctan2(cx, cy)) % 360,
        "along": cx * np.sin(hdg) + cy * np.cos(hdg),   # + = current pushing forward
        "across": cx * np.cos(hdg) - cy * np.sin(hdg),  # the leeway signature
    }, index=w.index)


def calibrate(w):
    """Find the BSP scale that zeroes the median along-heading current.

    ASSUMPTION: net along-track current averages to ~zero over a 46 h race
    spanning roughly four tide cycles. Every current number inherits it.
    """
    grid = np.arange(0.88, 1.06, 0.005)
    return min(grid, key=lambda k: abs(derived_current(w, k)["along"].median()))


def main(src_dir, tracks_csv, polar_path, chart_path):
    print("FILES")
    df = load(src_dir)
    print(f"\nTOTAL {df.shape[0]} rows x {df.shape[1]-1} cols | "
          f"{df.edt.min()} -> {df.edt.max()} EDT "
          f"({(df.edt.max()-df.edt.min()).total_seconds()/3600:.2f} h)")

    gaps = df.edt.diff().dt.total_seconds()
    print(f"cadence {gaps.median():.2f} s median | gaps >60 s: {(gaps>60).sum()}")

    r = df[(df.edt >= START) & (df.edt <= FINISH)].set_index("edt")
    rg = r.index.to_series().diff().dt.total_seconds()
    print(f"\nRACE WINDOW {len(r)} rows, {(FINISH-START).total_seconds()/3600:.2f} h | "
          f"{(rg>60).sum()} gaps >60 s totalling {rg[rg>60].sum()/60:.1f} min")

    live = [c for c in df.columns if df[c].notna().any() and c != "edt"]
    print(f"channels carrying data: {len(live)} of {df.shape[1]-1}")

    # --- §2.3 calibration -------------------------------------------------
    w = r[["SOG", "COG", "BSP", "HDG"]].dropna().resample("1min").median().dropna()
    k = calibrate(w[w.BSP > 2])
    cur = derived_current(w, k)
    print(f"\nCALIBRATION  k={k:.3f} (BSP over-reads {(1-k)*100:.1f}%)")
    print(f"  drift median {cur.drift.median():.2f} kt, p90 {cur.drift.quantile(.9):.2f}")
    print(f"  across-track residual (leeway) {cur['across'].median():+.2f} kt")

    print(f"  hours over 1.5 kt: {(cur.drift>1.5).sum()/60:.1f} | over 2.5 kt: "
          f"{(cur.drift>2.5).sum()/60:.1f}")

    pos = r[["Lat", "Lon"]].resample("1min").median().reindex(cur.index)
    region = np.where(pos.Lon < -73.7, "1 harbor/NY Bight",
              np.where(pos.Lon >= -72.4, "3 Montauk/Gut",
              np.where(pos.Lat < 40.95, "2 south shore", "4 the Sound")))
    print("  by region:")
    print(cur.assign(region=region).dropna(subset=["region"])
             .groupby("region").agg(n=("drift", "size"),
                                    median=("drift", "median"),
                                    p90=("drift", lambda s: s.quantile(.9)),
                                    set=("set", "median")).round(2).to_string())

    dt = r.BSP.dropna().index.to_series().diff().dt.total_seconds().fillna(0).clip(0, 60)
    dtw = (k * r.BSP.dropna() * dt / 3600).sum()
    dts = r.SOG.dropna().index.to_series().diff().dt.total_seconds().fillna(0).clip(0, 60)
    dog = (r.SOG.dropna() * dts / 3600).sum()
    print(f"  distance through water {dtw:.1f} nm vs over ground {dog:.1f} nm "
          f"(course 207.0 official / 205.84 polyline)")

    # --- §2.2 the finish --------------------------------------------------
    seg = r.loc["2026-07-25 11:40":"2026-07-25 12:10"].dropna(subset=["Lat", "Lon"])
    d = separation_nm(seg.Lat, seg.Lon, *BREAKWATER)
    print(f"\nFINISH  closest approach {d.idxmin()} at {d.min():.4f} nm; "
          f"RC amended 11:57:18 -> {(d.idxmin()-FINISH).total_seconds():+.0f} s")

    # --- §3.2 Plum Gut ----------------------------------------------------
    seg = r.loc["2026-07-24 18:00":"2026-07-25 00:00"].dropna(subset=["Lat", "Lon"])
    d = separation_nm(seg.Lat, seg.Lon, *PLUM_GUT)
    at = d.idxmin()
    print(f"\nPLUM GUT closest approach {at} at {d.min():.3f} nm | "
          f"SOG {seg.SOG.asof(at):.1f} vs BSP {seg.BSP.asof(at):.1f} kt")
    gut = cur.loc["2026-07-24 19:30":"2026-07-24 21:30"]
    proj = gut.drift * np.cos(np.radians(gut["set"]) - np.radians(FLOOD_AXIS_DEG))
    print("  measured current on the LIS1012 flood axis (+ = flood into the Sound):")
    for ts, v in proj.resample("10min").median().items():
        print(f"    {ts:%H:%M}  {v:+.2f} kt")

    # --- §3.1 the dawn park ----------------------------------------------
    twd = r.loc["2026-07-24 04:00":"2026-07-24 12:00", "TWD"].dropna()
    unwrapped = np.degrees(np.unwrap(np.radians(twd.values)))
    print(f"\nDAWN PARK 04:00-12:00 Fri  TWD rotation "
          f"{np.abs(np.diff(unwrapped)).sum()/60:.0f} deg cumulative, "
          f"{unwrapped[-1]-unwrapped[0]:+.0f} net")

    # --- §3.3 point of sail and maneuvers ---------------------------------
    tw = r["TWA"].dropna().resample("2s").median().interpolate(limit=15)
    flips = tw.index[np.sign(tw).replace(0, np.nan).ffill().diff().fillna(0) != 0]
    kept, last = [], None
    for ts in flips:                       # 90 s debounce: one maneuver, not one wobble
        if last is None or (ts - last).total_seconds() > 90:
            kept.append(ts)
            last = ts
    after = np.array([abs(tw.asof(ts + pd.Timedelta(seconds=60))) for ts in kept])
    print(f"\nMANEUVERS {len(kept)} total | {(after<90).sum()} tacks, {(after>=90).sum()} gybes")

    bins = [0, 40, 60, 90, 120, 150, 181]
    labels = ["<40", "40-60", "60-90", "90-120", "120-150", "150+"]
    share = pd.cut(r["TWA"].abs().dropna(), bins, labels=labels).value_counts(normalize=True)
    print("point of sail (% of race):")
    print((share.reindex(labels) * 100).round(1).to_string())

    # --- §3.4 the measured polar ------------------------------------------
    p = r[["BSP", "TWA", "TWS"]].resample("10s").median().dropna()
    p["atwa"] = p.TWA.abs()
    piv = p.pivot_table(index=pd.cut(p.atwa, [0, 45, 60, 75, 90, 110, 130, 150, 180]),
                        columns=pd.cut(p.TWS, [0, 4, 6, 8, 10, 12, 20]),
                        values="BSP", aggfunc="median", observed=True)
    cnt = p.pivot_table(index=pd.cut(p.atwa, [0, 45, 60, 75, 90, 110, 130, 150, 180]),
                        columns=pd.cut(p.TWS, [0, 4, 6, 8, 10, 12, 20]),
                        values="BSP", aggfunc="size", observed=True)
    print("\nMEASURED POLAR (median BSP, cells with >=30 samples)")
    print(piv.round(1).where(cnt >= 30).to_string())

    # --- §3.5 scored against the Pogo 50 VPP ------------------------------
    if polar_path and os.path.exists(polar_path):
        tws_axis, twa_axis, grid = read_polar(polar_path)
        p = p.assign(bsp_cal=k * p.BSP)          # the 6% over-read must come off first
        p["target"] = polar_target(tws_axis, twa_axis, grid, p.TWS.values, p.atwa.values)
        p = p[p.target > 0.2]
        p["pct"] = 100 * p.bsp_cal / p.target
        print(f"\nvs POGO 50 VPP (calibrated BSP)  median {p.pct.median():.1f}% of target")
        print("  BY TWS BAND — the VPP is optimistic in drifting conditions; the")
        print("  sub-6 kt rows are not a fair judgment of the crew:")
        print(p.groupby(pd.cut(p.TWS, [0, 4, 6, 8, 10, 12, 20]), observed=True)
               .agg(hours=("pct", lambda s: len(s) * 10 / 3600),
                    target=("target", "median"), actual=("bsp_cal", "median"),
                    pct=("pct", "median")).round(1).to_string())
        sail = p[p.TWS >= 6]                     # where sailing to polar is possible
        print("  BY POINT OF SAIL (TWS >= 6 only):")
        print(sail.groupby(pd.cut(sail.atwa, [0, 45, 60, 90, 120, 150, 180]), observed=True)
                  .agg(hours=("pct", lambda s: len(s) * 10 / 3600),
                       target=("target", "median"), actual=("bsp_cal", "median"),
                       pct=("pct", "median")).round(1).to_string())
        step = 10 / 3600
        step = 10 / 3600
        print(f"  scored {len(sail)*step:.1f} h: sailed {(sail.bsp_cal*step).sum():.1f} nm "
              f"vs {(sail.target*step).sum():.1f} nm of VPP target "
              f"({100*(1-(sail.bsp_cal*step).sum()/(sail.target*step).sum()):.1f}% deficit)")

        # --- §3.6 the crossover chart ------------------------------------
        if chart_path and os.path.exists(chart_path):
            sc = read_sailchart(chart_path)
            p["sail"] = prescribe(sc, p.TWS.values, p.atwa.values)
            print("\nPRESCRIBED SAIL (from the crossover chart — never observed;")
            print("  the J1-J4/Reacher/Blade/Staysail/Solent channels are all empty)")
            print(p.groupby("sail", observed=True)
                   .agg(hours=("pct", lambda s: len(s) * 10 / 3600),
                        tws=("TWS", "median"), target=("target", "median"),
                        actual=("bsp_cal", "median"), pct=("pct", "median"))
                   .sort_values("hours", ascending=False).round(1).to_string())

            # The control that matters: is the downwind deficit just light air?
            band = pd.cut(p.TWS, [0, 4, 6, 8, 10, 12, 20])
            grid_pct = p.pivot_table(index="sail", columns=band, values="pct",
                                     aggfunc="median", observed=True)
            grid_n = p.pivot_table(index="sail", columns=band, values="pct",
                                   aggfunc="size", observed=True)
            print("\n  CONTROL — median % of target within matched TWS bands")
            print("  (cells with >=180 samples = 30 min):")
            print(grid_pct.round(0).where(grid_n >= 180).to_string())

            runs = (p.sail != p.sail.shift()).cumsum()
            seg = p.groupby(runs).agg(sail=("sail", "first"), n=("pct", "size"))
            held = seg[seg.n >= 60]                     # 10 min at 10 s cadence
            changes = (held.sail != held.sail.shift()).sum() - 1
            print(f"\n  prescribed changes: {len(seg)-1} raw -> {changes} after a "
                  f"10-min hold filter")

    # --- §2.1 tracker corroboration ---------------------------------------
    if tracks_csv and os.path.exists(tracks_csv):
        yb = pd.read_csv(tracks_csv)
        yb = yb[yb.boat_name == "Max"].copy()
        yb["edt"] = (pd.to_datetime(yb.epoch, unit="s", utc=True)
                     .dt.tz_convert("America/New_York").dt.tz_localize(None))
        yb = yb.set_index("edt").sort_index()
        e = r.dropna(subset=["Lat", "Lon"])[["Lat", "Lon"]]
        ei = (e.reindex(e.index.union(yb.index)).interpolate(limit_direction="both")
              .reindex(yb.index))
        sep = separation_nm(ei.Lat, ei.Lon, yb.lat, yb.lon)
        print(f"\nvs YB TRACKER ({len(yb)} fixes)  separation median {sep.median():.4f} nm "
              f"({sep.median()*1852:.1f} m) | p95 {sep.quantile(.95):.4f} | max {sep.max():.3f}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    main(sys.argv[1],
         os.path.join(here, "raw", "alir2026_tracks_clean.csv"),
         sys.argv[2] if len(sys.argv) > 2 else None,
         sys.argv[3] if len(sys.argv) > 3 else None)
