/* Authored copy, machine form. SOURCE OF TRUTH: copy.md (same folder) — edit
   both together or not at all. Stage-2 MINIMUM-VIABLE set: factual slots only,
   provisional-labeled (mid-race data snapshot); narrative copy lands at
   stages 3-4 after the owner's stops. Microcopy proposed by the session;
   analysis claims deliberately absent until confirmed. */
window.__COPY__ = {
  titleblock: {
    eyebrow: 'Chart of the Race · 49th Around Long Island Regatta · July 23–26, 2026 · 207 NM',
    h1: '<span class="mag">Max</span> · Around Long Island 2026',
    sub: 'Ellis Island, under the Verrazzano, east to Montauk, through Plum Gut, down the Sound to Sea Cliff.',
    result: 'Provisional: 4th of 4, Spinnaker Division 9 — 42 of 53 starters scored when this data was captured (7 still racing; results not final).',
    tzn: 'All times EDT. Finish times verified against the tracker; see the notes for one open discrepancy.',
  },
  loading: 'Loading the race record…',
  noscript: 'This dashboard is interactive and needs JavaScript to draw its charts. The underlying data is plain JSON in <a href="data/core.json">data/core.json</a> if you\'d rather read it raw.',
  sections: {
    map:    { title: 'The course', note: 'The scored course is the routed 207 nm line; every government mark except Ambrose R“14” may be disregarded.' },
    dtf:    { title: 'The race', note: '' },
    race:   { title: 'Where the race was won and lost — vs <span id="refname" style="color:var(--magenta)"></span>' },
    xte:    { title: 'Distance from the course line', note: 'The south-shore spine is drafted from the sailed median, not marks — offsets here are position, not error.' },
    sog:    { title: 'Speed over ground', note: '', noteVmc: 'VMC is closing speed on the finish computed from positions — the tracker carries no wind, so this is not VMG.' },
    events: { title: 'Race log — every marked moment', note: '' },
  },
  race: { notes: { h: 'Corrected standings are division-scoped: PHRF divisions correct on time-on-distance; ORC Division 0 scores time-on-time and its mid-race traces here are approximate (endpoints exact).', e: '' } },
  sog: {},
  distspeed: {
    noteElapsed: 'Each dot is one boat: distance actually sailed against elapsed time. Rays are equal-finish-time guides.',
    noteCorrected: 'Same dots on corrected time — division-scoped; ORC and PHRF corrected times are not comparable across the boundary.',
    refLine: 'course · 207 nm',
    vsRef: 'vs the 207 nm scored course',
    xNote: 'distance sailed, nm',
  },
  controlsHint: 'Sets the x-axis on the offset, speed, and won-and-lost charts. <b>Distance</b> lines every boat up on the same water; <b>clock</b> shows what was happening when.',
  pills: { ghosts: 'Ghosts', rhumb: 'Direct line' },
  morePanel: { note: 'Tap any boat to add or remove it.', rankedHead: 'Ranked', dnfHead: 'Retired', otherHead: 'In progress / other' },
  emptyStates: { events: 'The race log ships after the crew-log review — nothing is public yet.' },
  footer: `<h3>How to read this</h3>
  <ul><li>PRELIMINARY BUILD: data captured 00:58 EDT July 26 while 7 boats were still racing; all results provisional pending protests and final scoring.</li>
  <li>Corrected times are division-scoped. PHRF divisions score time-on-distance at 207 nm; the new ORC Division 0 scores time-on-time. The two are never compared across the boundary.</li>
  <li>One open discrepancy: four official finish times (including Max&#8217;s) sit 8–68 minutes after each boat&#8217;s tracker reached the line; the race committee has been asked. Official values are used throughout.</li></ul>
  <h3>Sources &amp; method</h3>
  <ul><li>YB Tracking race alir26 (position history, decoded); YachtScoring event 50645 (entries, provisional results); Final 2026 ALIR SI (course, 207 nm, scoring).</li>
  <li>Weather evidence: NDBC observations, NOAA CO-OPS current predictions, archived HRRR/ECMWF forecasts via Open-Meteo (CC-BY 4.0) — evidence for the narrative only; no chart number depends on it.</li></ul>
  <div style="margin-top:10px;font-family:var(--mono);font-size:11px">Built from the race record · build 2026-07-26</div>`,
};
