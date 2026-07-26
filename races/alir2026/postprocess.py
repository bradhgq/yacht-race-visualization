#!/usr/bin/env python3
"""ALIR 2026 payload postprocess — reproducible, logged (prime rule 1).

Run by build_race.py AFTER build_data.py, BEFORE the shell build (cwd = race dir).

Jobs (all tracker/results-derived — the weather-evidence layer stays OUT of the
payload and lives as labeled constants inside the modules that display it,
per the stage-0 scope guard):

1. meta.note — the system-scoped official standing ("PHRF · Division 9 · 4th"),
   because YachtScoring's place_overall is per scoring group and three boats
   carry "#1"; the owner's directive is that PHRF #x and ORC #x are never
   shown unqualified (decisions/stage-3-corrections.yaml labeling_decisions).
2. meta.powNm / meta.lightNm — distance made in the two powered phases (P2+P5)
   and the three light phases (P3+P4+P6), for the split chart.
3. D.ledger — the natural-phase ledger: per phase, Max's progress, her spatial
   peer set (boats within PEER_NM at phase start), the peer median and rank,
   Katara56's progress, AND the whole-fleet same-water traversal stats
   (per-boat gate-to-gate crossing of the phase's DTF band) with the honest
   entry-spread badge. Phases are the stage-2 authored boundaries.
4. D.nightone — per-boat mean offshore distance and progress over the night-1
   window (23:00 Thu -> 12:00 Fri) + the quadratic fit (the middle-lane
   finding, stage-4 analysis).
5. D.soundgate — the Plum Gut entry cohort: gate time, progress 22:00->04:00,
   mean latitude, and the linear fit for the compounding line.
6. D.plumgut — every boat's gate passage epoch and SOG through the Gut
   (tracker-derived only; the predicted-current curve is evidence-class and
   rides in the module).

Every number here derives from the payload's own gridded series plus the
clean-tracks file; nothing is hand-entered.
"""
import csv
import json
import math
import pathlib
from bisect import bisect_left
from datetime import datetime, timezone, timedelta

OUT = pathlib.Path("out/dashboard_data.json")
EDT = timezone(timedelta(hours=-4))
T = lambda d, h, m=0: datetime(2026, 7, d, h, m, tzinfo=EDT).timestamp()

PHASES = [   # id, label, window (authored stage-2 boundaries), DTF band hi->lo
    ("P1", "Harbor beat",        T(23, 13, 55), T(23, 16, 55), 206, 194),
    ("P2", "Evening reach",      T(23, 16, 55), T(23, 23, 0),  194, 148),
    ("P3", "Night one",          T(23, 23, 0),  T(24, 4, 0),   148, 141),
    ("P4", "Dawn park + exit",   T(24, 4, 0),   T(24, 12, 0),  141, 129),
    ("P5", "Rebuild to the Gut", T(24, 12, 0),  T(24, 20, 35), 129, 66),
    ("P6", "Sound night",        T(24, 20, 35), T(25, 4, 0),   66, 48),
    ("P7", "Saturday run",       T(25, 4, 0),   T(25, 11, 57), 48, 0),
]
POWERED = {"P2", "P5"}
LIGHT = {"P3", "P4", "P6"}
PEER_NM = 3.0
HERO = "Max"
REF = "Katara56"
PLUM = (41.1680, -72.2150)

# LI south-shore polyline for offshore distance (geometric constant, course-model class)
SSH = [(40.5500, -73.9400), (40.5830, -73.6600), (40.5900, -73.5100), (40.6300, -73.2900),
       (40.6400, -73.1600), (40.7000, -72.9000), (40.7600, -72.7550), (40.8400, -72.4750),
       (40.8800, -72.3900), (40.9700, -72.1200), (41.0700, -71.8570)]


def geo_nm(la1, lo1, la2, lo2):
    a, b, c, d = map(math.radians, (la1, lo1, la2, lo2))
    return 2 * 3440.065 * math.asin(min(1.0, math.sqrt(
        math.sin((c - a) / 2) ** 2 + math.cos(a) * math.cos(c) * math.sin((d - b) / 2) ** 2)))


def _xy(la, lo):
    return ((lo + 73.0) * math.cos(math.radians(40.9)) * 60.0, (la - 40.9) * 60.0)


def offshore_nm(la, lo):
    px, py = _xy(la, lo)
    best = 1e9
    for (a1, o1), (a2, o2) in zip(SSH, SSH[1:]):
        ax, ay = _xy(a1, o1); bx, by = _xy(a2, o2)
        dx, dy = bx - ax, by - ay
        t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        best = min(best, math.hypot(px - (ax + t * dx), py - (ay + t * dy)))
    return best


def main():
    d = json.loads(OUT.read_text())
    boats = d["boats"]

    # series access on the gridded payload (epoch arrays)
    def at(nm, ep):
        b = boats.get(nm)
        if not b or not b.get("t"):
            return None
        t = b["t"]
        if ep < t[0] or ep > t[-1]:
            return None
        i = min(bisect_left(t, ep), len(t) - 1)
        if abs(t[i] - ep) > 900:
            return None
        if b["dtf"][i] is None or b["lat"][i] is None:
            return None
        return {"dtf": b["dtf"][i], "lat": b["lat"][i], "lon": b["lon"][i]}

    def made(nm, t1, t2):
        a1, a2 = at(nm, t1), at(nm, t2)
        return (a1["dtf"] - a2["dtf"]) if (a1 and a2) else None

    def gate_cross(nm, hi, lo):
        """First time this boat's dtf reaches hi, then lo (her own traversal)."""
        b = boats.get(nm)
        if not b or not b.get("t"):
            return None
        t_in = t_out = None
        for tt, dd in zip(b["t"], b["dtf"]):
            if dd is None:
                continue
            if t_in is None and dd <= hi:
                t_in = tt
            if t_out is None and dd <= lo:
                t_out = tt
                break
        if t_in and t_out and t_out > t_in:
            return (t_in, t_out)
        return None

    # 1. system-scoped standing note ------------------------------------------------
    for nm, b in boats.items():
        m = b.get("meta") or {}
        cls = m.get("cls") or ""
        if not cls:
            continue
        system = "ORC" if "ORC" in cls else "PHRF"
        div = cls.split(" - ")[0]
        div = (div.replace("Spinnaker Division", "Division")
                  .replace("Non-Spinnaker Division", "Non-Spin Division")
                  .replace("Double-Handed Division", "DH Division")
                  .replace("Multihull (NEMA) Division", "Multihull Division"))
        pos = m.get("clsPos")
        if pos:
            m["note"] = f"{system} · {div} · #{pos} of division"
        else:
            m["note"] = f"{system} · {div} · retired"
        b["meta"] = m

    # 1b. internal fair-comparison metric (owner, stage-4 round 1): percent behind
    # own SCORING GROUP's winner on official corrected seconds. Groups follow the
    # organizer's own place_overall universes (PHRF spinnaker circle incl. DH, ORC
    # Division 0, Non-Spinnaker circle). NO cross-system conversion exists that a
    # governing body sanctions, so none is attempted — the cross-group read rests
    # on the stated assumption that each group's winner sailed comparably well.
    # INTERNAL ANALYSIS ONLY (module fairladder + footer methodology footnote).
    import re as _re
    def _group(cls):
        if not cls:
            return None
        if "ORC" in cls:
            return "orc"
        if "Non-Spinnaker" in cls:
            return "nonspin"
        if "Multihull" in cls:
            return "multi"
        return "phrf_spin"          # Spinnaker + Double-Handed PHRF circle
    def _secs(hms):
        if not hms:
            return None
        parts = [int(x) for x in hms.split(":")]
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    gw = {}
    for nm, b in boats.items():
        m = b.get("meta") or {}
        g = _group(m.get("cls")); cs = _secs(m.get("corr"))
        if g and cs:
            gw[g] = min(gw.get(g, 10 ** 9), cs)
    for nm, b in boats.items():
        m = b.get("meta") or {}
        g = _group(m.get("cls")); cs = _secs(m.get("corr"))
        if g and cs and g in gw:
            m["fairPct"] = round((cs - gw[g]) / gw[g] * 100, 1)
            b["meta"] = m

    # 2+3. phase ledger + powered/light meta ---------------------------------------
    ledger = []
    pow_light = {}
    for pid, label, t1, t2, hi, lo in PHASES:
        m1 = at(HERO, t1)
        peers = []
        for nm in boats:
            if nm == HERO:
                continue
            a1 = at(nm, t1)
            mk = made(nm, t1, t2)
            if a1 and mk is not None and m1 and geo_nm(a1["lat"], a1["lon"], m1["lat"], m1["lon"]) <= PEER_NM:
                peers.append(mk)
        mm = made(HERO, t1, t2)
        rank = (1 + sum(1 for v in peers if mm is not None and v > mm)) if mm is not None else None
        med = sorted(peers)[len(peers) // 2] if peers else None
        # whole-fleet same-water traversal of the phase band
        travs = []
        for nm in boats:
            g = gate_cross(nm, hi, lo)
            if g:
                travs.append((nm, (g[1] - g[0]) / 3600, g[0]))
        travs.sort(key=lambda x: x[1])
        fleet = None
        if travs:
            names = [x[0] for x in travs]
            hrs = [x[1] for x in travs]
            ent = [x[2] for x in travs]
            med_h = hrs[len(hrs) // 2]
            fleet = {
                "n": len(travs),
                "rank": (names.index(HERO) + 1) if HERO in names else None,
                "hero_h": round(dict((x[0], x[1]) for x in travs).get(HERO, float("nan")), 2) if HERO in names else None,
                "med_h": round(med_h, 2),
                "spread_h": round((max(ent) - min(ent)) / 3600, 1),
            }
        ledger.append({
            "id": pid, "label": label, "hi": hi, "lo": lo,
            "t1": int(t1), "t2": int(t2),
            "hero": round(mm, 1) if mm is not None else None,
            "peer_med": round(med, 1) if med is not None else None,
            "peer_n": len(peers), "rank": rank,
            "ref": (lambda v: round(v, 1) if v is not None else None)(made(REF, t1, t2)),
            "fleet": fleet,
        })
        for nm in boats:
            key = "pow" if pid in POWERED else ("light" if pid in LIGHT else None)
            if not key:
                continue          # P1/P7 don't feed the split — a boat that
                                  # finished before P7's end must still qualify
            mk = made(nm, t1, t2)
            if mk is None:
                pow_light.setdefault(nm, {}).setdefault("bad", True)
            else:
                pow_light.setdefault(nm, {}).setdefault(key, 0.0)
                pow_light[nm][key] += mk
    d["ledger"] = ledger
    for nm, pl in pow_light.items():
        if pl.get("bad") or "pow" not in pl or "light" not in pl:
            continue
        boats[nm]["meta"]["powNm"] = round(pl["pow"], 1)
        boats[nm]["meta"]["lightNm"] = round(pl["light"], 1)

    # 4. night one: middle-lane dataset --------------------------------------------
    e1, e2 = T(23, 23), T(24, 12)
    mx = at(HERO, e1)
    rows = []
    for nm, b in boats.items():
        a1 = at(nm, e1)
        mk = made(nm, e1, e2)
        if not (a1 and mk is not None and mx) or abs(a1["dtf"] - mx["dtf"]) > 10:
            continue
        offs = [offshore_nm(la, lo) for tt, la, lo in zip(b["t"], b["lat"], b["lon"])
                if e1 <= tt <= e2 and la is not None]
        if not offs:
            continue
        rows.append({"nm": nm, "off": round(sum(offs) / len(offs), 1),
                     "dtf0": round(a1["dtf"], 1), "made": round(mk, 1)})
    # quadratic least squares via normal equations (no numpy dependency needed,
    # but numpy is in the pinned venv — use it for clarity)
    import numpy as np
    X = np.array([[1.0, r["off"], r["off"] ** 2, r["dtf0"]] for r in rows])
    y = np.array([r["made"] for r in rows])
    beta, *_ = np.linalg.lstsq(X, y, rcond=None)
    d["nightone"] = {
        "window": [int(e1), int(e2)],
        "boats": rows,
        "fit": {"b0": round(float(beta[0]), 3), "b_off": round(float(beta[1]), 3),
                "b_off2": round(float(beta[2]), 4), "b_dtf": round(float(beta[3]), 4),
                "min_off": round(float(-beta[1] / (2 * beta[2])), 1) if beta[2] > 0 else None,
                "dtf_anchor": round(float(mx["dtf"]), 1) if mx else None},
    }

    # 5+6. Plum Gut gate + Sound cohort --------------------------------------------
    src = pathlib.Path("raw/alir2026_tracks_clean.csv")
    raw = {}
    with src.open(newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            raw.setdefault(r["boat_name"], []).append(
                (int(r["epoch"]), float(r["lat"]), float(r["lon"])))
    for nm in raw:
        raw[nm].sort()
    # raw tracker names differ from payload display names (Habiru vs Habiru YCC,
    # WANDERER vs Wanderer, Little Texas YCC vs Little Texas) — join normalized
    def _norm(n):
        return " ".join(n.upper().replace(" YCC", "").split())
    disp = {_norm(nm): nm for nm in boats}
    plum = []
    for rawnm, pts in raw.items():
        nm = disp.get(_norm(rawnm))
        if nm is None:
            continue
        ds = [(geo_nm(la, lo, *PLUM), tt) for tt, la, lo in pts]
        gd, gt = min(ds)
        if gd < 2.0:
            w = [(tt, la, lo) for tt, la, lo in pts if abs(tt - gt) <= 1800]
            sog = None
            if len(w) > 2:
                dist = sum(geo_nm(w[i][1], w[i][2], w[i + 1][1], w[i + 1][2])
                           for i in range(len(w) - 1))
                span = (w[-1][0] - w[0][0]) / 3600
                sog = round(dist / span, 1) if span > 0 else None
            plum.append({"nm": nm, "gate": int(gt), "sog": sog})
    plum.sort(key=lambda x: x["gate"])
    d["plumgut"] = plum

    lo_, hi_ = T(24, 18, 30), T(24, 22, 30)
    cohort = []
    for p in plum:
        if not (lo_ <= p["gate"] <= hi_):
            continue
        nm = p["nm"]
        mk = made(nm, T(24, 22), T(25, 4))
        if mk is None:
            continue
        b = boats[nm]
        lats = [la for tt, la in zip(b["t"], b["lat"])
                if T(24, 22) <= tt <= T(25, 3) and la is not None]
        cohort.append({"nm": nm, "gate": p["gate"], "made": round(mk, 1),
                       "mlat": round(sum(lats) / len(lats), 3) if lats else None})
    if cohort:
        xs = np.array([c["gate"] for c in cohort], dtype=float)
        ys = np.array([c["made"] for c in cohort], dtype=float)
        A = np.vstack([np.ones_like(xs), (xs - xs.min()) / 3600]).T
        (b0, b1), *_ = np.linalg.lstsq(A, ys, rcond=None)
        d["soundgate"] = {"boats": cohort,
                          "fit": {"b0": round(float(b0), 2), "per_hour": round(float(b1), 2),
                                  "x0": int(xs.min())}}

    OUT.write_text(json.dumps(d, separators=(",", ":")))
    n_led = sum(1 for L in ledger if L["hero"] is not None)
    print(f"postprocess: notes for {len(boats)} boats · ledger {n_led}/7 phases · "
          f"nightone n={len(rows)} (min at {d['nightone']['fit']['min_off']} nm off) · "
          f"plumgut n={len(plum)} · soundgate n={len(cohort)}")


if __name__ == "__main__":
    main()
