#!/usr/bin/env node
/* Parameterized dashboard regression harness (I10 — tests gate the build).

     TZ=America/New_York node tests/test_dashboard.js <race_dir> [regression.json]

   Loads races/<race>/dist/standalone.html (self-contained: embedded data, no
   fetches), extracts its scripts, executes them in a vm sandbox with DOM and
   Plotly mocks, boots the app, and asserts the per-race fixtures across the
   four I10 categories:

     timezone       — tz probe renders naive-local under a non-UTC TZ; duration
                      round-trip; official start inside the start sequence
     exact-endpoint — race-chart final point == official corrected / elapsed /
                      pace deltas vs the reference (I2), asserted from the
                      RENDERED traces in all three mode combinations
     derived-metric — park module canary (I3) in payload AND rendered table;
                      finstrip renders every scored boat
     name-hygiene   — every selection surface (defaults, group buttons,
                      reference, fixture lists) exists in the data keys; plus
                      the DTF axis guard (time axis regardless of the shared
                      toggle — distance never plots on both axes)

   Assertion counts are fixed per category so a silently-skipped block fails
   loudly. Every human-caught defect lands here as a new assertion (prime rule 5).
*/
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const raceDir = path.resolve(process.argv[2] || '.');
const fixPath = process.argv[3] || path.join(raceDir, 'tests', 'regression.json');
const FIX = JSON.parse(fs.readFileSync(fixPath, 'utf8'));
const html = fs.readFileSync(path.join(raceDir, 'dist', 'standalone.html'), 'utf8');

/* ── minimal DOM mock ── */
class El {
  constructor(tag, id) {
    this.tagName = (tag || 'div').toUpperCase(); this.id = id || '';
    this.children = []; this.dataset = {}; this.style = {}; this.attrs = {};
    this.hidden = false; this.disabled = false; this.innerHTML = ''; this.textContent = '';
    this.value = ''; this.selected = false; this.type = '';
    const self = this;
    this.classList = {
      set: new Set(),
      add(...c) { c.forEach(x => this.set.add(x)); },
      remove(...c) { c.forEach(x => this.set.delete(x)); },
      toggle(c, force) { (force ?? !this.set.has(c)) ? this.set.add(c) : this.set.delete(c); },
      contains(c) { return this.set.has(c); },
    };
    // className writes replace the class set (shell uses both styles)
    Object.defineProperty(this, 'className', {
      get() { return [...self.classList.set].join(' '); },
      set(v) { self.classList.set = new Set(String(v).split(/\s+/).filter(Boolean)); },
    });
  }
  setAttribute(k, v) { this.attrs[k] = String(v); if (k.startsWith('data-')) this.dataset[k.slice(5)] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  removeAttribute(k) { delete this.attrs[k]; }
  appendChild(c) { this.children.push(c); return c; }
  remove() { this.removed = true; }
  focus() {}
  addEventListener() {}
  querySelector(sel) { return domQuery(this, sel)[0] || null; }
  querySelectorAll(sel) { return domQuery(this, sel); }
}
const byId = new Map();
function getEl(id) {
  if (!byId.has(id)) byId.set(id, new El('div', id));
  return byId.get(id);
}
// section scaffolds need child h2/.note/[data-mount] lookups; axisToggle needs buttons
function domQuery(root, sel) {
  if (sel === 'h2') return [root._h2 = root._h2 || new El('h2')];
  if (sel === '.note') return [root._note = root._note || new El('div')];
  if (sel === '[data-mount]') {
    // the mount div shares its id with the module (build.py emits <div id="<id>" data-mount>)
    return [getEl(root.id.replace(/^sec_/, ''))];
  }
  if (sel === '#axisToggle button') {
    if (!root._axbtns) root._axbtns = ['t', 'd'].map(ax => { const b = new El('button'); b.dataset.ax = ax; return b; });
    return root._axbtns;
  }
  if (sel === '.more-row' || sel === '.plot') return [];
  return [];
}

const domListeners = [];
const documentMock = {
  readyState: 'loading', hidden: false,
  body: new El('body'),
  getElementById: getEl,
  createElement: tag => new El(tag),
  addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') domListeners.push(fn); },
  querySelectorAll: sel => sel === '#axisToggle button' ? domQuery(getEl('axisToggle'), sel) : [],
};

/* ── Plotly mock: capture every react() call ── */
const plots = {};   // id -> {traces, layout}
const PlotlyMock = { react(id, traces, layout) { plots[id] = { traces, layout }; } };

/* ── sandbox ── */
const sandbox = {
  console, Date, Math, JSON, Set, Map, Promise, Object, Array, String, Number, RegExp, Error,
  setTimeout: fn => { fn(); return 1; }, clearTimeout: () => {},
  requestAnimationFrame: fn => { fn(); return 1; },
  document: documentMock,
};
sandbox.window = sandbox;
sandbox.window.Plotly = PlotlyMock;
sandbox.window.matchMedia = () => ({ matches: false });
sandbox.window.addEventListener = () => {};
sandbox.window.scrollY = 0;
vm.createContext(sandbox);

/* ── script extraction: every inline <script> except the Plotly vendor blob ── */
const scripts = [];
const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
let m;
while ((m = re.exec(html)) !== null) {
  if (/id="plotlyjs"/.test(m[1])) continue;
  scripts.push(m[2]);
}
assert.ok(scripts.length >= 10, `expected the standalone script set, got ${scripts.length}`);
for (const src of scripts) vm.runInContext(src, sandbox);

/* ── fixed-count test runner ── */
let passed = 0, failed = 0;
function check(category, name, fn) {
  try { fn(); passed++; console.log(`✔ [${category}] ${name}`); }
  catch (e) { failed++; console.error(`✘ [${category}] ${name}\n   ${e.message}`); }
}
const approx = (a, b, tol, msg) => assert.ok(Math.abs(a - b) < tol, `${msg}: ${a} !≈ ${b} (tol ${tol})`);

(async function main() {
  // boot: fire the captured DOMContentLoaded handlers, then drain microtasks
  documentMock.readyState = 'complete';
  for (const fn of domListeners) fn();
  await new Promise(r => setTimeout(r, 0));
  await null; await null; await null;

  // top-level const/let in classic scripts (S, render, …) live in the context's
  // global LEXICAL scope, not on window — reach them via evaluation
  const evalIn = expr => vm.runInContext(expr, sandbox);
  const CFG = sandbox.__RACE_CONFIG__;
  const D = sandbox.__DATA_EMBEDDED__;
  const S = evalIn('S');
  const render = evalIn('render');
  const off = CFG.time.utcOffset;
  const H = { tzStr: sandbox.tzStr, parseDur: sandbox.parseDur, startOf: sandbox.startOf };
  const hero = CFG.hero.name, ref = FIX.endpoints.ref;

  /* ── timezone ── */
  check('timezone', 'suite runs under an explicit TZ', () => {
    assert.ok(process.env.TZ, 'TZ must be set — CI pins America/New_York');
    if (process.env.TZ === 'UTC')
      console.warn('   note: under TZ=UTC double-shift bugs can hide; the canonical run is America/New_York');
  });
  check('timezone', `tz probe: tzStr(${FIX.tz_probe.epoch}) renders naive-local`, () => {
    assert.equal(H.tzStr(FIX.tz_probe.epoch, off), FIX.tz_probe.rendered);
  });
  check('timezone', 'duration round-trip + official start inside the start sequence', () => {
    assert.equal(H.parseDur(FIX.duration_roundtrip.str), FIX.duration_roundtrip.seconds);
    const start = H.startOf(D.boats[FIX.start_window.boat], off);
    const s = H.tzStr(start, off);
    assert.equal(s.slice(0, 10), FIX.start_window.date);
    const hm = s.slice(11);
    assert.ok(hm >= FIX.start_window.hm_min && hm <= FIX.start_window.hm_max, `start ${hm} outside the sequence`);
  });

  /* ── exact-endpoint (I2): read the RENDERED race-chart traces ── */
  const heroEndpoint = () => {
    const tr = plots.race.traces.find(t => t.name === hero);
    assert.ok(tr, `race chart has no ${hero} trace`);
    return tr.y[tr.y.length - 1];
  };
  const setState = (mode, view) => {
    S.raceMode = mode; S.raceView = view; render('race');
  };
  check('exact-endpoint', `corrected endpoint vs ${ref} = +${FIX.endpoints.corrected_min} min`, () => {
    assert.equal(S.ref, ref, 'default reference drifted');
    setState('h', 't');
    const v = heroEndpoint();
    approx(v, FIX.endpoints.corrected_min, 0.05, 'corrected endpoint');
    assert.ok(v > 0, 'endpoint sign flipped');
  });
  check('exact-endpoint', `elapsed endpoint = +${FIX.endpoints.elapsed_min} min`, () => {
    setState('e', 't');
    const v = heroEndpoint();
    approx(v, FIX.endpoints.elapsed_min, 0.05, 'elapsed endpoint');
    assert.ok(v > 0, 'endpoint sign flipped');
  });
  check('exact-endpoint', `pace endpoint = ${FIX.endpoints.pace_min_per_100} min/100nm`, () => {
    setState('h', 'p');
    approx(heroEndpoint(), FIX.endpoints.pace_min_per_100, 0.05, 'pace endpoint');
  });

  /* ── derived-metric (I3 + module canaries) ── */
  const park = FIX.module_canaries.park;
  check('derived-metric', `park canary: ${park.boat} u4 = ${park.u4}% (own-traversal, not wall-clock)`, () => {
    assert.equal(D.parkFair[park.boat].u4, park.u4);
    S.boats.add(park.boat); render('boats');
    const el = getEl('parkfair');
    assert.ok(new RegExp(`${park.boat}[\\s\\S]*?${park.u4}%`).test(el.innerHTML),
      'rendered park table does not show the canary');
  });
  check('derived-metric', `finstrip renders every scored boat (${FIX.finstrip_count})`, () => {
    const scored = Object.values(D.boats).filter(b => b.meta.corr).length;
    assert.equal(scored, FIX.finstrip_count, 'scored-boat count drifted');
    const [dots, diamond] = plots.finstrip.traces;
    assert.equal(dots.x.length + diamond.x.length, FIX.finstrip_count,
      'finstrip dots+diamond != scored boats');
  });

  /* ── name-hygiene (I4; every selection surface ⊆ data keys) ── */
  check('name-hygiene', 'fixture names present / dirty variants absent', () => {
    for (const nm of FIX.names_present) assert.ok(D.boats[nm], `${nm} missing from data keys`);
    for (const nm of FIX.names_absent) assert.ok(!D.boats[nm], `dirty name leaked: ${nm}`);
  });
  check('name-hygiene', 'every selection surface exists in the data keys', () => {
    const surfaces = [
      ['defaults.boats', CFG.defaults.boats],
      ['defaults.ref', [CFG.defaults.ref]],
      ['scoring probe/endpoint ref', [ref]],
      ...Object.entries(CFG.groups.buttons).map(([g, names]) => [`groups.buttons[${g}]`, names]),
    ];
    for (const [where, names] of surfaces)
      for (const nm of names)
        assert.ok(D.boats[nm], `${where}: '${nm}' not in data keys (the Zélée class of bug)`);
  });
  check('name-hygiene', 'DTF chart stays clock-based under the distance toggle (no distance on both axes)', () => {
    S.axis = 'd'; render('axis'); render('ev');   // ev scope rebuilds dtf
    assert.equal(plots.dtf.layout.xaxis.type, 'date', 'dtf x-axis lost its date type');
    const x0 = plots.dtf.traces[0].x[0];
    assert.match(String(x0), /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
      `dtf x-values must be naive local strings, got ${x0}`);
  });

  const EXPECTED = 11;   // fixed: a silently-skipped block must fail loudly
  console.log(`\n${passed} passed, ${failed} failed (of ${EXPECTED})`);
  if (failed || passed + failed !== EXPECTED) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
