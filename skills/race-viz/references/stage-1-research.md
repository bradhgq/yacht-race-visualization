# Stage 1 — Research

Requires the confirmed stage-0 record. Research runs natively: iterative web search/fetch against the targets below, fanned out and cross-checked. **Optional owner input:** the owner may run a chat deep-research session for a full-web narrative sweep of external references for the race; its brief lands in `races/<race>/research/` (or is pasted) and folds in as one corroboration-tier input — never sole support for a claim.

## Mandatory first check — scoring controversies

Before anything else: official notices, protest and redress decisions, rescorings, jury activity, results amendments. This gates how any tight margin may be narrated later (doctrine 6). A race with an active scoring controversy changes the meaning of every corrected-time comparison; find out now, not at synthesis.

## Targets, in priority order

1. Official recaps, notices of race, amendments, results pages — primary.
2. Broadcast and interview transcripts, if supplied — primary sources. Attribute clearly; quote sparingly and briefly (attribution is not a license to reproduce; keep quotes short and prefer paraphrase).
3. Per-comparison-boat dossiers for the benchmark set: design/type, rating, program history, notable results, public statements about this race. **Public information only** — never infer or assert other boats' internal crew decisions beyond what they've said publicly.
4. Press coverage — corroboration tier, never sole support for a claim.
5. Weather and current context: what the forecasts said pre-race versus what apparently occurred, where determinable from public sources.

## Weather narrative cross-check (when stage 0 acquired weather evidence)

If `races/<race>/raw/weather/` exists, every weather claim in circulation gets checked against it before it enters the brief: crew accounts of wind strength against the nearest NDBC station's observed range, the timing of a feature (squall line, dying gradient) against its arrival at successive stations, current-gate stories against the CO-OPS flood/ebb cycle. Label each cross-check with the evidence class — **observed** (NDBC), **model** (ERA5 — the ~25 km grid smooths micro-calms, so "model-supported, never observed" for anything the grid can't resolve), or **predicted** (CO-OPS harmonic tables) — and honor the coverage gaps the weather MANIFEST records: where no station observed, say so rather than borrowing a distant one. ALIR 2025 is the worked example (`races/alir2025/raw/weather/MANIFEST.md`): the layer corroborated the owner's squall account (31.9 kt observed vs ~30 felt), timed the squall line across three stations, and explained the park via the forecast gradient collapse — while the MANIFEST's two recorded gaps kept Montauk-corner and park-zone wind claims honestly model-scoped.

**Scope guard (unchanged from stage 0):** weather files are evidence for narrative and phase attribution only — no pipeline number may depend on them, and I18 stands: VMC, never VMG; the tracker carries no wind.

## Output — the research brief

- **Source list split primary / corroboration**, with URLs and access dates.
- **Dossier paragraphs** for each benchmark boat.
- **Claims-in-circulation list**: every checkable claim being made about the race — who won which phase, where the race was decided, what the weather story was, which boats "sailed the race of their lives." Collect these neutrally; each gets tested against the track in stage 3's discrepancy register. This list is where "insight others can't see" usually starts: the track frequently contradicts the circulating story.
- **Confidence labels** throughout: verified-fact / testimony / inference.

Soft stop: host the brief per the stop mechanic for the owner's read — this is also the natural moment for the optional chat deep-research sweep, offered as an owner task — and proceed to stage 2 on their go (or bundle the go with the stage-2 review). The brief's claims feed stage 3; its controversy findings feed doctrine check 6.
