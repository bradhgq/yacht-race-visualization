# RAGANA · Newport Bermuda 2026 — race-analysis dashboard

A crew's-eye reconstruction of RAGANA's (Cape Fear 38, USA 52238) 2026 Newport
Bermuda Race — 46/86 St. David's Lighthouse Overall — from the YB tracker, the
boat's nav log, and the on-course broadcast. Hosted publicly at
<https://hgq.fyi/ragana-newport-bermuda-2026/>.

## Layout

- `src/` — the app: `index.html`, `styles.css`, `app.js`, `helpers.js`
  (pure, node-testable helpers), `favicon.svg`, `vendor/` (pinned Plotly
  2.35.2 *basic* bundle, self-hosted — every chart is a scatter trace)
- `dashboard_data.json` — **authoritative** data payload; do not recompute
  race numbers (each has been reconciled against official results and the
  nav log)
- `build.py` — runs the regression tests, splits the data into
  `core.json` (eager) / `more.json` (on-demand) / `fleet.json` (after first
  paint), stamps cache-busting hashes, and writes `dist/` ready to drop into
  a static site — plus `dist/standalone.html`, a single self-contained file
  that works from `file://`
- `scripts/make_og.py` — regenerates `og.png` (social preview) from the data
  via headless Chrome
- `test/regression.test.cjs` — the three hard-won correctness checks (see
  below) plus name-normalization guards; a build gate
- `export_json.py` — pipeline from the raw YB tracker CSV (`nb2026_tracks.csv`,
  not in the repo) to `dashboard_data.json`
- `assemble.py`, `dashboard_template.html`, `ragana_nb2026_dashboard.html` —
  the inherited v5 single-file reference build, kept for provenance
- `PROMPT.md` — the productionization brief this repo implements

## Build & serve

```sh
python3 build.py          # tests + dist/
cd dist && python3 -m http.server 8000
```

`file://` won't fetch the split data — use the server above, or open
`dist/standalone.html`, which embeds everything.

## Tests

```sh
npm test    # = TZ=America/New_York node --test test/regression.test.cjs
```

Guards, per the brief:
1. **Timezone safety** — chart x-values are timezone-naive EDT strings;
   `edtStr(1782094500) === '2026-06-21 22:15'` under a US-Eastern TZ.
2. **Exact endpoints** — the won/lost chart ends at official results:
   RAGANA vs Christopher Dragon = +94.0 min corrected / +155.3 min elapsed.
3. **The park metric** — own-traversal of DTF 180→80, never a wall-clock
   window; Gemini II = 31% under 4 kts.

## Deploy (silverbox)

The repo's committed `dist/` is served as a Nix flake input — see
`hosts/silverbox/hgq-fyi.nix` in nix-config. To ship an update:

```sh
python3 build.py && git commit -am "..." && git push        # here
nix flake update ragana-newport-bermuda-2026 && sudo nixos-rebuild switch --flake .  # on silverbox
```

## Data notes

Regenerating `dashboard_data.json` needs `nb2026_tracks.csv` (YB tracker
export, 252,046 rows) — Brad has it. Two boats are named Phoenix
(`Phoenix USA25329`, `Phoenix USA93063`); "Hissy Fit II" is
whitespace-normalized from the CSV's double space.

Out-of-scope wishlist (footer): NOAA Gulf Stream overlay, GFS wind underlay,
animated time scrubber, synced hover.
