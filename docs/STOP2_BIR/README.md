# STOP 2 — BIR 2026 everything-built review set

Full-page headless-Chrome captures of the SHELL-built BIR 2026 dashboard
(`races/bir2026/dist/standalone.html`, commit `634f2a5`). This review is both
the parity check (against the live monolith at
hgq.fyi/ragana-block-island-2026 for content, against NB2026 for visual
authority) and the cull — every chart was built; nothing was pre-trimmed.

| file | what |
|---|---|
| `desktop_full.png` | 1280 px, whole page, default state (corrected · pace, SOG) |
| `desktop_race_elapsed.png` | race chart flipped to **Elapsed** |
| `desktop_sog_vmc.png` | speed chart flipped to **VMC (toward finish)** — negatives at the rounding visible, captioned not smoothed |
| `desktop_band_002.png` | ORC ToT **±0.02 band filter** active (9 rating peers selected) |
| `mobile_full.png` | 760 px, whole page |
| `mobile_sheet.png` | 760 px, bottom sheet open (groups / filter row / chips / pills) |

Fixture status at capture: **27/27** (12 shared-runner + 15 ported BIR checks
in `tests/extra.cjs`) under both `TZ=America/New_York` and `TZ=UTC`; oracle
compare IDENTICAL; NB2026 **18/18** unchanged. Full fixture dispositions for
the monolith's 34 assertions: `races/bir2026/docs/M2-monolith-mapping.md`.

## Cull candidates (owner decides; reasons attached)

1. **"Offset from the course line" (shell xte)** — my primary candidate. The
   routed active-leg XTE re-references at each of the four mark roundings, so
   an out-and-back course reads as a busy sawtooth; the upwind-lane module
   answers "who went where" better for this race. Built per the
   everything-built rule; recommend cull (or keep as a power-user view below
   the lane).
2. **distspeed Corrected mode** — works and is honest, but with a 276-min gap
   inside a 33-boat ORC band the corrected cloud is tight; Elapsed mode
   carries the story. Keep the module, consider hiding the toggle.
3. **Rating-band custom min/max inputs** — NB power feature; the three preset
   widths likely suffice here.

## Missing vs the monolith (restore-or-accept)

- **'All boats (58)' group button** — dropped (shell buttons are static name
  lists; an all-list is possible but clutters). Accept or restore.
- Monolith map start/finish glyphs (ink square / magenta star) → shell's
  circle/square ink pair.

## Intentional deltas vs the live monolith (shell wins, per the migration rule)

1. Race chart: pace view now carries the exact-endpoint dot at the finish
   (monolith dropped endpoints in pace view); the reference line draws flat at
   zero; events ride the pinned top row (y2) instead of a data-scaled y.
2. DTF chart shows the boat legend (NB behavior; monolith hid it).
3. Event log table: NB visual style (badges, To-go column, sticky first
   column) replaces the monolith's fixed column widths — fixtures A9 / A15 /
   A16 / R9a / R9i superseded by NB visual authority.
4. "+ More" panel: NB's ranked/Retired/PHRF three-list panel replaces the
   monolith's flat chip list.
5. 'All ORC' now includes Inisharon (ORC DNF with a track — the
   class-selection-includes-DNF decision, R2 #2).
6. New sections/controls the live site doesn't have (the parity point of the
   round): dist-vs-speed scatter, SOG|VMC toggle, ORC ToT band filters,
   shell xte. classFilter omitted deliberately (two named divisions already
   have one-click group buttons).
7. Map hover: division from `meta.cls` (ORC/PHRF) rather than the monolith's
   injected `data.classes` names ("Class 6 ORC") — the payload carries no
   class_name channel; adding one would be a ledgered re-freeze if wanted.
