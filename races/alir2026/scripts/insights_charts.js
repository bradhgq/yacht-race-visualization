/* The 25 candidate charts of the insights page (the shipped five render through
   their real module code). Each builder returns {traces, layout, height?}.
   Palette: validated categorical trio + shell tokens; hero magenta follows Max
   page-wide; sequential = one blue, light->dark; no dual axes anywhere (the
   two-lines-one-unit charts share a single knots axis, which is one axis). */
"use strict";
const BLUE = '#2D5FA8', ORANGE = '#B25B12', PURPLE = '#7A3E9D', SLATE = '#41505E',
      HERO = '#C2187E', MUTE = '#8B98A5', GOLD = '#B98A00', GREEN = '#2E7D4F';
const RAMP = [[0, '#DCE9F5'], [0.25, '#A9C8E6'], [0.5, '#6E9FD0'], [0.75, '#3D74B4'], [1, '#1B4A85']];
const RAMP5 = ['#B9D2EA', '#8FB6DC', '#5E92C6', '#3568A8', '#1B4A85'];

function phaseShapes(labeled) {
  const sh = INS.phases.map((p, i) => ({
    type: 'rect', xref: 'x', yref: 'paper', x0: p.a, x1: p.b, y0: 0, y1: 1,
    fillcolor: i % 2 ? '#17293A' : '#5E7B94', opacity: i % 2 ? 0.045 : 0.028,
    line: { width: 0 }, layer: 'below',
  }));
  const ann = labeled ? INS.phases.map(p => ({
    xref: 'x', yref: 'paper', x: p.a, xanchor: 'left', y: 0.03, yanchor: 'bottom',
    showarrow: false, textangle: -90, text: p.l,
    font: { size: 8, color: '#8B98A5', family: MONO },
  })) : [];
  return { sh, ann };
}
const tX = title => ({ ...GAX, type: 'date', title: { text: title || 'Time (EDT)', font: AXFONT } });
const line = (rows, key, name, color, extra) => ({
  type: 'scatter', mode: 'lines', name,
  x: rows.map(r => r.t), y: rows.map(r => r[key]),
  line: { color, width: 1.8, ...(extra && extra.line) }, connectgaps: false,
  hovertemplate: '%{x}<br>' + name + ' %{y}<extra></extra>', ...(extra || {}),
});

const CHARTS = {};

/* ── C2 · the dawn-park compass (time spirals outward) ── */
CHARTS.c2 = () => {
  const P = INS.c2, R0 = 3.0, K2 = 1.0;
  const xy = P.map(p => {
    const r = R0 + K2 * p.hr, a = Math.PI * p.a / 180;
    return { x: r * Math.sin(a), y: r * Math.cos(a), p };
  });
  const rings = [2, 4, 6, 8].map(hr => {
    const r = R0 + K2 * hr, xs = [], ys = [];
    for (let a = 0; a <= 360; a += 6) { xs.push(r * Math.sin(a * Math.PI / 180)); ys.push(r * Math.cos(a * Math.PI / 180)); }
    return { type: 'scatter', mode: 'lines', x: xs, y: ys, line: { color: '#E3ECEF', width: 1 },
             hoverinfo: 'skip', showlegend: false };
  });
  const traces = [...rings, {
    /* markers only — a connecting line crosses the rose centre on every big
       shift and turns the story into spaghetti (found on review) */
    type: 'scatter', mode: 'markers',
    x: xy.map(d => d.x), y: xy.map(d => d.y),
    marker: { size: 7.5, color: P.map(p => p.s), colorscale: RAMP, cmin: 0, cmax: 8,
      colorbar: { title: { text: 'TWS (kt)', font: AXFONT }, thickness: 10, len: 0.6,
        tickfont: { ...AXFONT, size: 9 }, outlinewidth: 0 }, line: { width: 0 } },
    customdata: P.map(p => [p.a, p.s, p.hr]),
    hovertemplate: '0%{customdata[2]:.1f} h into the park'.replace('0', '+') +
      '<br>from %{customdata[0]:.0f}° · %{customdata[1]:.1f} kt<extra></extra>',
    showlegend: false,
  }];
  const lim = R0 + K2 * 8.6;
  const ann = [['N', 0, 1], ['E', 1, 0], ['S', 0, -1], ['W', -1, 0]].map(([t, dx, dy]) => ({
    x: dx * (lim + 0.5), y: dy * (lim + 0.5), showarrow: false, text: t,
    font: { size: 11, color: '#4C6274', family: MONO },
  }));
  [[0, '04:00'], [4, '08:00'], [8, '12:00']].forEach(([hr, t]) => {
    const rr = R0 + K2 * hr, a = Math.PI * 205 / 180;
    ann.push({ x: rr * Math.sin(a), y: rr * Math.cos(a), showarrow: false, text: t,
      font: { size: 8, color: MUTE, family: MONO } });
  });
  return { traces, layout: { ...BASE(), margin: { l: 30, r: 30, t: 26, b: 26 },
    annotations: ann,
    xaxis: { visible: false, range: [-lim - 1.4, lim + 1.4] },
    yaxis: { visible: false, range: [-lim - 1.2, lim + 1.2], scaleanchor: 'x', scaleratio: 1 },
    showlegend: false }, height: 470 };
};

/* ── C3 · apparent vs true ── */
CHARTS.c3 = () => ({
  traces: [
    { type: 'scattergl', mode: 'markers', x: INS.c3.map(d => d.t), y: INS.c3.map(d => d.aw),
      marker: { size: 4.5, color: INS.c3.map(d => d.bsp), colorscale: RAMP, cmin: 0, cmax: 10,
        colorbar: { title: { text: 'BSP (kt)', font: AXFONT }, thickness: 10, len: 0.6,
          tickfont: { ...AXFONT, size: 9 }, outlinewidth: 0 } },
      customdata: INS.c3.map(d => d.atwa),
      hovertemplate: 'true %{x} kt · apparent %{y} kt<br>|TWA| %{customdata}°<extra></extra>',
      showlegend: false },
  ],
  layout: { ...BASE(), margin: { ...BASE().margin, t: 18, r: narrow() ? 50 : 70 },
    shapes: [{ type: 'line', x0: 0, y0: 0, x1: 18, y1: 18, line: { color: '#B9CBD4', width: 1.2, dash: 'dot' }, layer: 'below' }],
    annotations: [
      { x: 4.4, y: 14.5, showarrow: false, text: 'beating — the boat<br>adds wind', font: { size: 9.5, color: '#4C6274', family: MONO }, align: 'left' },
      { x: 13.5, y: 2.6, showarrow: false, text: 'running — the boat<br>subtracts it', font: { size: 9.5, color: '#4C6274', family: MONO }, align: 'left' }],
    xaxis: { ...GAX, range: [0, 18], dtick: 4, title: { text: 'True wind speed (kt)', font: AXFONT } },
    yaxis: { ...GAX, range: [0, 22], dtick: 4, title: { text: 'Apparent wind speed (kt)', font: AXFONT } } },
});

/* ── C4 · boat vs buoys ── */
CHARTS.c4 = () => {
  const { sh, ann } = phaseShapes(false);
  return { traces: [
    line(INS.c4, 'max', 'Max (measured)', HERO, { line: { width: 2.4 } }),
    line(INS.c4, 'b65', '44065 harbor entrance', BLUE),
    line(INS.c4, 'b69', '44069 south shore', ORANGE),
    line(INS.c4, 'kp', 'KPTN6 Kings Point', PURPLE),
  ], layout: { ...BASE(), margin: { ...BASE().margin, t: 24 }, shapes: sh, annotations: ann,
    xaxis: tX(), yaxis: { ...GAX, rangemode: 'tozero', title: { text: 'Wind speed (kt)', font: AXFONT } },
    showlegend: true, legend: { orientation: 'h', x: 0, y: 1.04, yanchor: 'bottom', font: { size: 10, family: MONO } } } };
};

/* ── C5 · sea temperature ── */
CHARTS.c5 = () => {
  const { sh, ann } = phaseShapes(true);
  return { traces: [line(INS.c5, 'v', 'sea temp', SLATE, { line: { width: 1.8 } })],
    layout: { ...BASE(), margin: { ...BASE().margin, t: 16 }, shapes: sh, annotations: ann,
      xaxis: tX(), yaxis: { ...GAX, title: { text: 'Sea temperature (°C)', font: AXFONT } },
      showlegend: false }, height: 330 };
};

/* ── C6 · barometer, gaps honest ── */
CHARTS.c6 = () => ({
  traces: [line(INS.c6, 'v', 'baro', SLATE, { mode: 'lines+markers', marker: { size: 3, color: SLATE } })],
  layout: { ...BASE(), margin: { ...BASE().margin, t: 22 },
    annotations: [{ xref: 'paper', yref: 'paper', x: 0.99, xanchor: 'right', y: 0.97, yanchor: 'top',
      showarrow: false, text: `${INS.c6cov}% coverage — the gaps are real gaps`,
      font: { size: 9.5, color: '#4C6274', family: MONO } }],
    xaxis: tX(), yaxis: { ...GAX, range: [1008, 1027], title: { text: 'Pressure (hPa)', font: AXFONT } },
    showlegend: false }, height: 300 });

/* ── C7 · per-model report card ── */
CHARTS.c7 = () => {
  const M = INS.c7, order = ['GFS', 'HRRRX', 'ECMWF'];
  const rows = order.map(o => M.find(m => m.model === o)).filter(Boolean);
  const lbl = { GFS: 'GFS', HRRRX: 'HRRR-X', ECMWF: 'ECMWF' };
  return { traces: [
    { type: 'bar', name: 'bias (kt)', x: rows.map(r => lbl[r.model]), y: rows.map(r => r.bias),
      marker: { color: rows.map(r => MODELCOL(r.model)), line: { color: '#FDFEFD', width: 2 } },
      text: rows.map(r => r.bias.toFixed(1)), textposition: 'outside', cliponaxis: false,
      textfont: { size: 10, family: MONO, color: '#4C6274' },
      hovertemplate: '%{x} bias %{y:.2f} kt<extra></extra>' },
    { type: 'bar', name: 'abs error (kt)', x: rows.map(r => lbl[r.model]), y: rows.map(r => r.mae),
      marker: { color: rows.map(r => MODELCOL(r.model)), opacity: 0.45, line: { color: '#FDFEFD', width: 2 } },
      text: rows.map(r => r.mae.toFixed(1)), textposition: 'outside', cliponaxis: false,
      textfont: { size: 10, family: MONO, color: '#4C6274' },
      customdata: rows.map(r => [r.dmae, r.n]),
      hovertemplate: '%{x} MAE %{y:.2f} kt<br>direction MAE %{customdata[0]}°<br>n=%{customdata[1]}<extra></extra>' },
  ], layout: { ...BASE(), barmode: 'group', bargap: 0.4, margin: { ...BASE().margin, t: 24 },
    shapes: [{ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 0, y1: 0, line: { color: '#51677A', width: 1.1 } }],
    xaxis: { ...GAX, type: 'category' },
    yaxis: { ...GAX, zeroline: false, title: { text: 'kt vs measured (TWS ≥ 6)', font: AXFONT } },
    showlegend: true, legend: { orientation: 'h', x: 0, y: 1.04, yanchor: 'bottom', font: { size: 10, family: MONO } } },
    height: 330 };
};
const MODELCOL = m => ({ GFS: BLUE, HRRRX: PURPLE, ECMWF: ORANGE }[m] || SLATE);

/* ── C8 · the park, forecast vs measured ── */
CHARTS.c8 = () => {
  const park = INS.phases.find(p => p.l === 'DAWN PARK');
  const models = [...new Set(INS.c8.fc.map(f => f.model))];
  return { traces: [
    { ...line(INS.c8.obs, 'v', 'measured at the boat', HERO, { line: { width: 2.4 } }) },
    ...models.map(m => ({ type: 'scatter', mode: 'markers', name: ({ GFS: 'GFS', HRRRX: 'HRRR-X', ECMWF: 'ECMWF' })[m] || m,
      x: INS.c8.fc.filter(f => f.model === m).map(f => f.t),
      y: INS.c8.fc.filter(f => f.model === m).map(f => f.f),
      marker: { size: 9, color: MODELCOL(m), symbol: 'diamond', line: { color: '#FDFEFD', width: 2 } },
      hovertemplate: '%{x}<br>forecast %{y} kt<extra>' + m + '</extra>' })),
  ], layout: { ...BASE(), margin: { ...BASE().margin, t: 24 },
    shapes: [{ type: 'rect', xref: 'x', yref: 'paper', x0: park.a, x1: park.b, y0: 0, y1: 1,
      fillcolor: '#17293A', opacity: 0.05, line: { width: 0 }, layer: 'below' }],
    annotations: [{ xref: 'x', yref: 'paper', x: park.a, xanchor: 'left', y: 0.04, yanchor: 'bottom',
      showarrow: false, textangle: -90, text: 'THE DAWN PARK', font: { size: 8.5, color: '#41505E', family: MONO } }],
    xaxis: tX(), yaxis: { ...GAX, rangemode: 'tozero', title: { text: 'Wind speed (kt)', font: AXFONT } },
    showlegend: true, legend: { orientation: 'h', x: 0, y: 1.04, yanchor: 'bottom', font: { size: 10, family: MONO } } } };
};

/* ── C9 · the 162° miss — two arrows ── */
CHARTS.c9 = () => {
  const c = INS.c9, S = 12.1;
  const vec = (spd, dir) => {   // direction FROM -> arrow points TO (downwind)
    const a = Math.PI * ((dir + 180) % 360) / 180;
    return { x: spd * Math.sin(a), y: spd * Math.cos(a) };
  };
  const f = vec(c.f, c.fd), o = vec(c.o, c.od);
  const rings = [4, 8].map(rr => { const xs = [], ys = [];
    for (let a = 0; a <= 360; a += 6) { xs.push(rr * Math.sin(a * Math.PI / 180)); ys.push(rr * Math.cos(a * Math.PI / 180)); }
    return { type: 'scatter', mode: 'lines', x: xs, y: ys, line: { color: '#E3ECEF', width: 1 }, hoverinfo: 'skip', showlegend: false }; });
  return { traces: rings, layout: { ...BASE(), margin: { l: 26, r: 26, t: 30, b: 26 },
    annotations: [
      ...[['N', 0, 1], ['E', 1, 0], ['S', 0, -1], ['W', -1, 0]].map(([t, dx, dy]) => ({
        x: dx * S, y: dy * S, showarrow: false, text: t, font: { size: 11, color: '#4C6274', family: MONO } })),
      { x: o.x * 0.98, y: o.y * 0.98, ax: 0, ay: 0, axref: 'x', ayref: 'y', showarrow: true,
        arrowhead: 3, arrowsize: 1.4, arrowwidth: 2.6, arrowcolor: HERO, text: '' },
      { x: f.x * 0.9, y: f.y * 0.9, ax: 0, ay: 0, axref: 'x', ayref: 'y', showarrow: true,
        arrowhead: 3, arrowsize: 1.2, arrowwidth: 2, arrowcolor: ORANGE, text: '' },
      { x: o.x, y: o.y, xanchor: 'left', showarrow: false, text: ` measured: ${c.o} kt from ${c.od}°`,
        font: { size: 10, color: HERO, family: MONO } },
      { x: f.x + 0.4, y: f.y - 1.3, xanchor: 'left', yanchor: 'top', showarrow: false,
        text: `forecast: ${c.f} kt from ${c.fd}°`, font: { size: 10, color: ORANGE, family: MONO } },
      { xref: 'paper', yref: 'paper', x: 0.02, y: 0.98, xanchor: 'left', yanchor: 'top', showarrow: false,
        align: 'left', text: `05:00 Saturday · the last ECMWF aboard<br>162° apart, 5× the strength`,
        font: { size: 10, color: '#4C6274', family: MONO } }],
    xaxis: { visible: false, range: [-S - 2, S + 2] },
    yaxis: { visible: false, range: [-S - 1.5, S + 1.5], scaleanchor: 'x', scaleratio: 1 },
    showlegend: false }, height: 440 };
};

/* ── C10 · staleness clock ── */
CHARTS.c10 = () => ({
  traces: [
    { type: 'scatter', mode: 'lines', name: 'age of newest forecast aboard',
      x: INS.c10.ages.map(a => a.t), y: INS.c10.ages.map(a => a.age),
      line: { color: SLATE, width: 2, shape: 'linear' }, fill: 'tozeroy', fillcolor: 'rgba(65,80,94,0.08)',
      hovertemplate: '%{x}<br>newest data aboard: %{y:.1f} h old<extra></extra>' },
    { type: 'scatter', mode: 'markers', name: 'download',
      x: INS.c10.downloads.map(d => d.t), y: INS.c10.downloads.map(() => 0),
      marker: { size: 10, symbol: 'triangle-up', color: HERO, line: { color: '#FDFEFD', width: 1.5 } },
      customdata: INS.c10.downloads.map(d => d.model),
      hovertemplate: '%{x}<br>%{customdata} downloaded<extra></extra>' },
  ],
  layout: { ...BASE(), margin: { ...BASE().margin, t: 24 },
    annotations: [{ xref: 'paper', yref: 'paper', x: 0.02, y: 0.95, xanchor: 'left', yanchor: 'top',
      showarrow: false, align: 'left',
      text: 'BLOCKED — [fact] only if these five files are the complete set.<br>Nothing downloaded after 19:12 Thursday: 41 h raced on ageing data.',
      font: { size: 9.5, color: '#A33B3B', family: MONO } }],
    xaxis: tX(), yaxis: { ...GAX, rangemode: 'tozero', title: { text: 'Forecast age (hours)', font: AXFONT } },
    showlegend: false } });

/* ── C11 · error vs lead ── */
CHARTS.c11 = () => {
  const models = [...new Set(INS.c11.map(d => d.model))];
  return { traces: models.map(m => ({ type: 'scatter', mode: 'markers',
    name: ({ GFS: 'GFS', HRRRX: 'HRRR-X', ECMWF: 'ECMWF' })[m] || m,
    x: INS.c11.filter(d => d.model === m).map(d => d.lead),
    y: INS.c11.filter(d => d.model === m).map(d => d.aerr),
    marker: { size: 8, color: MODELCOL(m), opacity: 0.8, line: { color: '#FDFEFD', width: 2 } },
    hovertemplate: '+%{x} h after download<br>|error| %{y} kt<extra>' + m + '</extra>' })),
  layout: { ...BASE(), margin: { ...BASE().margin, t: 24 },
    annotations: [{ xref: 'paper', yref: 'paper', x: 0.98, y: 0.95, xanchor: 'right', yanchor: 'top',
      showarrow: false, text: 'no fit line on purpose: n is too thin<br>to separate decay from weather',
      font: { size: 9.5, color: '#4C6274', family: MONO }, align: 'right' }],
    xaxis: { ...GAX, rangemode: 'tozero', title: { text: 'Hours after download', font: AXFONT } },
    yaxis: { ...GAX, rangemode: 'tozero', title: { text: '|wind speed error| (kt)', font: AXFONT } },
    showlegend: true, legend: { orientation: 'h', x: 0, y: 1.04, yanchor: 'bottom', font: { size: 10, family: MONO } } },
    height: 360 };
};

/* ── C12 · message inventory ── */
CHARTS.c12 = () => {
  const files = INS.c12.map(f => f.file.replace('.grb', '').replace(/_(\d{6})$/, ''));
  const series = [['10u', BLUE], ['10v', PURPLE], ['msl', SLATE], ['prate', MUTE]];
  return { traces: series.map(([k, col]) => ({ type: 'bar', name: k,
    x: files, y: INS.c12.map(f => f[k]),
    marker: { color: col, line: { color: '#FDFEFD', width: 2 } },
    hovertemplate: '%{x}<br>' + k + ': %{y} messages<extra></extra>' })),
  layout: { ...BASE(), barmode: 'group', bargap: 0.3, margin: { ...BASE().margin, t: 24, b: 74 },
    annotations: [{ x: files[INS.c12.findIndex(f => f['10v'] === 0 && f['10u'] > 0)], yref: 'paper', y: 1.0,
      yanchor: 'bottom', showarrow: false, text: 'u only — no wind vector possible',
      font: { size: 9.5, color: ORANGE, family: MONO } }],
    xaxis: { ...GAX, type: 'category', tickangle: -25, tickfont: { ...AXFONT, size: 8.5 } },
    yaxis: { ...GAX, title: { text: 'GRIB messages', font: AXFONT } },
    showlegend: true, legend: { orientation: 'h', x: 0, y: 1.1, yanchor: 'bottom', font: { size: 10, family: MONO } } },
    height: 360 };
};

/* ── C13 · the HRRR-X field ── */
CHARTS.c13 = () => {
  const f = INS.c13, b = INS.c13boat;
  return { traces: [
    { type: 'scattergl', mode: 'markers', x: f.lon, y: f.lat,
      /* tiles must cover the 0.05° grid pitch or the field stripes (found on
         review): at ~220 px/deg wide that is ~11 px of lon and ~15 of lat */
      marker: { symbol: 'square', size: narrow() ? 5.5 : 14, opacity: 1, color: f.s, colorscale: RAMP, cmin: 0, cmax: 14,
        colorbar: { title: { text: 'kt', font: AXFONT }, thickness: 10, len: 0.6, tickfont: { ...AXFONT, size: 9 }, outlinewidth: 0 } },
      hovertemplate: '%{y:.2f}, %{x:.2f}<br>forecast %{marker.color:.1f} kt<extra></extra>', showlegend: false },
    { type: 'scatter', mode: 'lines', x: INS.track.map(p => p.lon), y: INS.track.map(p => p.lat),
      line: { color: '#17293A', width: 1.4 }, hoverinfo: 'skip', showlegend: false },
    { type: 'scatter', mode: 'markers', x: [b.lon], y: [b.lat],
      marker: { size: 13, color: HERO, symbol: 'star', line: { color: '#fff', width: 1.5 } },
      hovertemplate: `Max 06:00 Fri — measured ${b.tws} kt from ${b.twd}°<extra></extra>`, showlegend: false },
  ], layout: { ...BASE(), margin: { ...BASE().margin, t: 26 },
    annotations: [{ x: b.lon, y: b.lat, ax: -60, ay: 30, showarrow: true, arrowwidth: 1, arrowcolor: HERO,
      text: `Max measured ${b.tws} kt — the model painted ${b.field} here`,
      font: { size: 9.5, color: HERO, family: MONO } },
      { xref: 'paper', yref: 'paper', x: 0.99, y: 0.02, xanchor: 'right', showarrow: false,
        text: 'HRRR-X valid 06:00 EDT Fri · 0.05° shown', font: { size: 9, color: '#4C6274', family: MONO } }],
    xaxis: { ...GAX, title: { text: 'Longitude', font: AXFONT } },
    yaxis: { ...GAX, scaleanchor: 'x', scaleratio: 1.33, title: { text: 'Latitude', font: AXFONT } },
    showlegend: false }, height: 470 };
};

/* ── C14 · the wind-band ladder ── */
CHARTS.c14 = () => {
  const rows = INS.c14, fenced = k => k === '0–4' || k === '4–6';
  return { traces: [{ type: 'bar', x: rows.map(d => d.k), y: rows.map(d => d.pct),
    marker: { color: rows.map(d => fenced(d.k) ? '#C7D2DB' : SLATE), line: { color: '#FDFEFD', width: 2 } },
    text: rows.map(d => d.pct + '%'), textposition: 'outside', cliponaxis: false,
    textfont: { size: 10, family: MONO, color: '#4C6274' },
    customdata: rows.map(d => [d.hours, d.act, d.tgt]),
    hovertemplate: 'TWS %{x} kt<br>%{y}% of target<br>%{customdata[0]} h · %{customdata[1]} vs %{customdata[2]} kt<extra></extra>' }],
  layout: { ...BASE(), bargap: 0.42, margin: { ...BASE().margin, t: 26 },
    annotations: [{ x: 0.5, xref: 'x', yref: 'paper', y: 0.99, yanchor: 'top', showarrow: false,
      text: 'fenced: a VPP in drifting air<br>judges the polar, not the crew',
      font: { size: 9, color: '#8B98A5', family: MONO } }],
    xaxis: { ...GAX, type: 'category', title: { text: 'True wind speed (kt)', font: AXFONT } },
    yaxis: { ...GAX, range: [0, 104], ticksuffix: '%', title: { text: 'Median % of VPP target', font: AXFONT } },
    showlegend: false }, height: 360 };
};

/* ── C17 · measured polar over VPP (half-rose, hand-rolled) ── */
CHARTS.c17 = () => {
  const toXY = (a, v) => ({ x: v * Math.sin(Math.PI * a / 180), y: v * Math.cos(Math.PI * a / 180) });
  const traces = [];
  [2, 4, 6, 8, 10].forEach(rr => { const xs = [], ys = [];
    for (let a = 0; a <= 180; a += 4) { const q = toXY(a, rr); xs.push(q.x); ys.push(q.y); }
    traces.push({ type: 'scatter', mode: 'lines', x: xs, y: ys, line: { color: '#E3ECEF', width: 1 },
      hoverinfo: 'skip', showlegend: false }); });
  [45, 90, 135].forEach(a => { const q = toXY(a, 10.6);
    traces.push({ type: 'scatter', mode: 'lines', x: [0, q.x], y: [0, q.y],
      line: { color: '#EDF3F6', width: 1 }, hoverinfo: 'skip', showlegend: false }); });
  INS.c17.forEach((band, i) => {
    const col = RAMP5[i];
    traces.push({ type: 'scatter', mode: 'lines', name: band.label + ' VPP', legendgroup: band.label,
      showlegend: false, x: band.vpp.map(p => toXY(p.a, p.v).x), y: band.vpp.map(p => toXY(p.a, p.v).y),
      line: { color: col, width: 1, dash: 'dot' },
      hovertemplate: 'VPP ' + band.label + ' · %{text}<extra></extra>',
      text: band.vpp.map(p => `${p.a}° → ${p.v} kt`) });
    traces.push({ type: 'scatter', mode: 'lines+markers', name: band.label, legendgroup: band.label,
      x: band.meas.map(p => toXY(p.a, p.v).x), y: band.meas.map(p => toXY(p.a, p.v).y),
      line: { color: col, width: 2.2 }, marker: { size: 5, color: col },
      hovertemplate: 'measured ' + band.label + ' · %{text}<extra></extra>',
      text: band.meas.map(p => `${p.a}° → ${p.v} kt`) });
  });
  const ann = [[2, '2'], [6, '6'], [10, '10 kt']].map(([v, t]) => ({
    x: 0.22, y: v, showarrow: false, text: t, xanchor: 'left', font: { size: 8.5, color: MUTE, family: MONO } }));
  ann.push({ x: 0, y: 11.3, showarrow: false, text: 'upwind', font: { size: 9.5, color: '#4C6274', family: MONO } });
  ann.push({ x: 0, y: -11.3, showarrow: false, text: 'dead downwind', font: { size: 9.5, color: '#4C6274', family: MONO } });
  return { traces, layout: { ...BASE(), margin: { l: 16, r: 12, t: 26, b: 26 }, annotations: ann,
    xaxis: { visible: false, range: [-1.2, 12.6] },
    yaxis: { visible: false, range: [-11.9, 11.9], scaleanchor: 'x', scaleratio: 1 },
    showlegend: true, legend: { orientation: 'v', x: 0.99, xanchor: 'right', y: 0.98, yanchor: 'top', font: { size: 9.5, family: MONO } } },
    height: 560 };
};

/* ── C18 · deficit over time ── */
CHARTS.c18 = () => {
  const { sh, ann } = phaseShapes(true);
  sh.push({ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 100, y1: 100, yref: 'y',
    line: { color: '#B9CBD4', width: 1.1, dash: 'dot' } });
  return { traces: [line(INS.c18, 'pct', '% of target', SLATE, { line: { width: 2 } })],
    layout: { ...BASE(), margin: { ...BASE().margin, t: 18 }, shapes: sh, annotations: ann,
      xaxis: tX(), yaxis: { ...GAX, range: [0, 112], ticksuffix: '%', title: { text: '% of VPP target (TWS ≥ 6)', font: AXFONT } },
      showlegend: false } };
};

/* ── C19 · heel vs target ── */
CHARTS.c19 = () => {
  const groups = [['upwind (<60°)', BLUE], ['reach (60–120°)', PURPLE], ['run (>120°)', ORANGE]];
  return { traces: groups.map(([g, col]) => ({ type: 'scattergl', mode: 'markers', name: g,
    x: INS.c19.filter(d => d.pos === g).map(d => d.h),
    y: INS.c19.filter(d => d.pos === g).map(d => d.pct),
    marker: { size: 5, color: col, opacity: 0.55 },
    hovertemplate: 'heel %{x}° · %{y}% of target<extra>' + g + '</extra>' })),
  layout: { ...BASE(), margin: { ...BASE().margin, t: 24 },
    xaxis: { ...GAX, rangemode: 'tozero', title: { text: '|Heel| (°)', font: AXFONT } },
    yaxis: { ...GAX, range: [0, 130], ticksuffix: '%', title: { text: '% of VPP target', font: AXFONT } },
    showlegend: true, legend: { orientation: 'h', x: 0, y: 1.04, yanchor: 'bottom', font: { size: 10, family: MONO } } } };
};

/* ── C20 · distance ledger ── */
CHARTS.c20 = () => {
  const last = INS.c20[INS.c20.length - 1];
  return { traces: [
    line(INS.c20, 'dtw', 'through the water (k·BSP)', BLUE, { line: { width: 2 } }),
    line(INS.c20, 'dog', 'over the ground (SOG)', PURPLE, { line: { width: 2, dash: 'dash' } }),
    line(INS.c20, 'made', 'course made good (payload)', SLATE, { line: { width: 2 } }),
  ], layout: { ...BASE(), margin: { ...BASE().margin, t: 24 },
    annotations: [{ x: last.t, y: last.dtw, xanchor: 'right', yanchor: 'bottom', showarrow: false,
      text: `${last.dtw} / ${last.dog} / ${last.made} nm`, font: { size: 9.5, color: '#4C6274', family: MONO } }],
    xaxis: tX(), yaxis: { ...GAX, rangemode: 'tozero', title: { text: 'Cumulative distance (nm)', font: AXFONT } },
    showlegend: true, legend: { orientation: 'h', x: 0, y: 1.04, yanchor: 'bottom', font: { size: 10, family: MONO } } } };
};

/* ── C21 · the Gut, measured vs predicted ── */
CHARTS.c21 = () => ({
  traces: [
    { type: 'scatter', mode: 'lines', name: 'CO-OPS LIS1012 predicted',
      x: INS.c21.pred.map(p => p.t), y: INS.c21.pred.map(p => p.v),
      line: { color: SLATE, width: 1.6, dash: 'dash' },
      hovertemplate: '%{x}<br>predicted %{y:+.2f} kt<extra></extra>' },
    { type: 'scatter', mode: 'lines+markers', name: 'measured aboard Max',
      x: INS.c21.meas.map(p => p.t), y: INS.c21.meas.map(p => p.v),
      line: { color: HERO, width: 2.2 }, marker: { size: 6, color: HERO },
      hovertemplate: '%{x}<br>measured %{y:+.2f} kt<extra></extra>' },
  ],
  layout: { ...BASE(), margin: { ...BASE().margin, t: 24 },
    shapes: [
      { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 0, y1: 0, line: { color: '#51677A', width: 1.1 } },
      { type: 'line', x0: INS.c21.transit, x1: INS.c21.transit, yref: 'paper', y0: 0, y1: 1,
        line: { color: MUTE, width: 1.2, dash: 'dot' } }],
    annotations: [{ x: INS.c21.transit, yref: 'paper', y: 0.03, yanchor: 'bottom', xanchor: 'right',
      showarrow: false, textangle: -90, text: 'Max through the Gut 20:37',
      font: { size: 8.5, color: '#4C6274', family: MONO } },
      { xref: 'paper', x: 0.99, xanchor: 'right', yref: 'paper', y: 0.97, yanchor: 'top', showarrow: false,
        align: 'right', text: 'flood into the Sound = positive (fair)<br>measured: slack ~20 min late, early ebb 2.7× the table',
        font: { size: 9.5, color: '#4C6274', family: MONO } }],
    xaxis: tX(), yaxis: { ...GAX, zeroline: false, title: { text: 'Current on the flood axis (kt)', font: AXFONT } },
    showlegend: true, legend: { orientation: 'h', x: 0, y: 1.04, yanchor: 'bottom', font: { size: 10, family: MONO } } } });

/* ── C22 · current vectors along the track ── */
CHARTS.c22 = () => {
  const S = 0.026;                       // deg of lat per kt of drift
  const segx = [], segy = [];
  for (const p of INS.c22) {
    segx.push(p.lon, p.lon + p.u * S / Math.cos(Math.PI * p.lat / 180), null);
    segy.push(p.lat, p.lat + p.vv * S, null);
  }
  return { traces: [
    { type: 'scatter', mode: 'lines', x: INS.track.map(p => p.lon), y: INS.track.map(p => p.lat),
      line: { color: '#D9E4E9', width: 1.6 }, hoverinfo: 'skip', showlegend: false },
    { type: 'scatter', mode: 'lines', x: segx, y: segy, line: { color: SLATE, width: 1.3 },
      hoverinfo: 'skip', showlegend: false },
    { type: 'scattergl', mode: 'markers', x: INS.c22.map(p => p.lon), y: INS.c22.map(p => p.lat),
      marker: { size: 5.5, color: INS.c22.map(p => p.d), colorscale: RAMP, cmin: 0, cmax: 2.5,
        colorbar: { title: { text: 'drift (kt)', font: AXFONT }, thickness: 10, len: 0.6,
          tickfont: { ...AXFONT, size: 9 }, outlinewidth: 0 } },
      customdata: INS.c22.map(p => p.d),
      hovertemplate: '%{y:.3f}, %{x:.3f}<br>drift %{customdata} kt<extra></extra>', showlegend: false },
  ], layout: { ...BASE(), margin: { ...BASE().margin, t: 22, r: narrow() ? 48 : 66 },
    annotations: [{ xref: 'paper', x: 0.01, yref: 'paper', y: 0.02, xanchor: 'left', showarrow: false,
      text: 'vector = set & drift, one per 30 min', font: { size: 9, color: '#4C6274', family: MONO } }],
    xaxis: { ...GAX, title: { text: 'Longitude', font: AXFONT } },
    yaxis: { ...GAX, scaleanchor: 'x', scaleratio: 1.33, title: { text: 'Latitude', font: AXFONT } },
    showlegend: false }, height: 480 };
};

/* ── C23 · the fleet's gate, repriced? ── */
CHARTS.c23 = () => {
  const predAt = t => {                  // linear interp on the hourly prediction
    const P = INS.c23.pred, k = s => Date.parse(s.replace(' ', 'T'));
    const x = k(t);
    for (let i = 1; i < P.length; i++) if (x <= k(P[i].t)) {
      const f = (x - k(P[i - 1].t)) / (k(P[i].t) - k(P[i - 1].t));
      return P[i - 1].v + f * (P[i].v - P[i - 1].v);
    } return null;
  };
  const fleet = INS.c23.fleet.map(g => ({ ...g, cur: predAt(g.t) })).filter(g => g.cur != null);
  return { traces: [
    { type: 'scatter', mode: 'lines', name: 'predicted current', x: INS.c23.pred.map(p => p.t),
      y: INS.c23.pred.map(p => p.v), line: { color: SLATE, width: 1.4, dash: 'dash' },
      hovertemplate: '%{x}<br>predicted %{y:+.2f} kt<extra></extra>' },
    { type: 'scatter', mode: 'markers', name: 'each boat at its crossing (on the prediction)',
      x: fleet.map(g => g.t), y: fleet.map(g => g.cur),
      marker: { size: 7, color: MUTE, line: { color: '#FDFEFD', width: 1.5 } },
      customdata: fleet.map(g => [g.nm, g.sog]),
      hovertemplate: '<b>%{customdata[0]}</b> · %{x}<br>predicted %{y:+.2f} kt · SOG %{customdata[1]} kt<extra></extra>' },
    { type: 'scatter', mode: 'markers', name: 'Max — measured',
      x: [INS.c23.max.t], y: [INS.c23.max.cur],
      marker: { size: 13, symbol: 'star', color: HERO, line: { color: '#fff', width: 1.5 } },
      hovertemplate: 'Max 20:37 — MEASURED %{y:+.2f} kt<extra></extra>' },
  ], layout: { ...BASE(), margin: { ...BASE().margin, t: 24 },
    shapes: [{ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 0, y1: 0, line: { color: '#51677A', width: 1.1 } }],
    annotations: [{ x: INS.c23.max.t, y: INS.c23.max.cur, ax: -70, ay: 22, showarrow: true, arrowwidth: 1,
      arrowcolor: HERO, text: 'measured −1.18 where<br>the table said −0.44',
      font: { size: 9.5, color: HERO, family: MONO }, align: 'right' }],
    xaxis: tX('Time through Plum Gut (EDT)'),
    yaxis: { ...GAX, zeroline: false, title: { text: 'Current (kt · + flood, fair)', font: AXFONT } },
    showlegend: true, legend: { orientation: 'h', x: 0, y: 1.04, yanchor: 'bottom', font: { size: 10, family: MONO } } } };
};

/* ── C24 · maneuver ledger ── */
CHARTS.c24 = () => {
  const { sh, ann } = phaseShapes(true);
  const tacks = INS.c24.filter(e => e.kind === 'tack'), gybes = INS.c24.filter(e => e.kind === 'gybe');
  return { traces: [
    { type: 'scatter', mode: 'markers', name: `tacks (${tacks.length})`, x: tacks.map(e => e.t),
      y: tacks.map(() => 1), marker: { symbol: 'line-ns-open', size: 13, color: BLUE, line: { width: 2 } },
      hovertemplate: '%{x}<br>tack<extra></extra>' },
    { type: 'scatter', mode: 'markers', name: `gybes (${gybes.length})`, x: gybes.map(e => e.t),
      y: gybes.map(() => 0), marker: { symbol: 'line-ns-open', size: 13, color: ORANGE, line: { width: 2 } },
      hovertemplate: '%{x}<br>gybe<extra></extra>' },
  ], layout: { ...BASE(), margin: { ...BASE().margin, t: 24 }, shapes: sh, annotations: ann,
    xaxis: tX(), yaxis: { ...GAX, range: [-0.7, 1.7], tickvals: [0, 1], ticktext: ['gybe', 'tack'], showgrid: false },
    showlegend: true, legend: { orientation: 'h', x: 0, y: 1.06, yanchor: 'bottom', font: { size: 10, family: MONO } } },
    height: 260 };
};

/* ── C25 · maneuver cost / recovery ── */
CHARTS.c25 = () => {
  const traces = [];
  [['tack', BLUE], ['gybe', ORANGE]].forEach(([k, col]) => {
    const c = INS.c25[k]; if (!c) return;
    traces.push({ type: 'scatter', mode: 'lines', x: [...c.m, ...c.m.slice().reverse()],
      y: [...c.hi, ...c.lo.slice().reverse()], fill: 'toself',
      fillcolor: col + '22', line: { width: 0 }, hoverinfo: 'skip', showlegend: false });
    traces.push({ type: 'scatter', mode: 'lines', name: `${k} (n=${c.n})`, x: c.m, y: c.med,
      line: { color: col, width: 2.2 },
      hovertemplate: '%{x:+.1f} min · %{y:.0f}% of approach speed<extra>' + k + '</extra>' });
  });
  return { traces, layout: { ...BASE(), margin: { ...BASE().margin, t: 24 },
    shapes: [
      { type: 'line', xref: 'paper', y0: 100, y1: 100, x0: 0, x1: 1, line: { color: '#B9CBD4', width: 1.1, dash: 'dot' } },
      { type: 'line', x0: 0, x1: 0, yref: 'paper', y0: 0, y1: 1, line: { color: MUTE, width: 1.1 } }],
    annotations: [{ x: 0, yref: 'paper', y: 1.0, yanchor: 'bottom', showarrow: false, text: 'helm over',
      font: { size: 9, color: '#4C6274', family: MONO } }],
    xaxis: { ...GAX, dtick: 2, title: { text: 'Minutes from the maneuver', font: AXFONT } },
    yaxis: { ...GAX, range: [40, 130], ticksuffix: '%', title: { text: '% of own approach speed', font: AXFONT } },
    showlegend: true, legend: { orientation: 'h', x: 0, y: 1.06, yanchor: 'bottom', font: { size: 10, family: MONO } } } };
};

/* ── C26 · helm by watch (PRIVATE) ── */
CHARTS.c26 = () => {
  const rows = INS.c26.filter(s => s.pct != null);
  return { traces: [{ type: 'bar', x: rows.map(s => s.start), y: rows.map(s => s.pct),
    marker: { color: rows.map(s => s.owner ? GOLD : SLATE), line: { color: '#FDFEFD', width: 2 } },
    customdata: rows.map(s => [s.owner ? "owner's watch" : 'other watch', s.tws, s.rudSD, s.heelSD, s.man]),
    hovertemplate: '%{x}<br><b>%{customdata[0]}</b> · %{y}% of target<br>TWS %{customdata[1]} kt · rudder σ %{customdata[2]}° · heel σ %{customdata[3]}°<br>%{customdata[4]} maneuvers<extra></extra>',
    width: 3 * 3600 * 1000 * 0.72 }],
  layout: { ...BASE(), margin: { ...BASE().margin, t: 30 },
    annotations: [
      { xref: 'paper', x: 0, yref: 'paper', y: 1.03, yanchor: 'bottom', showarrow: false, align: 'left',
        text: '<span style="color:#B98A00">■</span> owner\'s watch  <span style="color:#41505E">■</span> other watch — spans are [recall]',
        font: { size: 10, color: '#4C6274', family: MONO } }],
    xaxis: tX('Shift start (EDT) — 3 h watches'),
    yaxis: { ...GAX, range: [0, 104], ticksuffix: '%', title: { text: '% of VPP target (TWS ≥ 6)', font: AXFONT } },
    showlegend: false }, height: 360 };
};

/* ── C27 · the navigator's plan ── */
CHARTS.c27 = () => {
  const order = [];
  for (const h of INS.c27) if (!order.includes(h.name)) order.push(h.name);
  const traces = INS.c27.map(h => ({ type: 'scatter', mode: 'lines',
    x: [h.a, h.b], y: [h.name, h.name],
    line: { color: SLATE, width: 9 }, showlegend: false,
    hovertemplate: `<b>${h.name}</b><br>%{x}<extra></extra>` }));
  return { traces, layout: { ...BASE(), margin: { ...BASE().margin, t: 24, l: narrow() ? 92 : 118 },
    shapes: [{ type: 'rect', x0: '2026-07-25 05:58', x1: '2026-07-25 06:29', yref: 'paper', y0: 0, y1: 1,
      fillcolor: GOLD, opacity: 0.14, line: { width: 0 }, layer: 'below' }],
    annotations: [{ x: '2026-07-25 05:58', yref: 'paper', y: 0.02, yanchor: 'bottom', xanchor: 'right',
      showarrow: false, textangle: -90, text: '31 minutes · 10 changes',
      font: { size: 8.5, color: GOLD, family: MONO } }],
    xaxis: tX(), yaxis: { ...GAX, type: 'category', categoryorder: 'array', categoryarray: order.slice().reverse(),
      tickfont: { ...AXFONT, size: 9 } },
    showlegend: false }, height: 380 };
};

/* ── C28 · depth, shallow-up ── */
CHARTS.c28 = () => {
  const { sh, ann } = phaseShapes(true);
  const minRow = INS.c28.filter(d => d.v != null).reduce((a, b) => (a && a.v <= b.v) ? a : b, null);
  return { traces: [{ type: 'scatter', mode: 'lines', x: INS.c28.map(d => d.t), y: INS.c28.map(d => d.v),
    line: { color: BLUE, width: 1.6 }, fill: 'tozeroy', fillcolor: 'rgba(45,95,168,0.10)',
    connectgaps: false, hovertemplate: '%{x}<br>min sounding %{y} m<extra></extra>', showlegend: false }],
  layout: { ...BASE(), margin: { ...BASE().margin, t: 20 }, shapes: sh,
    annotations: [...ann, { x: minRow.t, y: minRow.v, ax: 0, ay: 30, showarrow: true, arrowwidth: 1,
      arrowcolor: ORANGE, text: `${minRow.v} m`, font: { size: 10, color: ORANGE, family: MONO } }],
    xaxis: tX(), yaxis: { ...GAX, autorange: 'reversed', title: { text: 'Depth (m) — shallow at the top', font: AXFONT } },
    showlegend: false }, height: 330 };
};

/* ── C30 · her wind vs the fleet's VMC ── */
CHARTS.c30 = () => {
  const { sh, ann } = phaseShapes(true);
  return { traces: [
    line(INS.c30, 'tws', 'Max — measured wind', HERO, { line: { width: 2.2 } }),
    line(INS.c30, 'vmc', 'fleet median VMC', SLATE, { line: { width: 2 } }),
  ], layout: { ...BASE(), margin: { ...BASE().margin, t: 24 }, shapes: sh, annotations: ann,
    xaxis: tX(), yaxis: { ...GAX, rangemode: 'tozero', title: { text: 'Knots — one unit, one axis', font: AXFONT } },
    showlegend: true, legend: { orientation: 'h', x: 0, y: 1.04, yanchor: 'bottom', font: { size: 10, family: MONO } } } };
};

/* ── render loop: modules + candidates, each isolated ── */
function drawAll() {
  for (const id of Object.keys(REG)) {
    const el = document.getElementById('plot-' + id);
    if (!el) continue;
    try {
      const m = REG[id], out = m.build(CTX);
      el.style.height = m.section.height;
      Plotly.newPlot(el, out.traces, { ...out.layout, height: el.clientHeight, autosize: false }, PLOTCFG);
      const t = document.getElementById('title-' + id); if (t) t.textContent = m.section.title;
      const n = document.getElementById('note-' + id); if (n) n.innerHTML = m.section.note;
    } catch (e) { el.innerHTML = '<div class="fail">module ' + id + ' failed: ' + e.message + '</div>'; }
  }
  for (const key of Object.keys(CHARTS)) {
    const el = document.getElementById('plot-' + key);
    if (!el) continue;
    try {
      const out = CHARTS[key]();
      const hpx = out.height || 400;
      el.style.height = hpx + 'px';
      Plotly.newPlot(el, out.traces, { ...out.layout, height: hpx, autosize: false }, PLOTCFG);
    } catch (e) { el.innerHTML = '<div class="fail">chart ' + key + ' failed: ' + e.message + '</div>'; }
  }
}
drawAll();
let _rt; addEventListener('resize', () => { clearTimeout(_rt); _rt = setTimeout(drawAll, 250); });
