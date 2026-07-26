# ALIR 2026 — Stage-1 Research Brief (DRAFT)

Prepared 2026-07-26 against the confirmed stage-0 record and its owner amendments.
Everything quantitative below is **exploratory** (nothing has been through the
pipeline; nothing is pinned) and every verdict-shaped statement is a **hypothesis
registered for stage-2 verification** — the owner's stop instruction is that opinions
form at stages 1–2, not before, and this brief is the stage-1 half of that work:
evidence assembled, claims collected, methodology fixed. Stage 2 does the adjudication.

Data snapshot caveat (unchanged): acquired mid-race 2026-07-26 00:58 EDT; results
provisional; owner re-fetches after final scoring.

---

## 1. The owner's reframed hypothesis, and what the track shows so far

The stage-0 aggregate ("dead level with Katara56 at 04:00 Friday, therefore night 1
was fine") was **an aggregation artifact**, and the owner caught it: a gun→04:00
segment nets the Thursday reach against the night. Split at the race's natural
transitions, the picture inverts:

### Natural-phase ledger — per-phase spatial peers (boats within 3 nm of Max at phase start)

| phase | window (EDT) | Max made | peer median | Max rank | vs Div 9 rivals |
|---|---|---|---|---|---|
| P1 harbor beat, gun → Red 14 | Thu 13:55–16:55 | 11.1 nm | 8.8 (n=47) | 9/48 | Zam +2.7 · Pos +2.2 · Kat −1.3 |
| P2 the reach east | Thu 16:55–23:00 | 46.7 | 39.5 (n=42) | **1/43** | all three ≈ level |
| P3 night-1 light air | Thu 23:00 – Fri 04:00 | 6.1 | 7.6 (n=10) | **11/11** | Zam +1.6 · Pos +1.4 · Kat +1.6 |
| P4 dawn transition + park exit | Fri 04:00–12:00 | 13.1 | 17.1 (n=5) | 4/6 | Zam +13.3 · Pos +13.3 · Kat +9.7 |
| P5 rebuild → Montauk → Plum Gut | Fri 12:00–20:35 | 58.1 | 48.0 (n=6) | **1/7** | Kat −2.2 (Zam/Pos in different water ahead) |
| P6 Sound night | Fri 20:35 – Sat 04:00 | 19.8 | 27.9 (n=2) | 3/3 | Zam +16.7 · Pos +12.7 · Kat +10.2 |
| P7 final morning → finish | Sat 04:00–11:57 | 50.9 | (no boat within 3 nm) | — | — |

("made" = routed distance-to-finish progress; "+x" = rival made x nm more than Max.)

The shape: **rank 1 among her water peers in both powered phases, last or near-last
in all three light-air phases.** The log's "caught a lot of boats" on the reach is
literal — 14 boats ahead of Max at Red 14, 3 by 23:00.

### The night-1 divergence (the owner's recollection, confirmed in the track)

Through 22:00 Thursday the whole local cluster sat 1.9–2.9 nm off the beach. Between
23:00 and 02:00 Katara56 peeled offshore — 2.5 → 9.7 nm — while Max went halfway
(→ ~6 nm), then jibed back inshore at 03:00 (the log's port jibe, ~050M) and worked
toward the beach again after 05:30. During the night itself (P3) Max lost 1.4–1.6 nm
to all three rivals; at the dawn build (P4) Katara56's offshore position paid +9.7 nm
more. **The position was taken during the night; most of its price was paid at dawn**
— which is the owner's formulation, now with numbers, held for stage-2 re-derivation.

Registered for stage 2 (verdicts deferred):
- **H-A (root cause):** the night-1 half-commitment (out, then back inshore at 03:00)
  is the single decision with the largest downstream cost, because its dawn deficit
  delayed Max's Plum Gut passage into the second park (see H-C).
- **H-B (dawn mechanism):** cross-shore position paid at the dawn transition
  (+0.21 kt per nm offshore in the fleet-wide band regression, partial corr +0.64,
  n=36) and NOT during the night proper (sign flips negative) — mechanically matched
  by the observed two-station wind-gradient reversal at ~08:00 (44065 minus 44069).
  Needs pipeline re-derivation + the bay-station caveat stated.
- **H-C (compounding):** losses compounded through gate timing — the Sound-entry
  cohort (through Plum Gut 18:30–22:30 Fri) shows the front group riding the new
  easterly to 17.7–22.5 nm made (22:00→04:00) while the late group made 12.7–15.6.
  Position begets position in a race of two parks.
- **H-D (retired):** the "CT side paid on night 2" claim from stage-0 exploration
  **does not survive** the proper cohort control — within the Sound-entry cohort the
  latitude signal collapses (raw corr −0.52 driven by the position confound; partial
  corr +0.06, n=13). Recorded here so stage 2 doesn't resurrect it by accident: the
  night-2 loss is explained by entry timing plus a Max-specific residual (−3.3 nm vs
  the cohort model) that stage 2 must attribute (current line along the LI shore?
  mode/sail choices? both?) before any caption mentions sides.
- **H-E (boat character):** Max (Pogo 50, planing hull) was fastest-in-water when
  powered (P2, P5) and slowest-in-cluster in under-4-kt phases (P3, P4, P6) — the
  polar signature, not crew error, may carry a large share of the light-air losses.
  Stage 2 should attempt a crude displacement-vs-planing peer split before blaming
  navigation for what physics prescribes.

## 2. What the navigator could have known — archived-forecast evidence

Evidence class: **archived forecast** (Open-Meteo historical-forecast + previous-runs
APIs, HRRR `ncep_hrrr_conus` + ECMWF `ecmwf_ifs025`; CC-BY 4.0; served-grid caveats in
`raw/weather/weather_manifest.json` — three of five ECMWF cells centre over land).

### Night 1 → Friday morning, south-shore point (40.58, −73.10)

The Thursday-evening lead-time view (`previous_day1`) split cleanly:

| Fri hour | HRRR d1 | ECMWF d1 | observed 44065 (offshore) |
|---|---|---|---|
| 04:00 | 4.6 kn 112° | 2.6 kn 333° | 3.6 kn 321° |
| 06:00 | 3.8 kn 030° | 4.1 kn 357° | 3.9 kn 343° |
| 08:00 | **9.4 kn 006°** | 2.9 kn 360° | 3.9 kn 016° |
| 10:00 | 7.9 kn 020° | 1.9 kn 156° | 5.8 kn 033° |

- **HRRR had the N→NE shift and the morning fill on the table the evening before** —
  the crew's 04:25 log reading of HRRR ("eastward shift by 0600") was a fair reading
  of real guidance, one to two hours optimistic on timing.
- **HRRR over-called the pressure ~60%** (9.4 promised vs ~4–6 observed);
  ECMWF under-called the trend but had the light-morning magnitude right.
  Near-real-time runs scored vs 44065 over 02:00–11:00: HRRR mean error +2.1 kn /
  MAE 2.3; ECMWF −1.4 / 1.4. Direction: HRRR tracked the veer; ECMWF wandered.
- The models **disagreed on the one question that mattered** (does a sailable NE
  breeze arrive at dawn?). HRRR said yes — and where it arrived first was offshore.
  What use a navigator could make of that disagreement is a stage-3 narrative
  question, not a verdict here.

### Night 2, the Sound (midsound point 41.05, −72.60)

Friday-evening lead-time views from both models showed 7–8 kn SE holding to ~22:00,
easing around midnight, HRRR rebuilding ENE ~7 kn from 02:00. Observed (KPTN6, the
Sound's ONLY platform, far west at Kings Point): collapse to 1.3–1.7 kn 22:00–00:00 —
earlier and deeper than either model — then a rebuild from 070° after 01:00. Both
models over-carried the western Sound through the collapse; neither resolves the
cross-Sound gradient, and no observation exists for it (the stage-0 MANIFEST gap).
The 21:00 "slightly more wind CT side, not worth the distance" call is therefore
**not adjudicable from weather evidence in hand** — and per H-D the fleet outcome
doesn't adjudicate it either.

Current at the gate: the crew's 20:35 estimate (0.4–0.9 kt adverse) and the 21:40
surprise (BSP 9.5 vs SOG 6.7, ≈2.8 kt adverse) bracket the CO-OPS **prediction**
(class: predicted, harmonic) for Plum Gut — [cross-check table to be completed from
the wx_crosscheck sweep].

## 3. Scoring-controversy check (mandatory first, doctrine 6 gate)

Swept 2026-07-26 ~02:15–02:45 EDT via the YachtScoring public API, alir.org,
seacliffyc.org, and web search; every load-bearing claim adversarially re-verified.

**No scoring controversy is publicly visible — but the sweep predates the decisive
hours.** Specifics (all verified-fact against the API unless noted):

- The event's complete public document set is 10 documents; the only amendment of any
  kind is a pre-race NOR amendment (2026-06-24, the one that **added the ORC
  division**). SI amendmentNo 0. Nothing has been posted since the pre-race captains'
  meeting evening (2026-07-22).
- The public protests endpoint returns zero rows — but `allowOnlineProtestFiling` is
  false for this event, so protests would be filed on paper and **never appear
  there** (inference; the empty endpoint proves nothing).
- Live results re-fetched 02:28 EDT are field-for-field identical to the stage-0
  snapshot; no OCS/DSQ/RDG/SCP/penalty/redress strings anywhere in the results JSON;
  the four finish-time-discrepancy boats (DUET, Max, MARIE, Ripple) are plain AOK.
- The public schema has **no penalty-annotation field**: a 2% SI penalty would
  surface only as inflated elapsed, indistinguishable from a late-recorded finish.
  The tracker-vs-official gaps therefore remain unexplained by any published action.
- **Timing caveat, binding on everything above:** the sweep ran before the 11:00
  protest-hearing window, the noon time limit, and the 14:00–19:00 awards ceremony
  (trophy announcements ~17:00) — all TODAY. The owner's re-fetch pass re-runs this
  check; until then, doctrine 6 treats every margin as provisional.

## 4. Benchmark dossiers

All public-record; each dossier's top claims adversarially re-verified (noted where
the verifier refuted a detail). Division 9's rating spread is −15 to −24 sec/mi.

**Max** — Pogo 50 (Finot-Conq planing design), USA 75050, Moritz Hilf (NYC, NYYC),
PHRF −18. Won the 2025 ALIR outright (ALIR Trophy; elapsed 26:00:50, corrected
27:02:56). Program history: first-to-finish + overall + ORC-class winner, 2022
Annapolis-to-Bermuda (753 nm); 2025 Larchmont Edlu triple-trophy (best corrected AND
fastest elapsed of 51 boats); Hilf previously campaigned a Pogo 10.50 (2nd, PHRF DH,
2017 Block Island Race). 2026: 4th of 4 in Division 9, elapsed 46:43:03 — same boat,
same rating, 20h42m slower than her 2025 winning ride. No public statements found.

**Katara56** — X-Yacht 56, CAY 61887, Daniel Griffin (Port Washington; PWYC/NYYC),
PHRF −18 — the hero's exact rating. **A first-season program on an aggressive
schedule**: Block Island Race May 2026 (9th of 9, ORC class 11), Newport Bermuda
June 2026 (16th of 19, Gibbs Hill), ALIR July 2026 (3rd of 4, Division 9) — three
majors in three months. A 2025 ALIR entry ("Katara YCC", an X4.3) was withdrawn
INACTIVE, so 2026 is the program's first ALIR start. No public statements found.

**Zammermoos** — ClubSwan 42 (Frers/NYYC-Nautor project boat), USA 4224, David Fass
(Mamaroneck; NYYC/Beach Point YC), PHRF −15. **The strongest résumé in the
division**: 2025 ORC North American champion; won the 2026 Miami–Nassau Race in both
elapsed and corrected; won the ~24 h long-distance race at the 2024 ORC Worlds
(Class A, by 40 s) and finished 5th of 19 overall. Never entered ALIR 2023–2025 —
2026 is her ALIR debut, and she won the division, the fastest elapsed in the fleet,
and (provisionally, derived locally from official results) **monohull line honors:
first boat home, 06:28:13 EDT Saturday**.

**Poseidon** — Swan 45 (Frers one-design; Sailing World 2003 Boat of the Year),
USA 52059, US Naval Academy Sailing Foundation (ex-*Plenty*, 2007 Swan 45 world
champion; donated 2022, in Navy service since 2024). ALIR 2026: skipper Nico
Martinez with an 11-midshipman crew (roster public on the entry); part of a
published summer campaign (Buzzards Bay → Newport → ALIR → Governor's Cup). 3rd in
class, 2024 Newport Bermuda. The Navy's *Wahoo* took 2025 ALIR line honors; 2026
appears to be Poseidon's ALIR debut for the program. Second boat home (06:54:59).

**Habiru YCC** — J/121, USA 61124, Steve Losik (Great Neck), ORC 0.9597. The YCC
suffix is the YRALIS **Youth Challenge Cup** program (≥25% of crew aged ≤18). Won
Spinnaker Division X + the Youth Challenge Cup at ALIR 2025; in 2026 won the new ORC
Division 0 by ~1h26m corrected, posted **the best corrected time in the spinnaker
circle** (39:56:42), and was third boat home behind two 45+ footers.

**Lioness** — Sydney 38, USA 38007, owned by Lion Sailing (NYC sailmaker/rigging
firm; races as "Lion Racing"), PHRF 24. New to this ownership in 2026: won the 71st
Edlu (Larchmont, May) with three trophies including best corrected overall, first
race out. ALIR 2026: won Spinnaker Division 8; 3rd-best PHRF corrected in the
circle. Relevant to H-D: she sailed the northern Sound on night 2 and was fastest —
the standing counter-example. (Verifier refuted two of the researcher's framing
claims — "mid-fleet rating means no gift" editorializing, and "no crew published" —
both excluded here.)

## 5. Claims in circulation

**The external claims list is effectively EMPTY, which is itself the finding.** As
of 02:45 EDT today: no organizer recap exists (alir.org's newest item is Dec 2025;
alir.org/2026 is a 404), no press coverage of the 2026 running exists anywhere
found (WindCheck, Scuttlebutt, Sail-World, Newsday all negative), and the community
channels are silent (SailNet's reliable annual ALIR thread has no 2026 edition yet;
Sailing Anarchy dormant; Instagram/Facebook login-walled — recorded inaccessible,
not absent). The awards ceremony is this afternoon; the narrative vacuum will fill
this week, into the owner's re-fetch pass.

Consequence, per the completeness critic: **the owner's crew log is currently the
dominant claims source for this race** — and it enters stage 3's discrepancy
register under the owner's own directive (testimony; yields to instruments).

Claims collected for the stage-3 register (neutral, untested):
1. USCG Local Notice to Mariners (week of 07/22): regatta of **~70 sailing vessels**
   planned — vs 53 actual starters. Pre-race planning figure, checkable (primary).
2. Navy Athletics (Jun 30): Poseidon's summer campaign as announced (primary,
   pre-race).
3. Organizer's Dec-2025 planning post: 2025 line honors Navy (ALI course) / Abilyn
   (ATI course); poses "will they repeat" — 2026 answer: Navy's Poseidon did NOT
   repeat line honors (Zammermoos); Abilyn moved to the ALI course Double-Handed
   division and won it (testimony → verified locally).
4. WindCheck "Cool new stuff at the ALIR" headline (bot-walled, UNREAD): two-course
   format "first time in history" — the researcher's dating argument places this as
   a 2025-edition article; do not cite for 2026.
5. Crew-log claims 1–10 (weather/current) — all cross-checked in §6 below.

## 6. Synoptic context and weather-narrative cross-check

### The synoptic frame (NWS OKX AFD/CWF archive via the IEM AFOS API; verified)

One feature governed the whole race: **a large high building in from the Great
Lakes behind Wednesday's cold front, sitting over the waters through the weekend,
weakening as it drifted offshore.** Pre-race and race-morning products said,
in sequence: Thursday N 5–10 kt veering to an afternoon E/SE sea breeze; Thursday
night SE ~5 collapsing, becoming E-to-N after midnight (the western-Sound zone
carried an explicit S-to-N overnight shift — land-breeze-shaped, though OKX never
used the phrase; grep zero across 38 AFDs); Friday NE ~5 becoming SE afternoon.
Race-morning AFD: *"weak pressure gradient… winds light"*, sea-breeze timing
uncertainty flagged at 1–3 hours. The only marine headline all race: **leftover
southerly swell** — SCA on the ocean zones into Thursday afternoon, seas 4–6
occasionally 8 ft off Montauk. Light gradient over a big old swell is the slatting
first night the log describes. No gales, no tropical features, no marine warnings
during the race window.

### Crew-log cross-check (10 claims; evidence class labeled per claim)

The log survives contact with the instruments far better than its author warned:

| # | log claim | verdict | class |
|---|---|---|---|
| 1 | ~7 kt TWS Thu 20:30 | **corroborated** — 44065 read 7.8 kn at 20:30 | observed |
| 2 | 5–6 kt Thu 21:45 | **corroborated** — 5.8–7.8 kn decaying | observed |
| 3 | <4 kt, shifty, Fri 01:00 | corroborated on speed (3.9 kn); "shifty" partial | observed |
| 4 | ~3 kt w/ brief builds 03:00–04:30 | **corroborated** — incl. a 1.9→3.9 kn build at 03:40 with a SW→NW direction snap | observed |
| 5 | ~2 kt stuck 07:00–11:00 | partially — **no observed wind exists mid-south-shore** (44025 anemometer dead since 07-14); ECMWF supports | model-scoped |
| 6 | builds ~12:00 Fri | corroborated — 44069 3.9→7.8 kn on the SE sea breeze | observed (inshore) + forecast |
| 7 | ~8 kt Orient Pt 20:35 | corroborated within class — **Montauk corner has no observed wind** (2nd straight year) | model-scoped |
| 8 | 21:40 "past the Plums": 9.5 STW vs 6.7 SOG | **phase exactly right** — crossed ~26 min before predicted peak ebb (−2.36 kt @ 22:06; interp. −2.16 at 21:40 vs ~2.5–3 implied) — prediction slightly under the felt set | predicted current |
| 9 | mid-Sound very light Sat 01:00 | corroborated within class — **central Sound has NO observation platform at all** | model-scoped |
| 10 | builds 6–10 kt from 02:30 | corroborated — KPTN6 rebuild from 070° after 01:00 | observed (west Sound) |

Standing gaps (binding on captions, carried from the MANIFEST): Montauk corner and
central Sound unobserved; mid-south-shore wind unobserved this year; ERA5 reanalysis
absent until ~Aug 3.

### Gap the critic flagged, not yet closed

The **Captains Meeting presentation** (19-page PDF, image-only — text extraction
failed, and this environment lacks a PDF renderer) is the organizer's own pre-race
weather framing and remains unread. Queued for the owner's re-fetch pass.

## 7. Stage-2 methodology (fixed by the owner's stop decisions)

1. **Phase boundaries from the data, not the clock**: detect Red 14 turn, the
   breeze-death hour, park exit, Montauk, Plum Gut, second park, final rebuild from
   Max's own track + wind evidence; the P1–P7 table above is the draft segmentation.
2. **Per-phase spatial peer sets** (radius-sensitivity: 3 / 5 / 8 nm; report n at
   each) alongside the division-scoped scoring comparison. Peers change per phase by
   design. P4/P6 peer sets at 3 nm are thin (n=5, n=2) — widen or use the
   Sound-entry-cohort construction there.
3. **Separate contemporaneous loss from positional setup**: for each decision window,
   report (a) nm lost during the window and (b) nm lost in the following phase
   attributable to the position taken — H-A's two-part accounting.
4. **Visualize before adjudicating**: the owner wants to see the divergence, not read
   a regression. Candidate modules: the night-1 divergence map (tracks colored by
   later dawn outcome), the phase ledger as a chart, dawn-reversal small multiples
   (fleet positions at 05/08/11 with the two-station gradient inset), Sound-entry
   cohort strip. Module selection is the stage-2 stop's decision.
5. **Displacement-vs-planing peer split** for H-E before any navigation blame lands.
6. All corrected-time claims stay division-scoped (ORC ToT vs PHRF ToD boundary).

## 8. Sources

All accessed 2026-07-26 (~02:00–03:00 EDT unless noted). Research ran as a 25-agent
verified sweep; the full machine record (findings, verifier verdicts, negatives with
the exact queries) is preserved in the session workspace and its load-bearing
content is inlined above.

**Primary**
- YachtScoring public API, event 50645: `/docs`, `/protests`, `/races`, `/news`,
  `/result-detail-report?raceNumber=1`, event record, entry list (boats + crew).
- Final 2026 ALIR SI + 2026 NOR + NOR Amendment 1 (YS documents endpoint; SI sha256
  in the stage-0 record).
- NWS OKX Area Forecast Discussions + Coastal Waters Forecasts, 2026-07-22 → 07-26,
  via the Iowa Environmental Mesonet AFOS API (38 AFD + 12 CWF products).
- USCG Local Notice to Mariners, Northeast District, week of 07/22/2026.
- Local acquired evidence: `races/alir2026/raw/**` (tracker, results, scratch,
  weather; sha256s in the manifests).
- alir.org (incl. /news, /2025 trophy page), seacliffyc.org.
- Naval Academy Athletics (2026-06-30 campaign article); NASF fleet pages.
- ORC certificate registry (Zammermoos US7471); ORC Worlds 2024 / Miami–Nassau 2026
  official reports; Larchmont YC Edlu 2025/2026 results; Storm Trysail 2017 BIR
  report; Annapolis-Bermuda 2022 results.

**Corroboration (never sole support)**
- SailNet + Sailing Anarchy forum sweeps (negatives), McMichael Yacht Brokers Edlu
  recap, lionsailing.com, boat-spec aggregators, search-index snippets of
  bot-walled WindCheck/US Harbors pages (labeled UNREAD where used).

**Recorded inaccessible:** windcheckmagazine.com (403), sailboatdata.com (403),
Facebook/Instagram (login walls), Captains Meeting PDF (image-only, no renderer).
