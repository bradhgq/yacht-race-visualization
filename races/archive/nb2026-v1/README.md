# nb2026-v1 — archived pre-consolidation build

This is the **single-race** RAGANA · Newport Bermuda 2026 dashboard build that was
served at `hgq.fyi/ragana-newport-bermuda-2026` *before* this repo became the
`yacht-race-visualization` monorepo. It predates the round-2 features (SOG|VMC
toggle, SDL-class / F-TCF filters, distance-vs-speed module) and the crew-record
corrections (electrolyte, Kevin memorial).

It is kept only as a **deploy rollback target** while the round-2 build
(`starter/examples/nb2026/dist/`) is verified live. Once the round-2 build is
confirmed serving, this directory is deleted (the full pre-consolidation history
remains recoverable via the git tag `nb2026-single-race-final`).

`dist/` here is the exact static tree that was hosted; it is self-contained
(`index.html` + `data/` + `vendor/`, plus a `standalone.html` for `file://`).
