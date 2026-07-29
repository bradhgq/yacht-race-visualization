#!/usr/bin/env python3
"""Compute the data behind ALL 30 catalogue charts (C1-C30) into insights.json.

    .venv/bin/python races/alir2026/scripts/gen_insights.py > <out.json>

Companion to gen_max_constants.py (which feeds the five shipped dashboard
modules). This one feeds the full-catalogue insights page: every entry in
docs/max-dashboard-chart-catalogue.md gets its own dataset, so no catalogue id
is silently merged into a neighbour's chart again.

Sources: the cleaned instrument file (never the raw export — memo 2.6), the
VPP, the crossover chart, the onboard GRIBs, the NDBC station files already in
raw/weather, and out/dashboard_data.json for anything fleet-side (payload is
authoritative; nothing here recomputes race numbers — prime rule 1).
"""
import glob
import json
import os
import re
import sys

import numpy as np
import pandas as pd

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLEAN = os.path.join(R, "raw/max/max_expedition_clean.csv.gz")
POLAR = os.path.join(R, "raw/max/Pogo_50_VPP_Expedition_v2.txt")
CHART = os.path.join(R, "raw/max/SailChart_MaxUSA75050v1.txt")
GRIBS = os.path.join(R, "raw/max/gribs")
NDBC = os.path.join(R, "raw/weather/ndbc")
PAYLOAD = os.path.join(R, "out/dashboard_data.json")
COOPS_PG = os.path.join(R, "raw/weather/coops/LIS1012_currents_hourly.json")

K = 0.940
START = pd.Timestamp("2026-07-23 13:55:00")
FINISH = pd.Timestamp("2026-07-25 11:57:18")
GUN_EPOCH = 1784836500          # 13:55 EDT Thu as epoch (UTC 17:55)
EDT = pd.Timedelta(hours=4)

PHASES = [
    ("2026-07-23 13:55", "2026-07-23 16:55", "HARBOR"),
    ("2026-07-23 16:55", "2026-07-23 23:00", "EVENING REACH"),
    ("2026-07-23 23:00", "2026-07-24 04:00", "NIGHT ONE"),
    ("2026-07-24 04:00", "2026-07-24 12:00", "DAWN PARK"),
    ("2026-07-24 12:00", "2026-07-24 20:35", "REBUILD → GUT"),
    ("2026-07-24 20:35", "2026-07-25 04:00", "SOUND NIGHT"),
    ("2026-07-25 04:00", "2026-07-25 11:57", "SATURDAY RUN"),
]

r = pd.read_csv(CLEAN, index_col=0, parse_dates=True)
out = {"phases": [{"a": a, "b": b, "l": l} for a, b, l in PHASES]}

def ts(t): return t.strftime("%Y-%m-%d %H:%M")
def wrap(x): return (x + 180) % 360 - 180

# ---------- polar helpers ----------
tws_ax, twa_ax, grid = [], None, []
for ln in open(POLAR):
    ln = ln.strip()
    if not ln or ln.startswith("!"):
        continue
    v = [float(x) for x in ln.split()]
    tws_ax.append(v[0])
    if twa_ax is None:
        twa_ax = v[1::2]
    grid.append(v[2::2])
tws_ax, twa_ax, grid = np.array(tws_ax), np.array(twa_ax), np.array(grid)

def vpp(tws, twa):
    tws = np.clip(tws, tws_ax[0], tws_ax[-1]); twa = np.clip(twa, twa_ax[0], twa_ax[-1])
    i = np.clip(np.searchsorted(tws_ax, tws) - 1, 0, len(tws_ax) - 2)
    j = np.clip(np.searchsorted(twa_ax, twa) - 1, 0, len(twa_ax) - 2)
    ft = (tws - tws_ax[i]) / (tws_ax[i + 1] - tws_ax[i])
    fa = (twa - twa_ax[j]) / (twa_ax[j + 1] - twa_ax[j])
    return ((1 - ft) * (1 - fa) * grid[i, j] + (1 - ft) * fa * grid[i, j + 1]
            + ft * (1 - fa) * grid[i + 1, j] + ft * fa * grid[i + 1, j + 1])

p10 = r[["BSP", "TWA", "TWS", "Heel"]].resample("10s").median().dropna(subset=["BSP", "TWA", "TWS"])
p10["atwa"] = p10.TWA.abs()
p10["cal"] = K * p10.BSP
p10["tgt"] = vpp(p10.TWS.values, p10.atwa.values)
p10 = p10[p10.tgt > 0.2]
p10["pct"] = 100 * p10.cal / p10.tgt

# ---------- C2 · the dawn-park compass (its own chart at last) ----------
park = r.loc["2026-07-24 04:00":"2026-07-24 12:00", ["TWD", "TWS"]].resample("5min").median().dropna()
out["c2"] = [{"a": round(float(a), 1), "hr": round((t - pd.Timestamp("2026-07-24 04:00")).total_seconds() / 3600, 2),
              "s": round(float(s), 2)} for t, (a, s) in zip(park.index, park.values)]

# ---------- C3 · apparent vs true wind ----------
c3 = r[["TWS", "AWS", "BSP", "TWA"]].resample("2min").median().dropna()
out["c3"] = [{"t": round(float(a), 2), "aw": round(float(b), 2), "bsp": round(float(c), 2),
              "atwa": round(abs(float(d)))} for a, b, c, d in c3.values]

# ---------- C4 · boat vs buoys (hourly) ----------
def ndbc(fn):
    rows = []
    for ln in open(os.path.join(NDBC, fn)):
        if ln.startswith("#"):
            continue
        f = ln.split()
        if len(f) < 7 or f[6] == "MM":
            continue
        t = pd.Timestamp(f"{f[0]}-{f[1]}-{f[2]} {f[3]}:{f[4]}") - EDT
        rows.append((t, float(f[6]) * 1.94384))
    s = pd.Series(dict(rows)).sort_index()
    return s.resample("1h").mean()

maxw = r["TWS"].resample("1h").median()
stations = {"b65": "44065_realtime2.txt", "b69": "44069_realtime2.txt", "kp": "kptn6_realtime2.txt"}
c4 = pd.DataFrame({"max": maxw})
for k2, fn in stations.items():
    try:
        c4[k2] = ndbc(fn).reindex(maxw.index)
    except FileNotFoundError:
        c4[k2] = np.nan
c4 = c4.loc[START:FINISH]
out["c4"] = [{"t": ts(t), **{k2: (None if pd.isna(v[k2]) else round(float(v[k2]), 1))
              for k2 in ["max", "b65", "b69", "kp"]}} for t, v in c4.iterrows()]

# ---------- C5 · sea temperature ----------
c5 = r["SeaTemp"].resample("10min").median()
out["c5"] = [{"t": ts(t), "v": None if pd.isna(v) else round(float(v), 2)} for t, v in c5.items()]

# ---------- C6 · barometer (gaps preserved) ----------
c6 = r["Baro"].resample("10min").median()
out["c6"] = [{"t": ts(t), "v": None if pd.isna(v) else round(float(v), 1)} for t, v in c6.items()]
out["c6cov"] = round(100 * float(r.Baro.notna().mean()), 1)

# ---------- GRIB scoring (feeds C7, C8, C9, C10, C11, C12, C13) ----------
import eccodes
obs = r[["Lat", "Lon", "TWS", "TWD"]].resample("10min").median().dropna()
NAME = re.compile(r"(?:SD|EX)_([A-Z0-9]+?)(?:_\d+)?_(\d{2})[A-Za-z]{3}\d{2}_(\d{2})(\d{2})(\d{2})\.grb$")
fro, downloads, inventory, field13 = [], [], [], None
for path in sorted(glob.glob(os.path.join(GRIBS, "*.grb"))):
    base = os.path.basename(path)
    m = NAME.search(base)
    model = m.group(1)
    dl = pd.Timestamp(f"2026-07-{m.group(2)} {m.group(3)}:{m.group(4)}:{m.group(5)}")
    downloads.append({"model": model, "t": ts(dl)})
    steps, run, counts = {}, None, {}
    with open(path, "rb") as f:
        while True:
            gid = eccodes.codes_grib_new_from_file(f)
            if gid is None:
                break
            nm = eccodes.codes_get(gid, "shortName")
            counts[nm] = counts.get(nm, 0) + 1
            if nm in ("10u", "10v"):
                if run is None:
                    d0 = str(eccodes.codes_get(gid, "dataDate"))
                    hh = int(eccodes.codes_get(gid, "dataTime")) // 100
                    run = pd.Timestamp(f"{d0[:4]}-{d0[4:6]}-{d0[6:]}") + pd.Timedelta(hours=hh)
                lo = eccodes.codes_get_array(gid, "longitudes")
                steps.setdefault(int(eccodes.codes_get(gid, "endStep")), {})[nm] = (
                    eccodes.codes_get_array(gid, "latitudes"),
                    np.where(lo > 180, lo - 360, lo),
                    eccodes.codes_get_array(gid, "values"))
            eccodes.codes_release(gid)
    inventory.append({"file": base, "model": model, **{k2: counts.get(k2, 0)
                     for k2 in ["10u", "10v", "msl", "prate"]}})
    # C13: the HRRR-X 0.025-deg field at 06:00 EDT Friday (run 18Z Thu, +16 h)
    if "HRRRX" in base and 16 in steps and "10u" in steps[16] and "10v" in steps[16]:
        la, lo2, u = steps[16]["10u"]; v = steps[16]["10v"][2]
        spd = np.hypot(u, v) * 1.94384
        keep = slice(None, None, 2)              # decimate 2x each axis via index math below
        idx = np.arange(len(la))
        ni = 160
        rows_i, cols_i = idx // ni, idx % ni
        sel = (rows_i % 2 == 0) & (cols_i % 2 == 0)
        field13 = {"lat": [round(float(x), 3) for x in la[sel]],
                   "lon": [round(float(x), 3) for x in lo2[sel]],
                   "s": [round(float(x), 1) for x in spd[sel]],
                   "valid": "2026-07-24 06:00", "_la": la, "_lo": lo2, "_sp": spd}
    for step, d in sorted(steps.items()):
        if "10u" not in d or "10v" not in d:
            continue
        valid = run + pd.Timedelta(hours=step) - EDT
        if not (obs.index.min() <= valid <= obs.index.max()):
            continue
        i = obs.index.get_indexer([valid], method="nearest")[0]
        if abs((obs.index[i] - valid).total_seconds()) > 900:
            continue
        o = obs.iloc[i]
        def near(fld):
            la, lo3, va = fld
            return va[np.argmin((la - o.Lat) ** 2 + ((lo3 - o.Lon) * np.cos(np.radians(o.Lat))) ** 2)]
        u, v = near(d["10u"]), near(d["10v"])
        fro.append({"model": model, "t": ts(valid),
                    "lead": round((valid - dl).total_seconds() / 3600, 1),
                    "f": round(float(np.hypot(u, v) * 1.94384), 1), "o": round(float(o.TWS), 1),
                    "fd": round(float(np.degrees(np.arctan2(-u, -v)) % 360)), "od": round(float(o.TWD))})
F = pd.DataFrame(fro)
out["c12"] = inventory
out["c13"] = field13
tr5 = r[["Lat", "Lon"]].resample("5min").median().dropna()
out["track"] = [{"lat": round(float(a), 4), "lon": round(float(b), 4)} for a, b in tr5.values]
b13 = r.loc["2026-07-24 05:55":"2026-07-24 06:05", ["Lat", "Lon", "TWS", "TWD"]].median()
fld = None
if field13 is not None:
    la_, lo_, sp_ = field13.pop("_la"), field13.pop("_lo"), field13.pop("_sp")
    kk = np.argmin((la_ - b13.Lat) ** 2 + ((lo_ - b13.Lon) * np.cos(np.radians(b13.Lat))) ** 2)
    fld = round(float(sp_[kk]), 1)
out["c13boat"] = {"lat": round(float(b13.Lat), 4), "lon": round(float(b13.Lon), 4),
                  "tws": round(float(b13.TWS), 1), "twd": round(float(b13.TWD)), "field": fld}

strong = F[F.o >= 6]
out["c7"] = [{"model": mo, "n": int(len(g)),
              "bias": round(float((g.f - g.o).mean()), 2),
              "mae": round(float((g.f - g.o).abs().mean()), 2),
              "dmae": round(float((((g.fd - g.od + 180) % 360 - 180)).abs().mean()), 1)}
             for mo, g in strong.groupby("model")]
w8 = r["TWS"].loc["2026-07-23 22:00":"2026-07-24 14:00"].resample("10min").median().dropna()
out["c8"] = {"obs": [{"t": ts(t), "v": round(float(v), 2)} for t, v in w8.items()],
             "fc": F[(F.t >= "2026-07-23 22:00") & (F.t <= "2026-07-24 14:00")]
                   [["model", "t", "f"]].to_dict("records")}
c9row = F[(F.model == "ECMWF") & (F.t == "2026-07-25 05:00")]
out["c9"] = c9row[["f", "fd", "o", "od", "t"]].to_dict("records")[0] if len(c9row) else None
dlt = sorted(pd.Timestamp(d["t"]) for d in downloads)
ages, cur = [], None
for t in pd.date_range(START, FINISH, freq="30min"):
    past = [d for d in dlt if d <= t]
    ages.append({"t": ts(t), "age": round((t - max(past)).total_seconds() / 3600, 2) if past else None})
out["c10"] = {"ages": ages, "downloads": downloads}
out["c11"] = F[["model", "lead"]].assign(aerr=(F.f - F.o).abs().round(2)).to_dict("records")

# ---------- C14 · the wind-band ladder (never had its own chart) ----------
bands = pd.cut(p10.TWS, [0, 4, 6, 8, 10, 12, 20])
out["c14"] = [{"k": lab, "hours": round(len(g) * 10 / 3600, 1), "pct": round(float(g.pct.median())),
               "tgt": round(float(g.tgt.median()), 1), "act": round(float(g.cal.median()), 1)}
              for lab, g in zip(["0–4", "4–6", "6–8", "8–10", "10–12", "12–20"],
                                [p10[bands == c] for c in bands.cat.categories])]

# ---------- C17 · the measured polar vs VPP ----------
c17 = []
for lo_, hi_, lab in [(4, 6, "4–6 kt"), (6, 8, "6–8 kt"), (8, 10, "8–10 kt"), (10, 12, "10–12 kt"), (12, 17, "12–17 kt")]:
    sub = p10[(p10.TWS > lo_) & (p10.TWS <= hi_)]
    meas = []
    for a in range(30, 180, 10):
        cell = sub[(sub.atwa >= a - 5) & (sub.atwa < a + 5)]
        if len(cell) >= 30:
            meas.append({"a": a, "v": round(float(cell.cal.median()), 2)})
    mid = (lo_ + hi_) / 2
    vppc = [{"a": int(a), "v": round(float(vpp(np.array([mid]), np.array([a]))[0]), 2)}
            for a in range(32, 181, 4)]
    c17.append({"label": lab, "meas": meas, "vpp": vppc})
out["c17"] = c17

# ---------- C18 · deficit over time ----------
g30 = p10[p10.TWS >= 6].resample("30min").agg(pct=("pct", "median"), tws=("TWS", "median"), n=("pct", "size"))
out["c18"] = [{"t": ts(t), "pct": None if (pd.isna(v.pct) or v.n < 60) else round(float(v.pct)),
               "tws": None if pd.isna(v.tws) else round(float(v.tws), 1)} for t, v in g30.iterrows()]

# ---------- C19 · heel vs target ----------
c19 = p10[(p10.TWS >= 6) & p10.Heel.notna()].resample("2min").median().dropna()
def pos(a): return "upwind (<60°)" if a < 60 else ("reach (60–120°)" if a < 120 else "run (>120°)")
out["c19"] = [{"h": round(abs(float(v.Heel)), 1), "pct": round(float(v.pct)), "pos": pos(v.atwa)}
              for _, v in c19.iterrows() if abs(v.Heel) < 35]

# ---------- C20 · distance ledger (payload dtf = course made good) ----------
D = json.load(open(PAYLOAD))
mx = D["boats"]["Max"]
bsps = (K * r.BSP.fillna(0)).clip(lower=0)
dt_s = r.index.to_series().diff().dt.total_seconds().fillna(0).clip(0, 60)
dtw_cum = (bsps * dt_s / 3600).cumsum()
dog_cum = (r.SOG.fillna(0) * dt_s / 3600).cumsum()
rows20 = []
for e, dtf in zip(mx["t"], mx["dtf"]):
    t = pd.Timestamp(e, unit="s") - EDT
    if t < START or t > FINISH or dtf is None:
        continue
    i = dtw_cum.index.get_indexer([t], method="nearest")[0]
    rows20.append({"t": ts(t), "dtw": round(float(dtw_cum.iloc[i]), 1),
                   "dog": round(float(dog_cum.iloc[i]), 1),
                   "made": round(float(mx["dtf"][0] - dtf), 1)})
out["c20"] = rows20

# ---------- current derivation (C21, C22, C23) ----------
w1 = r[["SOG", "COG", "BSP", "HDG"]].dropna().resample("1min").median().dropna()
gx = w1.SOG * np.sin(np.radians(w1.COG)); gy = w1.SOG * np.cos(np.radians(w1.COG))
bx = K * w1.BSP * np.sin(np.radians(w1.HDG)); by = K * w1.BSP * np.cos(np.radians(w1.HDG))
cx, cy = gx - bx, gy - by
cur = pd.DataFrame({"u": cx, "v": cy, "drift": np.hypot(cx, cy),
                    "set": np.degrees(np.arctan2(cx, cy)) % 360}, index=w1.index)

pg = json.load(open(COOPS_PG))["current_predictions"]["cp"]
pred = [{"t": p["Time"], "v": float(p["Velocity_Major"])} for p in pg
        if "2026-07-24 12:00" <= p["Time"] <= "2026-07-25 04:00"]
FLOOD = np.radians(291.0)
seg = cur.loc["2026-07-24 18:30":"2026-07-24 22:30"]
proj = (seg.drift * np.cos(np.radians(seg["set"]) - FLOOD)).resample("10min").median().dropna()
out["c21"] = {"meas": [{"t": ts(t), "v": round(float(v), 2)} for t, v in proj.items()],
              "pred": pred, "transit": "2026-07-24 20:37"}

c22 = cur.resample("30min").median().join(r[["Lat", "Lon"]].resample("30min").median()).dropna()
out["c22"] = [{"lat": round(float(v.Lat), 4), "lon": round(float(v.Lon), 4),
               "u": round(float(v.u), 2), "vv": round(float(v.v), 2),
               "d": round(float(v.drift), 2)} for _, v in c22.iterrows()]

# ---------- C23 · the fleet at the gate + Max's measured point ----------
gates = [{"nm": g["nm"], "t": ts(pd.Timestamp(g["gate"], unit="s") - EDT), "sog": g["sog"]}
         for g in D.get("plumgut", [])]
tmax = pd.Timestamp("2026-07-24 20:37")
i = proj.index.get_indexer([tmax], method="nearest")[0]
out["c23"] = {"fleet": gates, "pred": pred,
              "max": {"t": "2026-07-24 20:37", "cur": round(float(proj.iloc[i]), 2)}}

# ---------- C24 + C25 · maneuvers and their cost ----------
tw2 = r["TWA"].dropna().resample("2s").median().interpolate(limit=15)
sign = np.sign(tw2).replace(0, np.nan).ffill()
flips = tw2.index[sign.diff().fillna(0) != 0]
man, last = [], None
for t in flips:
    if last is None or (t - last).total_seconds() > 90:
        man.append(t); last = t
bsp2 = (K * r["BSP"].dropna()).resample("2s").median().interpolate(limit=30)
events, curves = [], {"tack": [], "gybe": []}
for t in man:
    after = tw2.loc[t + pd.Timedelta(seconds=50):t + pd.Timedelta(seconds=70)].abs().median()
    kind = "tack" if (not pd.isna(after) and after < 90) else "gybe"
    events.append({"t": ts(t), "kind": kind})
    base = bsp2.loc[t - pd.Timedelta(minutes=6):t - pd.Timedelta(minutes=3)].median()
    if pd.isna(base) or base < 3:
        continue
    rel = []
    for m_off in np.arange(-3, 10.01, 0.5):
        v = bsp2.loc[t + pd.Timedelta(minutes=m_off - 0.25):t + pd.Timedelta(minutes=m_off + 0.25)].median()
        rel.append(None if pd.isna(v) else float(v / base * 100))
    curves[kind].append(rel)
out["c24"] = events
c25 = {}
for kind, cs in curves.items():
    arr = np.array([[np.nan if x is None else x for x in c] for c in cs], dtype=float)
    if not len(arr):
        continue
    c25[kind] = {"n": int(len(arr)),
                 "m": [round(float(x), 1) for x in np.arange(-3, 10.01, 0.5)],
                 "med": [None if np.isnan(x) else round(float(x), 1) for x in np.nanmedian(arr, 0)],
                 "lo": [None if np.isnan(x) else round(float(x), 1) for x in np.nanpercentile(arr, 25, 0)],
                 "hi": [None if np.isnan(x) else round(float(x), 1) for x in np.nanpercentile(arr, 75, 0)]}
out["c25"] = c25

# ---------- C26 · helm by watch (PRIVATE; spans are [recall]) ----------
shifts = []
t0 = pd.Timestamp("2026-07-23 13:00")
for i in range(16):
    a = t0 + pd.Timedelta(hours=3 * i); b = a + pd.Timedelta(hours=3)
    a2, b2 = max(a, START), min(b, FINISH)
    if a2 >= b2:
        continue
    owner = a.hour in (19, 1, 7, 13)
    sub = p10.loc[a2:b2]; sub6 = sub[sub.TWS >= 6]
    rud = r["Rudder"].loc[a2:b2].std()
    heel = r["Heel"].loc[a2:b2].std()
    mans = sum(1 for e in events if a2 <= pd.Timestamp(e["t"]) < b2)
    shifts.append({"start": ts(a2), "owner": owner,
                   "pct": None if len(sub6) < 180 else round(float(sub6.pct.median())),
                   "tws": round(float(sub.TWS.median()), 1) if len(sub) else None,
                   "rudSD": None if pd.isna(rud) else round(float(rud), 1),
                   "heelSD": None if pd.isna(heel) else round(float(heel), 1), "man": mans})
out["c26"] = shifts

# ---------- C27 · the navigator's plan ----------
def wname(la, lo):
    for (a, b), nm in [((40.7022, -74.0326), "start pin"), ((40.6045, -74.0443), "Verrazzano"),
                       ((40.5279, -74.0094), 'Ambrose R"14"'), ((41.0716, -71.8548), "Montauk"),
                       ((41.168, -72.2189), "Plum Gut"), ((40.8614, -73.663), "the finish"),
                       ((40.9015, -73.6652), "Glen Cove appr."), ((40.9525, -73.4861), "mid-Sound A"),
                       ((40.9131, -73.406), "mid-Sound B"), ((40.9546, -73.4484), "mid-Sound C"),
                       ((40.961, -73.4878), "mid-Sound hold"), ((40.8941, -73.6658), "final appr.")]:
        if abs(la - a) < 0.004 and abs(lo - b) < 0.004:
            return nm
    return f"{la:.3f},{lo:.3f}"
mk = r[["Mk Lat", "Mk Lon"]].dropna().round(4)
ch = mk[(mk != mk.shift()).any(axis=1)]
holds = []
times = list(ch.index) + [FINISH]
for i, (t, row) in enumerate(ch.iterrows()):
    holds.append({"name": wname(row["Mk Lat"], row["Mk Lon"]), "a": ts(t), "b": ts(times[i + 1])})
out["c27"] = holds

# ---------- C28 · depth and the beach ----------
d5 = r["Depth"].resample("5min").min()
out["c28"] = [{"t": ts(t), "v": None if pd.isna(v) else round(float(v), 1)} for t, v in d5.items()]

# ---------- C30 · Max's wind vs the fleet's speed ----------
grid_t = mx["t"]
vmcs = {nm: b.get("vmc") for nm, b in D["boats"].items() if b.get("vmc")}
rows30 = []
for gi, e in enumerate(grid_t):
    t = pd.Timestamp(e, unit="s") - EDT
    if t < START or t > FINISH or t.minute != 0:
        continue
    vals = [b[gi] for b in vmcs.values() if gi < len(b) and b[gi] is not None]
    i = maxw.index.get_indexer([t], method="nearest")[0]
    rows30.append({"t": ts(t), "tws": None if pd.isna(maxw.iloc[i]) else round(float(maxw.iloc[i]), 1),
                   "vmc": round(float(np.median(vals)), 2) if len(vals) >= 10 else None,
                   "n": len(vals)})
out["c30"] = rows30

json.dump(out, sys.stdout, separators=(",", ":"))
