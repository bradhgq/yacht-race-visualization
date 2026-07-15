/* Upwind-lane module — signed offset from the straight line start → 1BI,
   on a DISTANCE-SAILED x-axis (0 → each boat's Block Island rounding), with a
   rounding marker at each line's end (monolith renderXTE VERBATIM through the
   ctx ABI). This is NOT the shell xte chart: different x basis (cumulative
   distance sailed vs shared axis) and a fixed reference line (start→1BI, not
   the routed active leg). Both ship for the everything-built review.

   Acts + events ride the module's own x-mapper (the hero's distance sailed up
   the leg): an event lands where the hero was when it happened; moments after
   her rounding are off this chart and dropped, act bands clip to the leg. */
"use strict";

registerModule({
  id: 'lane',
  deps: ['boats', 'ev'],
  section: {
    kind: 'plot',
    height: 'min(400px, 88vw)',
    title: 'The upwind lane — who went where on the way out',
    note: 'Signed offset from the straight line start → 1BI, positive = <b>south</b>, drawn up to each boat’s Block Island rounding. <span class="mag">Ragana</span> pushed to <b>+4.5 nm</b> south mid-leg — the deliberate bet on a southerly shift — but the lane alone doesn’t separate her from the class: Sleeper reached +5.6 and Zélée +5.0 on the same side. What distinguishes the winner is a <b>tighter corridor</b> — Christopher Dragon XII never went more than 2.0 nm south — and, above all, pace. Every boat’s average offset is near zero: these are tacking envelopes, not flyers.',
  },
  build(ctx) {
    const { D, S, h, cfg } = ctx, hero = cfg.hero.name;
    const P0 = cfg.lane.from, P1 = cfg.lane.to, C = cfg.lane.ringCenter;
    const R = 3440.065, rad = Math.PI / 180;
    const hv = (a, b2, c, d) => {
      const dp = (c - a) * rad, dl = (d - b2) * rad;
      const x = Math.sin(dp / 2) ** 2 + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin(dl / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(x));
    };
    const traces = []; let maxRound = 0, heroLeg = null;
    for (const nm of Object.keys(D.boats)) {
      if (!S.boats.has(nm) || !h.hasTrack(nm)) continue; const b = D.boats[nm];
      let i0 = -1, i1 = -1;
      for (let i = 0; i < b.lat.length; i++) {
        const dc = hv(b.lat[i], b.lon[i], C[0], C[1]);
        if (dc < 8) { if (i0 < 0) i0 = i; i1 = i; } else if (i0 >= 0) break;
      }
      if (i0 < 0) continue;
      let im = i0, dm = 1e9;
      for (let i = i0; i <= i1; i++) {
        const d = hv(b.lat[i], b.lon[i], P1[0], P1[1]); if (d < dm) { dm = d; im = i; }
      }
      const kx = 60 * Math.cos(41.13 * rad), ky = 60;
      const ax = P0[1] * kx, ay = P0[0] * ky, bx = P1[1] * kx, by = P1[0] * ky;
      const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
      const xs = [], ys = []; let cum = 0;
      for (let i = 0; i <= im; i++) {
        if (i > 0) cum += hv(b.lat[i - 1], b.lon[i - 1], b.lat[i], b.lon[i]);
        xs.push(cum);
        const px = b.lon[i] * kx, py = b.lat[i] * ky;
        ys.push(((px - ax) * dy - (py - ay) * dx) / L);
      }
      if (nm === hero) heroLeg = { ts: b.t.slice(0, im + 1), cums: xs };
      maxRound = Math.max(maxRound, cum);
      traces.push({ x: xs, y: ys, mode: 'lines', name: nm,
        line: { color: h.boatColor[nm], width: nm === hero ? 2.6 : 1.4 }, opacity: nm === hero ? 1 : .82,
        hovertemplate: `${nm} · %{x:.0f} nm sailed · %{y:.1f} nm (+ south / − north)<extra></extra>` });
      traces.push({ x: [cum], y: [ys[ys.length - 1]], mode: 'markers',
        marker: { symbol: 'circle-open', size: 9, color: h.boatColor[nm], line: { width: 2 } },
        hovertemplate: `${nm} rounds Block Island · ${cum.toFixed(0)} nm sailed<extra></extra>`, showlegend: false });
    }
    // acts + events in THIS chart's x-space (hero's distance sailed up the leg)
    const cumAt = (t, clamp) => {
      if (!heroLeg) return null;
      const { ts, cums } = heroLeg;
      if (t <= ts[0]) return clamp ? 0 : (t < ts[0] - 1 ? null : 0);
      if (t >= ts[ts.length - 1]) return clamp ? cums[cums.length - 1] : null;
      let i = ts.findIndex(x => x >= t); const f = (t - ts[i - 1]) / (ts[i] - ts[i - 1]);
      return cums[i - 1] + f * (cums[i] - cums[i - 1]);
    };
    const EVCAT = cfg.eventCategories;
    const ep = s => Date.parse(s.replace(' ', 'T') + '-04:00') / 1000;
    const shapes = [], ann = [];
    for (const [a, b, lbl, fill] of cfg.acts) {
      const x0 = cumAt(ep(a), true), x1 = cumAt(ep(b), true);
      if (x0 == null || x1 == null || x0 === x1) continue;
      shapes.push({ type: 'rect', xref: 'x', yref: 'paper', x0, x1, y0: 0, y1: 1, fillcolor: fill, line: { width: 0 } });
      const xm = cumAt((ep(a) + ep(b)) / 2, true);
      if (xm != null && !h.narrow()) ann.push({ x: xm, y: 1.05, xref: 'x', yref: 'paper', text: lbl, showarrow: false,
        xanchor: 'center', font: { size: 9, color: '#51677A', family: 'SF Mono, Menlo, monospace' } });
    }
    const evs = D.events.filter(e => S.ev.has(e.cat) && cumAt(e.t, false) != null);
    for (const e of evs) shapes.push({ type: 'line', xref: 'x', yref: 'paper',
      x0: cumAt(e.t, false), x1: cumAt(e.t, false), y0: 0, y1: 1,
      line: { color: EVCAT[e.cat].c, width: 1, dash: 'dot' }, opacity: .5 });
    if (evs.length) traces.push({ x: evs.map(e => cumAt(e.t, false)), y: evs.map(() => 6.0), mode: 'markers',
      marker: { symbol: evs.map(e => EVCAT[e.cat].sym), size: evs.map(e => EVCAT[e.cat].big ? 12 : 9),
        color: evs.map(e => EVCAT[e.cat].c), line: { width: 1, color: '#fff' } },
      text: evs.map(e => h.wrapText(`${e.label} · ${h.fmt(e.t)} ${cfg.time.tzLabel} · ${Math.round(h.heroDTFat(e.t))} nm to go — ${e.txt}`)),
      hoverinfo: 'text', showlegend: false });
    shapes.push({ type: 'line', xref: 'paper', x0: 0, x1: 1, yref: 'y', y0: 0, y1: 0, line: { color: '#B9CBD4', width: 1 } });
    ann.push({ x: maxRound, y: -5.8, xref: 'x', yref: 'y', xanchor: 'right', showarrow: false,
      text: '← boats round Block Island here', font: { size: 10, color: '#7D3C98', family: 'SF Mono, Menlo, monospace' } },
      { x: 2, y: 4.3, xref: 'x', yref: 'y', xanchor: 'left', showarrow: false, text: 'SOUTH ↑',
        font: { size: 9, color: '#9AAAB8', family: 'SF Mono, Menlo, monospace' } },
      { x: 2, y: -4.3, xref: 'x', yref: 'y', xanchor: 'left', showarrow: false, text: 'NORTH ↓',
        font: { size: 9, color: '#9AAAB8', family: 'SF Mono, Menlo, monospace' } });
    const layout = { ...h.BASE(), shapes, annotations: ann, margin: { ...h.BASE().margin, t: 24 },
      xaxis: { ...h.GAX, title: { text: 'Distance sailed from start (nm) — leg out to Block Island', font: h.AXFONT },
               range: [0, maxRound * 1.02] },
      yaxis: { ...h.GAX, title: { text: 'Offset from direct line (nm) — + south', font: h.AXFONT }, range: [-6.5, 6.5] },
      showlegend: false };
    return { traces, layout };
  },
});
