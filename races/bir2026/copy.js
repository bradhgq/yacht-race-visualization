/* BIR2026 authored copy, machine form. SOURCE OF TRUTH: docs/copy.md holds the
   R-round approved narrative; the strings here are the monolith src/index.html
   blocks verbatim (title block, section notes, footer) plus shell-required
   microcopy slots (marked NEW — microcopy only, no analysis claims; every
   set-dependent number stays scoped to what its section displays). Module
   section notes live in modules/<id>.js per the ABI. */
window.__COPY__ = {
  titleblock: {
    eyebrow: 'Chart of the Race · 79th Storm Trysail Club Block Island Race · 22–24 May 2026 · 186 NM',
    h1: '<span class="mag">Ragana</span> · Block Island Race 2026',
    sub: 'a crew’s-eye reconstruction of the race from the YB tracker and official results — the leg out, the rounding, and the run home',
    result: '<span>Class 6 ORC <b>9 / 9</b></span><span>ORC division <b>31 / 33</b></span>' +
      '<span>Elapsed <b>37:29:49</b></span><span>Corrected <b>35:20:27</b></span>' +
      '<span>vs Christopher Dragon XII <b>+4:36:04</b> corrected</span>',
    tzn: 'All times EDT (UTC−4). Finish 02:04:49 Sunday verified against the tracker.',
  },
  loading: 'Loading the race record — 58 boat tracks, the leg out, the rounding, and the run home…',
  noscript: 'This dashboard is interactive and needs JavaScript to draw its charts. The underlying data is plain JSON in <a href="data/core.json">data/core.json</a> if you\'d rather read it raw.',
  sections: {
    map: { title: 'The course',
      note: "Every selected boat's track around the 186-nm Block Island Course — out of Long Island Sound, around Block Island <b>leaving it to starboard</b> — up the north side, down the east side past Southeast Light, and back (the arrows on each track show direction of travel). Back to Stamford. Positions are exact but the aspect isn't to scale. Ghost tracks are the whole fleet, tinted <b>and dashed</b> by division: <span style=\"color:#7E97A6\">━ ORC</span> / <span style=\"color:#B49A7E\">┅ PHRF</span>. Hover — or tap — anything." },
    dtf: { title: 'The race',
      note: 'The whole race at a glance — distance still to sail, one line per boat, divided into the three phases used throughout. Steeper is faster. The flat spot late Saturday night on <span class="mag">Ragana</span>\'s line is the broach.' },
    race: { title: 'Where the race was won and lost — vs <span id="refname" style="color:var(--magenta)"></span>' },
    xte: { title: 'Offset from the course line',   // NEW (shell chart, microcopy): routed active-leg XTE
      note: 'Signed offset from the ACTIVE leg of the routed course line — the leg re-references at each mark, so a step at a rounding is expected and correct. Positive is the port side of the leg direction. Complements the upwind-lane chart above, which uses a fixed start → 1BI reference on a distance-sailed axis.' },
    sog: { title: 'Speed over ground',
      note: '30-minute smoothed GPS speed. Switch the axis to <b>distance</b> to line every boat up on the same stretch of water. The sharp collapse to under a knot late Saturday night on <span class="mag">Ragana</span>\'s line — from 8.5 knots to 0.7 in five minutes — is the broach and emergency douse; it took about fifteen minutes to rebuild speed.',
      noteVmc: '<b>VMC — velocity made good on course</b>, the rate the boat closes distance-to-finish along the routed course line (never VMG: the tracker carries no wind data). Negative values are real — a boat beating away from the course line, or the rounding itself, reads briefly negative. Expect legitimate VMC noise near the Block Island rounding, where the routed line turns under the fleet.' },
    events: { title: 'Race log — every marked moment',
      note: 'Ragana\'s tracked story, from the start to the finish at 02:04:49 Sunday. Times are local EDT. Reconstructed times are marked in the notes; the broach and douse timestamps were corrected against the track.' },
  },
  race: {
    notes: {
      h: 'Each line is a boat\'s corrected time minus the reference\'s, anchored at zero at the gun. Below zero is ahead. <b>Pace</b> divides by miles completed (min per 100 nm) so early and late phases read on the same scale; <b>Total</b> shows raw cumulative minutes with exact official endpoints at the finish.',
      e: 'Each line is a boat\'s elapsed time minus the reference\'s — raw boat-for-boat position on the water, no handicap. Anchored at zero at the gun; below zero is ahead. Switch to <b>Total</b> for exact official endpoints at the finish.',
    },
    // appended when division scoping hides selected boats ({n}/{s}/{cls} slots)
    noteDivision: '<b>{n} selected boat{s} hidden</b> — corrected times are never compared across scoring divisions ({cls} reference); switch to Elapsed for boat-for-boat.',
  },
  sog: {},
  controlsHint: 'Sets the x-axis on the offset and speed charts. <b>Distance</b> lines every boat up on the same water; <b>clock</b> shows what was happening when.',
  pills: { ghosts: 'Ghosts', rhumb: 'Course line' },
  filters: {   // NEW (shell filter row, microcopy)
    bandChip: '±{w} ({n})', bandCustomLabel: 'custom', bandApply: 'set',
    bandTitle: 'ORC ToT band around Ragana (0.9425) — true rating peers. PHRF ratings live on a different scale and never match numerically.',
  },
  morePanel: {   // NEW (shell more-panel, microcopy)
    note: 'Tap any boat to add or remove it. Ranked by overall corrected place; ORC and PHRF are scored separately.',
    rankedHead: 'Finishers', dnfHead: 'Retired', otherHead: 'PHRF division',
  },
  emptyStates: {
    events: 'Every event category is off. Turn one on under “Boats &amp; overlays” to fill this log back in.',
  },
  footer: `<h3>How to read this</h3>
  <ul>
    <li><b>The race chart</b> plots, at each 10-nm distance-to-finish milestone, one boat's time minus a reference boat's — negative means ahead. <b>Corrected</b> applies each boat's ORC time-on-time handicap; <b>elapsed</b> is raw boat-for-boat. Endpoints at the finish are exact from official results; the points between are tracker estimates. All boats compared share the 12:35 Class 6 start except Young American (12:05, offset removed).</li>
    <li><b>The 4.7-nm figure</b> is measured on the cleaned raw tracks as distance sailed from the start to each boat's first Block Island rounding, and reproduces Francois's slide measurement exactly. Over the whole race window Ragana sailed +4.9 nm more than Christopher Dragon XII — the upwind leg was effectively the entire distance penalty — worth ≈53 minutes of the 276-minute corrected gap. The rest was pace.</li>
    <li><b>Data cleaning:</b> 16 phantom position fixes (a simultaneous tracker artifact at Fri 20:00 EDT that teleported ~15 boats to a bogus position near Block Island, plus one triple on Midnight Rider) were removed under a documented rule before any numbers were computed. Post-finish tracker movement (trackers driven home by car at 25–60 kt) is trimmed at each boat's official finish.</li>
    <li><b>Divisions:</b> ORC and PHRF corrected times come from different rating systems and are never compared to each other anywhere on this page; Lucky's Cows-finish course is a different course and is excluded from corrected comparisons.</li>
    <li><b>VMC</b> (the speed chart's second metric) is velocity made good on course — the closing rate of routed distance-to-finish. The tracker carries no wind data, so nothing on this page is VMG.</li>
    <li><b>Weather note:</b> a relayed report of ~35-kt gusts Saturday night could not be verified — the Long Island Sound wind buoys were inactive for the race window. The breeze and sea clearly built sharply; the specific speed is an unconfirmed second-hand figure and is not asserted here.</li>
    <li><b>Sources:</b> YB Tracking export (53,638 positions, 58 boats, ~1-min interval); official YachtScoring results; the 2026 Sailing Instructions; Storm Trysail Club's official race report. Speed is derived from position over a centered 30-min window; distance-to-finish is routed along the ordered course line. Race timing verified EDT against six boats' official finishes.</li>
  </ul>
  <div style="margin-top:10px;font-family:var(--mono);font-size:11px">Built from the 2026 race record · times EDT (UTC−4) · build __BUILT__</div>`,
};
