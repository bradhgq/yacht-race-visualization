/* The Sound night — ALIR 2026's race-unique module (stage-4).

   One dot per cohort boat: x = when it entered the Sound at Plum Gut,
   y = miles made good through the night window 22:00→04:00. The owner's
   thesis, emphasized: the earlier advantage COMPOUNDED instead of
   compressing — the front group met Saturday's easterly first, and each
   hour later at the Gut cost measurably more by dawn. The dashed line is
   the cohort fit shipped in the payload (D.soundgate.fit, computed by the
   pipeline, not here); its slope is stated on-chart from the fit itself.

   Dot fill carries the DEBATED variable — mean latitude in the Sound
   (amber = southerly track, NY shore; green = northerly, CT side) — so the
   chart can show the side story dissolving: shade order does not track the
   y-axis once entry time is controlled. The partial correlation quoted in
   the note is computed at runtime from the cohort rows, never authored.

   Every number displayed here is computed from ctx.D at build time; this
   module embeds no evidence constants (the easterly is narrative context
   from events.yaml/copy, not a data series — the tracker has no wind, I18).
   Label-lane rule honored: all annotations are data-anchored in-plot; the
   y>1 paper lane and the top in-plot marker row stay untouched. */
"use strict";

registerModule({
  id: 'soundnight',
  deps: ['boats'],
  section: {
    kind: 'plot',
    height: 'min(440px, 95vw)',
    title: 'The Sound night — when you entered, not which shore',
    // Fallback text only: build() rewrites this note with runtime-computed
    // numbers (slope, partial correlation, Max residual) once the data is in.
    note: '<b>The Sound night was decided at the gate, hours before the side debate.</b> ' +
      'The front group met Saturday’s easterly first, and the advantage compounded instead of compressing. ' +
      'Dot shades show each boat’s mean latitude (amber = NY shore, green = CT side); ' +
      'shade order does not explain the night once entry time is controlled. ' +
      '<span class="mag">Max</span> also ran under the cohort fit — a current line along the LI shore ' +
      'or a mode difference could account for it; flagged, not asserted.',
  },
  build(ctx) {
    const { D, S, cfg, h } = ctx;
    const sg = D.soundgate;
    if (!sg || !sg.boats || !sg.boats.length) return { traces: [], layout: h.BASE() };
    const fit = sg.fit;
    const MONO = 'SF Mono, Menlo, monospace';
    const LINE = '#B4761A';

    const rows = sg.boats.slice().sort((a, b) => a.gate - b.gate).map(r => {
      const meta = (D.boats[r.nm] && D.boats[r.nm].meta) || {};
      return {
        nm: r.nm, gate: r.gate, made: r.made, mlat: r.mlat,
        orc: (meta.cls || '').indexOf('ORC') !== -1,
        ret: meta.grp === 'fleet_dnf',           // retired stay in: they sailed this night
      };
    });

    // ---- runtime statistics (all from the payload; nothing authored) ----
    const hrs = rows.map(r => (r.gate - fit.x0) / 3600);
    const made = rows.map(r => r.made);
    const lats = rows.map(r => r.mlat);
    const pearson = (a, b) => {
      const n = a.length, ma = a.reduce((s, v) => s + v, 0) / n, mb = b.reduce((s, v) => s + v, 0) / n;
      let num = 0, da = 0, db = 0;
      for (let i = 0; i < n; i++) { const p = a[i] - ma, q = b[i] - mb; num += p * q; da += p * p; db += q * q; }
      return da > 0 && db > 0 ? num / Math.sqrt(da * db) : 0;
    };
    // partial correlation of miles-made vs mean latitude, controlling for gate time
    const rym = pearson(made, lats), ryx = pearson(made, hrs), rmx = pearson(lats, hrs);
    const den = Math.sqrt((1 - ryx * ryx) * (1 - rmx * rmx));
    const pcorr = den > 0 ? (rym - ryx * rmx) / den : 0;
    const slope = Math.abs(fit.per_hour);
    const fitAt = e => fit.b0 + fit.per_hour * (e - fit.x0) / 3600;
    const maxRow = rows.find(r => r.nm === 'Max');
    const maxResid = maxRow ? maxRow.made - fitAt(maxRow.gate) : null;

    // ---- dot fill: continuous amber (south, NY shore) -> green (north, CT) ----
    const latLo = Math.min(...lats), latHi = Math.max(...lats);
    const AMBER = [0xC2, 0x8A, 0x1E], GREEN = [0x2F, 0x7D, 0x4F];
    const latColor = mlat => {
      const t = latHi > latLo ? (mlat - latLo) / (latHi - latLo) : 0.5;
      const c = AMBER.map((a, i) => Math.round(a + (GREEN[i] - a) * t));
      return `rgb(${c[0]},${c[1]},${c[2]})`;
    };

    // Focus labels: hero + the boats the story names, drawn only if the
    // cohort actually carries them (payload cohorts can be narrower).
    const FOCUS = new Set(['Max', 'Lioness', 'Katara56', 'Habiru YCC'].filter(nm => rows.some(r => r.nm === nm)));

    const gates = rows.map(r => r.gate);
    const gLo = Math.min(...gates), gHi = Math.max(...gates), pad = 15 * 60;

    const traces = [
      { // cohort fit line — dashed, from the payload's fit, drawn across the span
        x: [h.tzStr(gLo - pad), h.tzStr(gHi + pad)],
        y: [fitAt(gLo - pad), fitAt(gHi + pad)].map(v => Math.round(v * 100) / 100),
        mode: 'lines', line: { color: LINE, width: 1.5, dash: 'dash' },
        hoverinfo: 'skip', showlegend: false,
      },
      {
        x: rows.map(r => h.tzStr(r.gate)),
        y: rows.map(r => Math.round(r.made * 100) / 100),
        mode: 'markers',
        marker: {
          symbol: rows.map(r => r.orc ? 'square' : 'circle'),   // ORC visually distinct
          size: rows.map(r => FOCUS.has(r.nm) ? 12 : (S.boats.has(r.nm) ? 10 : 8)),
          color: rows.map(r => r.nm === 'Max' ? h.boatColor['Max'] : latColor(r.mlat)),
          opacity: rows.map(r => r.ret ? 0.35 : (FOCUS.has(r.nm) || S.boats.has(r.nm) ? 0.95 : 0.75)),
          line: { width: rows.map(r => FOCUS.has(r.nm) ? 1.5 : 0.5), color: '#fff' },
        },
        text: rows.map(r => h.wrapText(
          `${r.nm}${r.orc ? ' (ORC)' : ''}${r.ret ? ' (RET)' : ''} — entered the Gut ${h.fmt(r.gate)} ${cfg.time.tzLabel}, ` +
          `made ${r.made.toFixed(1)} nm 22:00→04:00 · mean lat ${r.mlat.toFixed(3)}°N`)),
        hoverinfo: 'text', showlegend: false,
      },
    ];

    // slope annotation, anchored above the fit line where the plot is empty
    // (early dots sit high-left, late dots low-right; upper-right is clear)
    const xm = gLo + 0.68 * (gHi - gLo);
    const ann = [{
      x: h.tzStr(xm), y: fitAt(xm) + 2.4, xref: 'x', yref: 'y', showarrow: false, xanchor: 'center',
      text: h.narrow()
        ? `+1 h at the Gut ≈ −${slope.toFixed(1)} nm`
        : `each hour later at the Gut<br>≈ ${slope.toFixed(1)} nm less by 04:00`,
      font: { size: 9, color: LINE, family: MONO },
    }];
    for (const r of rows) {
      if (!FOCUS.has(r.nm)) continue;
      ann.push({
        x: h.tzStr(r.gate), y: r.made, xref: 'x', yref: 'y', ax: 0, ay: -22,
        text: r.nm + (r.orc ? ' (ORC)' : ''), showarrow: true, arrowwidth: 1,
        arrowcolor: h.boatColor[r.nm] || '#51677A',
        font: { size: 10, color: h.boatColor[r.nm] || '#51677A', family: MONO },
      });
    }

    // note carries the thesis with the numbers computed above (never authored)
    if (typeof document !== 'undefined') {
      const sec = document.getElementById('sec_soundnight');
      const noteEl = sec && sec.querySelector('.note');
      if (noteEl) {
        const sideNull = `The dot shades carry the debated side (amber = southerly mean track, NY shore; ` +
          `green = northerly, CT side): once entry time is controlled they show no decisive pattern ` +
          `(partial correlation ${pcorr >= 0 ? '+' : '−'}${Math.abs(pcorr).toFixed(2)}).`;
        const lioness = FOCUS.has('Lioness')
          ? ' Lioness — northernmost and fast — is the counter-example that killed the side story.' : '';
        const maxLine = maxResid != null
          ? ` <span class="mag">Max</span> also ran ≈ ${Math.abs(maxResid).toFixed(1)} nm ` +
            `${maxResid < 0 ? 'under' : 'over'} the cohort fit — a current line along the LI shore or a mode ` +
            `difference could account for it; flagged, not asserted.` : '';
        noteEl.innerHTML =
          `<b>The Sound night was decided at the gate, hours before the side debate</b> — the front group met ` +
          `Saturday’s easterly first, and the advantage compounded instead of compressing: each hour later at ` +
          `the Gut cost ≈ ${slope.toFixed(1)} nm by 04:00. ` + sideNull + lioness + maxLine;
      }
    }

    const yLo = Math.min(...made), yHi = Math.max(...made);
    const layout = { ...h.BASE(), annotations: ann,
      margin: { ...h.BASE().margin, t: 26 },
      xaxis: { ...h.GAX, type: 'date',
        title: { text: `When the boat entered the Sound at the Gut (${cfg.time.tzLabel})`, font: h.AXFONT } },
      yaxis: { ...h.GAX, range: [yLo - 1.5, yHi + 1.8],
        title: { text: 'Miles made good 22:00–04:00 (nm)', font: h.AXFONT } },
      showlegend: false };
    return { traces, layout };
  },
});
