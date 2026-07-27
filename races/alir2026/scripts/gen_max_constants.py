#!/usr/bin/env python3
"""Emit the derived constants the Max modules embed (evidence-constants pattern).

    .venv/bin/python races/alir2026/scripts/gen_max_constants.py > modules/maxdata.js

Follows the forecast.js/plumgut.js precedent: a module carries its evidence as
a frozen constant with its class and derivation stated, rather than the pipeline
growing new payload keys. That keeps out/dashboard_data.json — and therefore the
snapshot compare (I16) — untouched by this exploratory layer.

All times are naive local 'YYYY-MM-DD HH:MM' strings (I1): never Date objects.
"""
import json, glob, re, sys, os
import numpy as np, pandas as pd

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLEAN = os.path.join(R, "raw/max/max_expedition_clean.csv.gz")
POLAR = os.path.join(R, "raw/max/Pogo_50_VPP_Expedition_v2.txt")
CHART = os.path.join(R, "raw/max/SailChart_MaxUSA75050v1.txt")
GRIBS = os.path.join(R, "raw/max/gribs")
TRACKS = os.path.join(R, "raw/alir2026_tracks_clean.csv")
K = 0.940
FINISH = pd.Timestamp("2026-07-25 11:57:18")

r = pd.read_csv(CLEAN, index_col=0, parse_dates=True)
out = {}

# ---- C1/C2 wind ribbon: TWD with TWS as magnitude, 5-min medians
w = r[["TWD", "TWS"]].resample("5min").median().dropna()
out["wind"] = [{"t": t.strftime("%Y-%m-%d %H:%M"), "d": round(float(a), 1), "s": round(float(b), 2)}
               for t, (a, b) in zip(w.index, w.values)]
park = r.loc["2026-07-24 04:00":"2026-07-24 12:00", "TWD"].resample("5min").median().dropna()
un = np.degrees(np.unwrap(np.radians(park.values)))
out["park"] = {"from": "2026-07-24 04:00", "to": "2026-07-24 12:00",
               "rangeDeg": round(float(un.max() - un.min())),
               "cumDeg": round(float(np.abs(np.diff(un)).sum())),
               "raceCumDeg": round(float(np.abs(np.diff(np.degrees(np.unwrap(np.radians(
                   r.TWD.dropna().resample("5min").median().dropna().values))))).sum())),
               "pctUnder3": round(100 * float(r.loc["2026-07-24 04:00":"2026-07-24 12:00", "TWS"].lt(3).mean()))}

# ---- polar
tws_ax, twa_ax, grid = [], None, []
for ln in open(POLAR):
    ln = ln.strip()
    if not ln or ln.startswith("!"): continue
    v = [float(x) for x in ln.split()]
    tws_ax.append(v[0])
    if twa_ax is None: twa_ax = v[1::2]
    grid.append(v[2::2])
tws_ax, twa_ax, grid = np.array(tws_ax), np.array(twa_ax), np.array(grid)
def target(tws, twa):
    tws = np.clip(tws, tws_ax[0], tws_ax[-1]); twa = np.clip(twa, twa_ax[0], twa_ax[-1])
    i = np.clip(np.searchsorted(tws_ax, tws) - 1, 0, len(tws_ax) - 2)
    j = np.clip(np.searchsorted(twa_ax, twa) - 1, 0, len(twa_ax) - 2)
    ft = (tws - tws_ax[i]) / (tws_ax[i+1] - tws_ax[i]); fa = (twa - twa_ax[j]) / (twa_ax[j+1] - twa_ax[j])
    return ((1-ft)*(1-fa)*grid[i, j] + (1-ft)*fa*grid[i, j+1] + ft*(1-fa)*grid[i+1, j] + ft*fa*grid[i+1, j+1])

p = r[["BSP", "TWA", "TWS"]].resample("10s").median().dropna()
p["atwa"] = p.TWA.abs(); p["cal"] = K * p.BSP; p["tgt"] = target(p.TWS.values, p.atwa.values)
p = p[p.tgt > 0.2]; p["pct"] = 100 * p.cal / p.tgt

def agg(frame, by, labels):
    g = frame.groupby(by, observed=True)
    return [{"k": str(lab), "hours": round(len(sub) * 10 / 3600, 1),
             "tgt": round(float(sub.tgt.median()), 1), "act": round(float(sub.cal.median()), 1),
             "pct": round(float(sub.pct.median()))}
            for lab, sub in zip(labels, [g.get_group(x) for x in g.groups])]

bands = pd.cut(p.TWS, [0, 4, 6, 8, 10, 12, 20])
out["polarWind"] = agg(p, bands, ["0–4", "4–6", "6–8", "8–10", "10–12", "12–20"])
s6 = p[p.TWS >= 6]
pos = pd.cut(s6.atwa, [0, 45, 60, 90, 120, 150, 180])
out["polarPos"] = agg(s6, pos, ["0–45", "45–60", "60–90", "90–120", "120–150", "150–180"])
st = 10 / 3600
out["polarTotal"] = {"hours": round(len(s6) * st, 1), "sailed": round(float((s6.cal * st).sum()), 1),
                     "target": round(float((s6.tgt * st).sum()), 1),
                     "deficit": round(100 * (1 - float((s6.cal * st).sum()) / float((s6.tgt * st).sum())), 1)}

# ---- sail crossover, matched-TWS control
sc = pd.read_csv(CHART, sep="\t", index_col=0)
sc.columns = [float(c) for c in sc.columns]; sc.index = [float(i) for i in sc.index]; sc = sc.sort_index()
rows_, cols_ = np.array(sc.index), np.array(sc.columns)
i = np.abs(rows_[:, None] - np.clip(p.TWS.values, rows_.min(), rows_.max())).argmin(0)
j = np.abs(cols_[:, None] - np.clip(p.atwa.values, cols_.min(), cols_.max())).argmin(0)
p["sail"] = sc.values[i, j]
ctrl = []
for sail in ["G1", "C0", "A2"]:
    sub = p[p.sail == sail]
    for lab, lo, hi in [("4–6", 4, 6), ("6–8", 6, 8), ("8–10", 8, 10), ("10–12", 10, 12), ("12–20", 12, 20)]:
        cell = sub[(sub.TWS > lo) & (sub.TWS <= hi)]
        if len(cell) >= 180:
            ctrl.append({"sail": sail, "band": lab, "pct": round(float(cell.pct.median())),
                         "mins": round(len(cell) * 10 / 60)})
out["sailControl"] = ctrl
out["sailTotals"] = [{"sail": k2, "hours": round(len(v) * 10 / 3600, 1),
                      "tws": round(float(v.TWS.median()), 1), "pct": round(float(v.pct.median()))}
                     for k2, v in p.groupby("sail") if len(v) > 60]

# ---- forecasts vs measured
try:
    import eccodes
    obs = r[["Lat", "Lon", "TWS", "TWD"]].resample("10min").median().dropna()
    NAME = re.compile(r"(?:SD|EX)_([A-Z0-9]+?)(?:_\d+)?_(\d{2})[A-Za-z]{3}\d{2}_(\d{2})(\d{2})(\d{2})\.grb$")
    rowsF, downloads = [], []
    for path in sorted(glob.glob(os.path.join(GRIBS, "*.grb"))):
        m = NAME.search(os.path.basename(path))
        if not m: continue
        model, dl = m.group(1), pd.Timestamp(f"2026-07-{m.group(2)} {m.group(3)}:{m.group(4)}:{m.group(5)}")
        downloads.append({"model": model, "t": dl.strftime("%Y-%m-%d %H:%M")})
        steps, run = {}, None
        with open(path, "rb") as f:
            while True:
                gid = eccodes.codes_grib_new_from_file(f)
                if gid is None: break
                nm = eccodes.codes_get(gid, "shortName")
                if nm in ("10u", "10v"):
                    if run is None:
                        d0 = str(eccodes.codes_get(gid, "dataDate")); hh = int(eccodes.codes_get(gid, "dataTime")) // 100
                        run = pd.Timestamp(f"{d0[:4]}-{d0[4:6]}-{d0[6:]}") + pd.Timedelta(hours=hh)
                    lo = eccodes.codes_get_array(gid, "longitudes")
                    steps.setdefault(int(eccodes.codes_get(gid, "endStep")), {})[nm] = (
                        eccodes.codes_get_array(gid, "latitudes"), np.where(lo > 180, lo - 360, lo),
                        eccodes.codes_get_array(gid, "values"))
                eccodes.codes_release(gid)
        for step, d in sorted(steps.items()):
            if "10u" not in d or "10v" not in d: continue
            valid = run + pd.Timedelta(hours=step) - pd.Timedelta(hours=4)
            if not (obs.index.min() <= valid <= obs.index.max()): continue
            idx = obs.index.get_indexer([valid], method="nearest")[0]
            if abs((obs.index[idx] - valid).total_seconds()) > 900: continue
            o = obs.iloc[idx]
            def near(fld):
                la, lo2, va = fld
                return va[np.argmin((la - o.Lat) ** 2 + ((lo2 - o.Lon) * np.cos(np.radians(o.Lat))) ** 2)]
            u, v = near(d["10u"]), near(d["10v"])
            rowsF.append({"model": model, "t": valid.strftime("%Y-%m-%d %H:%M"),
                          "lead": round((valid - dl).total_seconds() / 3600, 1),
                          "f": round(float(np.hypot(u, v) * 1.94384), 1), "o": round(float(o.TWS), 1),
                          "fd": round(float(np.degrees(np.arctan2(-u, -v)) % 360)), "od": round(float(o.TWD))})
    out["fcst"] = rowsF
    out["downloads"] = sorted(downloads, key=lambda x: x["t"])
    last = max(pd.Timestamp(x["t"]) for x in downloads)
    out["staleness"] = {"last": last.strftime("%Y-%m-%d %H:%M"),
                        "afterGunH": round((last - pd.Timestamp("2026-07-23 13:55")).total_seconds() / 3600, 2),
                        "remainingH": round((FINISH - last).total_seconds() / 3600, 2),
                        "pctRace": round(100 * (FINISH - last) / (FINISH - pd.Timestamp("2026-07-23 13:55")))}
except ImportError:
    sys.stderr.write("eccodes missing — forecast constants omitted\n")

# ---- C29 corroboration vs the YB tracker
yb = pd.read_csv(TRACKS); yb = yb[yb.boat_name == "Max"].copy()
yb["t"] = (pd.to_datetime(yb.epoch, unit="s", utc=True).dt.tz_convert("America/New_York").dt.tz_localize(None))
yb = yb.set_index("t").sort_index()
e = r.dropna(subset=["Lat", "Lon"])[["Lat", "Lon"]]
ei = e.reindex(e.index.union(yb.index)).interpolate(limit_direction="both").reindex(yb.index)
sep = 3440.065 * np.sqrt(np.radians(ei.Lat - yb.lat) ** 2 +
                         (np.cos(np.radians((ei.Lat + yb.lat) / 2)) * np.radians(ei.Lon - yb.lon)) ** 2)
sep = sep.dropna()
out["truth"] = {"n": int(len(sep)), "medianM": round(float(sep.median()) * 1852, 1),
                "p95Nm": round(float(sep.quantile(.95)), 3), "maxNm": round(float(sep.max()), 3),
                "hist": [{"b": round(float(lo), 3), "n": int(c)} for c, lo in
                         zip(*np.histogram(sep.clip(0, .35), bins=24, range=(0, .35)))][:24]}
seg = r.loc["2026-07-25 11:40":"2026-07-25 12:10"].dropna(subset=["Lat", "Lon"])
d = 3440.065 * np.sqrt(np.radians(seg.Lat - 40.8619) ** 2 +
                       (np.cos(np.radians((seg.Lat + 40.8619) / 2)) * np.radians(seg.Lon + 73.6603)) ** 2)
out["finish"] = {"crossing": d.idxmin().strftime("%Y-%m-%d %H:%M:%S"), "distNm": round(float(d.min()), 4),
                 "officialLocal": "2026-07-25 11:57:18",
                 "deltaS": round((d.idxmin() - FINISH).total_seconds())}

print("/* GENERATED by races/alir2026/scripts/gen_max_constants.py — do not hand-edit.")
print("   EVIDENCE, class: MEASURED (Max's own instruments) + PREDICTED (the onboard")
print("   GRIBs) + OFFICIAL (YB tracker, RC results). Derived from the committed")
print("   raw/max/ files via the documented cleaning pass; boat speed carries the")
print("   k=0.940 calibration. Times are naive local strings (I1). */")
print('"use strict";')
print("const MAXDATA = " + json.dumps(out, separators=(",", ":")) + ";")
