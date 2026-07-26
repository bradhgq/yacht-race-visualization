/* Watch performance — PRIVATE CUT ONLY (owner declaration, 2026-07-26: this
   build is the private opinionated version; the future public cut strips the
   watch layer and this module — recorded in the stage-5 ledger).

   One bar per 3-hour shift, chronological: Max's miles made toward the finish,
   colored by which watch had the deck (gold = the owner's, slate = the other),
   with the 3-nm spatial-peer median as a tick on every bar. THE HONEST READ IS
   THE GAP TO THE TICK, not the bar height: raw miles are almost entirely
   weather (night shifts always look slow), and only the same-water comparison
   says anything about the deck. Spans are reconstructed from the crew log
   (3h-on/3h-off, owner's starts 19/01/07/13) — owner to verify. */
"use strict";

registerModule({
  id: 'watchperf',
  deps: ['boats'],
  section: {
    kind: 'plot',
    height: 'min(480px, 96vw)',
    title: 'Watch by watch — the deck vs the neighbors (private)',
    note: '<b>Read the gap to the tick, not the bar:</b> bars are Max’s miles made toward the ' +
      'finish each 3-hour shift (gold = Brad’s watch, slate = the other); the dark tick is the ' +
      'median of the boats within 3 nm at the shift’s start — the same-water control. A bar ' +
      'ending above its tick beat the neighbors regardless of how light the shift was. Shifts ' +
      'are reconstructed from the crew log (3-on/3-off, starts 19:00/01:00/07:00/13:00) — ' +
      'verify before trusting the attribution; the first five hours (start to 19:00 Thu) were ' +
      'all-hands and are excluded. Private cut only.',
  },
  build(ctx) {
    const { D, h, cfg } = ctx;
    const W = D.watchperf || [];
    if (!W.length) return { traces: [], layout: h.BASE() };
    const GOLD = '#B8944A', SLATE = '#5F7484';
    const lab = w => {
      const a = h.tzStr(w.t1), b = h.tzStr(w.t2);
      return `${a.slice(5, 10)}<br>${a.slice(11, 16)}–${b.slice(11, 16)}`;
    };
    const xs = W.map((_, i) => i);
    const tr = [{
      x: xs, y: W.map(w => w.made), type: 'bar',
      marker: { color: W.map(w => w.crew === 'A' ? GOLD : SLATE), opacity: 0.82 },
      text: W.map(w => w.rank ? `${w.rank}/${w.peer_n + 1}` : ''),
      textposition: 'outside', textfont: { size: 9, family: 'SF Mono, Menlo, monospace' },
      hovertext: W.map(w =>
        h.wrapText(`${w.crew === 'A' ? "Brad's watch" : 'Other watch'} · ${h.fmt(w.t1)}–${h.fmt(w.t2)} ` +
          `${cfg.time.tzLabel}: Max made ${w.made} nm` +
          (w.peer_med != null ? ` · ${w.peer_n}-boat peer median ${w.peer_med} nm · rank ${w.rank}/${w.peer_n + 1}` :
            ' · no boat within 3 nm'))),
      hoverinfo: 'text', showlegend: false,
    }, {
      // the same-water control: peer median as a tick per shift
      x: xs, y: W.map(w => w.peer_med), mode: 'markers',
      marker: { symbol: 'line-ew-open', size: 16, color: '#17293A', line: { width: 2 } },
      hovertext: W.map(w => w.peer_med != null ?
        `peer median ${w.peer_med} nm (${w.peer_n} boats within 3 nm at shift start)` : ''),
      hoverinfo: 'text', showlegend: false,
    }];
    const ann = [
      { x: 0, y: 1.06, xref: 'paper', yref: 'paper', xanchor: 'left', showarrow: false,
        text: '<span style="color:#B8944A">■</span> Brad’s watch   <span style="color:#5F7484">■</span> other watch   — tick = 3-nm peer median',
        font: { size: 9.5, color: '#41505E', family: 'SF Mono, Menlo, monospace' } },
    ];
    // flag the shifts where the deck beat/lost to the neighbors by the most
    let best = null, worst = null;
    for (const w of W) {
      if (w.peer_med == null) continue;
      const dv = w.made - w.peer_med;
      if (!best || dv > best.dv) best = { w, dv };
      if (!worst || dv < worst.dv) worst = { w, dv };
    }
    for (const [tag, o, col] of [['best vs peers', best, '#2F7357'], ['worst vs peers', worst, '#B23A32']]) {
      if (!o) continue;
      ann.push({ x: W.indexOf(o.w), y: o.w.made, ax: 0, ay: -28, showarrow: true,
        arrowwidth: 1, arrowcolor: col, standoff: 12,
        text: `${tag} ${o.dv > 0 ? '+' : ''}${o.dv.toFixed(1)} nm`,
        font: { size: 9, color: col, family: 'SF Mono, Menlo, monospace' } });
    }
    const layout = { ...h.BASE(), annotations: ann,
      margin: { ...h.BASE().margin, t: 34, b: 52 },
      xaxis: { ...h.GAX, tickmode: 'array', tickvals: xs, ticktext: W.map(lab),
               tickfont: { size: 8.5, family: 'SF Mono, Menlo, monospace' } },
      yaxis: { ...h.GAX, title: { text: 'nm made toward the finish per shift', font: h.AXFONT } },
      bargap: 0.3, showlegend: false };
    return { traces: tr, layout };
  },
});
