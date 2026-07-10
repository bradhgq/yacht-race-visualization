/* Upwind-excess module — distance sailed from the start to the Block Island
   rounding, one horizontal bar per selected boat, anchored on the class winner
   (monolith renderUpwind VERBATIM through the ctx ABI). Reads the STORED
   meta.up1bi (pipeline postprocess, golden 4.7 nm delta) — never recomputes.
   Copy claims are scoped to the 18-boat analysis in the note and each bar is
   labelled with its class finish (round-3 narrative-honesty assertions). */
"use strict";

registerModule({
  id: 'upwind',
  deps: ['boats'],
  section: {
    kind: 'plot',
    height: 'min(430px, 92vw)',
    title: 'Distance vs. finish — what the 4.7 nm cost, and what it didn’t',
    note: 'Distance sailed from the start to the Block Island rounding, each bar labeled with the boat’s class finish. <b>Distance discipline tracks the podium</b> — the top three sailed +0.0, +0.3, +1.3 nm extra, and across Class 6 the distance-vs-finish rank correlation is 0.83. <span class="mag">Ragana</span>’s +4.7 nm at a 5.3-kt upwind average is ≈53 minutes of a 276-minute corrected gap; the rest is pace, most of it on the leg home (Act 3; see the speed chart and the broach). Zélée sailed +8.9 — nearly double — and still finished three places ahead: the margin for a clean lane is real, but pace decides the order inside it.',
  },
  build(ctx) {
    const { D, S, h, cfg } = ctx;
    const C6 = cfg.groups.by_name_class6;
    const rows = [];
    for (const nm of Object.keys(D.boats)) {
      if (!S.boats.has(nm)) continue;
      const v = D.boats[nm].meta.up1bi;
      if (v == null) continue;
      rows.push({ nm, sd: v });
    }
    if (!rows.length) return { traces: [], layout: { ...h.BASE() } };
    rows.sort((a, b) => a.sd - b.sd);
    const cd = rows.find(r => r.nm === 'Christopher Dragon XII');
    const base = cd ? cd.sd : Math.min(...rows.map(r => r.sd));
    const anchored = !!cd;
    const ord = n => n + (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');
    const lbl = r => {
      const m = D.boats[r.nm].meta;
      const fin = (r.nm === cfg.hero.name || C6.includes(r.nm)) ? ' · fin ' + ord(m.clsPos) : (m.cls ? ' · ' + m.cls : '');
      if (anchored && r.nm === 'Christopher Dragon XII') return 'reference · won class';
      const dv = r.sd - base;
      return (dv >= 0 ? '+' : '') + dv.toFixed(1) + ' nm' + fin + (anchored ? '' : ' *');
    };
    const traces = [{ type: 'bar', orientation: 'h',
      x: rows.map(r => r.sd), y: rows.map(r => r.nm),
      marker: { color: rows.map(r => h.boatColor[r.nm]) },
      text: rows.map(lbl), textposition: 'outside',
      hovertemplate: '%{y} · %{x:.1f} nm sailed to 1BI<extra></extra>' }];
    const layout = { ...h.BASE(), margin: { l: 150, r: 40, t: 8, b: 40 },
      xaxis: { ...h.GAX, title: { text: 'Distance sailed to Block Island (nm)', font: h.AXFONT },
               range: [base - 3, Math.max(...rows.map(r => r.sd)) + 8] },
      yaxis: { ...h.GAX, automargin: true }, showlegend: false };
    return { traces, layout };
  },
});
