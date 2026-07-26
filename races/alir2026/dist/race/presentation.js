/* ALIR 2026 presentation config — stage-2 MINIMUM-VIABLE authoring.
   Enough for the chain to build and the analysis to be read; the real
   presentation pass happens at stage 4. FACTS here must match config.yaml
   (shell/build.py consistency check). PRELIMINARY-SNAPSHOT build: data was
   captured mid-race (7 boats unscored); copy carries the provisional label
   until the owner's final-results re-fetch pass. */
window.__RACE_CONFIG__ = {
  meta: {
    title: 'ALIR 2026 — Around Long Island Regatta',
    url: 'https://hgq.fyi/max-around-long-island-2026/',   // PROPOSED slug — owner confirms at stage 5
    description: 'Around Long Island Regatta 2026 — 207 nm, NY Harbor to Hempstead Harbor. Fleet analysis.',
    ogDescription: 'ALIR 2026: two parks, one reach — 42 finishers (and counting) around Long Island.',
    ogImage: 'og.png',
  },
  hero: { name: 'Max', color: '#C2187E' },     // = config client_boat
  time: { utcOffset: -4, tzLabel: 'EDT' },
  course: {
    start: [40.7028, -74.0367], finish: [40.8619, -73.6603],   // = config.yaml course
    rhumbNm: 207.0,                       // official scoring distance (SI)
    dtfStartFallback: 205.8,              // routed polyline DTF at the start
    mapRange: { lon: [-74.20, -71.72], lat: [40.46, 41.31] },  // 2025 framing, same water
    startLabel: 'START — Ellis Island', finishLabel: 'FINISH — Sea Cliff',
    polyline: [                         // = config.yaml course.start + marks + finish (lockstep)
      [40.7028, -74.0367],
      [40.6060, -74.0450], [40.5281, -74.0094], [40.5500, -73.4000],
      [40.6400, -73.0500], [40.7700, -72.6000], [40.8600, -72.1000],
      [41.0600, -71.8450], [41.1680, -72.2150], [41.0500, -73.3500],
      [40.9250, -73.6250], [40.8619, -73.6603],
    ],
  },
  phases: [                               // PROPOSED at stage 2 from the natural-transition
                                          // ledger (owner directive: no clock windows) — DTF
                                          // bands anchored on the hero's boundary crossings
    [206, 194, 'HARBOR START'],           // Ellis Island line, the Narrows, Ambrose R"14"
    [194, 148, 'THE EVENING REACH'],      // the run east while Thursday's breeze lasted
    [148, 141, 'NIGHT ONE'],              // the dying gradient; the offshore decision window
    [141, 129, 'THE DAWN PARK'],          // Friday morning, waiting on the NE fill
    [129, 95, 'THE REBUILD'],             // sea breeze in, working the beach east
    [95, 66, 'MONTAUK & PLUM GUT'],       // the corner, Gardiners Bay, the Gut against the ebb
    [66, 48, 'THE SOUND NIGHT'],          // the second park; the side decision
    [48, 0, 'THE SATURDAY RUN'],          // the easterly rebuild down to Hempstead Harbor
  ],
  groups: {
    palette: {
      hero:        { label: 'Max',            colors: ['#C2187E'] },
      class9:      { label: 'Division 9',     colors: ['#0E8A8A', '#12A5A5', '#0B6D6D'] },
      orc0:        { label: 'ORC Division 0', colors: ['#D2691E', '#E0842F', '#B85A15', '#EDA054', '#9C4E12', '#F0B070'] },
      fleet_other: { label: 'Fleet',          colors: ['#7C8C9A', '#5F7484', '#93A3B1', '#6B8299'] },
      fleet_dnf:   { label: 'Retired',        colors: ['#9AA5AC'] },
    },
    quick: ['hero', 'class9', 'orc0'],
    chipExtras: ['Lioness', 'Abilyn'],    // Div 8 winner (night-2 counter-example) + DH winner
    dnfKey: 'fleet_dnf', outsideKey: '', fallbackKey: 'fleet_other',
    buttons: {                            // each a defensible comparison set (stage-0/2 judgment)
      'Division 9 — Max’s class': ['Max', 'Zammermoos', 'Poseidon', 'Katara56'],
      'ORC Division 0': ['Habiru YCC', 'Ohana', 'Della Aurora', 'Surface Tension', 'Imagine', 'Beagle'],
      'Night-1 water peers': ['Max', 'Katara56', 'Zammermoos', 'Lioness', 'Della Aurora', 'Crocodile', 'Beagle'],
      'Division winners': ['Zammermoos', 'Habiru YCC', 'Lioness', 'Abilyn', 'Golden-Eye', 'Mayhem', 'The Rover'],
    },
  },
  eventCategories: {},                    // events.yaml ships empty until the owner prunes the
                                          // internal draft (stage-0 stop decision); categories
                                          // land with the entries at stage 3/4
  defaults: {
    boats: ['Max', 'Zammermoos', 'Poseidon', 'Katara56', 'Habiru YCC', 'Lioness'],  // I7 core set
    ev: [], ref: 'Katara56',              // milestone-delta reference: the identical -18 rating
                                          // makes her the like-for-like benchmark (doctrine 5)
    fleet: true, rhumb: false,            // marks course — the chord misleads; courseline carries it
    overlays: {},
    raceMode: 'h', raceView: 'p', axis: 'd', speedMetric: 'vmc',
  },
  race: { height: '430px', milestoneTop: 200, milestoneBottom: 1, milestoneStep: 1,
          correctedModel: 'tod',   // PHRF time-on-distance for the mid-race corrected traces.
                                   // KNOWN LIMIT (stage-2 finding, owner decides at the stop):
                                   // the six ORC Division 0 boats score time-on-TIME; one global
                                   // model cannot fit both, so their MID-RACE corrected traces
                                   // render ~elapsed (ToD at 0.83-0.96 sec/mi subtracts almost
                                   // nothing) — up to ~4% high vs their true ToT corrected.
                                   // Endpoint values are exact (read from official results).
                                   // Options at the stop: per-boat model dispatch in the shell
                                   // (same 0<r<2 rule as scoring_alir.py) or an ORC caption.
          paceMinDone: 15, eventRowY: 19, ratingLabel: 'PHRF / ORC' },
  charts: {
    map: { heightScale: 0.75, legendBottom: true },   // 2025 owner preferences, same water
    dtf: { eventTopY: 200, height: '280px' },
    sog: { height: '340px', yRange: [0, 12], eventTopY: 11,   // fleet max SOG 10.0 kt
           metrics: { s: 'SOG', v: 'VMC (toward finish)' }, vmcYRange: [-3, 12] },
    xte: { eventTopY: 8, height: '340px' },
  },
  ratingBands: { widths: [15, 30] },      // hero-centred: ±15 covers exactly Division 9's
                                          // -24..-15 spread; ±30 adds nothing until PHRF 12
  distspeed: {
    isoDays: [1.75, 2.1, 2.45],           // elapsed 42/50.4/58.8 h — brackets 40:33..~59h scored
    isoDaysCorr: [1.75, 2.1, 2.45],       // corrected 39:56..~58h scored so far (provisional)
    toggle: { key: 'distMode', default: 'h',
              states: [{ v: 'e', label: 'Elapsed' }, { v: 'h', label: 'Corrected' }] },
  },
  kpis: [],                               // authored at the stage-2/3 stops from CONFIRMED
                                          // findings only — the memo proposes candidates
  mapLabels: [
    [196, 'AMBROSE R“14”', 28, 22],
    [95, 'MONTAUK', 30, -18],
    [70, 'PLUM GUT', -10, -26],
  ],
  controls: { pills: ['@ghosts'] },       // scored course always on (2025 owner decision)
  layout: ['map', 'dtf', 'race', '@distspeed', 'two:xte,sog'],   // no events section until
                                          // the owner-pruned events land (stage 3/4)
  modules: ['distspeed'],
  overlays: ['courseline'],
};
