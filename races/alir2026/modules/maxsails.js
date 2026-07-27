/* The downwind deficit, controlled for wind speed — C15 + C16, and the
   crew-facing headline of the whole instrument layer.

   EVIDENCE MODULE: values ride MAXDATA. Class: MEASURED boat speed (with the
   k=0.940 calibration applied — the transducer read 6.0% fast) scored against
   the Pogo 50 design VPP, grouped by what the SAIL CROSSOVER CHART prescribed
   for the wind she measured.

   FORM: the naive version of this finding — "she was slow under the kite" — is
   confounded, because A2 time was lighter and darker. So the chart IS the
   control: percentage of target within MATCHED wind bands, one group per band.
   The gap has to survive at every wind speed to mean anything, and it does.

   THE LIMITATION, on the chart and not in a footnote: Expedition's sail-selection
   channels (J1-J4, Reacher, Blade, Staysail, Solent) are ALL EMPTY, so this is
   the PRESCRIBED sail, never the observed one. The owner's crew log is the only
   record of what was actually hoisted and is explicitly [recall]. Two readings
   fit these bars — the kite was up and slow, or the kite often was not up — and
   the data cannot separate them. Scoring a crew against their own approximate
   memory would manufacture precision that does not exist, so the [recall] track
   may annotate this chart but must never drive it. */
"use strict";

/* Categorical hues, fixed order, validated (dataviz check 3: CVD separation
   protan 22.2 / tritan 14.9, normal-vision 24.1, all vs the #FDFEFD surface).
   Green/orange was the intuitive pick and FAILED protan at dE 5.8 — hence blue,
   orange, purple. Assigned to the sail, never to its rank. */
const SAIL_COL = { G1: '#2D5FA8', C0: '#7A3E9D', A2: '#B25B12' };
const SAIL_LABEL = {
  G1: 'G1 — genoa', C0: 'C0 — Code 0', A2: 'A2 — running kite',
};

registerModule({
  id: 'maxsails',
  deps: [],
  section: {
    kind: 'plot',
    height: 'min(540px, 112vw)',
    title: 'Fast with a headsail, slow with a kite — at every wind speed',
    note: '<b>Max held ~80% of her polar target whenever the crossover chart called for the genoa, ' +
      'and about ten points less whenever it called for a downwind sail. That gap survives at ' +
      'every wind speed, so it is not a light-air artefact.</b> ' +
      'Each bar is the median percentage of the Pogo 50 VPP target she actually achieved, within a ' +
      'matched wind band — comparing like with like is the entire point of the chart. ' +
      'Boat speed carries the k=0.940 calibration (the log read 6.0% fast; uncorrected this would ' +
      'flatter every bar). ' +
      '<b>What this cannot tell you:</b> the export\'s sail-selection channels are all empty, so these ' +
      'are the sails the <i>chart prescribed</i> for the measured wind — never what was observed on ' +
      'deck. Two readings fit equally well: the kite was up and underperforming, or the kite often ' +
      'was not up at all. Only the crew can say, and their log is recollection, not record.',
  },
  build(ctx) {
    const { h } = ctx;
    const MONO = 'SF Mono, Menlo, monospace';
    const C = (typeof MAXDATA !== 'undefined' && MAXDATA.sailControl) || [];
    if (!C.length) return { traces: [], layout: h.BASE() };

    const bands = [];
    for (const r of C) if (bands.indexOf(r.band) < 0) bands.push(r.band);
    const sails = ['G1', 'C0', 'A2'];

    const traces = sails.map(s => {
      const rows = bands.map(b => C.find(r => r.sail === s && r.band === b));
      return {
        type: 'bar', name: SAIL_LABEL[s],
        x: bands, y: rows.map(r => r ? r.pct : null),
        customdata: rows.map(r => r ? [r.mins, r.sail] : [null, s]),
        marker: {
          color: SAIL_COL[s],
          /* 2px surface gap between adjacent fills (dataviz mark spec) */
          line: { color: '#FDFEFD', width: 2 },
        },
        /* Direct labels on every bar: with only 15 marks the value IS the
           content, and it doubles as the secondary encoding that keeps identity
           off colour alone. */
        text: rows.map(r => r ? r.pct + '%' : ''),
        textposition: 'outside', textfont: { size: 9.5, family: MONO, color: '#4C6274' },
        cliponaxis: false,
        hovertemplate: '<b>%{customdata[1]}</b> · TWS %{x} kt<br>' +
          '%{y}% of polar target<br>%{customdata[0]} min in this cell<extra></extra>',
      };
    });

    const layout = {
      ...h.BASE(),
      margin: { ...h.BASE().margin, t: 26 },
      barmode: 'group', bargap: 0.3, bargroupgap: 0.1,
      xaxis: {
        ...h.GAX, type: 'category', automargin: true,
        title: { text: 'True wind speed (kt) — bands matched across sails', font: h.AXFONT },
        tickfont: { ...h.AXFONT, size: 10 },
      },
      yaxis: {
        ...h.GAX, range: [0, 104], dtick: 20, ticksuffix: '%',
        title: { text: 'Median % of VPP target achieved', font: h.AXFONT },
      },
      showlegend: true,
      legend: {
        orientation: 'h', x: 0, xanchor: 'left', y: 1.1, yanchor: 'bottom',
        font: { size: 10, family: MONO },
      },
    };
    return { traces, layout };
  },
});
