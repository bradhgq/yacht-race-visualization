import json, pathlib, re
R = pathlib.Path("/home/user/yacht-race-visualization")
S = pathlib.Path("/tmp/claude-0/-home-user-yacht-race-visualization/4d494e55-34c7-5f02-86a5-b3b79a8057df/scratchpad")
plotly = (R/"starter/shell/vendor/plotly-basic-2.35.2.min.js").read_text()
maxdata = (R/"races/alir2026/modules/maxdata.js").read_text()
mods = {m: (R/f"races/alir2026/modules/{m}.js").read_text()
        for m in ["maxtruth","maxwind","maxfcst","maxpolar","maxsails"]}
qa = json.loads((S/"qa.json").read_text())

def note_of(src):
    m = re.search(r"note:\s*((?:'(?:[^'\\]|\\.)*'\s*\+\s*)*'(?:[^'\\]|\\.)*')", src)
    return m.group(1) if m else "''"

STATIONS = [
    ("maxtruth","C29","Does the tracker tell the truth?",
     "Validation first — every other chart spends this one's credibility.", None),
    ("maxwind","C1 · C2","The wind she actually sailed in",
     "The layer the tracker never had.",
     "The y-axis wraps at north, so through the park the trace exits the top and reappears at the bottom. "
     "The caption says so, but it still reads as two winds at once at first glance. The alternative is an "
     "unwrapped axis that loses the compass labels. Design call, not correctness — yours."),
    ("maxfcst","C7 · C8 · C9 · C10","What the navigator knew",
     "The successor to the forecast report card, with no internet data in it.",
     "The staleness line bottom-right is <b>blocked</b> until you confirm those five GRIBs are everything "
     "that came aboard. If more were downloaded and not exported, the claim collapses."),
    ("maxpolar","C14 · C15","Sailed to her numbers?",
     "Scored at the angle she was actually sailing.", None),
    ("maxsails","C15 · C16","Fast with a headsail, slow with a kite",
     "The control that makes the finding defensible.",
     "This is the chart most likely to land as a judgment on named crew. It compares against the "
     "<b>crossover chart</b> — a fixed document — not against anyone's memory. Tell me if the "
     "prescribed-vs-observed caveat in the caption is strong enough, or whether it needs to be on the plot itself."),
]

station_html = "\n".join(f"""
    <section class="station">
      <div class="rail"><span class="eyebrow">{eb}</span></div>
      <div class="body">
        <h3>{title}</h3>
        <p class="lede">{lede}</p>
        <div class="plate"><div id="plot-{mid}" class="plot"></div></div>
        <p class="shipnote" id="note-{mid}"></p>
        {f'<aside class="ask"><span class="asklabel">Your call</span><p>{ask}</p></aside>' if ask else ''}
      </div>
    </section>""" for mid, eb, title, lede, ask in STATIONS)

HTML = f"""<title>Max — the instrument layer</title>
<style>
:root{{
  --water:#EEF4F6; --paper:#FBFCFB; --card:#FFFFFF; --ink:#17293A; --ink2:#4C6274;
  --grid:#D9E4E9; --magenta:#C2187E; --gold:#B98A00; --green:#2E7D4F; --rule:#B9CBD4;
  --edge:#DCE6EA; --inset:#F4F8F9;
  --mono:"SF Mono",SFMono-Regular,Menlo,Consolas,monospace;
  --sans:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;
}}
@media (prefers-color-scheme:dark){{
  :root{{ --water:#0E1922; --paper:#132230; --card:#16283A; --ink:#DCE8EF; --ink2:#9DB2C0;
    --grid:#22384A; --rule:#33556B; --edge:#22384A; --inset:#122232; --magenta:#F06BB8; }}
}}
:root[data-theme="dark"]{{ --water:#0E1922; --paper:#132230; --card:#16283A; --ink:#DCE8EF;
  --ink2:#9DB2C0; --grid:#22384A; --rule:#33556B; --edge:#22384A; --inset:#122232; --magenta:#F06BB8; }}
:root[data-theme="light"]{{ --water:#EEF4F6; --paper:#FBFCFB; --card:#FFFFFF; --ink:#17293A;
  --ink2:#4C6274; --grid:#D9E4E9; --rule:#B9CBD4; --edge:#DCE6EA; --inset:#F4F8F9; --magenta:#C2187E; }}
*{{box-sizing:border-box}}
body{{background:var(--water);color:var(--ink);font-family:var(--sans);
  line-height:1.62;-webkit-font-smoothing:antialiased;margin:0;padding:0 20px 96px}}
.wrap{{max-width:1080px;margin:0 auto}}
.eyebrow{{font-family:var(--mono);font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink2)}}
h1{{font-size:clamp(30px,4.6vw,46px);line-height:1.1;letter-spacing:-.022em;margin:.35em 0 .18em;text-wrap:balance;font-weight:600}}
h2{{font-size:clamp(20px,2.6vw,26px);letter-spacing:-.012em;margin:0 0 .3em;font-weight:600;text-wrap:balance}}
h3{{font-size:clamp(17px,2.1vw,21px);letter-spacing:-.01em;margin:0 0 .2em;font-weight:600;text-wrap:balance}}
p{{margin:0 0 .85em;max-width:68ch}}
a{{color:var(--magenta)}}
.masthead{{padding:64px 0 28px;border-bottom:1px solid var(--edge)}}
.sub{{font-size:17px;color:var(--ink2);max-width:60ch}}
.facts{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1px;
  background:var(--edge);border:1px solid var(--edge);margin:30px 0 0}}
.fact{{background:var(--paper);padding:13px 15px}}
.fact b{{display:block;font-family:var(--mono);font-size:20px;letter-spacing:-.02em;font-variant-numeric:tabular-nums}}
.fact span{{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink2)}}
.part{{padding:56px 0 8px}}
.part .eyebrow{{color:var(--magenta)}}
.station{{display:grid;grid-template-columns:78px 1fr;gap:0;padding:34px 0;border-top:1px solid var(--edge)}}
.rail{{padding-top:5px}}
.body{{min-width:0}}
.lede{{color:var(--ink2);font-size:15.5px;margin-bottom:1em}}
.plate{{background:#FFFFFF;border:1px solid var(--edge);padding:10px 8px 6px;
  overflow-x:auto;position:relative}}
.plot{{width:100%}}
.shipnote{{font-size:13.2px;line-height:1.6;color:var(--ink2);margin-top:.9em;max-width:none}}
.shipnote b{{color:var(--ink)}}
.ask{{background:var(--inset);border-left:2px solid var(--magenta);padding:13px 16px;margin-top:16px}}
.ask p{{margin:0;font-size:14px}}
.asklabel{{display:block;font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--magenta);margin-bottom:5px}}
.qa{{display:grid;grid-template-columns:1fr;gap:0}}
.verdict{{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 0}}
.chip{{font-family:var(--mono);font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;
  border:1px solid var(--rule);padding:4px 9px;color:var(--ink2)}}
.chip.kept{{border-color:var(--green);color:var(--green)}}
.chip.cut{{border-color:var(--gold);color:var(--gold)}}
table{{border-collapse:collapse;font-family:var(--mono);font-size:12.5px;width:100%;
  font-variant-numeric:tabular-nums}}
th,td{{text-align:left;padding:6px 10px;border-bottom:1px solid var(--edge)}}
th{{font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink2);font-weight:400}}
.scroller{{overflow-x:auto}}
.open li{{margin-bottom:.7em;max-width:66ch}}
footer{{border-top:1px solid var(--edge);margin-top:52px;padding-top:22px;font-size:13px;color:var(--ink2)}}
code{{font-family:var(--mono);font-size:12.5px;background:var(--inset);padding:1px 5px}}
@media (max-width:720px){{ .station{{grid-template-columns:1fr;gap:10px}} .rail{{padding-top:0}} }}
@media (prefers-reduced-motion:reduce){{ *{{animation:none!important;transition:none!important}} }}
:focus-visible{{outline:2px solid var(--magenta);outline-offset:2px}}
</style>

<div class="wrap">
  <header class="masthead">
    <span class="eyebrow">ALIR 2026 · Max · Pogo 50 · USA75050 · private cut</span>
    <h1>The instrument layer</h1>
    <p class="sub">Five charts built from Max's own 1 Hz record, rendering here exactly as they do in the
      dashboard — same module code, same engine, same tokens. Before them, the two cleaning decisions that
      changed what the data says. Reviewing this means two things: are the charts right, and did I throw
      away the right rows.</p>
    <div class="facts">
      <div class="fact"><b>192,001</b><span>rows exported</span></div>
      <div class="fact"><b>156,237</b><span>rows after cleaning</span></div>
      <div class="fact"><b>46.04 h</b><span>race window</span></div>
      <div class="fact"><b>99.99%</b><span>wind coverage</span></div>
      <div class="fact"><b>4 m 24 s</b><span>longest outage</span></div>
    </div>
  </header>

  <div class="part"><span class="eyebrow">Part one</span><h2>What I threw away, and why it mattered</h2>
    <p>Both of these changed a finding I had already written down. That is the reason they lead.</p>
  </div>

  <section class="station">
    <div class="rail"><span class="eyebrow">QA 1</span></div>
    <div class="body">
      <h3>There are two boats in this file</h3>
      <p class="lede">Twelve seconds on Saturday morning, every row plotted.</p>
      <div class="plate"><div id="plot-ghost" class="plot" style="height:320px"></div></div>
      <p class="shipnote">The log alternates, row by row, between two completely different boats. One is
        making <b>6.5 kt on 274°</b> with a position fix and the Glen Cove waypoint loaded. The other is
        making <b>0.2 kt on 343°</b>, carries <b>no position at all</b>, and still has Montauk as its
        active waypoint — a mark passed thirty-six hours earlier. It runs the whole race, 4.09% of rows,
        300–600 in every three-hour block, and it explains all 164 duplicate timestamps.</p>
      <div class="verdict">
        <span class="chip cut">6,664 rows cut</span>
        <span class="chip">identified by: no position fix, ever</span>
        <span class="chip kept">wind &amp; speed medians unchanged</span>
      </div>
      <aside class="ask"><span class="asklabel">What it cost</span>
        <p>Left in, the ghost's stale waypoint alternating with the real one turns <b>17 real waypoint
        changes into 414</b> — and I had already written that up as a navigator cycling routes at dawn.
        It never happened. The corrected version is better: one waypoint held 25 h 55 m down the south
        shore, then ten changes in 31 minutes at dawn Saturday, then a decision held 3 h 45.</p></aside>
    </div>
  </section>

  <section class="station">
    <div class="rail"><span class="eyebrow">QA 2</span></div>
    <div class="body">
      <h3>The heading flicker you warned me about</h3>
      <p class="lede">You said ~26°. It is 25.7°, on 7.17% of samples, all race.</p>
      <div class="plate"><div id="plot-flick" class="plot" style="height:340px"></div></div>
      <p class="shipnote">Steering produces the cluster under 2°. The second population sits at
        <b>24–28°</b> with almost nothing between 10° and 22° — and no helmsman produces 26° in one second
        while producing nothing at 15°. It is one-sided: 5.76% of samples within 3° of <b>−26</b>, only
        0.03% near +26. COG does not move with it, so the boat is not turning.</p>
      <div class="scroller"><table>
        <tr><th>the decisive tell</th><th>HDG − COG</th><th>reading</th></tr>
        <tr><td>normal samples</td><td>+{qa['crab']['normalBefore']}°</td><td>her true crab angle</td></tr>
        <tr><td>during a flicker</td><td>{qa['crab']['flickBefore']}°</td><td>impossible — she has not slewed 25°</td></tr>
        <tr><td>after repair</td><td>+{qa['crab']['afterAll']}°</td><td>crab restored; this is what a correct fix looks like</td></tr>
      </table></div>
      <div class="verdict">
        <span class="chip kept">residual {qa['residStat']['beforePct']}% → {qa['residStat']['afterPct']}%</span>
        <span class="chip">+{qa['residStat']['offset']}° applied to flagged samples</span>
        <span class="chip kept">TWA immune — polar work unaffected</span>
      </div>
      <aside class="ask"><span class="asklabel">What it cost</span>
        <p>TWD is heading-referenced, so it inherited the fault and is recomputed from the repaired
        heading. <b>TWA is immune</b> — it comes from the masthead and boat speed with no heading input —
        so the polar report card, point of sail, the sail crossover and maneuver detection all needed no
        revision. What it did break: my dawn-park figure of "2,216° of rotation". That was mis-scaled,
        flicker-contaminated, <i>and</i> built on a metric that changes with sample rate. Withdrawn. The
        chart below now leads with the range, which is stable.</p></aside>
    </div>
  </section>

  <div class="part"><span class="eyebrow">Part two</span><h2>The five charts</h2>
    <p>Live and interactive — hover any mark. These are the real modules on the real engine, so what you
      see is what ships. The captions are the shipped captions.</p>
  </div>
{station_html}

  <div class="part"><span class="eyebrow">Part three</span><h2>Still open</h2></div>
  <ul class="open">
    <li><b>Are those five GRIBs everything that came aboard?</b> The "88% of the race on Thursday-evening
      data" line is the strongest claim in the set and it collapses if more were downloaded and not
      exported. Cheapest question here, biggest consequence.</li>
    <li><b>The word VMG.</b> Invariant I18 makes the harness reject it, because tracker data carries no
      wind. Max's log does, so VMG is now computable for exactly one boat. That needs your ruling and an
      explicit amendment before it appears anywhere — I have not used it.</li>
    <li><b>Polar and crossover provenance.</b> Both files are unattributed. "22.9% off target" is only as
      good as the VPP it is measured against — builder's published curve, an Expedition-generated table,
      or tuned from sailing her?</li>
    <li><b>Section placement.</b> I put the instrument layer after the existing forecast card, so the page
      runs from internet-data forecasting to onboard-data forecasting. Move it earlier if the crew cut
      should lead with it.</li>
  </ul>

  <footer>
    <p>Branch <code>claude/max-boat-data-explore-atu4mi</code>. Rebuild with
      <code>.venv/bin/python starter/build_race.py races/alir2026</code> and serve
      <code>races/alir2026/dist</code>. Chain green, harness 12/12 under both timezones, snapshot compare
      IDENTICAL — this layer rides embedded evidence constants, so the pinned payload never moved.
      Chart plates stay light in both page themes on purpose: the light plate is what ships.</p>
  </footer>
</div>

<script>{plotly}</script>
<script>{maxdata}</script>
<script>
const QA = {json.dumps(qa)};
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
<script>{mods['maxtruth']}</script>
<script>{mods['maxwind']}</script>
<script>{mods['maxfcst']}</script>
<script>{mods['maxpolar']}</script>
<script>{mods['maxsails']}</script>
<script>
/* ---- the two data-quality charts, built here (review-only, not shipped) ---- */
function ghostChart(){{
  const g=QA.ghost, real=g.filter(d=>d.real), gh=g.filter(d=>!d.real);
  const idx=new Map(g.map((d,i)=>[d,i]));
  const mk=(rows,name,col,sym)=>({{type:'scatter',mode:'markers+lines',name,
    x:rows.map(d=>idx.get(d)),y:rows.map(d=>d.sog),
    marker:{{size:9,color:col,symbol:sym,line:{{color:'#FDFEFD',width:2}}}},
    line:{{color:col,width:1.4,dash:sym==='x'?'dot':'solid'}},
    customdata:rows.map(d=>[d.hdg,d.t]),
    hovertemplate:'%{{customdata[1]}}<br>SOG %{{y}} kt<br>heading %{{customdata[0]}}°<extra>'+name+'</extra>'}});
  Plotly.newPlot('plot-ghost',
    [mk(real,'the real boat','#2D5FA8','circle'),mk(gh,'the ghost stream','#B25B12','x')],
    {{...BASE(),height:320,autosize:false,
     margin:{{...BASE().margin,t:24,b:72}},   // room for the angled tick labels
     annotations:[{{xref:'paper',yref:'paper',x:0.01,y:0.52,xanchor:'left',showarrow:false,
       text:'every other row is a different boat',font:{{size:10,color:'#4C6274',family:MONO}}}}],
     xaxis:{{...GAX,tickmode:'array',tickvals:g.map((d,i)=>i).filter(i=>i%4===0),
       ticktext:g.filter((d,i)=>i%4===0).map(d=>d.t.slice(0,8)),
       tickangle:-45,tickfont:{{...AXFONT,size:8.5}},
       title:{{text:'consecutive rows as logged · 2026-07-25 Saturday morning',font:AXFONT}}}},
     yaxis:{{...GAX,range:[-0.4,8],title:{{text:'Speed over ground (kt)',font:AXFONT}}}},
     showlegend:true,legend:{{orientation:'h',x:0,y:1.04,yanchor:'bottom',font:{{size:10,family:MONO}}}}}},
    PLOTCFG);
}}
function flickChart(){{
  const s=QA.steps;
  Plotly.newPlot('plot-flick',
    [{{type:'bar',x:s.map(d=>d.b+0.5),y:s.map(d=>d.n),width:0.85,
      marker:{{color:s.map(d=>d.b>=22&&d.b<30?'#B25B12':'#41505E'),line:{{color:'#FDFEFD',width:1}}}},
      hovertemplate:'%{{x:.0f}}–%{{x:.0f}}° step<br>%{{y}} samples<extra></extra>'}}],
    {{...BASE(),height:340,autosize:false,margin:{{...BASE().margin,t:24}},bargap:0.06,
     shapes:[{{type:'rect',xref:'x',yref:'paper',x0:10,x1:22,y0:0,y1:1,
       fillcolor:'#17293A',opacity:0.05,line:{{width:0}},layer:'below'}}],
     annotations:[
      {{xref:'x',yref:'paper',x:16,y:0.5,showarrow:false,textangle:-90,
        text:'no helmsman steers here',font:{{size:9.5,color:'#4C6274',family:MONO}}}},
      {{xref:'x',yref:'paper',x:26,y:0.97,yanchor:'top',showarrow:false,
        text:'the fault',font:{{size:10,color:'#B25B12',family:MONO}}}},
      {{xref:'x',yref:'paper',x:2,y:0.97,yanchor:'top',xanchor:'left',showarrow:false,
        text:'ordinary steering',font:{{size:10,color:'#41505E',family:MONO}}}}],
     xaxis:{{...GAX,range:[0,34],dtick:4,title:{{text:'Heading change in one second (°)',font:AXFONT}}}},
     yaxis:{{...GAX,type:'log',dtick:1,title:{{text:'Samples (log)',font:AXFONT}}}},
     showlegend:false}},
    PLOTCFG);
}}
/* ---- render the shipped modules ---- */
const NOTES={json.dumps({m: None for m in mods})};
function draw(){{
  ghostChart(); flickChart();
  for(const id of Object.keys(REG)){{
    const m=REG[id], out=m.build(CTX), el=document.getElementById('plot-'+id);
    /* Modules own their geometry (I15): the module declares section.height and
       the container obeys it. Plotly is then told the resolved pixel height, so
       the div and the drawing cannot disagree — measuring them apart was the
       bug that put captions on top of charts. */
    el.style.height=m.section.height;
    Plotly.newPlot('plot-'+id,out.traces,
      {{...out.layout,height:el.clientHeight,autosize:false}},PLOTCFG);
    const n=document.getElementById('note-'+id);
    if(n) n.innerHTML=m.section.note;
  }}
}}
draw();
let t; addEventListener('resize',()=>{{clearTimeout(t);t=setTimeout(draw,220);}});
</script>
"""
out = S/"max-review.html"
out.write_text(HTML)
print("wrote", out, round(len(HTML)/1e6,2), "MB")
