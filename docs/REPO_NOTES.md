# REPO_NOTES — standing decisions and open threads

Living document, kept deliberately short (owner doctrine, 2026-07-16):
an entry exists here only while it records a **standing decision not yet
encoded in CLAUDE.md / the skill / INVARIANTS.md / code comments** or an
**open thread**. When an item closes or its rule lands where it belongs, the
entry is deleted — git history is the archive (the full narrative ledger ends
at the `docs-pass` compaction commit; earlier states are one `git log --
docs/REPO_NOTES.md` away).

## Standing decisions

- **ABI amendments**: additive optional fields on the module/overlay ABI need
  only an entry here + an INVARIANTS.md note (precedents: `mapLayer`,
  `bandAnnotations`, `ctx.copy`); breaking changes need an owner adjudication.
- **REPO_SPEC v2 will not be written.** The README (layout + invocations),
  `starter/shell/INVARIANTS.md` (I1–I18 + ctx ABI), and the skill are the
  living spec. REPO_SPEC v1.1 and both round retrospectives are retired to
  git history — their content is consolidated into the skill.
- **Fixtures are authored-frozen** (`races/<race>/tests/regression.json`),
  cross-checked against config goldens by `shell/build.py` — never emitted by
  the pipeline under test (a pipeline bug must not rewrite its own fixtures).
- **Archives live in the `archives-2026-07` GitHub release**, not the tree:
  the original ragana-dashboard git bundle (unique content: the
  `claude/bir2026-productionization` branch) and the GATE-B/STOP-2 review
  capture sets. Shipped round-1 history is also reachable via the pushed tag
  `nb2026-single-race-final`.

## Open threads

- **decyb license** (YB binary decoder port): no declared license upstream;
  owner-adjudicated fine for this personal/non-commercial use with author
  attribution. Revisit before any commercial use — terms from the author, or
  cleanroom-reimplement from `starter/acquisition/README.md`'s byte-layout
  notes. (2026-07-08)
- **`docs/OPINIONS_NB/` deletion**: executes when main is next merged into
  the `nb2026-opinions` branch (PR #1) — review screenshots are PR material
  and leave the tree once their round closes; `verdict_mobile.png` can go
  immediately (nothing references it).
- **DOC_GAPS #8** (finish-line coordinate provenance) — the one open
  documentation gap; needs owner input.
