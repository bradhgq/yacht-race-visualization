/* Time-density dots — equal-TIME markers along each selected track (owner
   request, stage-4 round 1): a dot every hour on the gridded series, so dot
   density reads as pace directly — dots bunch where the boat parked and
   stretch where she ran. Complements the arrows overlay (direction). */
"use strict";

registerOverlay({
  id: 'timedots',
  mapLayer: 'over',
  pill: { label: 'Hour dots', color: '#51677A', default: true },
  mapTraces(ctx) {
    const { D, S, h } = ctx;
    const tr = [];
    const nsel = [...S.boats].length;
    const STEP = nsel > 8 ? 8 : 4;          // 15-min grid: 8 = every 2 h when busy, else hourly
    for (const nm of Object.keys(D.boats)) {
      if (!S.boats.has(nm) || !h.hasTrack(nm)) continue;
      const b = D.boats[nm];
      const xs = [], ys = [], txt = [];
      for (let i = 0; i < b.t.length; i += STEP) {
        if (b.lat[i] == null) continue;
        xs.push(b.lon[i]); ys.push(b.lat[i]);
        txt.push(`${nm} · ${h.fmt(b.t[i])}`);
      }
      tr.push({ x: xs, y: ys, mode: 'markers',
        marker: { size: 3.2, color: h.boatColor[nm] || '#7C8C9A', opacity: 0.55 },
        text: txt, hoverinfo: 'text', showlegend: false });
    }
    return tr;
  },
});
