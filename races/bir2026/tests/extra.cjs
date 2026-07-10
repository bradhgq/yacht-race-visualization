/* BIR2026 race-specific checks — the monolith's 34-assertion suite ported to
   the shell build (dispositions for the CSS/layout-specific originals are in
   the M2 mapping table, docs/M2-monolith-mapping.md). Loaded by the shared
   runner; counted in regression.json expected_checks. */
'use strict';

module.exports = async ({ check, approx, assert, plots, evalIn, getEl, render, S, D, CFG, FIX }) => {
  const hero = CFG.hero.name;

  /* x1 · G3+A6 — upwind bars read STORED up1bi; honest labels */
  check('bir', `upwind: ${hero} bar '${FIX.upwind.hero_label}', reference anchored, class bars carry finish places`, () => {
    const diff = D.boats[hero].meta.up1bi - D.boats['Christopher Dragon XII'].meta.up1bi;
    assert.ok(Math.abs(diff - FIX.module_canaries.upwind_excess.nm) < 0.001, `up1bi diff ${diff}`);
    for (const nm of ['Zélée', 'In Theory']) S.boats.add(nm);
    render('boats');
    const bar = plots.upwind.traces[0];
    assert.equal(bar.text[bar.y.indexOf(hero)], FIX.upwind.hero_label);
    assert.equal(bar.text[bar.y.indexOf('Christopher Dragon XII')], FIX.upwind.ref_label);
    for (const nm of ['In Theory', 'Zélée'])
      assert.match(bar.text[bar.y.indexOf(nm)], / fin \d/, `${nm} bar missing finish place`);
    for (const nm of ['Zélée', 'In Theory']) if (!CFG.defaults.boats.includes(nm)) S.boats.delete(nm);
    render('boats');
  });

  /* x2 · G5+A7 — two-division beeswarm: counts, labels, shape, never pooled */
  check('bir', `finstrip: ORC ${FIX.finstrip_bands.ORC} / PHRF ${FIX.finstrip_bands.PHRF}, beeswarm not diagonal, Lucky excluded`, () => {
    const pool = cls => Object.keys(D.boats).filter(nm => nm !== 'Lucky'
      && D.boats[nm].meta.cls === cls && D.boats[nm].meta.corr && D.boats[nm].meta.el);
    assert.equal(pool('ORC').length, FIX.finstrip_bands.ORC);
    assert.equal(pool('PHRF').length, FIX.finstrip_bands.PHRF);
    assert.equal(pool('ORC').filter(nm => pool('PHRF').includes(nm)).length, 0, 'divisions pooled');
    const anns = plots.finstrip.layout.annotations.map(a => a.text);
    assert.ok(anns.some(t => new RegExp(`ORC .* ${FIX.finstrip_bands.ORC} finishers`).test(t)), 'ORC band label');
    assert.ok(anns.some(t => new RegExp(`PHRF .* ${FIX.finstrip_bands.PHRF} finishers`).test(t)), 'PHRF band label');
    const dots = plots.finstrip.traces.filter(t => t.mode === 'markers').reduce((s, t) => s + t.x.length, 0);
    assert.equal(dots, FIX.finstrip_bands.ORC + FIX.finstrip_bands.PHRF, 'rendered dots != scored boats');
    const orc = plots.finstrip.traces.filter(t => t.mode === 'markers' && t.y.length > 5)
      .sort((a, b) => b.y.length - a.y.length)[0];
    let ups = 0, downs = 0;
    for (let i = 1; i < orc.y.length; i++) { if (orc.y[i] > orc.y[i - 1]) ups++; else if (orc.y[i] < orc.y[i - 1]) downs++; }
    assert.ok(ups > 0 && downs > 0, `beeswarm y monotonic (ups=${ups} downs=${downs}) — a diagonal`);
    const ys = plots.finstrip.traces.filter(t => t.mode === 'markers').flatMap(t => t.y);
    assert.ok(Math.max(...ys) > 15, 'PHRF band not separated from ORC');
  });

  /* x3 · A2 — corrected mode hides cross-division boats, with the disclosure */
  check('bir', 'corrected never crosses divisions: PHRF boat hidden vs ORC ref, disclosed, drawn again in elapsed', () => {
    S.boats.add('Young American');
    S.raceMode = 'h'; S.raceView = 't'; render('race');
    assert.ok(!plots.race.traces.some(t => t.name === 'Young American'), 'PHRF boat drawn vs ORC reference');
    const note = getEl('racenote').innerHTML;
    assert.match(note, /hidden/);
    assert.match(note, /never compared across scoring divisions/);
    S.raceMode = 'e'; render('race');
    assert.ok(plots.race.traces.some(t => t.name === 'Young American'), 'elapsed mode wrongly hid a boat');
    S.boats.delete('Young American'); S.raceMode = 'h'; render('race');
  });

  /* x4 · R9e — every race line anchors at the start (pace keeps the first 20 nm) */
  check('bir', `race lines anchor at ${CFG.race.startAnchor} nm with a zero gap at the gun`, () => {
    S.raceMode = 'h'; S.raceView = 'p'; render('race');
    const rag = plots.race.traces.find(t => t.name === hero);
    assert.equal(rag.x[0], CFG.race.startAnchor, `line starts at ${rag.x[0]}`);
    assert.equal(rag.y[0], 0, 'start anchor must be 0');
    assert.ok(rag.x.includes(160), 'milestone points missing after the anchor');
  });

  /* x5 · R9k — a DNF boat with no official time cannot crash or draw */
  check('bir', 'DNF boat (Inisharon) never draws a comparison line and never crashes Total view', () => {
    S.boats.add('Inisharon');
    S.raceView = 't'; S.raceMode = 'e'; render('race');
    assert.ok(plots.race, 'race chart failed with a DNF boat selected');
    assert.ok(!plots.race.traces.some(t => t.name === 'Inisharon'), 'DNF boat drew a line');
    S.boats.delete('Inisharon'); S.raceView = 'p'; S.raceMode = 'h'; render('race');
  });

  /* x6 · NF1+NF2 — Windfall meta-only; raw Zèlèe never leaks */
  check('bir', 'Windfall ships meta-only (PHRF, scored, trackless); pre-override Zèlèe absent', () => {
    const w = D.boats['Windfall'];
    assert.ok(w, 'Windfall missing — PHRF band would be 22');
    assert.equal(w.meta.cls, 'PHRF');
    assert.ok(w.meta.corr && w.meta.el, 'Windfall must score in the PHRF band');
    assert.ok(!w.t || w.t.length === 0, 'Windfall must have no track');
    assert.ok(!D.boats['Zèlèe'], 'raw pre-override name leaked');
  });

  /* x7 · A12+R9 — the three act bands + hoverable event markers on every time chart */
  check('bir', 'acts: 3 labelled bands + hoverable event markers on dtf, race, sog AND the lane', () => {
    const fills = new Set(CFG.acts.map(a => a[3]));
    for (const id of ['dtf', 'race', 'sog', 'lane']) {
      const rects = (plots[id].layout.shapes || []).filter(s => s.type === 'rect' && fills.has(s.fillcolor));
      assert.equal(rects.length, 3, `${id}: ${rects.length} act bands`);
      const labels = (plots[id].layout.annotations || []).filter(a => /ACT [123]/.test(a.text || ''));
      assert.equal(labels.length, 3, `${id}: act labels missing`);
      assert.ok(plots[id].traces.some(t => t.hoverinfo === 'text' && t.mode === 'markers'),
        `${id}: no hoverable event-marker trace`);
    }
  });

  /* x8 · A8 — direction arrows: local-segment pairs, scaled to the selection */
  check('bir', 'map arrows: an (anchor,head) pair trace per selected boat, heads visible, anchors size 0', () => {
    const arrows = plots.map.traces.filter(t => t.marker && t.marker.symbol === 'arrow' && t.marker.angleref === 'previous');
    assert.ok(arrows.length >= 2, `expected arrow traces, got ${arrows.length}`);
    for (const a of arrows) {
      assert.ok(a.x.length >= 6 && a.x.length <= 12 && a.x.length % 2 === 0, `arrow trace ${a.x.length} pts`);
      for (let i = 0; i < a.marker.size.length; i += 2) {
        assert.equal(a.marker.size[i], 0, 'pair anchor must be invisible');
        assert.ok(a.marker.size[i + 1] > 0, 'pair head must be visible');
      }
    }
  });

  /* x9 · A13+A14 — starboard note east of the island; map fitted, not aspect-locked */
  check('bir', 'map: starboard annotation on the EAST side; lat range fitted (p1–p99, <1°), no scaleanchor', () => {
    const a = (plots.map.layout.annotations || []).find(x => /island to starboard/.test(x.text || ''));
    assert.ok(a, 'starboard rounding annotation missing');
    assert.ok(a.x > -71.578, `label at lon ${a.x} not east of the island`);
    const y = plots.map.layout.yaxis;
    assert.ok(!y.scaleanchor, 'map must not be aspect-locked');
    assert.ok(Array.isArray(y.range) && y.range[1] - y.range[0] < 1.0,
      `map lat span ${(y.range[1] - y.range[0]).toFixed(2)}° — outliers not clipped`);
  });

  /* x10 · R9b — Max default-on and drawn on first paint */
  check('bir', 'Max (PHRF chip extra) is default-selected and drawn', () => {
    assert.ok(S.boats.has('Max'), 'Max missing from the default selection');
    assert.ok(plots.sog.traces.some(t => t.name === 'Max'), 'Max selected but not drawn');
  });

  /* x11 · R9c — a category with no events gets no pill */
  check('bir', 'overlay pills: empty category loses its pill; Ghosts + Course line stay', () => {
    evalIn('window.__SAVED_EV = D.events; D.events = D.events.filter(e => e.cat !== "crew");');
    render('ev');
    const labels = getEl('overlays').children.map(c => c.innerHTML);
    assert.ok(!labels.some(l => /Crew$/.test(l)), 'Crew pill rendered with zero crew events');
    assert.ok(labels.some(l => /Ghosts/.test(l)) && labels.some(l => /Course line/.test(l)),
      'non-event pills must stay');
    evalIn('D.events = window.__SAVED_EV;');
    render('ev');
  });

  /* x12 · I17 — rating band: peers selected, defaults survive, PHRF never matches */
  check('bir', `ORC ToT band ±0.02 selects ${FIX.bir_bands.width_counts['0.02']} peers; defaults survive; band is ORC-only by construction`, () => {
    const setBand = evalIn('setBand'), filterTargets = evalIn('filterTargets');
    const t0 = D.boats[hero].meta.tcf;
    setBand(t0 - 0.02, t0 + 0.02, '0.02');
    const targets = filterTargets();
    assert.equal(targets.length, FIX.bir_bands.width_counts['0.02'], 'band count drifted');
    for (const nm of targets) {
      assert.ok(S.boats.has(nm), `${nm} in band but not selected`);
      assert.notEqual(D.boats[nm].meta.cls, 'PHRF', `${nm} is PHRF — bands crossed the rating scale`);
    }
    const added = targets.filter(nm => !CFG.defaults.boats.includes(nm));
    setBand(t0 - 0.02, t0 + 0.02, '0.02');   // same key toggles off
    for (const nm of CFG.defaults.boats) assert.ok(S.boats.has(nm), `${nm} default eaten by the filter (I17)`);
    for (const nm of added) assert.ok(!S.boats.has(nm), `${nm} lingered after band-off`);
  });

  /* x13 · R9f — SOG on the distance axis starts each boat at its own gun */
  check('bir', 'SOG distance axis: every line monotone (pre-start milling clipped)', () => {
    S.axis = 'd'; S.speedMetric = 'sog'; render('axis');
    for (const tr of plots.sog.traces.filter(t => t.mode === 'lines')) {
      for (let i = 1; i < tr.x.length; i++)
        assert.ok(tr.x[i] <= tr.x[i - 1] + 0.001,
          `${tr.name} SOG x doubles back at i=${i} (${tr.x[i - 1]} → ${tr.x[i]})`);
    }
  });

  /* x14 · A11 — lane geometry: distance-sailed x, ±6.5 y, rounding markers */
  check('bir', 'lane: x from 0 to the roundings (90–130 nm), y ±6.5, circle-open rounding markers', () => {
    const xr = plots.lane.layout.xaxis.range;
    assert.equal(xr[0], 0, 'lane x must start at 0 nm sailed');
    assert.ok(xr[1] > 90 && xr[1] < 130, `lane x max ${xr[1]} outside 90–130`);
    const yr = plots.lane.layout.yaxis.range;
    assert.equal(yr[0], -6.5); assert.equal(yr[1], 6.5);
    assert.ok(plots.lane.traces.some(t => t.marker && t.marker.symbol === 'circle-open'), 'no rounding markers');
  });

  /* x15 · I18 — course-referenced speed is VMC; VMG appears only in negation */
  check('bir', 'no VMG claim anywhere: y-titles, captions and footer only ever negate it', () => {
    S.speedMetric = 'vmc'; render('speed');
    const vmcTitle = plots.sog.layout.yaxis.title.text;
    S.speedMetric = 'sog'; render('speed');
    const sogTitle = plots.sog.layout.yaxis.title.text;
    const scrub = s => String(s).replace(/n(ever|ot|othing on this page is) VMG/g, '');
    for (const [where, text] of [
      ['vmc y-title', vmcTitle], ['sog y-title', sogTitle],
      ['sog note', getEl('sog_note').innerHTML],
      ['footer copy', evalIn('window.__COPY__.footer')],
      ['vmc caption slot', evalIn('window.__COPY__.sections.sog.noteVmc')],
    ])
      assert.ok(!scrub(text).includes('VMG'), `${where} claims VMG (tracker has no wind data)`);
  });
};
