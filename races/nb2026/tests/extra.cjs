/* NB2026 race-specific checks — the round-3 opinion layer (verdict cards,
   phase decomposition, lessons). The decomposition checks are DERIVATION
   checks, not new goldens: expected values are computed from the shipped
   payload's official times at test time (doctrine gate 5 — a decomposition
   must reconcile to the official delta), so no frozen number was added. */
'use strict';

module.exports = async ({ check, approx, assert, plots, evalIn, getEl, render, S, D, CFG, H, off }) => {
  const hero = CFG.hero.name;
  const officialGap = (ref, key) =>
    (H.parseDur(D.boats[hero].meta[key]) - H.parseDur(D.boats[ref].meta[key])) / 60;
  const barsTotal = () => plots.phasegap.traces[0].y.reduce((s, v) => s + (v ?? 0), 0);

  /* n1 · phasegap reconciles to the official margin in BOTH modes (gate 5) */
  check('nb', 'phase decomposition: bars sum to the official corrected AND elapsed margins', () => {
    const ref0 = S.ref;
    S.raceMode = 'h'; render('race');
    approx(barsTotal(), officialGap(ref0, 'corr'), 0.05, 'corrected bars must sum to the official corrected margin');
    S.raceMode = 'e'; render('race');
    approx(barsTotal(), officialGap(ref0, 'el'), 0.05, 'elapsed bars must sum to the official elapsed margin');
    S.raceMode = 'h'; render('race');
  });

  /* n2 · gate 5 is benchmark-dependent: the bars follow the reference select */
  check('nb', 'phase decomposition follows the reference (Gesture) and still reconciles', () => {
    const ref0 = S.ref;
    S.ref = 'Gesture'; render('race');
    approx(barsTotal(), officialGap('Gesture', 'corr'), 0.05, 'bars must reconcile vs the new reference');
    S.ref = ref0; render('race');
    approx(barsTotal(), officialGap(ref0, 'corr'), 0.05, 'bars must reconcile again after restoring');
  });

  /* n3 · verdict cards: every card cites an insight event that exists (copy
     discipline — the panel restates synthesized claims, it authors none) */
  check('nb', 'verdict: 5 cards rendered, each sourced to a real insight event', () => {
    const items = evalIn('window.__COPY__.verdict.items');
    assert.equal(items.length, 5, `${items.length} verdict items, want 5`);
    const rendered = (getEl('verdict').innerHTML.match(/border-left:3px solid/g) || []).length;
    assert.equal(rendered, 5, `rendered ${rendered} verdict cards, want 5`);
    const insightLabels = D.events.filter(e => e.cat === 'insight').map(e => e.label);
    for (const it of items)
      assert.ok(insightLabels.some(l => l.includes(it.src.replace('INSIGHT · ', ''))),
        `verdict card '${it.t}' cites '${it.src}' — no matching insight event`);
  });

  /* n4 · lessons: every cited timestamp exists in the race log */
  check('nb', 'lessons: every item cites a log timestamp that exists in D.events', () => {
    const groups = evalIn('window.__COPY__.lessons.groups');
    const html = getEl('lessons').innerHTML;
    // payload event times are epochs; cites are naive local strings (I1)
    const times = new Set(D.events.map(e => H.tzStr(e.t, off)));
    let n = 0;
    for (const g of groups) {
      assert.ok(html.includes(g.head), `lessons group '${g.head}' not rendered`);
      for (const it of g.items) {
        assert.ok(times.has(it.t), `lesson cites ${it.t} ('${it.cite}'), not in the race log`);
        n++;
      }
    }
    assert.ok(n >= 10, `only ${n} lessons — the logged set is 13`);
  });
};
