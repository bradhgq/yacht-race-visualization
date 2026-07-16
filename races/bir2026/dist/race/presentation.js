/* BIR2026 presentation config — the monolith's (b)-column values through the
   shell, verbatim where the monolith had them (refs are src/app.js lines at
   bir2026-monolith-final). Facts shared with config.yaml must match it
   (shell/build.py consistency check). Narrative copy: copy.js/copy.md; the
   race-unique charts live in modules/ + overlays/.

   Config decisions logged for the STOP-2 review:
   - classFilter OMITTED: two named divisions (ORC/PHRF) are already one-click
     group buttons; the numeric class-input model doesn't fit non-numeric
     division names. ratingBands kept — ORC ToT is a continuous scale and the
     hero-centred band is numerically ORC-only by construction (PHRF ratings
     are 90+ sec/mi and never fall in a ±0.05 window around 0.9425).
   - group-button name lists are STATIC, generated from the frozen oracle
     (monolith computed them at runtime); 'All ORC' now includes Inisharon
     (ORC DNF with a track) per the class-selection-includes-DNF decision. */
window.__RACE_CONFIG__ = {
  meta: {
    title: 'Ragana · Block Island Race 2026 · Race Analysis',
    url: 'https://hgq.fyi/ragana-block-island-2026/',
    description: "A crew's-eye reconstruction of Ragana's 79th Storm Trysail Club Block Island Race — 58 boat tracks, the leg out to Block Island, the rounding and the run home, and where the race was won and lost. 9/9 Class 6 ORC.",
    ogDescription: "A crew's-eye reconstruction of the 79th Block Island Race from the YB tracker and official results — 9/9 Class 6 ORC, +4:36:04 corrected behind the class winner.",
    twitterDescription: "A crew's-eye reconstruction of the 79th Block Island Race from the YB tracker and official results.",
    ogImage: 'og.png',
  },
  hero: { name: 'Ragana', color: '#C2187E' },
  time: { utcOffset: -4, tzLabel: 'EDT' },
  course: {
    start: [41.0005, -73.5238], finish: [41.0153, -73.536],
    rhumbNm: 186.0,                      // official course length
    dtfStartFallback: 188.7,             // routed polyline DTF at the start (app.js:24)
    startLabel: 'Start', finishLabel: 'Finish',
  },
  // three-act structure (app.js ACTS_DEF) — drawn by overlays/acts.js on every
  // time chart and mapped into the lane module's own x-space
  acts: [
    ['2026-05-22 12:35', '2026-05-22 20:35', 'ACT 1 · OUT', 'rgba(78,121,167,0.06)'],
    ['2026-05-22 20:35', '2026-05-23 09:09', 'ACT 2 · SOUND → BLOCK ISLAND', 'rgba(125,60,152,0.06)'],
    ['2026-05-23 09:09', '2026-05-24 02:05', 'ACT 3 · ROUNDING & HOME', 'rgba(194,24,126,0.06)'],
  ],
  phases: [],                            // acts replace DTF-based phase bands
  groups: {                              // app.js:44-51
    palette: {
      hero:        { label: 'Ragana', colors: ['#C2187E'] },
      class6:      { label: 'Class 6 ORC', colors: ['#0E7C7B', '#159B95', '#3FBDB4', '#C1550C', '#E0891B', '#D9A017', '#8C3B1E', '#7D3C98'] },
      orc_other:   { label: 'ORC', colors: ['#4A6B7A', '#6E8B98', '#5C7D8C', '#3F5C69', '#547182', '#6B87A0'] },
      phrf:        { label: 'PHRF', colors: ['#A9885F', '#B79B77', '#8F7048', '#C2A67F', '#9C8258'] },
      fleet_dnf:   { label: 'Retired', colors: ['#9AA5AC'] },
      fleet_other: { label: 'Fleet', colors: ['#4A6B7A', '#6E8B98', '#8DA5AF', '#5C7D8C'] },
    },
    quick: ['hero', 'class6'],
    chipExtras: ['Young American', 'Max', 'Loki', 'Banter', 'Touch of Grey', 'Full Tilt'],   // app.js:66
    chipRank: 'clsPos',                  // chips tag the in-class finish, not overall
    dnfKey: 'fleet_dnf', outsideKey: 'phrf', fallbackKey: 'fleet_other',
    by_name_class6: ['Christopher Dragon XII', 'In Theory', 'Groupe 5', 'SqueeZeplay',
                     'Save the Sound', 'Zélée', 'Sleeper', 'Blue Skies'],
    buttons: {                           // static lists generated from the frozen oracle
      'Class 6 ORC': ['Christopher Dragon XII', 'In Theory', 'Groupe 5', 'SqueeZeplay',
                      'Save the Sound', 'Zélée', 'Sleeper', 'Blue Skies'],
      'All ORC': ['Thin Man', 'Abilyn', 'Stratos', 'Eventyr', 'Velocity2', 'Christopher Dragon XII',
                  'In Theory', 'Groupe 5', 'SqueeZeplay', 'Save the Sound', 'Zélée', 'Sleeper',
                  'Blue Skies', 'Inisharon', 'Loki', 'Zig Zag', 'Quickdraw', 'Skye', 'Alibi',
                  'Dire Wolf', 'Banter', 'Palantir 5', 'ARMA', 'Phantom', 'Cool Breeze', 'Habiru',
                  'Touch of Grey', 'Cougar', 'Rocksteady', 'Fortissimo', 'Katara56', 'OC-86',
                  'Temptation/Oakcliff', 'Lucky'],
      'All PHRF': ['Young American', 'Sunny Side', 'Midnight Rider', 'Cathexis', 'Co-Conspirator',
                   'Tacktile', 'Full Tilt', 'Duet', 'Charlotte', 'Flying Lady', 'Madison', 'Speck',
                   'Elan', 'Blitzen', 'Lioness', 'Summer Grace', 'Fireball', 'Comet', 'Scylla',
                   'Oakcliff Farr 40 Blue', 'Oakcliff Farr 40 Red', 'Max', 'Windfall'],
      'Bermuda boats': ['Banter', 'Touch of Grey', 'Zélée'],
    },
  },
  eventCategories: {                     // app.js:54-59 — ONE label per category (R9d):
    crew:      { c: '#B9770E', sym: 'circle', label: 'Crew' },           // chips, table and
    systems:   { c: '#C0392B', sym: 'x', label: 'Systems' },             // hovers share these
    sail:      { c: '#0E5A8A', sym: 'triangle-up', label: 'Sails' },     // strings verbatim
    tactics:   { c: '#7D3C98', sym: 'diamond', label: 'Tactics' },
    insight:   { c: '#C2187E', sym: 'star-diamond', label: 'Insights', big: true },
    milestone: { c: '#17293A', sym: 'star', label: 'Milestones', big: true },
  },
  defaults: {                            // app.js:67-72
    boats: ['Ragana', 'Christopher Dragon XII', 'In Theory', 'Groupe 5', 'Max'],
    ev: ['milestone', 'systems', 'tactics', 'sail', 'insight', 'crew'],
    ref: 'Christopher Dragon XII',
    fleet: true, rhumb: true,
    overlays: { acts: true, arrows: true },
    raceMode: 'h', raceView: 'p', axis: 'd', speedMetric: 'vmc',
  },
  race: {
    milestoneTop: 180, milestoneBottom: 10, milestoneStep: 10,   // app.js:487
    paceMinDone: 20,                                             // app.js:507 (done > 20)
    startAnchor: 188.7,                                          // R9e: gap is 0 at the gun
    divisionScoped: true,                                        // A2: corrected never crosses divisions
    crossCourse: ['Lucky'],                                      // Cows-finish variant: never compared
    eventRowY: 19, ratingLabel: 'TCF',
  },
  charts: {
    dtf: { eventTopY: 183 },                                     // no yRange -> rangemode tozero
    sog: { yRange: [0, 11], eventTopY: 10.4,
           clipPreStart: '2026-05-22 12:05',                     // R9f own-gun distance start
           metrics: { s: 'SOG', v: 'VMC (toward finish)' },
           vmcYRange: [-4, 11] },
    xte: { eventTopY: 5,                                         // shell xte: routed active-leg offset
           yTitle: 'nm port (+) / starboard (−) of the active leg' },
    map: {
      hoverCls: true, hideLegend: true,
      heightScale: 0.75,                 // owner (2026-07-15): course chart ~25% less vertical space
      ghostStyles: { ORC: { color: '#C0CDD6' }, PHRF: { color: '#C9BCA9', dash: 'dot' },
                     default: { color: '#C0CDD6' } },
      ghostDefaultCls: 'ORC',
      fitRange: { lonHiPadX: 4, lonHiFloor: -71.33, latHiPadX: 2, latHiFloor: 41.285 },
    },
  },
  distspeed: {                           // promoted shell module; iso rays v = d/t
    isoDays: [1.4, 1.6, 1.8],            // elapsed 33.6 / 38.4 / 43.2 h
    isoDaysCorr: [1.3, 1.5, 1.7],        // corrected times compress under ToT
    toggle: { key: 'distMode', default: 'h',
              states: [{ v: 'e', label: 'Elapsed' }, { v: 'h', label: 'Corrected' }] },
  },
  lane: {                                // modules/lane.js geometry (app.js:617)
    from: [41.0005, -73.5238], to: [41.262, -71.587], ringCenter: [41.168, -71.578],
  },
  ratingBands: { widths: [0.01, 0.02, 0.05] },   // hero-centred ORC ToT (0.9425); PHRF never matches numerically
  kpis: [                                // app.js renderKPIs, monolith order
    { label: 'Upwind vs CD XII', value: '+4.7 nm', sub: 'extra distance to Block Island' },
    { label: 'Corrected vs winner', value: '+4:36:04', sub: 'Christopher Dragon XII' },
    { label: 'Ragana sailed', value: '{stats.sailed_ragana} nm', sub: 'course line 188.7 nm' },
    { label: 'Average speed', value: '{stats.avg_sog} kt', sub: 'max {stats.max_sog} kt' },
    { label: 'Class 6 ORC', value: '9 / 9', sub: '31 / 33 ORC division' },
  ],
  mapLabels: [],
  mapAnnotations: [                      // geo labels + the r6 starboard-rounding note
    { x: -72.045, y: 41.27, text: 'The Race', showarrow: false,
      font: { size: 10, color: '#51677A', family: 'SF Mono, Menlo, monospace' }, bgcolor: 'rgba(253,254,253,.75)' },
    { x: -72.215, y: 41.105, text: 'Plum Gut', showarrow: false,
      font: { size: 10, color: '#51677A', family: 'SF Mono, Menlo, monospace' }, bgcolor: 'rgba(253,254,253,.75)' },
    { x: -71.60, y: 41.30, text: 'Block Island', showarrow: false,
      font: { size: 10, color: '#51677A', family: 'SF Mono, Menlo, monospace' }, bgcolor: 'rgba(253,254,253,.75)' },
    { x: -71.505, y: 41.118, text: 'Southeast Light', showarrow: false,
      font: { size: 10, color: '#51677A', family: 'SF Mono, Menlo, monospace' }, bgcolor: 'rgba(253,254,253,.75)' },
    { x: -71.875, y: 41.045, text: 'Montauk Pt', showarrow: false,
      font: { size: 10, color: '#51677A', family: 'SF Mono, Menlo, monospace' }, bgcolor: 'rgba(253,254,253,.75)' },
    { x: -71.49, y: 41.21, ax: -71.36, ay: 41.247, xref: 'x', yref: 'y', axref: 'x', ayref: 'y',
      showarrow: true, arrowhead: 2, arrowsize: 1.1, arrowwidth: 1.4, arrowcolor: '#7D3C98',
      text: 'island to starboard<br>down the east side', xanchor: 'right',
      font: { size: 9.5, color: '#7D3C98', family: 'SF Mono, Menlo, monospace' }, bgcolor: 'rgba(253,254,253,.85)' },
  ],
  controls: { pills: ['@ghosts', '@rhumb'] },   // acts + arrows are pill-less, always on
  layout: ['map', 'dtf', 'race', '@upwind', '@finstrip', '@lane', '@distspeed', 'xte', 'sog', 'events'],
  modules: ['upwind', 'finstrip', 'lane', 'distspeed'],
  overlays: ['acts', 'arrows'],
};
