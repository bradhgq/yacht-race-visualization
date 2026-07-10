# BIR2026 — authored copy

The R-round approved narrative record lives in [`docs/copy.md`](docs/copy.md)
(CP-4/R9 reviewed). This race's machine copy is `copy.js` (`window.__COPY__`):
its title block, section notes and footer are the monolith `src/index.html`
blocks **verbatim** (bir2026-monolith-final tag); module section notes ride in
`modules/<id>.js` per the ABI.

Slots added at the shell migration (M2), microcopy only — flagged for the
STOP-2 owner review:

- `sections.xte` — the shell's routed active-leg offset chart (new chart, new
  caption; describes mechanics only, no analysis claims).
- `sections.sog.noteVmc` — the VMC caption (I18 wording; notes the legitimate
  rounding noise rather than smoothing it).
- `race.notes.h/e` + `race.noteDivision` — mode notes rebuilt for the shell's
  note-per-mode slot machinery from the monolith's dynamic sentence; the
  division-scoping disclosure keeps the monolith's exact claim.
- `filters.*`, `morePanel.*` — control-row microcopy (band tooltip states the
  ORC-only-by-construction scoping).
- footer gained a one-line VMC/I18 definition.

Copy freezes per CP-3 discipline; corrections need a decisions/ record.
