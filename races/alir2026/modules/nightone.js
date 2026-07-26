/* Night one — the lane that paid and the lane that didn't (ALIR 2026 race-unique).

   Two stacked panels in one plot. TOP: the U-shape — each boat's mean distance
   offshore overnight (x) vs the miles it made good in the window (y), with the
   quadratic fit (evaluated at equal starting DTF) showing a fitted minimum:
   both edges of the fleet beat the middle lane. BOTTOM: the mechanism, as
   OBSERVED evidence — the hourly two-station wind difference (offshore buoy
   minus bay station) that flips sign at 08:00, when the advantage crossed from
   the inshore land breeze to the offshore gradient. All boat numbers come from
   ctx.D.nightone at runtime; the only embedded constants are the weather
   evidence below, per the evidence-constants pattern (squall.js precedent).

   LABEL-LANE RULE (owner, 2026-07-23): y>1 paper belongs to phase labels, the
   top in-plot row to event markers — the dead-lane label therefore renders
   VERTICALLY beside its own line, and panel annotations stay inside their
   panel's empty quadrants. */
"use strict";

/* EVIDENCE — class: OBSERVED. Two-station hourly wind difference, kt:
   NDBC 44065 (New York Harbor entrance, the offshore/gradient signal) MINUS
   NDBC 44069 (Great South Bay). Hours are EDT, Fri 2026-07-24. Negative =
   inshore/land-breeze side stronger; positive = offshore/gradient stronger.
   Caveat carried in the note: 44069 sits INSIDE Great South Bay, not on the
   ocean beach — sign and timing are defensible, magnitude is not. Hand-carried
   from the stage-0 weather acquisition; the tracker itself has no wind (I18). */
const GRADIENT_KT = [
  [2, -0.2], [3, -0.8], [4, -2.8], [5, -1.9], [6, -0.5],
  [7, -0.3], [8, 0.0], [9, 2.4], [10, 2.9], [11, 1.8],
];
const AMBER = '#B4761A';   // inshore / land breeze stronger
const GREEN = '#2F7357';   // offshore / gradient stronger

registerModule({
  id: 'nightone',
  deps: ['boats'],
  section: {
    kind: 'plot',
    height: 'min(560px, 98vw)',
    title: 'Night one — the lane that paid and the lane that didn’t',
    note: '<b>Both edges of the fleet outpaced the middle: the fitted dead lane sits at ~5 nm offshore — ' +
      'exactly where <span class="mag">Max</span> and Beagle spent the night.</b> ' +
      'Top: one dot per boat — mean distance offshore overnight (x) vs miles made good, 23:00 Thu–12:00 Fri (y); ' +
      'the dashed curve is the quadratic fit at equal starting distance-to-finish. Committed inshore (Crocodile) ' +
      'or committed offshore (Katara56, Lioness, Della Aurora) both beat the middle. ' +
      'Bottom: the mechanism — hourly wind at NDBC 44065 (offshore, NY Harbor entrance) minus 44069 (Great South Bay): ' +
      'the land breeze pays inshore until dawn, and at 08:00 the sign flips — the gradient takes over and the ' +
      'advantage crosses to offshore. Evidence class: <b>observed</b> station data (the tracker carries no wind). ' +
      'Caveat: 44069 sits inside Great South Bay, not on the ocean beach — the sign and the flip timing are ' +
      'defensible, the magnitude is not.',
  },
  build(ctx) {
    const { D, S, h } = ctx;
    const N = D.nightone;
    const MONO = 'SF Mono, Menlo, monospace';
    const fit = N.fit;
    const wLbl = `${h.fmt(N.window[0])}–${h.fmt(N.window[1])}`;   // runtime window label

    const isORC = nm => {
      const m = (D.boats[nm] || {}).meta || {};
      return !!(m.cls && m.cls.indexOf('ORC') >= 0);
    };
    const isRET = nm => ((D.boats[nm] || {}).meta || {}).grp === 'fleet_dnf';

    const FOCUS = new Set(['Max', 'Beagle']);
    const LABELED = h.narrow()
      ? { 'Max': [0, 22], 'Beagle': [18, 18], 'Katara56': [0, 24] }
      : { 'Max': [0, 22], 'Beagle': [18, 18], 'Katara56': [0, 24],
          'Lioness': [0, -18], 'Della Aurora': [30, -2],
          'Crocodile': [-6, -20], 'Zammermoos': [0, -16] };

    /* ── top panel: the U-shape ── */
    const pts = N.boats;
    const scatter = {
      x: pts.map(p => p.off),
      y: pts.map(p => p.made),
      xaxis: 'x', yaxis: 'y',
      mode: 'markers',
      marker: {
        symbol: pts.map(p => isORC(p.nm) ? 'square' : 'circle'),
        size: pts.map(p => p.nm === 'Max' ? 12 : (FOCUS.has(p.nm) ? 11 : (S.boats.has(p.nm) ? 9 : 7))),
        color: pts.map(p => h.boatColor[p.nm] || '#7C8C9A'),
        opacity: pts.map(p => isRET(p.nm) ? 0.35 : (FOCUS.has(p.nm) || S.boats.has(p.nm) ? 0.95 : 0.6)),
        line: { width: pts.map(p => FOCUS.has(p.nm) ? 1.5 : 0.5), color: '#fff' },
      },
      text: pts.map(p => h.wrapText(
        `${p.nm}${isORC(p.nm) ? ' (ORC)' : ''}${isRET(p.nm) ? ' (RET)' : ''} — ` +
        `mean ${p.off.toFixed(1)} nm offshore, made ${p.made.toFixed(1)} nm, ${wLbl}`)),
      hoverinfo: 'text', showlegend: false,
    };

    // quadratic fit at the anchor DTF, over the lane range
    const fx = [], fy = [];
    for (let x = 1.5; x <= 9.5001; x += 0.1) {
      fx.push(Math.round(x * 100) / 100);
      fy.push(Math.round((fit.b0 + fit.b_off * x + fit.b_off2 * x * x + fit.b_dtf * fit.dtf_anchor) * 100) / 100);
    }
    const fitLine = {
      x: fx, y: fy, xaxis: 'x', yaxis: 'y', mode: 'lines',
      line: { color: AMBER, width: 1.5, dash: 'dash' },
      hoverinfo: 'skip', showlegend: false,
    };

    /* ── bottom panel: the observed gradient ── */
    const catLbl = hh => `${String(hh).padStart(2, '0')}h`;
    const bars = {
      x: GRADIENT_KT.map(r => catLbl(r[0])),
      y: GRADIENT_KT.map(r => r[1]),
      xaxis: 'x2', yaxis: 'y2', type: 'bar',
      marker: { color: GRADIENT_KT.map(r => r[1] < 0 ? AMBER : (r[1] > 0 ? GREEN : '#8FA1AD')) },
      text: GRADIENT_KT.map(r => h.wrapText(
        `Fri ${catLbl(r[0])} EDT — 44065 − 44069 = ${r[1] > 0 ? '+' : ''}${r[1].toFixed(1)} kt (observed)`)),
      hoverinfo: 'text', showlegend: false,
    };

    /* ── shapes & annotations ── */
    const Y0 = 14.5, Y1 = 38.5;    // top-panel y range, fixed so shapes span it
    const shapes = [{
      type: 'line', xref: 'x', yref: 'y',
      x0: fit.min_off, x1: fit.min_off, y0: Y0, y1: Y1,
      line: { color: AMBER, width: 1, dash: 'dot' },
    }];
    const ann = [
      // dead-lane label: vertical beside its own line (label-lane rule)
      { x: fit.min_off, y: (Y0 + Y1) / 2, xref: 'x', yref: 'y', showarrow: false,
        text: h.narrow() ? 'DEAD LANE' : `THE DEAD LANE · ~${fit.min_off.toFixed(0)} nm off`,
        textangle: -90, xanchor: 'center', xshift: -8,
        font: { size: 9, color: AMBER, family: MONO }, opacity: 0.85 },
      // bottom panel: mechanism labels inside empty quadrants
      { x: catLbl(3), y: 2.2, xref: 'x2', yref: 'y2', showarrow: false,
        text: 'land breeze', font: { size: 9, color: AMBER, family: MONO } },
      { x: catLbl(10), y: -2.0, xref: 'x2', yref: 'y2', showarrow: false,
        text: 'gradient takes over', font: { size: 9, color: GREEN, family: MONO } },
    ];
    for (const p of pts) {
      const off2 = LABELED[p.nm];
      if (!off2) continue;
      ann.push({ x: p.off, y: p.made, xref: 'x', yref: 'y', ax: off2[0], ay: off2[1],
        text: p.nm, showarrow: true, arrowwidth: 1, arrowcolor: h.boatColor[p.nm] || '#7C8C9A',
        font: { size: 10, color: h.boatColor[p.nm] || '#7C8C9A', family: MONO } });
    }

    const layout = { ...h.BASE(), shapes, annotations: ann,
      margin: { ...h.BASE().margin, t: 26 },
      xaxis: { ...h.GAX, domain: [0, 1], anchor: 'y', range: [1.3, 9.7],
        title: { text: 'Mean nm offshore, 23:00 Thu – 12:00 Fri', font: h.AXFONT } },
      yaxis: { ...h.GAX, domain: [0.42, 1], anchor: 'x', range: [Y0, Y1],
        title: { text: 'nm made good in the window', font: h.AXFONT } },
      xaxis2: { ...h.GAX, domain: [0, 1], anchor: 'y2',
        title: { text: 'EDT hour, Fri', font: h.AXFONT } },
      yaxis2: { ...h.GAX, domain: [0, 0.30], anchor: 'x2', range: [-3.4, 3.4],
        zeroline: true,
        title: { text: 'Δ kt · observed', font: h.AXFONT } },
      bargap: 0.25,
      showlegend: false };
    return { traces: [fitLine, scatter, bars], layout };
  },
});
