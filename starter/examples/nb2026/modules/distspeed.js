/* Distance-sailed vs speed module (round 2 — Sebastian's request, reframed):
   the Honey-rule chart. x = total distance sailed from the raw pings
   (meta.sailedNm, same basis as the published 687.6 nm); y = sailed distance ÷
   OFFICIAL elapsed (meta.avgKt) so the iso-elapsed rays v = d/t are exact by
   construction. One dot per scored boat; grey rays = equal finish time;
   vertical line = the rhumb (theoretical minimum distance). kind:plot, so the
   layout rides the shell's react() wrapper (I6 for free). */
"use strict";

registerModule({
  id: 'distspeed',
  deps: ['boats', 'race'],   // dot colors follow selection; ring follows the reference
  section: {
    kind: 'plot',
    height: 'min(470px, 92vw)',
    title: 'Distance sailed vs speed — minimum distance at maximum speed',
    note: 'The prime directive of long-distance racing, drawn: every mile off the rhumb is an investment that must be repaid in boatspeed. Each dot is a scored St. David’s boat — how far it actually sailed (the vertical line is the 635 nm rhumb, the theoretical minimum) against how fast it went (distance sailed ÷ official elapsed, so the grey rays through the origin are lines of equal finish time — boats on the same ray finished the same water in the same time, and up-and-left wins). Distance right of the line is miles a boat chose, or was forced, to sail beyond the direct course; height above the ray it started on is speed that paid for them. RAGANA bought 52 extra miles; this chart shows who bought their miles cheaply and who paid for miles that never paid back.',
  },
  build(ctx) {
    const { D, S, h, cfg } = ctx, hero = cfg.hero.name;
    const rows = [];
    for (const nm of Object.keys(D.boats)) {
      const m = D.boats[nm].meta;
      if (!m.corr || m.sailedNm == null || m.avgKt == null) continue;
      rows.push({ nm, x: m.sailedNm, y: m.avgKt, sdl: m.sdl, el: m.el });
    }
    const rhumb = cfg.course.rhumbNm;
    const xs = rows.map(r => r.x), ys = rows.map(r => r.y);
    const x0 = Math.min(rhumb, ...xs) - 10, x1 = Math.max(...xs) + 10;
    const y0 = Math.min(...ys) - 0.35, y1 = Math.max(...ys) + 0.35;

    const rag = rows.find(r => r.nm === hero);
    const others = rows.filter(r => r.nm !== hero);
    const hover = r => `#${r.sdl} ${r.nm} · ${r.x} nm sailed (+${(r.x - rhumb).toFixed(1)} vs rhumb) · ` +
      `${r.y} kt avg · elapsed ${r.el}${r.nm === S.ref ? ' · reference' : ''}`;
    const traces = [
      { x: others.map(r => r.x), y: others.map(r => r.y), mode: 'markers',
        marker: { size: 7, color: others.map(r => S.boats.has(r.nm) ? h.boatColor[r.nm] : 'rgba(110,139,152,0.45)'),
          line: { width: others.map(r => r.nm === S.ref ? 2 : 1), color: others.map(r => r.nm === S.ref ? '#17293A' : '#fff') } },
        text: others.map(hover), hoverinfo: 'text', showlegend: false },
      { x: [rag.x], y: [rag.y], mode: 'markers',
        marker: { symbol: 'diamond', size: 13, color: cfg.hero.color, line: { width: 1.5, color: '#fff' } },
        hovertext: [hover(rag)], hoverinfo: 'text', showlegend: false }];

    // iso-elapsed rays through the origin: v = d / t. Boats on a ray finished
    // the water in the same time; the label sits where the ray leaves the view.
    const shapes = [], ann = [];
    for (const days of cfg.distspeed.isoDays) {
      const v = x => x / (days * 24);
      let lx = x1, ly = v(x1);          // exit through the right edge…
      if (ly > y1) { ly = y1; lx = y1 * days * 24; }   // …or through the top
      shapes.push({ type: 'line', xref: 'x', yref: 'y', x0: x0, y0: v(x0), x1: x1, y1: v(x1),
        line: { color: 'rgba(110,139,152,0.35)', width: 1, dash: 'dot' } });
      if (ly >= y0 && ly <= y1)
        ann.push({ x: lx, y: ly, xref: 'x', yref: 'y', text: `${days} d elapsed`, showarrow: false,
          xanchor: 'right', yanchor: 'bottom', xshift: -3,
          font: { size: 9, color: '#7A93A3', family: 'SF Mono, Menlo, monospace' } });
    }
    shapes.push({ type: 'line', xref: 'x', yref: 'paper', x0: rhumb, x1: rhumb, y0: 0, y1: 1,
      line: { color: cfg.hero.color, width: 1, dash: 'dash' }, opacity: .6 });
    ann.push({ x: rhumb, y: .98, xref: 'x', yref: 'paper', text: `rhumb ${rhumb} nm — minimum distance`,
      showarrow: false, xanchor: 'left', xshift: 5,
      font: { size: 9, color: cfg.hero.color, family: 'SF Mono, Menlo, monospace' } });
    ann.push({ x: rag.x, y: rag.y, xref: 'x', yref: 'y', ax: 0, ay: -42, text: `${hero}`, showarrow: true,
      arrowhead: 0, arrowwidth: .7, arrowcolor: 'rgba(194,24,126,0.55)', standoff: 8,
      font: { size: 10, color: cfg.hero.color, family: 'SF Mono, Menlo, monospace' } });

    const layout = { ...h.BASE(), shapes, annotations: ann,
      margin: { ...h.BASE().margin, t: 16, b: 44 }, showlegend: false,
      xaxis: { ...h.GAX, range: [x0, x1],
        title: { text: h.narrow() ? 'Distance sailed (nm)' : 'Distance sailed (nm) — right of the dashed line is miles beyond the rhumb', font: h.AXFONT } },
      yaxis: { ...h.GAX, range: [y0, y1],
        title: { text: 'Average speed (kt) — sailed ÷ official elapsed', font: h.AXFONT } } };
    return { traces, layout };
  },
});
