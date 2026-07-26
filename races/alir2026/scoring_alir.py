"""ALIR 2026 mixed-system corrected-time hook (scoring.params.hook).

2026 introduced ORC Division 0 alongside the PHRF divisions, and the two score
differently in the SAME event:

- PHRF (Spinnaker / Non-Spinnaker / Double-Handed / Multihull-NEMA): time on
  distance at the SI's 207.0 nm — corrected = elapsed − rating × 207.
- ORC Division 0: time on time — corrected = elapsed × rating.

build_data passes only {'rating': …} to scoring.corrected, so the dispatch
must work from the rating value alone. That is safe here by construction:
2026 ORC ratings are float multipliers in 0.8312..0.9625 and PHRF ratings are
integer sec/mi in −24..171 with nothing in (0, 2) — verified across the whole
scratch sheet at stage 0. The probe gate (scoring.run_probe) holds this to
official results with probe boats from BOTH systems: Max and Zammermoos (ToD),
Habiru YCC (ToT).

If a future rating ever lands in (0, 2) as a PHRF value, this dispatch breaks
loudly at the probe gate — do not widen the band silently; re-derive the
dispatch from the division column instead.
"""


def corrected(elapsed_s, boat, distance_nm, cfg):
    r = boat['rating']
    if 0.0 < r < 2.0:                 # ORC time-on-time multiplier
        return elapsed_s * r
    return elapsed_s - r * distance_nm   # PHRF time-on-distance (sec/mi)
