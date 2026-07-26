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
    result: 'PHRF Spinnaker Division 9: 4th of 4 \u00b7 elapsed 46:02:18 (amended by the race committee) \u00b7 45 finishers, 7 retired. Results labeled preliminary by the organizer.',
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
  theses: [   // the stated opinions (stage-3/4; each verified in the charts below, in order)
    { h: 'The race was decided in the transitions, not in the breeze.',
      txt: 'Max was the fastest boat in her own water on the reach and again from the rebuild to Plum Gut — and last or nearly last among her neighbors in all three light-air phases. The 171 minutes to Katara56 concentrate almost entirely in two windows: the Friday dawn transition and the Sound night.' },
    { h: 'Night one\u2019s half-commitment set the bill; dawn presented it.',
      txt: 'Katara56 committed nine-plus miles offshore between 23:00 and 02:00; Max went halfway and jibed back. The fleet\u2019s worst lane that night was the seam near five miles off \u2014 between the land breeze inshore and the gradient offshore \u2014 and Max and Beagle sailed the night almost exactly on it.' },
    { h: 'Plum Gut repriced the fleet \u2014 and the debated question wasn\u2019t the decisive one.',
      txt: 'The 18:10\u201318:30 group carried a knot of fair flood through the Gut; Max arrived 20:35, into the ebb; the boats behind paid up to its \u22122.4 kt peak. From there Saturday\u2019s easterly reached the leaders first and the gap compounded. Which Sound shore to favor \u2014 the call debated aboard \u2014 shows no measurable effect once entry time is controlled.' },
    { h: 'The boat is two boats.',
      txt: 'No boat in the fleet changes character between wind bands like a Pogo 50: fourth of 49 for miles made in the powered phases \u2014 behind only the three biggest boats \u2014 and thirty-fifth in the light ones, a 31-place swing and the largest in the race. Physics shares every light-air bill with navigation.' },
    { h: 'The models split, and each was half right.',
      txt: 'Thursday evening\u2019s HRRR had the dawn northeaster\u2019s direction and timing nearly right and over-called its pressure by roughly sixty percent; ECMWF had the pressure right and lost the direction. Both missed the western Sound\u2019s collapse. When models disagree on the variable you would act on, the disagreement is the forecast. (Archived-forecast evidence, labeled in the last chart.)' },
  ],
  controlsHint: 'Sets the x-axis on the offset, speed, and won-and-lost charts. <b>Distance</b> lines every boat up on the same water; <b>clock</b> shows what was happening when.',
  pills: { ghosts: 'Ghosts', rhumb: 'Direct line' },
  morePanel: { note: 'Tap any boat to add or remove it.', rankedHead: 'Ranked', dnfHead: 'Retired', otherHead: 'In progress / other' },
  emptyStates: { events: 'The race log ships after the crew-log review — nothing is public yet.' },
  footer: `<h3>How to read this</h3>
  <ul><li>Data captured 10:00 EDT July 26 with every Around-Long-Island boat resolved (45 finishers, 6 retired); the organizer still labels results preliminary. Nomad (Around-the-Islands course \u2014 a different course around Block Island) is out of scope and unscored.</li>
  <li>Corrected times are division-scoped. PHRF divisions score time-on-distance at 207 nm; the new ORC Division 0 scores time-on-time. The two are never compared across the boundary.</li>
  <li>Finish-time note: Max&#8217;s official finish was amended by the race committee to 11:57:18 — six seconds from her tracker&#8217;s line marker — after this project&#8217;s query. Three other boats&#8217; official times still sit 8–68 minutes after their tracker line-crossings; official values are used throughout.</li></ul>
  <h3>Sources &amp; method</h3>
  <ul><li>YB Tracking race alir26 (position history, decoded); YachtScoring event 50645 (entries, provisional results); Final 2026 ALIR SI (course, 207 nm, scoring).</li>
  <li>Weather evidence: NDBC observations, NOAA CO-OPS current predictions, archived HRRR/ECMWF forecasts via Open-Meteo (CC-BY 4.0) — evidence for the narrative only; no chart number depends on it.</li></ul>
  <div style="margin-top:10px;font-family:var(--mono);font-size:11px">Built from the race record · build __BUILT__</div>`,
};
