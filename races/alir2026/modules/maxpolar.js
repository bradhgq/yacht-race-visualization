/* The polar report card — C14 + C15.

   EVIDENCE MODULE: values ride MAXDATA. Class: MEASURED boat speed (k=0.940)
   against the Pogo 50 design VPP, interpolated at the ACTUAL sailed TWA, so a
   boat forced onto a course angle is judged at the angle she sailed.

   FORM: magnitude by category -> bars, one axis, sorted by the course's own
   order (close-hauled to dead downwind) rather than by value, because the
   SHAPE is the finding: strong upwind and reaching, weak between 90 and 150,
   where the single largest block of time sits.

   THE FENCE: only TWS >= 6 kt is scored here. VPP polars are notoriously
   optimistic in drifting conditions — below 6 kt she scores 36-54%, which is a
   judgment of the polar, not of the crew. The sub-6 kt rows are stated in the
   note as context and deliberately NOT plotted as if they were performance. */
"use strict";

registerModule({
  id: 'maxpolar',
  deps: [],
  section: {
    kind: 'plot',
    height: 'min(500px, 105vw)',
    title: 'Sailed to her numbers? — by point of sail',
    note: '<b>Upwind and reaching she was quick — 84–90% of a Pogo 50\'s design target. ' +
      'Between 90° and 150° she fell to 71–73%, and that is where the largest single block of ' +
      'the race sits: nine hours.</b> ' +
      'Each bar is the median share of VPP target achieved, scored at the angle she was actually ' +
      'sailing. Bar width in the tooltip is the hours spent there — a 90% score over half an hour ' +
      'matters less than a 71% over nine. Across the 25.6 h where sailing to polar was possible she ' +
      'covered <b>171.7 nm against 222.6 nm of target</b>, a 22.9% shortfall. ' +
      '<i>Scored only above 6 kt of breeze.</i> Below that a VPP is optimistic to the point of ' +
      'meaninglessness — she scores 36% in 0–4 kt and 54% in 4–6 kt, which measures the polar\'s ' +
      'optimism in drifting conditions and says nothing whatever about the crew. Above 6 kt the ' +
      'ladder runs 69% · 77% · 83% · <b>89%</b> as the breeze fills. ' +
      'Boat speed carries the k=0.940 calibration.',
  },
  build(ctx) {
    const { h } = ctx;
    const MONO = 'SF Mono, Menlo, monospace';
    const P = (typeof MAXDATA !== 'undefined' && MAXDATA.polarPos) || [];
    if (!P.length) return { traces: [], layout: h.BASE() };
    const T = MAXDATA.polarTotal;

    /* Sequential-by-magnitude would imply the categories are ordered by value;
       they are not — they are ordered by point of sail. So: one accent hue for
       the weak band that carries the finding, the shell's recessive slate for
       the rest. Identity is carried by the axis label, never by colour alone. */
    const WEAK = '#B25B12', OK = '#41505E';
    const isWeak = d => d.pct < 75;   // the 71-73% band the note names

    const traces = [{
      type: 'bar', orientation: 'h',
      y: P.map(d => d.k + '°'), x: P.map(d => d.pct),
      marker: {
        color: P.map(d => isWeak(d) ? WEAK : OK),
        line: { color: '#FDFEFD', width: 2 },
      },
      customdata: P.map(d => [d.hours, d.act, d.tgt]),
      text: P.map(d => d.pct + '%'),
      textposition: 'outside', cliponaxis: false,
      textfont: { size: 10, family: MONO, color: '#4C6274' },
      hovertemplate: 'TWA %{y}<br><b>%{x}% of target</b><br>' +
        '%{customdata[1]:.1f} kt sailed vs %{customdata[2]:.1f} kt target<br>' +
        '%{customdata[0]:.1f} h spent here<extra></extra>',
      name: '% of target',
    }];

    const annotations = [{
      xref: 'paper', yref: 'paper', x: 1, xanchor: 'right', y: 1.02, yanchor: 'bottom',
      showarrow: false,
      text: `${T.hours} h scored · ${T.sailed} nm sailed vs ${T.target} nm target · ${T.deficit}% short`,
      font: { size: 9.5, color: '#4C6274', family: MONO },
    }];

    const layout = {
      ...h.BASE(),
      margin: { ...h.BASE().margin, t: 30, l: h.narrow() ? 62 : 78 },
      bargap: 0.42,          // thin marks (dataviz): bars should not fill their slot
      annotations,
      xaxis: {
        ...h.GAX, range: [0, 104], dtick: 20, ticksuffix: '%',
        title: { text: 'Median % of VPP target (TWS ≥ 6 kt only)', font: h.AXFONT },
      },
      yaxis: {
        ...h.GAX, type: 'category', autorange: 'reversed',
        title: { text: h.narrow() ? '|TWA|' : 'Point of sail (|TWA|)', font: h.AXFONT },
        tickfont: { ...h.AXFONT, size: 10 },
      },
      showlegend: false,
    };
    return { traces, layout };
  },
});
