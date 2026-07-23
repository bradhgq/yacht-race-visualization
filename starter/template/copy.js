/* Authored copy, machine form. SOURCE OF TRUTH: copy.md (same folder) — edit
   both together or not at all. The shell reads window.__COPY__ at runtime;
   build.py injects the static slots (titleblock/footer) at build time. See
   races/nb2026/copy.js and races/bir2026/copy.js for the full worked slot
   sets. Microcopy may be proposed by a session; analysis claims may not. */
window.__COPY__ = {
  titleblock: {
    eyebrow: '',                 // 'Chart of the Race · <edition> · <dates> · <length> NM'
    h1: '<span class="mag"></span> · ',
    sub: '',
    result: '',                  // spans of official results — see worked examples
    tzn: '',                     // 'All times <TZ>. Finish verified against the tracker.'
  },
  loading: 'Loading the race record…',
  noscript: 'This dashboard is interactive and needs JavaScript to draw its charts. The underlying data is plain JSON in <a href="data/core.json">data/core.json</a> if you\'d rather read it raw.',
  sections: {
    map:    { title: 'The course', note: '' },
    dtf:    { title: 'The race', note: '' },
    race:   { title: 'Where the race was won and lost — vs <span id="refname" style="color:var(--magenta)"></span>' },
    xte:    { title: 'Distance from the rhumb line', note: '' },
    sog:    { title: 'Speed over ground', note: '', noteVmc: '' },   // noteVmc must negate VMG (I18)
    events: { title: 'Race log — every marked moment', note: '' },
  },
  race: { notes: { h: '', e: '' } },   // corrected|elapsed mode captions
  sog: {},                             // axisHint/axisHintNarrow when park shading exists
  // distspeed captions (shared shell module reads ctx.copy.distspeed):
  distspeed: { noteElapsed: '', noteCorrected: '', refLine: '', vsRef: '', xNote: '' },
  controlsHint: 'Sets the x-axis on the offset, speed, and won-and-lost charts. <b>Distance</b> lines every boat up on the same water; <b>clock</b> shows what was happening when.',
  pills: { ghosts: 'Ghosts', rhumb: 'Rhumb line' },
  morePanel: { note: 'Tap any boat to add or remove it.', rankedHead: 'Ranked', dnfHead: 'Retired', otherHead: 'Other' },
  emptyStates: { events: 'Every event category is off. Turn one on under “Boats &amp; overlays” to fill this log back in.' },
  footer: `<h3>How to read this</h3>
  <ul><li></li></ul>
  <h3>Sources &amp; method</h3>
  <ul><li></li></ul>
  <div style="margin-top:10px;font-family:var(--mono);font-size:11px">Built from the race record · build __BUILT__</div>`,
};
