/* Two boats in one — the phase-split scatter (ALIR 2026's signature module).

   One dot per boat: x = miles it logged in the POWERED windows (P2 the Friday
   reach + P5 the rebuild to the Gut), y = miles in the LIGHT-AIR windows
   (P3 night one + P4 the dawn park + P6 the Sound night) — the same phase
   windows as the ledger above. Both mileages ride meta (postprocess), so a
   boat renders from the payload alone; every number on this chart, including
   Max's two ranks, is computed here at runtime. No weather constants are
   embedded — the split is pure tracker geometry, the phase windows carry the
   weather story elsewhere.

   Owner directives: retired boats stay plotted — they count as neighbors for
   what they sailed — at muted opacity with (RET) in hover; ORC Division 0
   boats are squares with (ORC) in hover; Max is the hero and carries its
   powered/light ranks on-chart (the note stays static by design). Quadrant
   captions ride paper corners; per the label-lane rule nothing here claims
   the y>1 phase lane or the top in-plot event row. */
"use strict";

registerModule({
  id: 'split',
  deps: ['boats'],
  section: {
    kind: 'plot',
    height: 'min(440px, 95vw)',
    title: 'Two boats in one — powered vs light',
    note: 'One dot per boat, its raced distance split by phase: <b>x</b> = miles logged in the two powered windows ' +
      '(P2, the Friday reach; P5, the rebuild to the Gut), <b>y</b> = miles in the three light-air windows ' +
      '(P3, night one; P4, the dawn park; P6, the Sound night) — the same windows as the phase ledger above. ' +
      '<span class="mag">Max</span> is two boats in one hull: first in the fleet for powered-phase miles, mid-fleet ' +
      'once the air went light — the exact ranks are printed at its dot. Retired boats stay plotted for the miles ' +
      'they did sail (RET, faded); ORC Division 0 boats plot as squares.',
  },
  build(ctx) {
    const { D, S, h } = ctx;
    const HERO = 'Max';
    const MONO = 'SF Mono, Menlo, monospace';
    const MUTE = '#7C8C9A';

    const pts = [];
    for (const nm of Object.keys(D.boats)) {
      const m = D.boats[nm].meta;
      if (!m || m.powNm == null || m.lightNm == null) continue;
      pts.push({
        nm,
        pow: m.powNm,
        light: m.lightNm,
        orc: (m.cls || '').indexOf('ORC') !== -1,
        ret: m.grp === 'fleet_dnf',
        note: m.note || '',
      });
    }
    pts.sort((a, b2) => a.pow - b2.pow);   // hero (top powered) draws last
    const n = pts.length;
    const byName = {};
    for (const p of pts) byName[p.nm] = p;

    const tag = p => (p.orc ? ' (ORC)' : '') + (p.ret ? ' (RET)' : '');
    const tr = [{
      x: pts.map(p => p.pow),
      y: pts.map(p => p.light),
      mode: 'markers',
      marker: {
        symbol: pts.map(p => p.orc ? 'square' : 'circle'),
        size: pts.map(p => p.nm === HERO ? 12 : (S.boats.has(p.nm) ? 9 : 7)),
        color: pts.map(p => p.nm === HERO ? h.boatColor[HERO]
          : (S.boats.has(p.nm) ? (h.boatColor[p.nm] || MUTE) : MUTE)),
        opacity: pts.map(p => p.nm === HERO ? 1
          : (p.ret ? 0.35 : (S.boats.has(p.nm) ? 0.9 : 0.55))),
        line: { width: pts.map(p => p.nm === HERO ? 1.5 : 0.5), color: '#fff' },
      },
      text: pts.map(p => h.wrapText(
        `${p.nm}${tag(p)} — ${p.note} · powered ${p.pow.toFixed(1)} nm · light ${p.light.toFixed(1)} nm`)),
      hoverinfo: 'text', showlegend: false,
    }];

    // quadrant captions — paper corners, never the phase or event lanes
    const ann = [
      { xref: 'paper', yref: 'paper', x: 0.99, y: 0.02, xanchor: 'right', yanchor: 'bottom',
        showarrow: false, text: 'powered specialist',
        font: { size: 9, color: MUTE, family: MONO }, opacity: 0.85 },
      { xref: 'paper', yref: 'paper', x: 0.01, y: 0.99, xanchor: 'left', yanchor: 'top',
        showarrow: false, text: 'light-air specialist',
        font: { size: 9, color: MUTE, family: MONO }, opacity: 0.85 },
    ];

    // notable boats + the biggest light-phase specialist, found at runtime;
    // label only boats actually present in the split data
    let lightTop = null;
    for (const p of pts) if (!lightTop || p.light > lightTop.light) lightTop = p;
    const labels = h.narrow() ? [] : ['Katara56', 'Zammermoos', 'Poseidon', 'Lioness'];
    if (lightTop && lightTop.nm !== HERO && labels.indexOf(lightTop.nm) === -1) labels.push(lightTop.nm);
    for (const nm of labels) {
      const p = byName[nm];
      if (!p) continue;
      ann.push({ x: p.pow, y: p.light, xref: 'x', yref: 'y', ax: 0, ay: -20,
        showarrow: true, arrowwidth: 1, arrowcolor: h.boatColor[nm] || '#51677A',
        text: nm, font: { size: 9, color: h.boatColor[nm] || '#51677A', family: MONO } });
    }

    // the hero label carries the runtime ranks (ties share a rank, strict count)
    const mx = byName[HERO];
    if (mx) {
      const powRank = pts.filter(p => p.pow > mx.pow).length + 1;
      const lightRank = pts.filter(p => p.light > mx.light).length + 1;
      const txt = h.narrow()
        ? `Max<br>powered #${powRank}/${n} · light #${lightRank}/${n}`
        : `Max — powered #${powRank} of ${n} · light-air #${lightRank} of ${n}`;
      ann.push({ x: mx.pow, y: mx.light, xref: 'x', yref: 'y', ax: -78, ay: -34,
        showarrow: true, arrowwidth: 1.5, arrowcolor: h.boatColor[HERO],
        text: txt, font: { size: 10, color: h.boatColor[HERO], family: MONO } });
    }

    const layout = { ...h.BASE(), annotations: ann,
      margin: { ...h.BASE().margin, t: 30 },
      xaxis: { ...h.GAX,
        title: { text: 'Miles sailed in the powered phases — P2 + P5 (nm)', font: h.AXFONT } },
      yaxis: { ...h.GAX,
        title: { text: 'Miles in the light-air phases — P3 + P4 + P6 (nm)', font: h.AXFONT } },
      showlegend: false };
    return { traces: tr, layout };
  },
});
