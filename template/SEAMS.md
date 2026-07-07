# Template seams

`dashboard_template.html` is the NB2026 monolith, verbatim — **not** a neutral
shell. Race-unique sections are unconditional DOM (finstrip, park table, recon),
NB2026 prose is baked into the HTML, and the JS hardcodes the client-boat key.
The state model, axis-toggle machinery, `edtStr()` naive rendering, and the
won/lost chart are generic *patterns*, but the file as shipped is
worked-example code.

- **v0 protocol for a new race**: duplicate this file and hand-edit the
  race-unique sections and copy blocks. Manual, honest, acceptable for race #2.
- **SEAM 1** — shell + `race.config.js` + `modules/` split, module interface
  per RETROSPECTIVE §2 (the frozen `ctx` ABI). Lands in Phase 2 of the build;
  `modules/` is reserved for it.
- **SEAM 2** — design-token kit (`tokens.css` + `tokens.js`) per RETROSPECTIVE
  §3. Also Phase 2.

Until the seams land, the extraction targets are already prepared:
`examples/nb2026/presentation.js` (every (b)-column value) and
`examples/nb2026/copy.md` (every authored narrative block).
