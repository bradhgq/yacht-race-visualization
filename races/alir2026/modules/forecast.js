/* The forecast report card — leg by leg (the closing chart).

   EVIDENCE MODULE: every number here is an embedded evidence constant, not
   pipeline output. Class: ARCHIVED MODEL FORECASTS — Open-Meteo historical
   forecast API (HRRR and ECMWF IFS runs archived as issued; CC-BY 4.0) —
   scored against OBSERVED wind at NDBC stations (44065 New York Harbor
   Entrance, KPTN6 Kings Point; NDBC data are US-government public domain).
   Derivation: for each leg, bias = mean(model − buoy) over the leg's clock
   window at the named station; MAE = mean |model − buoy| over the same
   window. Source table: scratchpad forecast_legs.json (stage-4 weather
   acquisition), transcribed 2026-07-26. The tracker carries no wind (I18):
   nothing in this chart is derived from boat data, and no boat traces render
   here, so the ORC/RET marker rules have no surface in this module.

   One leg — Montauk & Gardiners Bay — has NO observing station. It gets no
   bars and no invented score; its slot carries a vertical label saying so
   (LABEL-LANE RULE: band/slot labels render vertically inside their own
   slot, textangle -90; the y>1 paper lane holds only this module's own
   legend + reading key, and no overlay claims it on a category axis). */
"use strict";

registerModule({
  id: 'forecast',
  deps: [],
  section: {
    kind: 'plot',
    height: 'min(420px, 95vw)',
    title: 'The forecast report card — leg by leg',
    note: 'Each pair of bars scores one leg of the race: how far the model’s leg-average wind sat above (+) or below (−) ' +
      'what the observing buoy actually measured, in knots. The zero line <b>is</b> the buoy. ' +
      'Small figures above each pair: mean absolute error, HRRR | ECMWF. ' +
      'Over the whole race HRRR was the sharper tool on four of the five observable legs, but it over-called the two nights ' +
      '(+2.1 kn at dawn, +3.2 kn in the Sound) — exactly the error that makes a light-air park look survivable on the routing screen. ' +
      'ECMWF’s one clear win was the dawn-pressure call. Both models missed the western Sound collapse. ' +
      'Evidence: archived model forecasts (Open-Meteo, HRRR + ECMWF IFS, CC-BY 4.0) vs observed wind at NDBC stations 44065 and KPTN6 ' +
      '(public domain). The Montauk corner has no wind observation, so no honest score exists there. All times EDT.',
  },
  build(ctx) {
    const { h } = ctx;
    const MONO = 'SF Mono, Menlo, monospace';
    const C_HRRR = '#B4761A', C_EC = '#4C9AA8', MUTE = '#8A97A3';

    // EVIDENCE CONSTANTS — archived forecasts vs NDBC observations; see the
    // provenance block at the top of this file. bias/mae in knots; bias
    // positive = model over-called the wind vs the buoy.
    const LEGS = [
      { id: 'harbor',   label: 'The harbor & the Narrows',  short: 'Harbor',   when: 'Thu 14:00–17:00',        station: '44065', hrrr_bias:  0.4, ecmwf_bias: -4.2, hrrr_mae: 0.6, ecmwf_mae: 4.2 },
      { id: 'reach',    label: 'The evening reach',         short: 'Reach',    when: 'Thu 17:00–23:00',        station: '44065', hrrr_bias: -1.0, ecmwf_bias: -3.1, hrrr_mae: 1.8, ecmwf_mae: 3.1 },
      { id: 'night1',   label: 'Night one & the dawn park', short: 'Night 1',  when: 'Fri 00:00–12:00',        station: '44065', hrrr_bias:  2.1, ecmwf_bias: -1.2, hrrr_mae: 2.2, ecmwf_mae: 1.4 },
      { id: 'corner',   label: 'Montauk & Gardiners Bay',   short: 'Montauk',  when: 'Fri 13:00–19:00',        station: null,    hrrr_bias: null, ecmwf_bias: null, hrrr_mae: null, ecmwf_mae: null },
      { id: 'sound',    label: 'The Sound night',           short: 'Sound',    when: 'Fri 20:00 – Sat 04:00',  station: 'KPTN6', hrrr_bias:  3.2, ecmwf_bias:  2.9, hrrr_mae: 3.4, ecmwf_mae: 3.4 },
      { id: 'saturday', label: 'The Saturday run',          short: 'Saturday', when: 'Sat 04:00–12:00',        station: 'KPTN6', hrrr_bias: -1.1, ecmwf_bias: -2.4, hrrr_mae: 1.5, ecmwf_mae: 2.8 },
    ];
    const STN = { '44065': 'NDBC 44065 (NY Harbor entrance)', 'KPTN6': 'KPTN6 (Kings Point)' };

    const nrw = h.narrow();
    // Category tick labels: leg + window + station lines (short form on phones).
    const cats = LEGS.map(l => {
      const stn = l.station ? l.station : 'NO OBSERVATION';
      return nrw ? `${l.short}<br>${stn}` : `${l.label}<br>${l.when}<br>${stn}`;
    });
    const sgn = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1);

    const bar = (name, color, biasOf, maeOf) => ({
      type: 'bar', name, x: cats, y: LEGS.map(biasOf),
      marker: { color, line: { width: 0 } },
      text: LEGS.map(l => {
        const b = biasOf(l);
        if (b == null) return '';
        return h.wrapText(`${l.label} (${l.when} EDT) — ${name} averaged ${sgn(b)} kn vs ${STN[l.station]} over the leg; ` +
          `mean abs error ${maeOf(l).toFixed(1)} kn. Archived forecast (Open-Meteo, CC-BY 4.0) vs observed buoy wind.`);
      }),
      hoverinfo: 'text',
    });
    const traces = [
      bar('HRRR', C_HRRR, l => l.hrrr_bias, l => l.hrrr_mae),
      bar('ECMWF', C_EC, l => l.ecmwf_bias, l => l.ecmwf_mae),
    ];

    // y-range from the constants, with headroom for the MAE row above each pair
    const vals = LEGS.flatMap(l => [l.hrrr_bias, l.ecmwf_bias]).filter(v => v != null);
    const hi = Math.max(0, ...vals), lo = Math.min(0, ...vals);

    const ann = [
      // reading key — paper top-left (this module's own y>1 lane; no phase labels exist here)
      { xref: 'paper', yref: 'paper', x: 0, y: 1.10, xanchor: 'left', showarrow: false,
        text: 'bias = model minus buoy, averaged over the leg',
        font: { size: 9, color: MUTE, family: MONO } },
      // the zero line is the buoy
      { xref: 'paper', yref: 'y', x: 1, y: 0, xanchor: 'right', yanchor: 'bottom', showarrow: false,
        text: 'buoy = 0', font: { size: 9, color: '#51677A', family: MONO } },
      // the unobserved corner — vertical label inside its own slot (label-lane rule)
      { xref: 'x', yref: 'paper', x: cats[3], y: 0.5, showarrow: false, textangle: -90,
        text: nrw ? 'models only — no observation' : 'models only — no wind observation exists at the corner',
        font: { size: 9, color: MUTE, family: MONO }, opacity: 0.85 },
    ];
    for (const l of LEGS) {
      if (l.hrrr_mae == null) continue;
      ann.push({ xref: 'x', yref: 'y', x: cats[LEGS.indexOf(l)],
        y: Math.max(0, l.hrrr_bias, l.ecmwf_bias) + 0.35, yanchor: 'bottom', showarrow: false,
        text: `MAE ${l.hrrr_mae.toFixed(1)} | ${l.ecmwf_mae.toFixed(1)}`,
        font: { size: 9, color: MUTE, family: MONO } });
    }

    const layout = { ...h.BASE(),
      margin: { ...h.BASE().margin, t: 36 },
      barmode: 'group', bargap: 0.35, bargroupgap: 0.12,
      shapes: [{ type: 'line', xref: 'paper', yref: 'y', x0: 0, x1: 1, y0: 0, y1: 0,
        line: { color: '#51677A', width: 1.2 } }],
      annotations: ann,
      xaxis: { ...h.GAX, type: 'category', tickangle: 0, automargin: true,
        tickfont: { size: 9, family: MONO } },
      yaxis: { ...h.GAX, range: [lo - 1.0, hi + 1.5], zeroline: false,
        title: { text: 'Model bias vs buoy (kn)', font: h.AXFONT } },
      showlegend: true,
      legend: { orientation: 'h', x: 1, xanchor: 'right', y: 1.13, yanchor: 'bottom',
        font: { size: 10, family: MONO } },
    };
    return { traces, layout };
  },
});
