/* The night-one map — the divergence, watchable (owner: the M2 centerpiece,
   with equal-TIME dots so density reads as pace: bunched dots = parked).
   Tracks 22:00 Thu → 08:00 Fri for the night cast, hourly dots on the 15-min
   grid, arrowheads on the final segment for direction. Boats whose full
   series lives in more.json render once it loads (hasTrack guard) — the
   core cast (hero, Division 9, ORC group, Lioness) is always present. */
"use strict";

registerModule({
  id: 'nightmap',
  deps: ['boats'],
  section: {
    kind: 'plot',
    height: 'min(600px, 110vw)',
    title: 'Night one on the water — the peel, the jibe, the dead lane',
    note: '<b>Dots are one hour apart — where they bunch, the boat is parked.</b> ' +
      'Katara56 peels offshore from 23:00 and keeps her spacing through dawn; ' +
      '<span class="mag">Max</span> follows halfway, jibes back toward the beach at 03:00, ' +
      'and her dots close up in the 5-nm dead lane. Arrowheads mark direction of travel. ' +
      'The dashed line is the Long Island south shore.',
  },
  build(ctx) {
    const { D, S, cfg, h } = ctx;
    const T0 = Date.UTC(2026, 6, 24, 2, 0) / 1000;    // 22:00 EDT Thu = 02:00Z Fri
    const T1 = Date.UTC(2026, 6, 24, 12, 0) / 1000;   // 08:00 EDT Fri
    const CAST = ['Max', 'Katara56', 'Zammermoos', 'Poseidon', 'Habiru YCC',
                  'Lioness', 'Della Aurora', 'Beagle', 'Crocodile'];
    const SHORE = [[40.594, -73.35], [40.62, -73.29], [40.635, -73.20], [40.64, -73.16],
                   [40.66, -73.06], [40.69, -72.955], [40.72, -72.87], [40.76, -72.755],
                   [40.80, -72.66], [40.83, -72.55], [40.845, -72.47]];
    const tr = [{
      x: SHORE.map(p => p[1]), y: SHORE.map(p => p[0]), mode: 'lines',
      line: { color: '#8898A6', width: 1, dash: 'dot' }, hoverinfo: 'skip', showlegend: false,
    }];
    const ann = [{
      x: -72.93, y: 40.71, xref: 'x', yref: 'y', showarrow: false,
      text: 'LONG ISLAND — south shore', textangle: -8,
      font: { size: 9, color: '#8898A6', family: 'SF Mono, Menlo, monospace' },
    }];
    for (const nm of CAST) {
      if (!h.hasTrack(nm)) continue;
      const b = D.boats[nm];
      const hero = nm === cfg.hero.name;
      const col = h.boatColor[nm] || (nm === 'Katara56' ? '#2F7357' : '#7C8C9A');
      const lx = [], ly = [], dx = [], dy = [], dt = [];
      for (let i = 0; i < b.t.length; i++) {
        if (b.t[i] < T0 || b.t[i] > T1 || b.lat[i] == null) continue;
        lx.push(b.lon[i]); ly.push(b.lat[i]);
        if ((b.t[i] - T0) % 3600 < 900) {              // hourly dot on the 15-min grid
          dx.push(b.lon[i]); dy.push(b.lat[i]); dt.push(`${nm} · ${h.fmt(b.t[i])}`);
        }
      }
      if (lx.length < 2) continue;
      tr.push({ x: lx, y: ly, mode: 'lines',
        line: { color: col, width: hero ? 3 : 1.6 }, opacity: hero ? 1 : 0.8,
        hoverinfo: 'skip', showlegend: false });
      tr.push({ x: dx, y: dy, mode: 'markers',
        marker: { size: hero ? 5 : 4, color: col, opacity: 0.85,
                  line: { width: 0.5, color: '#fff' } },
        text: dt, hoverinfo: 'text', showlegend: false });
      // direction arrowhead on the final segment
      const n = lx.length;
      ann.push({ x: lx[n - 1], y: ly[n - 1], ax: lx[n - 2], ay: ly[n - 2],
        xref: 'x', yref: 'y', axref: 'x', ayref: 'y', showarrow: true,
        arrowhead: 2, arrowsize: 1.3, arrowwidth: hero ? 2 : 1.2, arrowcolor: col, text: '' });
      const lab = { Max: [8, -10], Katara56: [8, 12], Beagle: [-46, -10], Crocodile: [8, -10] }[nm];
      if (lab || !h.narrow()) {
        ann.push({ x: lx[n - 1], y: ly[n - 1], xanchor: 'left', showarrow: false,
          xshift: (lab ? lab[0] : 8), yshift: (lab ? lab[1] : -10),
          text: nm + (((D.boats[nm].meta || {}).cls || '').includes('ORC') ? ' ■' : ''),
          font: { size: 9.5, color: col, family: 'SF Mono, Menlo, monospace' } });
      }
    }
    // the 03:00 jibe marker on Max
    const mb = D.boats['Max'];
    if (mb && mb.t) {
      const tj = Date.UTC(2026, 6, 24, 7, 0) / 1000;   // 03:00 EDT
      let best = 0; for (let i = 0; i < mb.t.length; i++) if (Math.abs(mb.t[i] - tj) < Math.abs(mb.t[best] - tj)) best = i;
      if (mb.lat[best] != null) ann.push({ x: mb.lon[best], y: mb.lat[best], ax: 0, ay: -30,
        showarrow: true, arrowwidth: 1, arrowcolor: h.boatColor['Max'],
        text: '03:00 — the jibe back', font: { size: 9.5, color: h.boatColor['Max'], family: 'SF Mono, Menlo, monospace' } });
    }
    const layout = { ...h.BASE(), annotations: ann,
      margin: { ...h.BASE().margin, t: 24 },
      xaxis: { ...h.GAX, range: [-73.10, -72.52], title: { text: 'longitude — 22:00 Thu → 08:00 Fri', font: h.AXFONT } },
      yaxis: { ...h.GAX, range: [40.47, 40.82], scaleanchor: 'x', scaleratio: 1.32,
               title: { text: 'latitude', font: h.AXFONT } },
      showlegend: false };
    return { traces: tr, layout };
  },
});
