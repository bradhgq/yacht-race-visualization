/* Direction arrows overlay — periodic mid-line arrows on each selected boat's
   map track (monolith renderMap verbatim, R9-upgraded pair encoding: each arrow
   is an invisible anchor at the PREVIOUS ping plus the visible head, so
   angleref:'previous' aligns with the LOCAL segment, not a long chord; arrow
   count scales down as the selection grows). Always on, no pill. */
"use strict";

registerOverlay({
  id: 'arrows',
  mapLayer: 'over',
  pill: { default: true },
  mapTraces(ctx) {
    const { D, S, h } = ctx, hero = ctx.cfg.hero.name;
    const tr = [];
    const nsel = [...S.boats].length;
    const K = nsel > 10 ? 3 : (nsel > 4 ? 4 : 6);   // arrows per track, scaled to clutter
    for (const nm of Object.keys(D.boats)) {
      if (!S.boats.has(nm) || !h.hasTrack(nm)) continue; const b = D.boats[nm];
      const axx = [], ayy = [], asz = [];
      for (let j = 1; j <= K; j++) {
        const i = Math.floor(b.lat.length * j / (K + 1));
        if (i > 0 && i < b.lat.length) {
          axx.push(b.lon[i - 1]); ayy.push(b.lat[i - 1]); asz.push(0);
          axx.push(b.lon[i]); ayy.push(b.lat[i]); asz.push(nm === hero ? 11 : 8);
        }
      }
      tr.push({ x: axx, y: ayy, mode: 'markers',
        marker: { symbol: 'arrow', size: asz, angleref: 'previous',
          color: h.boatColor[nm], line: { width: 0.5, color: '#fff' } },
        opacity: nm === hero ? 1 : .9, hoverinfo: 'skip', showlegend: false });
    }
    return tr;
  },
});
