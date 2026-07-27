/* The corroboration panel — C29. Quietly the most valuable chart in the set.

   EVIDENCE MODULE: values ride MAXDATA. Class: MEASURED (Max's 1 Hz GPS)
   against OFFICIAL (the YB tracker fixes every shipped number on this page is
   built from, and the RC's amended finish time).

   Why it matters: every other chart on this dashboard — DTF, VMC, the phase
   ledger, the loss decompositions — rests on YB tracker geometry that has never
   had an independent check. Max carried a second, far denser positioning system
   for the whole race. This is that check, and the tracker passes it.

   It also independently ratifies the RC amendment. Max's official finish was
   first entered as 12:38:03, then amended to 11:57:18 after this project
   queried it. Her own instruments put the line crossing at 11:56:30 — a third
   source, agreeing to 47 seconds. */
"use strict";

registerModule({
  id: 'maxtruth',
  deps: [],
  section: {
    kind: 'plot',
    height: 'min(430px, 95vw)',
    title: 'Does the tracker tell the truth? — 766 fixes checked',
    note: '<b>Median disagreement between Max\'s own 1 Hz GPS and the YB tracker: 6.9 metres. ' +
      'Every distance, every VMC, every phase-ledger row on this page rests on that geometry, and ' +
      'until now nothing had checked it.</b> ' +
      'Each bar counts YB fixes at a given separation from where her instruments say she was. ' +
      'The long tail is not tracker error — it is the fast reaching legs, where a five-minute ' +
      'tracker gap spans nearly a mile and interpolating across it cuts the corner. ' +
      '<b>The finish is the sharper test.</b> Max\'s official time was first entered as 12:38:03 and ' +
      'amended by the Race Committee to <b>11:57:18</b>. Her instruments put her closest approach to ' +
      'the Glen Cove breakwater light at <b>11:56:30</b>, 0.055 nm off it — a third independent ' +
      'source, agreeing to <b>47 seconds</b>, about seven boat lengths at the 6.8 kt she was ' +
      'carrying. Evidence class: <b>measured vs official</b>.',
  },
  build(ctx) {
    const { h } = ctx;
    const MONO = 'SF Mono, Menlo, monospace';
    const T = (typeof MAXDATA !== 'undefined' && MAXDATA.truth) || null;
    if (!T || !T.hist) return { traces: [], layout: h.BASE() };
    const F = MAXDATA.finish;

    const M2NM = 1852;
    const traces = [{
      type: 'bar',
      x: T.hist.map(b => b.b), y: T.hist.map(b => b.n),
      width: 0.0135,
      marker: { color: '#41505E', line: { color: '#FDFEFD', width: 1 } },
      customdata: T.hist.map(b => Math.round(b.b * M2NM)),
      hovertemplate: '≈%{customdata} m separation<br>%{y} tracker fixes<extra></extra>',
      name: 'tracker fixes',
    }];

    const medNm = T.medianM / M2NM;
    const shapes = [{
      type: 'line', xref: 'x', yref: 'paper', x0: medNm, x1: medNm, y0: 0, y1: 1,
      line: { color: '#C2187E', width: 1.6, dash: 'dot' },
    }];

    const annotations = [
      { xref: 'x', yref: 'paper', x: medNm, xanchor: 'left', y: 0.97, yanchor: 'top',
        showarrow: false, align: 'left',
        text: `  median ${T.medianM} m`,
        font: { size: 10, color: '#C2187E', family: MONO } },
      { xref: 'paper', yref: 'paper', x: 0.99, xanchor: 'right', y: 0.72, yanchor: 'top',
        showarrow: false, align: 'right',
        text: `p95 ${T.p95Nm} nm · max ${T.maxNm} nm<br>` +
          `n = ${T.n} tracker fixes<br><br>` +
          `<b>finish crossing ${F.crossing.slice(11)}</b><br>` +
          `RC amended ${F.officialLocal.slice(11)} · ${Math.abs(F.deltaS)} s apart`,
        font: { size: 9.5, color: '#4C6274', family: MONO } },
    ];

    const layout = {
      ...h.BASE(),
      margin: { ...h.BASE().margin, t: 18 },
      shapes, annotations, bargap: 0.08,
      xaxis: {
        ...h.GAX, range: [-0.008, 0.35], zeroline: false,
        title: { text: 'Separation, instruments vs tracker (nm)', font: h.AXFONT },
      },
      yaxis: {
        /* headroom: on a log axis the 647-fix spike otherwise touches the frame */
        ...h.GAX, type: 'log', dtick: 1, range: [-0.05, Math.log10(Math.max(...T.hist.map(b => b.n))) + 0.18],
        title: { text: 'Tracker fixes (log)', font: h.AXFONT },
      },
      showlegend: false,
    };
    return { traces, layout };
  },
});
