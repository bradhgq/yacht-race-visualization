/* The internal comparison ladder — NOT a ranking (owner directive, stage-4
   round 1): no governing body sanctions a PHRF↔ORC conversion, and the ORC
   Triple-Number coefficient's reference base is not recoverable from public
   data, so no cross-system corrected arithmetic is attempted. Instead every
   finisher is measured INSIDE her own scoring universe — percent behind her
   own scoring group's winner on corrected time — and the three groups are
   drawn on one strip for internal analysis only. The stated, unverifiable
   assumption: each group's winner sailed comparably well. Methodology in the
   note and the page footer. */
"use strict";

registerModule({
  id: 'fairladder',
  deps: ['boats'],
  section: {
    kind: 'plot',
    height: 'min(560px, 96vw)',
    title: 'The whole fleet on one strip — an internal comparison, not a ranking',
    note: '<b>Method:</b> each finisher is scored only against her own scoring universe — ' +
      'percent behind her own group’s winner on official corrected time (PHRF spinnaker circle, ' +
      'ORC Division 0, Non-Spinnaker circle). No PHRF↔ORC conversion exists that any governing body ' +
      'sanctions, so none is used; comparing bars ACROSS groups assumes each group’s winner sailed ' +
      'comparably well — a stated, unverifiable assumption. Internal analysis only; the official ' +
      'standings are per division and this strip does not replace them.',
  },
  build(ctx) {
    const { D, S, h } = ctx;
    const rows = [];
    for (const nm of Object.keys(D.boats)) {
      const m = D.boats[nm].meta;
      if (!m || m.fairPct == null) continue;
      rows.push({ nm, pct: m.fairPct, note: m.note || '', orc: (m.cls || '').includes('ORC') });
    }
    rows.sort((a, b) => a.pct - b.pct);
    const HERO = ctx.cfg.hero.name;
    const y = rows.map((_, i) => rows.length - i);          // top = closest to her winner
    const colors = rows.map(r => r.nm === HERO ? h.boatColor[HERO]
      : r.orc ? '#D2691E' : (S.boats.has(r.nm) ? (h.boatColor[r.nm] || '#5F7484') : '#7C8C9A'));
    const tr = [{
      x: rows.map(r => Math.round(r.pct * 10) / 10), y,
      type: 'bar', orientation: 'h',
      marker: { color: colors, opacity: rows.map(r => r.nm === HERO ? 1 : 0.75) },
      text: rows.map(r => ` ${r.nm}${r.orc ? ' ■ORC' : ''}`),
      textposition: 'outside', textfont: { size: 9, family: 'SF Mono, Menlo, monospace' },
      hovertext: rows.map(r => h.wrapText(
        `${r.nm} — ${r.note} · +${r.pct.toFixed(1)}% behind her own group's winner (corrected)`)),
      hoverinfo: 'text', showlegend: false,
    }];
    const ann = [{
      x: 1, y: 1.03, xref: 'paper', yref: 'paper', xanchor: 'right', showarrow: false,
      text: 'INTERNAL COMPARISON · groups normalized to their own winners · not an official ladder',
      font: { size: 9, color: '#8A6A2F', family: 'SF Mono, Menlo, monospace' },
    }];
    const layout = { ...h.BASE(), annotations: ann,
      margin: { ...h.BASE().margin, l: 30, r: 8, t: 26 },
      xaxis: { ...h.GAX, title: { text: '% behind own scoring group’s winner, corrected time', font: h.AXFONT }, rangemode: 'tozero' },
      yaxis: { ...h.GAX, showticklabels: false },
      bargap: 0.25, showlegend: false };
    return { traces: tr, layout };
  },
});
