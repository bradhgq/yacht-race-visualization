/* Act bands overlay — the race's three-act narrative structure (authored in
   presentation.js cfg.acts as local-time ranges + labels + fills), drawn as
   tinted bands with top labels on every time-based chart via the shell's
   overlayShapes/overlayAnnotations hooks. Pill-less and always on (pill.default
   true, not listed in controls.pills). The lane module maps the same cfg.acts
   into its own distance-sailed x-space itself. */
"use strict";

registerOverlay({
  id: 'acts',
  pill: { default: true },   // always on; no chip
  bands(ctx, mode) {
    const X = mode === 'time' ? ctx.h.tzStr : ctx.h.evX;
    const ep = s => Date.parse(s.replace(' ', 'T') + '-04:00') / 1000;
    return ctx.cfg.acts.map(([a, b, lbl, fill]) => ({
      type: 'rect', xref: 'x', yref: 'paper', x0: X(ep(a)), x1: X(ep(b)),
      y0: 0, y1: 1, fillcolor: fill, line: { width: 0 } }));
  },
  bandAnnotations(ctx, mode) {
    if (ctx.h.narrow()) return [];
    const X = mode === 'time' ? ctx.h.tzStr : ctx.h.evX;
    const ep = s => Date.parse(s.replace(' ', 'T') + '-04:00') / 1000;
    return ctx.cfg.acts.map(([a, b, lbl]) => ({
      x: X((ep(a) + ep(b)) / 2), y: 1.05, xref: 'x', yref: 'paper', text: lbl,
      showarrow: false, xanchor: 'center',
      font: { size: 9, color: '#51677A', family: 'SF Mono, Menlo, monospace' } }));
  },
});
