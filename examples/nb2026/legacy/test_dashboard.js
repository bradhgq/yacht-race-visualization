#!/usr/bin/env node
/* test_dashboard.js — regression harness for the race dashboard.
 *
 * Runs the assembled dashboard's <script> in Node with a mocked DOM + Plotly,
 * then asserts golden numbers. Run under a NON-UTC timezone to catch the
 * classic double-shift bug:
 *
 *     TZ=America/New_York node test_dashboard.js [path/to/built.html]
 *
 * Golden values below are for RAGANA / Newport Bermuda 2026. For a new race,
 * regenerate the goldens from official results and one hand-verified probe,
 * then keep them frozen. Every bug a human catches during iteration should
 * become a new assertion here.
 */
const fs = require('fs');
const path = process.argv[2] || 'ragana_nb2026_dashboard.html';
const html = fs.readFileSync(path, 'utf8');

/* ── extract the data block and the app code ── */
const blocks = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const dataJson = blocks.find(b => b.trim().startsWith('{'));
const code = blocks[blocks.length - 1];

/* ── minimal DOM + Plotly mocks ── */
const els = {};
const mkEl = () => ({ textContent:'', innerHTML:'', style:{}, className:'', title:'', dataset:{},
  classList:{ toggle(){}, add(){}, remove(){} }, setAttribute(){}, appendChild(){},
  onclick:null, onchange:null, value:'', querySelectorAll:()=>({ forEach:()=>{} }) });
global.document = {
  getElementById: id => { if (id === 'DATA') return { textContent: dataJson.replace(/<\\\//g, '</') };
    els[id] = els[id] || mkEl(); return els[id]; },
  createElement: () => mkEl(),
  querySelectorAll: () => ({ forEach: () => {} })
};
let calls = [];
global.Plotly = { react: (id, tr, lay) => calls.push({ id, tr, lay }) };

/* ── assertion helpers ── */
let failures = 0;
const ok = (cond, label) => { console.log((cond ? 'PASS' : 'FAIL') + '  ' + label); if (!cond) failures++; };
const approx = (a, b, tol=0.15) => Math.abs(a - b) <= tol;

/* ── GOLDEN VALUES (RAGANA / NB2026 — replace per race) ── */
const GOLD = {
  tzProbeEpoch: 1782094500, tzProbeStr: '2026-06-21 22:15',   // RAGANA enters park zone, EDT
  ref: 'Christopher Dragon',
  correctedEndpointMin: 94.0,     // RAGANA vs ref, official corrected delta
  elapsedEndpointMin: 155.3,      // RAGANA vs ref, official elapsed delta
  paceEndpointMinPer100: 14.8,    // corrected delta / 635.1 nm * 100
  parkBoat: 'Gemini II', parkU4: '31%',   // the fixed-window bug's canary
  finstripDots: 81                 // scored SDL boats minus RAGANA
};

/* ── run the app, then probe ── */
const driver = `
  ok(edtStr(${GOLD.tzProbeEpoch}) === '${GOLD.tzProbeStr}',
     'timezone-naive rendering (run under TZ=America/New_York)');
  ok(calls.some(c=>c.id==='race') && calls.some(c=>c.id==='map') && calls.some(c=>c.id==='dtf'),
     'initial render produced core charts');

  // exact official endpoints, both scoring modes (default view is Pace)
  S.ref='${GOLD.ref}'; S.raceMode='h'; S.raceView='p'; calls.length=0; buildRace();
  let rag = calls.find(c=>c.id==='race').tr.find(t=>t.name==='RAGANA');
  ok(approx(rag.y[rag.y.length-1], ${GOLD.paceEndpointMinPer100}), 'pace endpoint = official corrected / course nm');
  S.raceView='t'; calls.length=0; buildRace();
  rag = calls.find(c=>c.id==='race').tr.find(t=>t.name==='RAGANA');
  ok(approx(rag.y[rag.y.length-1], ${GOLD.correctedEndpointMin}), 'corrected endpoint exact from official results');
  S.raceMode='e'; calls.length=0; buildRace();
  rag = calls.find(c=>c.id==='race').tr.find(t=>t.name==='RAGANA');
  ok(approx(rag.y[rag.y.length-1], ${GOLD.elapsedEndpointMin}), 'elapsed endpoint exact from official results');

  // spatial park metric canary (the wall-clock-window bug)
  buildParkTable();
  const pt = els['parktable'].innerHTML;
  ok(pt.includes('${GOLD.parkBoat}') ? pt.includes('${GOLD.parkU4}') : true,
     'park table uses per-boat traversal (canary: ${GOLD.parkBoat} ${GOLD.parkU4})');

  // DTF chart must never plot distance on both axes (y=x collapse)
  calls.length=0; S.axis='d'; buildDTF();
  const cd = calls.find(c=>c.id==='dtf').tr.find(t=>t.name && t.name!=='RAGANA');
  ok(typeof cd.x[0] === 'string', 'DTF chart stays time-based under distance axis toggle');

  // finish strip present with full scored fleet
  calls.length=0; buildFinStrip();
  const fin = calls.find(c=>c.id==='finstrip');
  ok(fin && fin.tr[0].x.length === ${GOLD.finstripDots}, 'finish strip has all scored boats');

  // name normalization: default selections resolve to real data keys
  ok([...S.boats].every(nm => D.boats[nm]), 'all default boat selections exist in data (whitespace/diacritics)');
`;
try {
  new Function('ok','approx','calls','els', code + driver)(ok, approx, calls, els);
} catch (e) {
  console.log('FAIL  runtime error: ' + e.message);
  failures++;
}
console.log(failures ? `\n${failures} failure(s)` : '\nall green');
process.exit(failures ? 1 : 0);
