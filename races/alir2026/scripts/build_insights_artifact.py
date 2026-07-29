#!/usr/bin/env python3
"""Assemble the full-catalogue insights page: all 30 charts, one per C-id.

    .venv/bin/python races/alir2026/scripts/build_insights_artifact.py <insights.json> <out.html>

The five shipped dashboard modules render through their real module code (the
registerModule shim, as in build_review_artifact.py); the other 25 charts are
built here from insights.json. Every panel carries its catalogue id, a status
chip, and a caption stating evidence class and confidence — the catalogue's
honesty rules travel with the pixels.
"""
import json
import pathlib
import sys

R = pathlib.Path(__file__).resolve().parents[3]
RACE = pathlib.Path(__file__).resolve().parents[1]

def main(insights_path, out_path):
    plotly = (R / "starter/shell/vendor/plotly-basic-2.35.2.min.js").read_text()
    maxdata = (RACE / "modules/maxdata.js").read_text()
    mods = {m: (RACE / f"modules/{m}.js").read_text()
            for m in ["maxwind", "maxpolar", "maxsails", "maxtruth", "maxfcst"]}
    insights = pathlib.Path(insights_path).read_text()
    js = (pathlib.Path(__file__).parent / "insights_charts.js").read_text()

    CARDS = [
        ("A", "Wind truth — the layer the tracker never had",
         "Every wind number in the shipped dashboard is a buoy 10–40 nm away or a model. "
         "These are measurements at the boat.", [
            ("C1", "SHIPPED", "module:maxwind", "", ""),
            ("C2", "CANDIDATE", "c2", "The dawn-park compass",
             "The park, as a compass. Each dot is a 5-minute median of wind direction; time spirals "
             "outward from 04:00 (centre) to 12:00 (rim), shade is wind strength. The trace wanders "
             "through essentially the whole rose — a 348° range — while the breeze sat under 3 kt for "
             "38% of the window. <b>[fact]</b> for the geometry; <b>[inference]</b> that "
             "directionlessness, not mere calm, is what cost the time. Evidence: measured TWD, "
             "5-minute medians, timescale stated."),
            ("C3", "CANDIDATE", "c3", "Apparent vs true wind — the breeze the boat makes",
             "Each dot is two minutes of racing: true wind across, apparent wind up, shade = boat "
             "speed. Above the diagonal the boat is adding wind (beating — the dark fast dots), below "
             "it subtracting (running). This is why the reaches <i>felt</i> windier than the park was "
             "calm: at 8 kt TWS upwind she carried 12+ kt across the deck; dead downwind the same "
             "gradient read as 4. <b>[fact]</b> — primary masthead channels vs the computed solution."),
            ("C4", "CANDIDATE", "c4", "Was her wind the buoys' wind?",
             "Max's measured wind against the three NDBC stations the shipped dashboard leans on, "
             "hourly. Where the magenta line parts company with a station, every buoy-based claim "
             "about her water inherits that gap. <b>[fact]</b> for the differences; <b>[inference]</b> "
             "for any claim about spatial extent — three stations and one boat cannot map a gradient. "
             "Evidence: instruments + NDBC (public domain, already in the repo)."),
            ("C5", "CANDIDATE", "c5", "Sea temperature — the passage in one trace",
             "23.4 °C in the harbour, 18.0 °C off the south shore Friday, 21.7 °C in the Sound. "
             "<b>[fact]</b> for the values. Deliberately <i>not</i> annotated with a thermal-front "
             "story: asserting the water drove the wind would be [inference] dressed as physics."),
            ("C6", "CANDIDATE", "c6", "Barometer — thin, and shown honestly",
             "29.5% coverage, 1018–1023 hPa total range. The gaps are real gaps and drawn as such. "
             "Supports \"nothing dramatic passed through\" and nothing stronger. <b>[fact]</b>, but "
             "thin — included because hiding a weak channel would misrepresent the dataset."),
        ]),
        ("B", "Forecast decision quality — no internet data",
         "The shipped forecast card scores archived models against buoys. These score the five GRIBs "
         "that were physically aboard against the wind she measured — \"was the information the "
         "navigator had good, where he was?\"", [
            ("C7", "CANDIDATE", "c7", "The onboard report card, per model",
             "Bias and absolute error against measured wind at her position, observed TWS ≥ 6 kt "
             "(direction in drifting air is noise). Every model under-forecast; the coarse global GFS "
             "beat the 0.025° HRRR-X. <b>[fact]</b> for the arithmetic; <b>[inference]</b>, and weak, "
             "for any model ranking — n = 43 hours from one race is a report card on these files, not "
             "a verdict on ECMWF."),
            ("C7–C10", "SHIPPED", "module:maxfcst", "", ""),
            ("C8", "CANDIDATE", "c8", "The park was not forecast",
             "Measured wind through the park window (line) against every forecast value any file "
             "aboard carried for those hours (dots). The breeze died to 1.8 kt; the files said 4–8. "
             "<b>[fact]</b> for the miss. <b>[inference]</b> for \"this is why the fleet got caught\" — "
             "one boat's instruments cannot speak for 51 others."),
            ("C9", "CANDIDATE", "c9", "The 162° miss",
             "For 05:00 Saturday the last ECMWF aboard had 1.6 kt from 243°. The easterly arrived at "
             "8.4 kt from 045° — the opposite side of the compass, at five times the strength. Arrows "
             "point the way the wind blows. <b>[fact]</b>; predictions vs measurement."),
            ("C10", "BLOCKED", "c10", "Information age — the staleness clock",
             "How old the newest forecast aboard was, at every moment of the race. Last download "
             "19:12 Thursday, 5.3 h after the gun; the remaining 41 h — the park, the Gut, the whole "
             "Sound night — sailed on ageing data, 41 h old at the finish. <b>BLOCKED</b>: this is "
             "[fact] only if the five files are the complete set. Unconfirmed — do not ship until the "
             "owner confirms nothing else was downloaded."),
            ("C11", "CANDIDATE", "c11", "Does forecast age cost accuracy? (thin)",
             "Absolute wind-speed error against hours-since-download. Shown as a scatter and "
             "deliberately <i>not</i> fitted: 80 points across five lead bins cannot separate skill "
             "decay from different bins sampling different weather. <b>[inference]</b>, low "
             "confidence, shown for completeness."),
            ("C12", "CANDIDATE", "c12", "The download that carried no wind",
             "GRIB message inventory per file. EX_HRRR_0027 holds 19 complete messages, clean "
             "terminator — and only the u-component. One of five downloads could never have produced "
             "a wind vector. <b>[fact]</b>; a request-configuration artefact worth a navigator's "
             "minute before the next race."),
            ("C13", "CANDIDATE", "c13", "The pattern vs the strength — HRRR-X at dawn",
             "The HRRR-X wind field for 06:00 Friday (shown at 0.05°), with her track and her "
             "position at that hour. The model had the <i>shape</i> of the south-shore light patch — "
             "and at this hour it even had the value at her position about right (annotation quotes "
             "both). The park's fatal miss developed <i>later in the morning</i>, as the hole "
             "deepened where every file said it would fill: that failure is C8's chart. "
             "<b>[fact]</b> for the render; <b>[inference]</b> for any pattern judgment."),
        ]),
        ("C", "Performance against the polar",
         "Calibrated boat speed (k = 0.940 — the transducer read 6.0% fast) against the Pogo 50 VPP, "
         "scored at the angle she actually sailed.", [
            ("C14", "CANDIDATE", "c14", "The report card by wind band",
             "Median % of VPP target as the breeze builds: 36% in near-calm rising to 89% at 12–20 kt. "
             "The two left bars are fenced: below ~6 kt a VPP is optimistic to the point of "
             "meaninglessness, so those bars measure the polar's optimism, not the crew. "
             "<b>[fact]</b> arithmetic; the fence is the interpretation rule."),
            ("C15", "SHIPPED", "module:maxpolar", "", ""),
            ("C16", "SHIPPED", "module:maxsails", "", ""),
            ("C17", "CANDIDATE", "c17", "The measured polar, laid over the VPP",
             "Her actual median speeds by true-wind angle (solid, one curve per wind band) against "
             "the design VPP at each band's midpoint (dashed). The gap opens exactly where C15/C16 "
             "say: aft of 90°. Cells with under 5 minutes of data are blank, not interpolated — the "
             "planing end of this polar was simply never sampled (TWS peaked at 16.9 kt). "
             "<b>[fact]</b>; measured vs the (unattributed — decision #6) VPP."),
            ("C18", "CANDIDATE", "c18", "Sailed to her numbers, hour by hour",
             "% of target as a time series (30-min medians, only where TWS ≥ 6 — the line breaks "
             "where scoring would be unfair). Best sustained stretch: Thursday evening's reach at "
             "~90%. The fade after each nightfall is visible and real — but conditions dominate, so "
             "per-window readings are <b>[inference]</b>; see C26 before blaming any watch."),
            ("C19", "CANDIDATE", "c19", "Heel vs target — the trim diagnostic",
             "Each dot is two minutes (TWS ≥ 6): heel across, % of target up, coloured by point of "
             "sail. Upwind she pays for sailing flat; the downwind cloud shows no heel–speed "
             "relationship at all, consistent with the deficit living in sail area, not trim. "
             "<b>[inference]</b> — an optimal-heel claim needs more breeze range than this race gave."),
            ("C20", "CANDIDATE", "c20", "The distance ledger",
             "Three odometers on one clock: miles through the water (calibrated), miles over the "
             "ground, and course made good (payload's routed figure — the pipeline's own number, not "
             "recomputed). Water ≈ ground to 0.1 nm — that is the k calibration closing — and both "
             "run ~18 nm over the course: the price of the lanes she sailed. <b>[fact]</b>."),
        ]),
        ("D", "Current and tide",
         "The boat as a current meter: ground track minus calibrated water track. Inherits the k "
         "assumption and carries unmodelled leeway (−0.22 kt across-track); stated, not hidden.", [
            ("C21", "CANDIDATE", "c21", "Plum Gut: measured vs predicted",
             "Her derived current on the flood axis through the transit (magenta) against the CO-OPS "
             "LIS1012 harmonic the shipped chart draws (dashed). Slack ran ~20 min late; the early "
             "ebb hit −1.18 kt where the table said −0.44 — 2.7× harder — then the table "
             "over-predicted by 21:30. <b>[fact]</b> measured / <b>[predicted]</b> harmonic. One "
             "boat's water, two hours of it."),
            ("C22", "CANDIDATE", "c22", "The current field she sailed through",
             "Set-and-drift vectors along the track, one per 30 min. The harbour ebb, the south-shore "
             "slosh, the Gut, the Sound's weak rotary — 11.5 h of the race carried over 1.5 kt. "
             "<b>[inference]</b>: inherits k and unmodelled leeway; read structure, not third "
             "decimals."),
            ("C23", "SPECULATIVE", "c23", "Does her measurement reprice the fleet's gate?",
             "Every boat's Gut crossing on the predicted-current curve, with Max's one measured point "
             "on top. If the harmonic ran ~20 min late and ~2.7× hard for her, the boats crossing "
             "near her hour may have paid differently than the shipped chart implies. Framed as a "
             "question: one 2-hour measurement cannot recalibrate a 12-hour arrival spread. "
             "<b>[inference]</b>, explicitly speculative."),
        ]),
        ("E", "Maneuvers, helm and the plan",
         "What the deck and the nav station were doing — the most person-adjacent charts here, and "
         "the private-cut boundary runs through this section.", [
            ("C24", "CANDIDATE", "c24", "The maneuver ledger",
             "All 87 maneuvers on the race clock: 26 in the six harbour-and-reach hours, 24 in the "
             "shifty overnight-and-park block, two per powered evening reach. Density is the story — "
             "the boat was worked hardest exactly where the breeze was least. <b>[fact]</b> under a "
             "stated rule (TWA sign change held 90 s)."),
            ("C25", "CANDIDATE", "c25", "What a maneuver cost",
             "Median speed through each tack and gybe, as % of that maneuver's own approach speed "
             "(band = middle half). <b>Gybes cut deeper than tacks</b> — to a median 73% of approach "
             "speed against the tacks' 82% — and both are back to par inside two to three minutes. "
             "Only maneuvers with over 3 kt of approach speed can be scored (n = 30 tacks, 9 gybes); "
             "the drifting-park ones cannot. Shown as distributions, never a single \"cost\" number — "
             "isolating a maneuver from a shifting breeze is genuinely hard. <b>[inference]</b>. "
             "Expedition's own TackLoss channels were empty; this is derived."),
            ("C26", "PRIVATE", "c26", "Helm workload by watch",
             "% of target per 3-hour shift, coloured by which watch had the deck (gold = owner's, "
             "per the crew log — which is <b>[recall]</b>, offered as approximate). Tooltips carry "
             "rudder SD, heel SD, maneuvers. <b>The entanglement is the caveat</b>: the shifts that "
             "score worst are the shifts the chart called for a kite, and this chart cannot separate "
             "deck from sail plan. Private cut only; if the framing can't survive contact with the "
             "crew, it doesn't ship."),
            ("C27", "PRIVATE", "c27", "The navigator's plan, and 31 minutes of doubt",
             "The 17 waypoint targets as holds on a timeline: Montauk held 25 h 55 m down the whole "
             "south shore, then ten changes in 31 minutes at dawn Saturday (gold band), resolving "
             "into a mid-Sound choice held 3 h 45. <b>[fact]</b> for the sequence — corrected from "
             "the ghost-stream's fake 414 — and <b>[inference]</b> for the word \"doubt\". Private "
             "cut: it names a person's hesitation."),
            ("C28", "CANDIDATE", "c28", "Depth, and how close the beach lane ran",
             "Minimum sounding per 5 minutes, drawn shallow-up because that is how it feels aboard. "
             "4.5 m off the south shore Friday afternoon — the inshore lane was sailed to single "
             "digits of water. <b>[fact]</b>; transducer depth, zero-values cleaned."),
        ]),
        ("F", "Instrument × fleet",
         "One boat's truth against 52 boats' behaviour — the bridge charts.", [
            ("C29", "SHIPPED", "module:maxtruth", "", ""),
            ("C30", "CANDIDATE", "c30", "Her wind vs the fleet's progress",
             "Max's measured wind (magenta) and the fleet's median closing speed on the finish "
             "(slate; VMC, never VMG — I18) on one knots axis. The fleet's speed follows her "
             "anemometer with striking fidelity for boats spread over 40 nm — and that is "
             "correlation across a shared weather system, never causation. <b>[inference]</b> "
             "throughout, and the honest version says so on the chart."),
        ]),
    ]

    def card_html(cid, status, kind, title, caption):
        chip = {"SHIPPED": "chip ship", "CANDIDATE": "chip", "BLOCKED": "chip block",
                "PRIVATE": "chip priv", "SPECULATIVE": "chip spec"}[status]
        if kind.startswith("module:"):
            mid = kind.split(":")[1]
            return f'''
      <article class="card" id="card-{mid}">
        <div class="cardhead"><span class="eyebrow">{cid}</span><span class="{chip}">{status}</span></div>
        <h3 id="title-{mid}"></h3>
        <div class="plate"><div id="plot-{mid}" class="plot"></div></div>
        <p class="cap" id="note-{mid}"></p>
      </article>'''
        return f'''
      <article class="card" id="card-{kind}">
        <div class="cardhead"><span class="eyebrow">{cid}</span><span class="{chip}">{status}</span></div>
        <h3>{title}</h3>
        <div class="plate"><div id="plot-{kind}" class="plot"></div></div>
        <p class="cap">{caption}</p>
      </article>'''

    sections = ""
    for letter, name, blurb, cards in CARDS:
        inner = "\n".join(card_html(*c) for c in cards)
        sections += f'''
    <section class="group">
      <div class="grouphead"><span class="eyebrow">Section {letter}</span>
        <h2>{name}</h2><p class="blurb">{blurb}</p></div>
      {inner}
    </section>'''

    html = f"""<title>Max — the full catalogue, 30 insights</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
:root{{
  --water:#EEF4F6; --paper:#FBFCFB; --ink:#17293A; --ink2:#4C6274; --grid:#D9E4E9;
  --magenta:#C2187E; --gold:#B98A00; --green:#2E7D4F; --rule:#B9CBD4; --edge:#DCE6EA;
  --inset:#F4F8F9;
  --mono:"SF Mono",SFMono-Regular,Menlo,Consolas,monospace;
  --sans:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;
}}
@media (prefers-color-scheme:dark){{
  :root{{ --water:#0E1922; --paper:#132230; --ink:#DCE8EF; --ink2:#9DB2C0; --grid:#22384A;
    --rule:#33556B; --edge:#22384A; --inset:#122232; --magenta:#F06BB8; }}
}}
:root[data-theme="dark"]{{ --water:#0E1922; --paper:#132230; --ink:#DCE8EF; --ink2:#9DB2C0;
  --grid:#22384A; --rule:#33556B; --edge:#22384A; --inset:#122232; --magenta:#F06BB8; }}
:root[data-theme="light"]{{ --water:#EEF4F6; --paper:#FBFCFB; --ink:#17293A; --ink2:#4C6274;
  --grid:#D9E4E9; --rule:#B9CBD4; --edge:#DCE6EA; --inset:#F4F8F9; --magenta:#C2187E; }}
*{{box-sizing:border-box}}
body{{background:var(--water);color:var(--ink);font-family:var(--sans);line-height:1.6;
  margin:0;padding:0 18px 90px;-webkit-font-smoothing:antialiased}}
.wrap{{max-width:1060px;margin:0 auto}}
.eyebrow{{font-family:var(--mono);font-size:10.5px;letter-spacing:.17em;text-transform:uppercase;color:var(--ink2)}}
h1{{font-size:clamp(28px,4.4vw,44px);line-height:1.08;letter-spacing:-.02em;margin:.3em 0 .2em;font-weight:600;text-wrap:balance}}
h2{{font-size:clamp(19px,2.5vw,25px);margin:.15em 0 .2em;font-weight:600;letter-spacing:-.012em;text-wrap:balance}}
h3{{font-size:clamp(16px,2vw,19px);margin:.35em 0 .55em;font-weight:600;letter-spacing:-.008em;text-wrap:balance}}
p{{margin:0 0 .8em;max-width:70ch}}
.masthead{{padding:56px 0 26px;border-bottom:1px solid var(--edge)}}
.sub{{font-size:16.5px;color:var(--ink2);max-width:62ch}}
.legendrow{{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}}
.group{{padding-top:44px}}
.grouphead{{margin-bottom:6px}}
.grouphead .eyebrow{{color:var(--magenta)}}
.blurb{{color:var(--ink2);font-size:14.5px}}
.card{{border-top:1px solid var(--edge);padding:26px 0 10px}}
.cardhead{{display:flex;gap:10px;align-items:center}}
.chip{{font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;border:1px solid var(--rule);
  padding:2.5px 8px;color:var(--ink2);text-transform:uppercase}}
.chip.ship{{border-color:var(--green);color:var(--green)}}
.chip.block{{border-color:#A33B3B;color:#A33B3B}}
.chip.priv{{border-color:var(--gold);color:var(--gold)}}
.chip.spec{{border-color:#7A3E9D;color:#7A3E9D}}
.plate{{background:#FFFFFF;border:1px solid var(--edge);padding:8px 6px 4px;overflow-x:auto;position:relative}}
.plot{{width:100%}}
.cap{{font-size:13px;line-height:1.6;color:var(--ink2);margin-top:.8em;max-width:none}}
.cap b{{color:var(--ink)}}
.fail{{font-family:var(--mono);font-size:12px;color:#A33B3B;padding:18px}}
footer{{border-top:1px solid var(--edge);margin-top:50px;padding-top:20px;font-size:13px;color:var(--ink2)}}
code{{font-family:var(--mono);font-size:12px;background:var(--inset);padding:1px 5px}}
:focus-visible{{outline:2px solid var(--magenta);outline-offset:2px}}
@media (prefers-reduced-motion:reduce){{*{{animation:none!important;transition:none!important}}}}
</style>
<div class="wrap">
  <header class="masthead">
    <span class="eyebrow">ALIR 2026 · Max · Pogo 50 · crew-only cut</span>
    <h1>The full catalogue — 30 insights</h1>
    <p class="sub">Every entry from the chart catalogue, one chart per id — nothing merged, nothing
      skipped. Five are the shipped dashboard modules running their real code; the rest are candidates
      rendered from the same cleaned data. Each panel names its evidence class and confidence, and
      the ones that must not ship yet say so on their own chip.</p>
    <div class="legendrow">
      <span class="chip ship">SHIPPED</span><span class="chip">CANDIDATE</span>
      <span class="chip block">BLOCKED</span><span class="chip priv">PRIVATE</span>
      <span class="chip spec">SPECULATIVE</span>
    </div>
  </header>
  {sections}
  <footer>
    <p>Data: <code>races/alir2026/raw/max/</code> (cleaned per the memo — ghost stream removed, −26°
      flicker repaired, k = 0.940 applied) · fleet numbers from the pipeline payload, never recomputed ·
      generators <code>gen_insights.py</code> + <code>gen_max_constants.py</code>. Chart plates stay
      light in both themes: the light plate is what ships.</p>
  </footer>
</div>
<script>{plotly}</script>
<script>{maxdata}</script>
<script>const INS = {insights};</script>
<script>
const MONO='SF Mono, Menlo, Consolas, monospace';
const AXFONT={{family:MONO,size:10.5,color:'#4C6274'}};
const narrow=()=>window.matchMedia('(max-width:760px)').matches;
function BASE(){{return{{paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'#FDFEFD',
  font:{{family:'-apple-system, Helvetica Neue, Arial',size:12,color:'#17293A'}},
  margin:narrow()?{{l:44,r:10,t:8,b:40}}:{{l:56,r:16,t:8,b:40}},hovermode:'closest',
  hoverlabel:{{align:'left',bgcolor:'#17293A',bordercolor:'#17293A',font:{{size:11.5,color:'#fff'}}}},
  legend:{{orientation:'h',y:-0.14,font:{{size:11}}}}}};}}
const GAX={{gridcolor:'#E3ECEF',zerolinecolor:'#B9CBD4',tickfont:AXFONT,linecolor:'#B9CBD4'}};
const PLOTCFG={{responsive:true,displaylogo:false,displayModeBar:false}};
const REG={{}};
function registerModule(m){{REG[m.id]=m;}}
const CTX={{h:{{BASE,GAX,AXFONT,narrow}},cfg:{{time:{{tzLabel:'EDT'}}}}}};
</script>
<script>{mods['maxwind']}</script>
<script>{mods['maxpolar']}</script>
<script>{mods['maxsails']}</script>
<script>{mods['maxtruth']}</script>
<script>{mods['maxfcst']}</script>
<script>{js}</script>
"""
    pathlib.Path(out_path).write_text(html)
    print(f"wrote {out_path}  {len(html)/1e6:.2f} MB")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
