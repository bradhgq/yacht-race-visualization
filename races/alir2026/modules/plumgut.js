/* Plum Gut — one gate, three tides (ALIR 2026 race-unique).

   One dot per boat: x = the clock time it shot Plum Gut, y = the SOG it
   carried through the Gut (tracker-derived, ±30 min around the gate). The
   dashed right-axis curve is the predicted tidal current at the gate — the
   fleet arrived on three different tides and the gate repriced them three
   times: the 18:10–18:30 group rode the flood through at pace, Max arrived
   half an hour into the ebb, the boats behind paid up to peak ebb, and
   Saturday's pack rode the next flood. All boat numbers come from
   ctx.D.plumgut at runtime; the only embedded constants are the current
   evidence below, per the evidence-constants pattern (squall.js precedent).

   LABEL-LANE RULE (owner, 2026-07-23): y>1 paper belongs to phase labels,
   the top in-plot row to event markers. The curve's label therefore sits
   inside the plot's empty pre-fleet region (no boat reached the Gut before
   18:10; the prediction window opens 15:00), and boat labels are arrowed
   point labels in the door.js pattern. */
"use strict";

/* EVIDENCE — class: PREDICTED tidal current (predictions, not observations).
   NOAA CO-OPS tidal current predictions, station LIS1012 (Plum Gut), harmonic
   prediction, hourly, 2026-07-24 15:00 → 2026-07-25 03:00 EDT. Sign
   convention: positive = flood INTO Long Island Sound = fair for this fleet;
   negative = ebb = foul. Times are naive local strings in the exact format
   h.tzStr emits, so both series share one clock axis (I1). Hand-carried from
   the stage-0 weather acquisition; the tracker itself has no wind or
   current (I18). Never extrapolated: crossings outside this window get no
   interpolated value. */
const PG_PRED_CURRENT = [
  { t: '2026-07-24 15:00', v: 0.83 },
  { t: '2026-07-24 16:00', v: 1.14 },
  { t: '2026-07-24 17:00', v: 1.21 },
  { t: '2026-07-24 18:00', v: 1.11 },
  { t: '2026-07-24 19:00', v: 0.67 },
  { t: '2026-07-24 20:00', v: -0.44 },
  { t: '2026-07-24 21:00', v: -1.79 },
  { t: '2026-07-24 22:00', v: -2.35 },
  { t: '2026-07-24 23:00', v: -2.21 },
  { t: '2026-07-25 00:00', v: -2.06 },
  { t: '2026-07-25 01:00', v: -1.65 },
  { t: '2026-07-25 02:00', v: -0.65 },
  { t: '2026-07-25 03:00', v: 0.31 },
];
/* Same source and class — the max-ebb prediction event, finer than hourly. */
const PG_PEAK_EBB = { t: '2026-07-24 22:06', v: -2.36 };

registerModule({
  id: 'plumgut',
  deps: ['boats'],
  section: {
    kind: 'plot',
    height: 'min(460px, 95vw)',
    title: 'Plum Gut — one gate, three tides',
    note: '<b>One gate, three prices: the 18:10–18:30 group rode +1 kt of flood through at ~8.8 kt; ' +
      '<span class="mag">Max</span> arrived 20:35, half an hour into the ebb; the group behind paid up to ' +
      'peak ebb (−2.36 kt, 22:06) — Three Little Birds made 0.9 kt over the ground near the bottom of it; ' +
      'Saturday’s pack rode the next flood.</b> ' +
      'Each dot is one boat: when it shot the Gut (x) and the SOG it carried through, ±30 min (left y, tracker-derived). ' +
      'The dashed curve (right y) is the predicted tidal current at the gate — NOAA CO-OPS station LIS1012, harmonic. ' +
      'Evidence class: <b>predictions, not observations</b> — positive is flood into the Sound (fair), negative is ebb (foul). ' +
      'Dot color = predicted current at crossing: green fair (≥ +0.3 kt), amber foul (≤ −0.3 kt), grey near slack ' +
      'or outside the shown prediction window. Squares are ORC Division 0; muted dots retired later, but they count ' +
      'as neighbors for what they sailed here.',
  },
  build(ctx) {
    const { D, S, cfg, h } = ctx;
    const MONO = 'SF Mono, Menlo, monospace';
    const rows = (D.plumgut || []).slice().sort((a, b2) => a.gate - b2.gate);
    if (!rows.length) return { traces: [], layout: h.BASE() };

    /* naive 'YYYY-MM-DD HH:MM' -> comparable minutes, manual parse — no Date
       objects anywhere near chart values (I1). Linear within a calendar
       month, which covers the whole prediction window. */
    const kmin = s => (((+s.slice(0, 4) * 12 + +s.slice(5, 7)) * 31 + +s.slice(8, 10)) * 24 +
      +s.slice(11, 13)) * 60 + +s.slice(14, 16);
    const curK = PG_PRED_CURRENT.map(p => kmin(p.t));
    const curAt = local => {                     // linear interp; null outside the window
      const k = kmin(local);
      if (k < curK[0] || k > curK[curK.length - 1]) return null;
      for (let i = 1; i < curK.length; i++) {
        if (k <= curK[i]) {
          const f = (k - curK[i - 1]) / (curK[i] - curK[i - 1]);
          return PG_PRED_CURRENT[i - 1].v + f * (PG_PRED_CURRENT[i].v - PG_PRED_CURRENT[i - 1].v);
        }
      }
      return null;
    };

    const FAIR = '#1E7D48', SLK = '#8B98A5', FOUL = '#B25B12', CUR = '#41505E';
    const heroCol = h.boatColor['Max'] || '#C2187E';

    const pts = rows.map(r => {
      const m = (D.boats[r.nm] || {}).meta || {};
      const local = h.tzStr(r.gate);
      return {
        nm: r.nm, gate: r.gate, local, sog: r.sog, cur: curAt(local),
        orc: !!(m.cls && m.cls.indexOf('ORC') >= 0),
        ret: m.grp === 'fleet_dnf',
      };
    });
    const colOf = p => p.nm === 'Max' ? heroCol :
      p.cur == null ? SLK : p.cur >= 0.3 ? FAIR : p.cur <= -0.3 ? FOUL : SLK;
    const curTxt = p => p.cur == null ? 'no prediction (outside embedded window)' :
      (p.cur >= 0 ? '+' : '−') + Math.abs(p.cur).toFixed(2) + ' kt ' +
      (Math.abs(p.cur) < 0.3 ? 'near slack' : p.cur > 0 ? 'flood (fair)' : 'ebb (foul)');

    /* arrowed point labels, door.js pattern; offsets hand-tuned per lane */
    const FOCUS = {
      'Zammermoos':         { ax: -14, ay: -20 },
      'Poseidon':           { ax: 18,  ay: 22 },
      'Habiru YCC':         { ax: 10,  ay: -36 },   // labeled only if present in D.plumgut
      'Katara56':           { ax: 0,   ay: -22 },
      'Max':                { ax: 0,   ay: -26 },
      'The Rover':          { ax: -10, ay: -22 },
      'Beagle':             { ax: 14,  ay: 22 },
      'Three Little Birds': { ax: 6,   ay: -34, label: 'Three Little Birds (RET)' },
    };
    const NARROW_FOCUS = new Set(['Max', 'Katara56', 'Three Little Birds']);
    const focused = p => !!FOCUS[p.nm] && (!h.narrow() || NARROW_FOCUS.has(p.nm));

    const traces = [
      { // predicted current, right axis — EVIDENCE (see constants above)
        x: PG_PRED_CURRENT.map(p => p.t),
        y: PG_PRED_CURRENT.map(p => p.v),
        yaxis: 'y2', mode: 'lines',
        line: { color: CUR, width: 1.5, dash: 'dash' },
        text: PG_PRED_CURRENT.map(p => h.wrapText(
          `Predicted current ${(p.v >= 0 ? '+' : '−')}${Math.abs(p.v).toFixed(2)} kt ` +
          `${p.v >= 0 ? '(flood into the Sound, fair)' : '(ebb, foul)'} — ` +
          'CO-OPS LIS1012 harmonic prediction, not an observation')),
        hoverinfo: 'text', showlegend: false,
      },
      { // one marker per boat through the Gut
        x: pts.map(p => p.local),
        y: pts.map(p => Math.round(p.sog * 10) / 10),
        mode: 'markers',
        marker: {
          symbol: pts.map(p => p.orc ? 'square' : 'circle'),
          size: pts.map(p => focused(p) ? 12 : (S.boats.has(p.nm) ? 9 : 7)),
          color: pts.map(colOf),
          opacity: pts.map(p => p.ret ? 0.45 : (focused(p) || S.boats.has(p.nm) ? 0.95 : 0.85)),
          line: { width: pts.map(p => focused(p) ? 1.5 : 0.5), color: '#fff' },
        },
        text: pts.map(p => h.wrapText(
          `${p.nm}${p.orc ? ' (ORC)' : ''}${p.ret ? ' (RET)' : ''} — through Plum Gut ` +
          `${h.fmt(p.gate)} ${cfg.time.tzLabel} · SOG ${p.sog.toFixed(1)} kt · ` +
          `predicted current ${curTxt(p)}`)),
        hoverinfo: 'text', showlegend: false,
      },
    ];

    const shapes = [
      { // slack reference for the current axis: flood above, ebb below
        type: 'line', xref: 'x', yref: 'y2',
        x0: PG_PRED_CURRENT[0].t, x1: PG_PRED_CURRENT[PG_PRED_CURRENT.length - 1].t,
        y0: 0, y1: 0, line: { color: 'rgba(65,80,94,0.35)', width: 1, dash: 'dot' },
      },
    ];

    const ann = [
      { // curve label, in the empty pre-fleet region (label-lane rule: no
        // horizontal lane claimed; y>1 and the top in-plot row stay free)
        x: '2026-07-24 15:05', xanchor: 'left', align: 'left',
        y: -1.5, yref: 'y2', showarrow: false, opacity: 0.9,
        text: h.narrow() ? 'PREDICTED CURRENT' :
          'PREDICTED CURRENT · CO-OPS LIS1012<br>harmonic prediction, not observation',
        font: { size: 9, color: CUR, family: MONO },
      },
      { // peak ebb — evidence constant, same source and class as the curve
        x: PG_PEAK_EBB.t, y: PG_PEAK_EBB.v, xref: 'x', yref: 'y2',
        ax: -55, ay: -4, showarrow: true, arrowwidth: 1, arrowcolor: FOUL,
        text: `peak ebb −${Math.abs(PG_PEAK_EBB.v).toFixed(2)} kt · ` +
          PG_PEAK_EBB.t.slice(11),
        font: { size: 9, color: FOUL, family: MONO },
      },
    ];
    for (const p of pts) {
      if (!focused(p)) continue;
      const f = FOCUS[p.nm];
      ann.push({
        x: p.local, y: p.sog, xref: 'x', yref: 'y',
        ax: f.ax, ay: f.ay, showarrow: true, arrowwidth: 1,
        arrowcolor: colOf(p), text: f.label || p.nm,
        font: { size: p.nm === 'Max' ? 10 : 9, color: colOf(p), family: MONO },
      });
    }

    const layout = { ...h.BASE(), shapes, annotations: ann,
      margin: { ...h.BASE().margin, t: 30, r: 46 },
      xaxis: { ...h.GAX, type: 'date',
        title: { text: `Time through Plum Gut (${cfg.time.tzLabel})`, font: h.AXFONT } },
      yaxis: { ...h.GAX, range: [0, 10.4],
        title: { text: 'SOG through the Gut (kt)', font: h.AXFONT } },
      yaxis2: { ...h.GAX, overlaying: 'y', side: 'right', showgrid: false,
        zeroline: false, range: [-2.9, 1.75],
        title: { text: h.narrow() ? 'Pred. current (kt)' :
          'Predicted current (kt · + flood into the Sound)', font: h.AXFONT } },
      showlegend: false };
    return { traces, layout };
  },
});
