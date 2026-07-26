/* The phase ledger — the race in seven rows (owner's combined M3+M8).

   One horizontal row per phase, judged on TWO bases side by side, each on its
   own x-axis with a shared zero at plot center (both ranges are symmetric):

   Basis A (solid, bottom scale, nm): hero nm made minus the median of the
   boats within 3 nm of him at the phase start — like-for-like water AND
   weather; annotated with Max's rank inside that peer group (rank of
   peer_n + 1 boats). A diamond marks Katara56 against the same peer median,
   so the like-for-like rival is visible in every row.

   Basis B (pale, top scale, %): the whole-fleet same-water basis. Converting
   (med_h − hero_h) to "equivalent nm" is NOT valid across boats that crossed
   the stretch hours apart, so the RATIO is plotted instead:
   (med_h / hero_h − 1) × 100 — positive = Max faster than the fleet median
   through that water. Annotated rank/fleet plus the honesty badge
   '±<spread>h entries': wide entry spread = cross-weather comparison —
   the owner's rule is display the caveat, never hide it.

   All numbers are computed at runtime from ctx.D.ledger (payload); nothing is
   hardcoded. Peer sets in the payload keep boats that later retired — owner
   directive: they count as neighbors for the water they actually sailed.

   LABEL-LANE RULE compliance: every annotation lives INSIDE its own row
   (yref:'y' + pixel yshift into the bar's lane) — the y>1 paper lane stays
   with phase labels and the top in-plot row with event markers, untouched. */
"use strict";

registerModule({
  id: 'ledger',
  deps: ['boats'],
  section: {
    kind: 'plot',
    height: 'min(460px, 95vw)',
    title: 'The phase ledger — the race in seven rows',
    note: 'Each row is one phase, judged two ways. <b>Basis A</b> (solid bars, bottom scale) is like-for-like: ' +
      'nm <span class="mag">Max</span> made minus the median of the boats within 3 nm of him when the phase opened, ' +
      'Rows P1\u2013P7 are the race\u2019s natural phases (name + clock window on the axis). Labelled with Max\u2019s rank in that peer group. <b>Basis B</b> (pale bars, top scale) is the same-water fleet test: ' +
      'how much faster (+) or slower (−) Max sailed the phase\'s stretch of water than the fleet median that crossed it, ' +
      'as a percentage of elapsed time, labelled rank/fleet. The muted ±h badge is basis B\'s honesty caveat: entries into ' +
      'the stretch spread by that many hours, and a wide spread means boats met different weather there — the caveat is ' +
      'displayed, never hidden. The diamond is Katara56 against the same 3-nm peer median. P7 has no 3-nm peers ' +
      '(Max sailed alone), so basis A is blank there; basis B still renders. Peer groups keep boats that later ' +
      'retired — they count for the water they sailed.',
  },
  build(ctx) {
    const { D, cfg, h } = ctx;
    const L = D.ledger || [];
    if (!L.length) return { traces: [], layout: h.BASE() };
    const nw = h.narrow();
    const MONO = 'SF Mono, Menlo, monospace';
    const GRN = '#2F7357', RED = '#B23A32';
    const aFill = v => v >= 0 ? 'rgba(47,115,87,0.92)' : 'rgba(178,58,50,0.92)';
    const bFill = v => v >= 0 ? 'rgba(47,115,87,0.40)' : 'rgba(178,58,50,0.40)';
    const sgn = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1);
    const kColor = h.boatColor['Katara56'] || '#41658A';

    const ids = L.map(p => p.id);
    // owner (round 1): P1-P7 need clarity on the axis — full name + clock window
    const win = p => {
      const a = h.tzStr(p.t1), b = h.tzStr(p.t2);
      const sameDay = a.slice(5, 10) === b.slice(5, 10);
      return `${a.slice(5, 16)} → ${sameDay ? b.slice(11, 16) : b.slice(5, 16)}`;
    };
    const rowLbl = L.map(p => nw ? p.id : `${p.id} · ${p.label}<br>${win(p)}`);
    // basis A: nm vs the 3-nm-at-entry peer median (null where no peers — P7)
    const A = L.map(p => p.peer_med == null ? null : p.hero - p.peer_med);
    // basis B: % faster (+) / slower (−) than the fleet median through the same water
    const B = L.map(p => (p.fleet.med_h / p.fleet.hero_h - 1) * 100);
    // Katara56 on basis A (null where the peer basis is blank)
    const K = L.map(p => (p.ref == null || p.peer_med == null) ? null : p.ref - p.peer_med);

    // symmetric ranges → both zero lines coincide at plot center
    const aMax = 1.30 * Math.max(1e-6, ...A.concat(K).filter(v => v != null).map(Math.abs));
    const bMax = 1.30 * Math.max(1e-6, ...B.map(Math.abs));

    const hovA = L.map((p, i) => A[i] == null ? '' : h.wrapText(
      `Max — ${p.id} ${p.label} (${p.hi}→${p.lo} nm to go, ${h.fmt(p.t1)}–${h.fmt(p.t2)} ${cfg.time.tzLabel}): ` +
      `${p.hero.toFixed(1)} nm made vs ${p.peer_med.toFixed(1)} nm peer median (${sgn(A[i])} nm) · ` +
      `rank ${p.rank}/${p.peer_n + 1} among boats within 3 nm at the phase start (retired boats included)`));
    const hovB = L.map((p, i) => h.wrapText(
      `Same water, ${p.id} ${p.label} (${p.hi}→${p.lo} nm to go): Max ${p.fleet.hero_h.toFixed(2)} h vs ` +
      `fleet median ${p.fleet.med_h.toFixed(2)} h — ` +
      (B[i] >= 0 ? `the median boat took ${B[i].toFixed(0)}% longer` : `the median boat was through ${(-B[i]).toFixed(0)}% quicker`) +
      ` · rank ${p.fleet.rank}/${p.fleet.n} · entries into this stretch spread ±${p.fleet.spread_h} h (wide spread = different weather)`));

    const traces = [
      { type: 'bar', orientation: 'h', xaxis: 'x',
        x: A, y: ids, width: 0.30, offset: -0.40,
        marker: { color: A.map(v => v == null ? 'rgba(0,0,0,0)' : aFill(v)), line: { width: 0 } },
        hovertext: hovA, hoverinfo: 'text', showlegend: false },
      { type: 'bar', orientation: 'h', xaxis: 'x2',
        x: B, y: ids, width: 0.30, offset: 0.10,
        marker: { color: B.map(bFill), line: { width: 0 } },
        hovertext: hovB, hoverinfo: 'text', showlegend: false },
      // Katara56 — the like-for-like rival, on the basis-A scale, row center
      { type: 'scatter', mode: 'markers', xaxis: 'x',
        x: K.map(v => v), y: ids,
        marker: { symbol: 'diamond', size: 8, color: kColor, line: { width: 1, color: '#fff' } },
        text: L.map((p, i) => K[i] == null ? '' : h.wrapText(
          `Katara56 — ${p.id} ${p.label}: ${p.ref.toFixed(1)} nm made vs the same 3-nm peer median ` +
          `(${sgn(K[i])} nm; Max ${sgn(A[i])} nm)`)),
        hoverinfo: 'text', showlegend: false },
    ];

    const ann = [];
    L.forEach((p, i) => {
      if (A[i] != null) {
        ann.push({ xref: 'x', yref: 'y', x: A[i], y: ids[i], yshift: 12,
          xanchor: A[i] >= 0 ? 'left' : 'right', xshift: A[i] >= 0 ? 4 : -4, showarrow: false,
          text: `${p.rank}/${p.peer_n + 1}`, font: { size: 9, color: '#4C6274', family: MONO } });
      } else {
        // P7: Max sailed alone — document the blank instead of hiding it
        ann.push({ xref: 'x', yref: 'y', x: 0, y: ids[i], yshift: 12,
          xanchor: 'left', xshift: 6, showarrow: false,
          text: nw ? 'sailed alone' : 'no 3-nm peers — sailed alone',
          font: { size: 9, color: '#8AA0AF', family: MONO } });
      }
      ann.push({ xref: 'x2', yref: 'y', x: B[i], y: ids[i], yshift: -12,
        xanchor: B[i] >= 0 ? 'left' : 'right', xshift: B[i] >= 0 ? 4 : -4, showarrow: false,
        text: `${p.fleet.rank}/${p.fleet.n}`, font: { size: 9, color: '#6E8B98', family: MONO } });
      // honesty badge, opposite side of the row from the basis-B bar
      ann.push({ xref: 'paper', yref: 'y', x: B[i] >= 0 ? 0.004 : 0.996, y: ids[i], yshift: -12,
        xanchor: B[i] >= 0 ? 'left' : 'right', showarrow: false,
        text: nw ? `±${p.fleet.spread_h}h` : `±${p.fleet.spread_h}h entries`,
        font: { size: 9, color: '#9AACB8', family: MONO }, opacity: 0.9 });
    });
    // name the diamond once, in the row where the space right of it is clearest
    let kRow = -1, kBest = -Infinity;
    K.forEach((v, i) => {
      if (v == null) return;
      const clear = v - Math.max(A[i] || 0, 0);
      if (clear > kBest) { kBest = clear; kRow = i; }
    });
    if (kRow >= 0) ann.push({ xref: 'x', yref: 'y', x: K[kRow], y: ids[kRow],
      xanchor: 'left', xshift: 9, showarrow: false, text: 'Katara56',
      font: { size: 9, color: kColor, family: MONO } });

    const layout = { ...h.BASE(), annotations: ann,
      margin: { l: nw ? 46 : 132, r: 12, t: 46, b: 44 },
      barmode: 'overlay',
      xaxis: { ...h.GAX, range: [-aMax, aMax], zerolinewidth: 2,
        title: { text: nw ? 'nm vs 3-nm peers (A)' : 'Basis A — nm made vs median of boats within 3 nm at phase start', font: h.AXFONT } },
      xaxis2: { ...h.GAX, overlaying: 'x', side: 'top', range: [-bMax, bMax],
        zerolinewidth: 2, showgrid: false, ticksuffix: '%',
        title: { text: nw ? '% vs fleet median (B)' : 'Basis B — % faster (+) / slower (−) than fleet median, same water', font: h.AXFONT } },
      yaxis: { ...h.GAX, type: 'category', categoryorder: 'array', categoryarray: ids,
        autorange: 'reversed', tickmode: 'array', tickvals: ids, ticktext: rowLbl,
        tickfont: { ...h.AXFONT, size: nw ? 9 : 10 } },
      showlegend: false };
    return { traces, layout };
  },
});
