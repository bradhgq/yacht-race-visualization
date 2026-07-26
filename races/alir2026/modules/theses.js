/* The theses block — the dashboard's opinions, stated up front (owner directive,
   stage-4 design: "3-5 theses stated" directly after the course). Content rides
   COPY.theses (copy.js) — narrative never lives in module code; this module is
   pure rendering. kind:'html': build() writes into the section mount directly. */
"use strict";

registerModule({
  id: 'theses',
  deps: [],
  section: {
    kind: 'html',
    title: 'What the data says — five theses',
    note: 'Each thesis is verified against the tracker and, where marked, the weather evidence; ' +
          'the charts below carry the proof in the order the race unfolded.',
  },
  build(ctx) {
    if (!ctx.el) return;
    const items = (ctx.copy.theses || []);
    ctx.el.innerHTML =
      '<ol style="margin:0;padding:0 0 0 0;list-style:none;display:flex;flex-direction:column;gap:10px">' +
      items.map((t, i) =>
        `<li style="display:grid;grid-template-columns:2em 1fr;gap:10px;align-items:baseline">` +
        `<span style="font-family:var(--mono,SF Mono,Menlo,monospace);font-size:12px;color:var(--magenta,#C2187E);font-weight:600">${i + 1}</span>` +
        `<span style="font-size:14px;line-height:1.55"><b>${t.h}</b> ${t.txt}</span></li>`
      ).join('') +
      '</ol>';
  },
});
