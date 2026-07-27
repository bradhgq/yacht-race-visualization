/* What the navigator actually knew — C7 + C8 + C9 + C10.

   EVIDENCE MODULE: values ride MAXDATA. Class: PREDICTED (the five routing
   GRIBs that were ON THE BOAT, each stamped with its download time) scored
   against MEASURED wind at Max's own position.

   This is the successor to forecast.js, and the difference is the whole point.
   forecast.js scores ARCHIVED model runs against BUOYS: "was the model good?"
   This scores the files that were aboard against the wind she measured: "was
   the information the navigator had good, where he was?" Same chart grammar,
   strictly better evidence — and no internet data at all.

   FORM: forecast vs observed on matched units is a scatter against the 1:1
   line, where distance from the diagonal IS the error and no second axis is
   needed. Points above the line are over-forecast, below are under-forecast.

   HONEST LIMIT, on the chart: n=43 scored steps from one race is a report card
   on THESE FILES, not a verdict on ECMWF. Direction error is only shown where
   the wind was over 6 kt, because below that a measured direction is noise. */
"use strict";

/* Same validated categorical trio as maxsails, assigned to the model. Fixed
   order, never cycled (dataviz non-negotiable). */
const MODEL_COL = { GFS: '#2D5FA8', HRRRX: '#7A3E9D', ECMWF: '#B25B12' };
const MODEL_LABEL = { GFS: 'GFS', HRRRX: 'HRRR-X', ECMWF: 'ECMWF' };

registerModule({
  id: 'maxfcst',
  deps: [],
  section: {
    kind: 'plot',
    height: 'min(560px, 115vw)',
    title: 'What the navigator knew — the forecasts that were aboard',
    note: '<b>Every model under-forecast the breeze, and the two misses that mattered are the two ' +
      'furthest from the line.</b> Each dot is one forecast hour from a GRIB that was physically on ' +
      'the boat, scored against the wind Max measured at her own position at that moment. ' +
      'The diagonal is a perfect forecast: below it the model had less breeze than she got, above it ' +
      'more. ' +
      '<b>The dot at the far left is the dawn park</b> — GFS had 7.6 kt for 11:00 Friday; she was ' +
      'making 1.8. The park, the segment that costs +273 min in the phase ledger, was not forecast. ' +
      '<b>The dot at the top is Saturday\'s finish</b>: ECMWF had 4.6 kt, the easterly delivered 11.7. ' +
      'Worse than either, and not visible on a speed axis: for 05:00 Saturday the last ECMWF aboard ' +
      'had 1.6 kt from <b>243°</b> — the breeze arrived at 8.4 kt from <b>045°</b>, 162° away, the ' +
      'opposite side of the compass. ' +
      '<i>This is a report card on these five files, not on the models in general</i> — 43 scored ' +
      'hours from one race. Pooled: bias −1.7 kt, error 2.1 kt, direction 29° (above 6 kt, where a ' +
      'measured direction means anything). Evidence class: <b>predictions vs measurement</b>, no ' +
      'internet data — the forecasts came off the boat.',
  },
  build(ctx) {
    const { h } = ctx;
    const MONO = 'SF Mono, Menlo, monospace';
    const F = (typeof MAXDATA !== 'undefined' && MAXDATA.fcst) || [];
    if (!F.length) return { traces: [], layout: h.BASE() };
    const S = MAXDATA.staleness;

    const models = [];
    for (const r of F) if (models.indexOf(r.model) < 0) models.push(r.model);

    const traces = models.map(m => {
      const rows = F.filter(r => r.model === m);
      return {
        type: 'scatter', mode: 'markers', name: MODEL_LABEL[m] || m,
        x: rows.map(r => r.f), y: rows.map(r => r.o),
        marker: {
          size: h.narrow() ? 8 : 9.5, color: MODEL_COL[m] || '#41505E',
          opacity: 0.85,
          /* 2px surface ring so overlapping marks stay countable */
          line: { color: '#FDFEFD', width: 2 },
        },
        customdata: rows.map(r => [r.t, r.lead, r.fd, r.od]),
        hovertemplate: `<b>${MODEL_LABEL[m] || m}</b> · %{customdata[0]}<br>` +
          'forecast %{x:.1f} kt from %{customdata[2]}°<br>' +
          'measured %{y:.1f} kt from %{customdata[3]}°<br>' +
          '%{customdata[1]:.1f} h after download<extra></extra>',
      };
    });

    const lim = 18;
    const shapes = [{
      type: 'line', xref: 'x', yref: 'y', x0: 0, y0: 0, x1: lim, y1: lim,
      line: { color: '#B9CBD4', width: 1.4, dash: 'dot' }, layer: 'below',
    }];

    /* Selective direct labels: the two misses that carry the narrative, arrowed
       in the door.js pattern. Everything else is hover-only — never a number on
       every point. */
    const park = F.reduce((a, r) => (r.f - r.o) > (a ? a.f - a.o : -99) ? r : a, null);
    const fin = F.reduce((a, r) => (r.o - r.f) > (a ? a.o - a.f : -99) ? r : a, null);
    const annotations = [];
    if (park) annotations.push({
      x: park.f, y: park.o, ax: 62, ay: -30, showarrow: true, arrowwidth: 1,
      arrowcolor: MODEL_COL[park.model], text: 'the dawn park —<br>forecast 7.6, sailed 1.8',
      font: { size: 9, color: MODEL_COL[park.model], family: MONO }, align: 'left',
    });
    if (fin) annotations.push({
      x: fin.f, y: fin.o, ax: -18, ay: -30, showarrow: true, arrowwidth: 1,
      arrowcolor: MODEL_COL[fin.model], text: 'Saturday\'s finish breeze',
      font: { size: 9, color: MODEL_COL[fin.model], family: MONO }, align: 'left',
    });
    /* The staleness fact rides the corner: vertical, inside its own empty slot,
       claiming no lane the legend or point labels own (label-lane rule). */
    annotations.push({
      xref: 'paper', yref: 'paper', x: 0.995, xanchor: 'right', y: 0.03, yanchor: 'bottom',
      showarrow: false, align: 'right',
      text: `last download ${S.last} — ${S.afterGunH.toFixed(1)} h after the gun.<br>` +
        `${S.remainingH.toFixed(0)} h of racing followed it, on data already aboard.`,
      font: { size: 9, color: '#4C6274', family: MONO },
    });

    const layout = {
      ...h.BASE(),
      margin: { ...h.BASE().margin, t: 26 },
      shapes, annotations,
      xaxis: {
        ...h.GAX, range: [0, lim], dtick: 4, zeroline: false,
        title: { text: 'Forecast wind speed (kt)', font: h.AXFONT },
      },
      yaxis: {
        /* NO scaleanchor: forcing a 1:1 aspect on a wide plot box expands the
           x-range to fit the box, which showed NEGATIVE forecast wind speeds.
           Matched ranges give the diagonal its meaning; the box need not be
           square for that. */
        ...h.GAX, range: [0, lim], dtick: 4, zeroline: false,
        title: { text: 'Measured wind speed at the boat (kt)', font: h.AXFONT },
      },
      showlegend: true,
      legend: {
        orientation: 'h', x: 0, xanchor: 'left', y: 1.06, yanchor: 'bottom',
        font: { size: 10, family: MONO },
      },
    };
    return { traces, layout };
  },
});
