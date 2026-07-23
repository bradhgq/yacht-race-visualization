# ALIR 2025 — Stage-1 Research Brief

Around Long Island Regatta, 48th annual · Sea Cliff Yacht Club · 24–26 July 2025
Compiled 2026-07-23. All access dates 2026-07-23 unless noted.

Requires the confirmed stage-0 record (`decisions/stage-0-scope.yaml`). Produces no
pipeline numbers. Its claims list is the test matrix for stage 2; its controversy
finding gates doctrine 6 (how tight margins may be narrated).

Confidence vocabulary used throughout: **verified-fact** (official record or our own
primary data) · **testimony** (a named eyewitness) · **inference** (someone's
reasoning from what they saw) · **unsourced** (assertion with no traceable origin).

---

## 1. Mandatory first check — scoring controversies

**Verdict: no evidence of any scoring dispute. The published results are final and
uncontested.** Confidence: high. This is a supported negative, not a failed search —
four independent channels agree, and the two most load-bearing were re-verified
directly rather than taken on report.

| Channel | Evidence | Verified |
|---|---|---|
| YachtScoring documents endpoint | `api.yachtscoring.com/v1/public/event/50029/docs` returns exactly 8 documents; **0 created after the 24 Jul start**; **0 carrying `amendmentNo > 0`**. Latest is the Captains' Meeting Presentation (24 Jul). The SI is v1.3 of 22 Jul — a pre-race revision. | re-run directly |
| Event record | Same API: `resultStatus: "Final"`, `isCompleted: true`. | re-run directly |
| Notice Board | `yachtscoring.com/notice_board_summary/50029` — empty, no protests recorded. The SI designates this and the Documents page as the venues for notices to competitors, so silence here is meaningful. | reported by recon |
| Scoring codes in the results | Our own `raw/alir2025_results.csv` carries only `AOK`, `RET`, `DNC` — **no `RDG`, `DSQ`, `DPI`, or `TLE`**, and no footnotes. Redress cannot be granted invisibly; it would appear as RDG. | our primary data |

**Consequence for the narrative:** the 4:50 spread across the top three of the
Spinnaker circle may be narrated as rating-scale noise (doctrine 6) without the
complication of an active protest or rescoring.

**Residual risk, stated plainly:** the ALIR Facebook and Instagram pages and the two
competitor WhatsApp groups set up by the SI are login-walled and could not be read.
Informal grumbling, if any exists, would live there. Nothing in the official record
hints at it.

---

## 2. Sources

### Primary

| Source | URL | What it gives | Reachable |
|---|---|---|---|
| Official trophy list | https://www.alir.org/2025 | All 16 trophies and winners | yes |
| Sailing Instructions v1.3 | YachtScoring docs, event 50029 | Course, the single mandatory mark, finish line, 207 nm scoring distance, 250 nm for the Islands course, time limit noon Sun 27 Jul, staggered starts 1100–1220 | PDF; text extracted |
| Notice of Race | YachtScoring docs, event 50029 | Entry conditions | PDF, not extracted |
| Full cumulative results | https://www.yachtscoring.com/event_results_cumulative/50029 | Division places, skippers, clubs | JS-rendered; needs a text proxy |
| Event + results API | `api.yachtscoring.com/v1/public/event/50029[/docs]` | Status, documents, results feed | yes |
| **Our own acquired data** | `races/alir2025/raw/` | Results, scratch sheet, 26k tracker pings — the *primary* evidence for this project | n/a |
| WindCheck feature, by Barry Lenoble | https://www.windcheckmagazine.com/article/sounds-great-wins-2025-around-long-island-regatta/ | First-person account, Sound's Great | **403 to plain fetch**; body retrieved via `r.jina.ai` proxy |
| SailNet thread, BarryL | https://www.sailnet.com/threads/2025-around-long-island-regatta.354357/ | Same author, extra tactical detail | 307s to a non-resolving host; proxy works |
| SailNet season recap, BarryL | https://www.sailnet.com/threads/2025-sailing-season-recap.354735/ | One-sentence summary of the race | proxy |
| NWS OKX storm event page, 25 Jul 2025 | https://www.weather.gov/okx/20250725 | Dedicated severe-weather writeup for the race day | yes |
| NWS OKX Area Forecast Discussions | `mesonet.agron.iastate.edu/wx/afos/p.php?pil=AFDOKX&e=202507260015` (and `…0606`) | The forecast narrative for the calm night | yes |
| Navy Sports recap | https://navysports.com/news/2025/8/11/offshore-sailing-wraps-up-summer-slate.aspx | Wahoo's result, independent of the OA | yes |
| The WaterFront Center | https://www.thewaterfrontcenter.org/news/alir2025 | Junior team account (Little Texas YCC) | yes |
| **Owner testimony — Daffodil** | Brad, 2026-07-23, in session | Squall as experienced on deck; sail handling; wind either side | n/a |

### Corroboration tier

Sea Cliff YC event page (evergreen boilerplate) · alir.org/news (7 posts, all pre-race
bar a Dec 2025 "planning for 2026") · NEMA event listing (logistics only) · PhotoBoat
gallery, paywalled · Pogo 50 and Ker 50 design pages · nymediaboat.com 2016 ALIR post.

### Reachability notes worth reusing

- `https://r.jina.ai/<url>` defeats the WindCheck 403, the SailNet redirect, **and**
  YachtScoring's JS-only results pages.
- YachtScoring PDFs return binary that plain fetching cannot parse; ghostscript
  extracts them.
- The API's docs endpoint returns `{count, rows}` — a parser looking for `data` or
  `documents` silently reports zero. This bit us once during this very check.

---

## 3. The single-source problem — and why it partly resolves

**The entire published narrative of ALIR 2025 rests on one person.** Barry Lenoble of
*Sound's Great* wrote the WindCheck feature and both SailNet threads. There is no
independent published testimony from Max, Wahoo, Phantom, Habiru, Daffodil, or
Dolcezza. His vantage is one boat in Spinnaker Division 5.

Two things materially improve that position:

**(a) His account is measurably accurate.** Testing his published timestamps against
our tracker — this is triage of a source, not analysis:

| His claim | Our tracker | Agreement |
|---|---|---|
| Rounded R14 at 1:29 PM Thu | closest approach 0.18 nm at **13:30 EDT Thu** | within a minute |
| Rounded Montauk at 3:30 AM | 0.22 nm at **03:20 EDT Friday** | within 10 min — **and it settles the date** |
| Matinecock Point 9:40 PM Fri, 3 nm out | 0.87 nm at **21:40 EDT Fri** | exact |
| At midnight, 100 yards from the committee boat | **00:15–01:05 Sat parked at 0.09 nm** (≈175 yd), 0.05–0.35 kt for ~55 min | corroborated |
| Finished after 12:45 AM Sat | official finish **01:09:55**, last ping 01:10 | consistent |

A witness this precise on the checkable details earns provisional credit on the
uncheckable ones. Note the WindCheck text labels the Montauk rounding "Saturday";
the tracker says **Friday**, and his own internal arithmetic (19 hours elapsed at
6:20 AM) agrees with the tracker. Treat the published day-label as an error.

**(b) We now have a second eyewitness.** Brad's account from Daffodil's deck is
independent testimony from a different boat, different division, different part of the
Sound. It agrees with Lenoble on the essentials — a violent, short squall on Friday
afternoon in air that was otherwise nearly calm.

---

## 4. Per-boat dossiers

Public information only. Nothing here asserts another crew's internal decisions
beyond what they have said publicly.

**Max** — Pogo 50, Moritz Hilf, New York YC. Winner, Spinnaker Division 0, and holder
of the **Around Long Island Regatta Trophy for the overall Around Long Island course**
(verified-fact, official trophy page). Published material is thin: no interview, no
crew account. One useful historical thread — a 2016 report has Moritz Hilf finishing
second in the double-handed division with a **Pogo 10.5** also named *Max*
(nymediaboat.com). **Flag before treating "Max" as one boat across years.** The Pogo 50
is a Finot-Conq design: beamy, light, twin-ruddered, built for fast offwind sailing.

**Daffodil** — Corsair F31R trimaran, Alex Watson, NEMA. **The only multihull entered**,
so Division M was a one-boat division and her "First to Finish (Multihull)" trophy and
her division win are the same 1-of-1 fact stated twice (verified-fact). No published
coverage of the boat at all. Owner testimony now supplies the only deck-level account.
On the unofficial unified corrected ladder she sits 30th of 43 — which is where any
real comparison for her has to come from.

**Habiru YCC** — J/121, Steve Losik, United Yacht Club. Winner, Spinnaker Division X;
**Youth Challenge Cup** (verified-fact). Active Long Island Sound ORC campaign. The
"YCC" suffix is an SI requirement for Youth Challenge Cup scoring, not part of the
boat's name — relevant to our name-normalisation. No published crew account.

**Wahoo** — Ker 50, US Naval Academy (skipper of record 1/C Eddie Konjoyan). **First to
Finish, Around Long Island course**, plus the service-academy trophy; 2nd in Division 0
and 3rd overall on corrected time. Independently corroborated by Navy's own athletics
recap — the only boat with a source outside the organising authority. Ex-*Snow Lion*,
donated to USNA in 2016. A roster page elsewhere names a different midshipman in
connection with the boat; treat the skipper-of-record attribution as the official one.

**Phantom** — J/105, Max Hafen, Centerport YC. Winner, Spinnaker Division 9, and **2nd
overall on corrected time in the Spinnaker circle** at +4:05 behind Max — verified from
our own official results file, though notably **invisible in any public source**. No
published coverage whatsoever.

**Dolcezza** — Hunter Legend 37.5, Neill Parker Jr. Winner of the Non-Spinnaker circle
overall, by 3:54. No published coverage. (Note the entry list carries two boats named
Dolcezza; this is the sail-53 boat — see the stage-0 record.)

**Sound's Great** — Jeanneau 409, Barry Lenoble, MSSA. Winner, Spinnaker Division 5;
**22nd of 32 on corrected time within the Spinnaker circle**. By far the best-documented
boat in the fleet. Lenoble states this was his **11th ALIR**, his 4th aboard this boat,
and a **third consecutive Division 5 win** (2023–2025), and that it was his last race
on her. Crew named in his account.

---

## 5. Claims in circulation

Collected neutrally. Each is tested against the track at stage 2/3.

### About the result

**C1. "Sound's Great wins the 2025 Around Long Island Regatta."** WindCheck headline.
**Verdict: PARTIAL — true divisionally, false as stated.** The official trophy page
awards the overall Around Long Island Regatta Trophy to **Max**; Sound's Great appears
nowhere on the 2025 trophy list, won Spinnaker Division 5, and was 22nd of 32 on
corrected time in its own circle, 4h 40m behind Max. The article beneath the headline
is an honest first-person account of *that boat's* race and does not itself claim the
regatta. Confidence: verified-fact (both halves). **Copy must credit Max with the
regatta and Sound's Great with its division.**

**C2. Third consecutive Division 5 win for Sound's Great (2023, 2024, 2025).**
Testimony; the 2025 leg is verified-fact. The earlier two are unverified here.

**C3. Wahoo took line honours but finished 2nd in division and 3rd overall.**
Verified-fact, double-sourced (our results + Navy). A useful public illustration that
elapsed-time leader ≠ corrected-time winner.

### About how the race played out

**C4. The first half was fast: 10+ kts under downwind sail along the south shore with
surges to 12; R14 rounded 1:29 PM; Montauk "in record time" at 03:30 in 15–20 kts
gusting 25, with 4–5 ft seas.** Testimony (Lenoble); timestamps already corroborated
(§3). "Record time" is unverified and probably unverifiable without prior-year data.

**C5. Two squalls crossed the fleet in Long Island Sound on Friday afternoon/evening;
the second, near Northport, was over 35 kts for roughly 15 minutes.** Testimony
(Lenoble, who also relays *Bay Retriever* reporting 35 kts in the first).
**Strongly corroborated by the NWS**, which published a dedicated event page for
25 July 2025: a pre-frontal trough and cold front triggered a broken line of severe
storms, active roughly 2:20–6:00 PM EDT, with one cluster running from the
Westchester/Fairfield border into central Long Island, and marine stations from
Norwalk to Jersey City recording **40–55 mph gusts**. Confidence: testimony +
verified-fact meteorology.

**C6. (Owner testimony, Daffodil.) A short violent squall on Friday afternoon, felt at
about 30 kts for roughly two minutes; main and jib dropped before/during, jib-only for
a few minutes after, then main re-set. Wind on either side of it was around 2 kts, so
the squall was a welcome push.** Independent second-boat testimony. Our own buoy data
shows a propagating signature that fits: Kings Point gusts 24.5 kt with a sharp
direction reversal at 15:36 EDT, NY Harbor **31.9 kt** at 16:40 with direction snapping
through 90°+, offshore of Islip 23.5 kt at 17:30. **Note the open question:** Brad
recalls one squall, Lenoble reports two. Both may be right from different positions —
that is exactly what a moving-frame analysis has to resolve.

**C7. "Reports of dismastings," shredded sails, boats withdrawing after the second
squall.** **Unsourced** — relayed hearsay, no named boat anywhere. Our results show 7
RET and 2 DNC, consistent with attrition but attributing no cause. **Do not repeat as
fact.** The tracker can show where and when the retirees stopped; it cannot show why.

**C8. The Sound went calm on the night of 25–26 July, hard enough that a competitive
boat anchored ~100 yards from the finish around midnight and did not cross until after
12:45 AM.** Testimony, and **corroborated by our tracker** (§3). The forecast narrative
supports it: NWS discussions that evening had convection clearing the waters by ~9 PM
and high pressure building in behind the front, advertising only a brief period of
20 kt gusts and otherwise sub-advisory conditions — the classic post-frontal gradient
collapse. Confidence: high.

**C9. Sound's Great stayed toward the Long Island shore while Towhee went toward the
Connecticut side, and the split decided Division 5 — Towhee's main halyard broke in a
squall, costing over an hour.** Testimony as to the split (cleanly falsifiable from two
tracks); **inference** as to causation, and it concerns a rival's boat, so the breakage
claim is not direct observation. Towhee finished 3rd in Division 5, which is at least
consistent.

**C10. Matinecock Point at 9:40 PM Friday, 3 nm from the finish — then nearly three
hours to cover it.** Testimony, corroborated (§3). The sharpest single expression of
the finishing parking lot.

**C11. The course allowed either Plum Gut or The Race.** Verified-fact — the SI
mandates neither, and the WaterFront Center account describes the choice the same way.
Our own tracking shows 42 of 43 finishers took Plum Gut, and one (Yopo) took the
Sluiceway.

---

## 6. Weather narrative from public sources

What was *said*, as distinct from the observational data already in `raw/weather/`:

- **NWS OKX considered 25 July 2025 significant enough to warrant its own event page** —
  a broken line of severe thunderstorms ahead of a cold front, roughly 2:20–6:00 PM EDT,
  with three clusters, one tracking from the Westchester/Fairfield border into central
  Long Island. Marine gusts of 40–55 mph were recorded between Norwalk and Jersey City;
  land maxima reached the low 60s in New Jersey. This is the public, independent
  confirmation of both eyewitness squall accounts.
- **The forecast for the night that followed explains the park.** The evening discussion
  had convection clearing the waters by about 9 PM and a cooler, drier air mass
  filtering in as high pressure built from the north; the overnight marine outlook
  offered only a brief period of 20 kt gusts and otherwise sub-advisory conditions. By
  the small hours the discussion had high pressure over the area and winds going
  northwesterly and light. **No meaningful wind was forecast for the Sound overnight
  25–26 July** — which is what boats parking off Glen Cove at midnight looks like in a
  forecast product.
- **Standing caveat from stage 0:** we hold no *observed* wind for the Montauk corner or
  the central Sound (every 2025 platform there is dead). Wind in those two places is
  reanalysis-model only, and its ~25 km grid smooths precisely the micro-calms that
  decided the finishing order. Any claim about wind there must say so.

---

## 7. Notable absences — themselves a finding

- **No official recap of any kind.** For a 48th-running, 57-boat, two-course regatta, the
  organising authority published a trophy list and nothing else. The news page runs from
  pre-race sponsorship posts straight to a December "planning for 2026" note.
- **No press coverage.** No Newsday, no Scuttlebutt, no Yachts & Yachting, no trade
  reporting. WindCheck's only 2025 ALIR item is a competitor's own first-person piece.
- **Nothing published about Phantom or Dolcezza** beyond their result lines, despite both
  winning something — and Phantom's 2nd overall is invisible outside our own data.
- **Nothing published about Max**, the overall winner, beyond the trophy line.
- **Login-walled and unread:** ALIR Facebook and Instagram, and the competitor WhatsApp
  groups — the only plausible venues for damage reports or informal chatter.

**What this means for the project:** the tracker is not one source among many, it is
*the* source. The analysis will carry essentially all of the interpretive weight, and
almost anything we find will be genuinely new rather than a restatement of a public
account. It also raises the standard of care: with no press to contradict, an
overstated claim from us would stand unchallenged.

---

## Handoff to stage 2

Test matrix, in rough priority order — each to be verified against the track before any
view displaying it is built (doctrine 7), with the verdict shipped in the caption
whichever way it lands:

1. **Max cleared the course before both the squall and the park** — the mechanism behind
   the overall win. Includes the honest counterweight: boats still racing received
   pressure she never got, so finishing early was not purely an advantage.
2. **The Friday squall(s) as a propagating event** reaching boats at different times and
   to different degrees — moving-frame metric, anchored to two independent deck accounts
   (C5, C6) and the NWS timeline. Resolve one-squall vs two.
3. **The Sound park** — a spatial slow-zone metric run over each boat's own traversal of
   the band, never a wall-clock window (doctrine 1).
4. **Daffodil's south-shore reach to Montauk** — speed against the fleet within a spatial
   band; the trimaran doing what it was built for.
5. **Daffodil's night leg toward Plum Gut** — Brad's own recollection of sailing lower
   and further north than optimal, on his watch. Test, don't assume.
6. **The Sound's Great / Towhee shore split** (C9) — two tracks, cleanly falsifiable.
7. **Where and when the seven retirements stopped** — bounded by what tracks can show;
   the dismasting claim (C7) stays unsourced.
