# Stage 5 — Handoff & publication (Claude Code)

Requires the confirmed CP-4 record and a green regression suite. The Claude Code session inherits this same skill; per-race state arrives as files plus a thin `PROMPT.md`.

## Handoff package

- Repo state: pipeline code, `config.yaml`, `events.yaml`, the template (or shell + race config, once that refactor lands), and `decisions/CP-*.yaml`.
- `dashboard_data.json` plus the assembled reference build — the known-good HTML the chat session iterated to.
- The test harness with the race's frozen goldens.
- `PROMPT.md` (skeleton in `schemas.md`) containing:
  - a context paragraph — race, tier, client, where the project stands;
  - **invariants**: timezone-naive rendering; exact-official-endpoints; the state-model conventions; this race's golden values; anything added during CP-4 rounds;
  - **the job list**: mobile breakpoints, lazy-loading, performance budget, hosting, accessibility;
  - **the do-not-touch list**: golden values, `dashboard_data.json` semantics, module math;
  - the requirement to run the suite under a non-UTC `TZ` **before and after** the work — all green both times — and that any newly human-caught defect becomes a new assertion (prime rule 5 doesn't stop at handoff).

## Publication — CP-5 Ledger

- The per-item opt-in list for anything log-derived going public, plus explicit confirmation that everything else stays private (prime rule 4).
- A final suite run against the shipped artifact; record the build hash and URL in the ledger.
- Tier 1 may fold CP-5 into the CP-4 sign-off (nothing private to strip), but the final suite run still happens.

## Build/publish checklist (since R2)

- **Run the full chain in order** before handing off: `starter/pipeline/build_data.py races/<race>/config.yaml` → `starter/shell/build.py races/<race>` → harness under both `TZ=America/New_York` and `TZ=UTC` → `starter/pipeline/compare_data.py` (GATE A). Green throughout.
- **Stale-standalone trap:** the harness tests the *built* `dist/standalone.html`, so a source edit isn't seen until a rebuild. After editing shell/module/race source, rebuild **once with `--skip-tests`** to refresh `dist/`, then run the gated build — otherwise the test-then-build gate validates the previous artifact.
- **Committed dist:** the deployed `races/<race>/dist/` must be force-added past the global `dist/` ignore — the nix flake input serves straight from the git tree, so an uncommitted dist ships nothing.
- **Hosting:** on silverbox, `races/<race>` maps to a nginx location aliased to `${inputs.race-viz-site}/races/<race>/dist/` under the hgq.fyi vhost; deploy = push monorepo main, then `nix flake update race-viz-site && sudo nixos-rebuild switch --flake .#silverbox`.
- **Note:** there is no `KICKOFF_TEMPLATE.md` in the repo; if the skill loop wants one, extract it from this stage file rather than inventing it fresh.
