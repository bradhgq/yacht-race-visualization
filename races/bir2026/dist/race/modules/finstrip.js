/* Finish-spread module — TWO division bands (ORC and PHRF), each a
   bidirectional beeswarm of corrected times (monolith renderFinstrip VERBATIM
   through the ctx ABI). ORC and PHRF use different rating systems: their
   corrected times are NEVER pooled or compared — separate rows, separate
   labels, different marker glyphs as the non-colour cue. Lucky (Cows-finish
   course variant) is excluded from corrected comparisons entirely. */
"use strict";

registerModule({
  id: 'finstrip',
  deps: ['boats'],
  section: {
    kind: 'plot',
    height: 'min(340px, 80vw)',
    title: 'The finish — every corrected time, division by division',
    note: 'Corrected times by scoring division — <b>ORC and PHRF use different rating systems, so their corrected times are shown as separate rows and are never compared to each other</b>. <span class="mag">Ragana</span> is the magenta diamond in the ORC row (33 finishers; last in Class 6, 31st of 33 in division). Lucky (Cows-finish course variant) is excluded. Nearly half the fleet crossed after 2300 Saturday, into the same building wind that produced the broach.',
  },
  build(ctx) {
    const { D, h, cfg } = ctx;
    const ORDER = Object.keys(D.boats);
    const pool = cls => ORDER.filter(nm => nm !== 'Lucky' && D.boats[nm].meta.cls === cls
        && D.boats[nm].meta.corr && D.boats[nm].meta.el)
      .map(nm => ({ nm, c: h.parseDur(D.boats[nm].meta.corr) / 3600 }))
      .filter(o => !isNaN(o.c)).sort((a, b) => a.c - b.c);
    function swarm(fin, xspan) {
      const dx = xspan * 0.012;               // collision radius in x-units
      const placed = [];
      for (const o of fin) {
        let lvl = 0, dir = 1, tries = 0;
        while (tries < 40) {
          const clash = placed.some(p => p.lvl === lvl && Math.abs(p.c - o.c) < dx);
          if (!clash) { o.lvl = lvl; break; }
          lvl = (dir > 0 ? +Math.ceil(tries / 2) : -Math.ceil(tries / 2));
          dir = -dir; tries++;
        }
        if (o.lvl === undefined) o.lvl = 0;
        placed.push(o);
      }
      return Math.max(1, ...fin.map(o => Math.abs(o.lvl)));
    }
    const orc = pool('ORC'), phrf = pool('PHRF');
    const allc = [...orc, ...phrf].map(o => o.c);
    const xspan = (Math.max(...allc) - Math.min(...allc)) || 1;
    const mAO = swarm(orc, xspan), mAP = swarm(phrf, xspan);
    const BAND = 9, GAP = 5;                   // equal half-height per band
    const scale = (arr, mx) => { for (const o of arr) o.y = o.lvl * (BAND / Math.max(mx, 1)); };
    scale(orc, mAO); scale(phrf, mAP);
    const cOrc = 0, cPhrf = 2 * BAND + GAP;    // band centers
    for (const o of orc) o.y += cOrc;
    for (const o of phrf) o.y += cPhrf;
    const traces = [];
    const hero = cfg.hero.name;
    const dot = (fin, color, sym) => {
      const others = fin.filter(o => o.nm !== hero);
      traces.push({ x: others.map(o => o.c), y: others.map(o => o.y), mode: 'markers',
        marker: { size: 7, color, opacity: .7, symbol: sym }, text: others.map(o => o.nm),
        hovertemplate: '%{text} · corrected %{x:.2f} h<extra></extra>', showlegend: false });
      const R = fin.find(o => o.nm === hero);
      if (R) traces.push({ x: [R.c], y: [R.y], mode: 'markers',
        marker: { size: 16, color: cfg.hero.color, symbol: 'diamond', line: { width: 1.5, color: '#fff' } },
        text: [hero], hovertemplate: `${hero} · corrected %{x:.2f} h<extra></extra>`, showlegend: false });
    };
    dot(orc, '#5D7C8E', 'circle'); dot(phrf, '#A9885F', 'square');
    const ann = [{ x: 0, y: cOrc + BAND + 2.5, xref: 'paper', yref: 'y', xanchor: 'left', showarrow: false,
        text: `ORC · Block Island Course · ${orc.length} finishers (● circles)`,
        font: { size: 10, color: '#51677A', family: 'SF Mono, Menlo, monospace' } },
      { x: 0, y: cPhrf + BAND + 2.5, xref: 'paper', yref: 'y', xanchor: 'left', showarrow: false,
        text: `PHRF · Block Island Course · ${phrf.length} finishers (■ squares — different rating, not comparable to ORC)`,
        font: { size: 10, color: '#51677A', family: 'SF Mono, Menlo, monospace' } }];
    const layout = { ...h.BASE(), margin: { l: 16, r: 16, t: 8, b: 40 }, annotations: ann,
      shapes: [{ type: 'line', xref: 'paper', x0: 0, x1: 1, yref: 'y', y0: BAND + GAP / 2, y1: BAND + GAP / 2,
                 line: { color: '#D5E0E4', width: 1, dash: 'dot' } }],
      xaxis: { ...h.GAX, title: { text: 'Corrected time (hours) — within each division only', font: h.AXFONT } },
      yaxis: { ...h.GAX, visible: false, range: [cOrc - BAND - 2, cPhrf + BAND + 3.5] }, showlegend: false };
    return { traces, layout };
  },
});
