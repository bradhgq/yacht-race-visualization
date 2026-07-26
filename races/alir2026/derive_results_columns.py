#!/usr/bin/env python3
"""Derive raw/alir2026_results_local.csv from the as-fetched results CSV.

Adds the two columns the pipeline's column map needs:

- finish_local: the YS export's finish_time_utc is EDT WALL CLOCK mislabeled
  with a Z suffix, in 2026 exactly as in 2025 (stage-0 probe: six boats'
  finish-line crossings sit exactly +4.00 h from the claimed values, each
  within 0.05 nm of the Glen Cove light — see decisions/stage-0-scope.yaml).
  So the derivation strips the fake 'T'/'Z' decoration and applies NO offset
  shift. If a future re-download fixes the upstream mislabel, the probe will
  catch it (+0.00 h) and this script must then convert genuinely.
- retire_reason: empty — the organizer published no reasons; finish_status
  (AOK/RET) already carries the outcome.

NOTE the four finish-time discrepancies (DUET +68.5 min, Max +40.9, Palomino
+29.2, Marie +28.5 official-minus-track-crossing) pass through UNTOUCHED:
official results are the endpoint authority (doctrine 2); the conflict is
flagged in the stage-0 record, never smoothed here.

Run from the race dir: python3 derive_results_columns.py
"""
import csv
import pathlib

RAW = pathlib.Path(__file__).parent / "raw"
SRC = RAW / "alir2026_results.csv"
DST = RAW / "alir2026_results_local.csv"


def finish_local(finish_time_utc: str) -> str:
    if not finish_time_utc:
        return ""
    return finish_time_utc.replace("T", " ").replace(".000Z", "").replace("Z", "")


def main() -> None:
    with SRC.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
        fields = list(rows[0].keys())
    for r in rows:
        r["finish_local"] = finish_local(r["finish_time_utc"])
        r["retire_reason"] = ""
    with DST.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields + ["finish_local", "retire_reason"])
        w.writeheader()
        w.writerows(rows)
    print(f"wrote {DST} ({len(rows)} rows)")


if __name__ == "__main__":
    main()
