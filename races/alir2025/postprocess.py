#!/usr/bin/env python3
"""ALIR 2025 payload postprocess — reproducible, logged (prime rule 1).

Run by build_race.py AFTER build_data.py, BEFORE the shell build (cwd = race dir).

One job: the UNIFIED OVERALL LADDER. The organizer scores three circles
separately, so meta.sdl (place_overall from the results CSV) carries three
different rank scales and three boats hold "#1" — the ranked list rendered
#1 Daffodil / #1 Dolcezza / #1 Max, which the owner ruled confusing
(stage-2 stop, 2026-07-23; decisions/stage-0-scope.yaml cross_circle_comparison
records the unified ladder itself as an approved UNOFFICIAL view).

All 43 in-scope finishers race the identical 207.0 nm ToD formula (stage-0
verified exact, including Daffodil's NEMA rating), so one corrected-seconds
sort is arithmetically well-defined:

  meta.sdl  <- unified corrected rank 1..43 (the ranked list + chips read this)
  meta.note <- the official per-circle standing, so the detail surface renders
               BOTH ("Official: 1st of 1, Multihull circle · unified 30/43"...)

cls / clsPos (division + in-division rank) are untouched — official scoring
stays visible everywhere it already was.
"""
import json
import pathlib
from datetime import datetime, timezone

OUT = pathlib.Path("out/dashboard_data.json")
CIRCLE_SHORT = {
    "Multihull": "Multihull circle",
    "Non-Spinnaker": "Non-Spinnaker circle",
    "Spinnaker": "Spinnaker circle",
}


def circle_of(cls: str) -> str:
    if "Multihull" in cls:
        return "Multihull"
    if "Non-Spinnaker" in cls:
        return "Non-Spinnaker"
    return "Spinnaker"


def dur_s(hms: str) -> int:
    h, m, s = hms.split(":")
    return int(h) * 3600 + int(m) * 60 + int(s)


def main() -> None:
    d = json.loads(OUT.read_text())
    finishers = [(dur_s(b["meta"]["corr"]), nm) for nm, b in d["boats"].items()
                 if b["meta"].get("corr")]
    finishers.sort()

    # official per-circle overall rank, recomputed from the same corrected sort
    # (equals the results CSV's place_overall; asserted below, never assumed)
    by_circle = {}
    for _, nm in finishers:
        c = circle_of(d["boats"][nm]["meta"]["cls"])
        by_circle.setdefault(c, []).append(nm)

    for uni, (_, nm) in enumerate(finishers, 1):
        meta = d["boats"][nm]["meta"]
        c = circle_of(meta["cls"])
        circ_rank = by_circle[c].index(nm) + 1
        official_sdl = meta["sdl"]
        assert official_sdl == circ_rank, (
            f"{nm}: recomputed circle rank {circ_rank} != official place_overall "
            f"{official_sdl} — refusing to overwrite a rank I cannot reproduce")
        meta["sdl"] = uni
        n_circ = len(by_circle[c])
        suffix = 'st' if official_sdl == 1 else 'nd' if official_sdl == 2 else 'rd' if official_sdl == 3 else 'th'
        meta["note"] = (f"Unofficial unified ladder: {uni}/{len(finishers)} · "
                        f"official {official_sdl}{suffix} overall, {CIRCLE_SHORT[c]} "
                        f"({n_circ} boat{'s' if n_circ != 1 else ''})")

    # THE DOOR metrics -> meta (stage-4 round-1 defect fix): the door module first
    # computed enter/hours client-side from t/dtf series — but the split build
    # ships full series only for the core boats until more.json loads, so the
    # live page drew 6 dots where the standalone harness saw 43. meta ships for
    # EVERY boat in core.json, so the numbers are computed here once, from the
    # same gridded dtf the pipeline built, and the module just reads meta.
    n_door = 0
    for _, nm in finishers:
        b = d["boats"][nm]
        meta = b["meta"]
        enter = next((b["t"][i] for i, x in enumerate(b.get("dtf") or [])
                      if x is not None and x <= 15), None)
        if enter is None:
            continue
        fin_local = datetime.strptime(meta["fin"], "%Y-%m-%d %H:%M:%S")
        fin_epoch = fin_local.replace(tzinfo=timezone.utc).timestamp() + 4 * 3600
        meta["doorEnter"] = int(enter)
        meta["doorHrs"] = round((fin_epoch - enter) / 3600, 2)
        n_door += 1

    # Compact division labels (stage-4 round 2, owner): the results carry
    # "Spinnaker Division X - Warning Signal 12:00"-style strings; meta.cls is a
    # display surface (ranked rows, hovers, filters), so shorten it. The full
    # strings remain in config divisions_in_scope and the raw results.
    SHORT = {"Non-Spinnaker Division 1": "NS Div 1", "Non-Spinnaker Division 2": "NS Div 2",
             "Spinnaker Division 4": "Div 4", "Spinnaker Division 5": "Div 5",
             "Double-Handed Division 7": "DH Div 7", "Spinnaker Division 9": "Div 9",
             "Spinnaker Division X": "Div X", "Spinnaker Division 0": "Div 0",
             "Multihull (NEMA) Division M": "Multihull"}
    n_cls = 0
    for b in d["boats"].values():
        cls = b["meta"].get("cls") or ""
        for long, short in SHORT.items():
            if cls.startswith(long):
                b["meta"]["cls"] = short
                n_cls += 1
                break

    OUT.write_text(json.dumps(d, separators=(",", ":")))
    print(f"postprocess: unified ladder applied to {len(finishers)} finishers "
          f"(circles: { {c: len(v) for c, v in by_circle.items()} }); "
          f"official circle ranks preserved in meta.note; door metrics on {n_door} boats; compact division labels on {n_cls}")


if __name__ == "__main__":
    main()
