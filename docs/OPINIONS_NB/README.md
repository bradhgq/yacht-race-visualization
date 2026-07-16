# NB2026 opinion layer — review set (branch nb2026-opinions)

Headless-Chrome captures of the three tier-1 panels added on this branch
(source truth: the branch build; dist/ itself is NOT committed here — the
committed dist stays production until merge + rebuild).

| file | what |
|---|---|
| `verdict_panel.png` | the five-call verdict panel (desktop, 1280) |
| `phasegap.png` | per-phase decomposition vs Christopher Dragon, corrected — bars reconcile to the official +94.0 |
| `verdict_mobile.png` | verdict cards at 390 px (single column) |

Fixture status at capture: NB 23/23 (19 shared + 4 in the new tests/extra.cjs)
under both TZs; oracle IDENTICAL; BIR untouched (29/29).
