# BIR 2026 — further work

Owner-facing backlog, split per Brad's ask (2026-07-09): visual improvements and
deeper research integration. Nothing here changes a shipped analysis number
without a new checkpoint (prime rules 1/3); items marked **[data]** need inputs
we don't have yet. Ranked within each section by value-for-effort.

## 1. Visual

1. **Synced hover / time scrubber across charts.** One hovered moment highlights
   the boat's map position, DTF, race-gap and SOG values simultaneously. The
   single biggest readability win: the `decor()` x-mappers (epoch → each chart's
   x-space) are already exactly the plumbing a shared cursor needs. Plotly can't
   sync hover across separate divs natively, so it's a small custom layer:
   listen to `plotly_hover`, translate the epoch through each chart's mapper,
   draw a synced vline (shape update, no re-render).
2. **Coastline under the course map.** A light inline-SVG outline of the CT
   shore, Long Island, and Block Island itself (no CDN — CSP/standalone-safe;
   trace once from NOAA shoreline data and commit as a small path set). The
   island's actual shape would make the starboard-rounding annotation
   self-evident and give the ghost fleet geographic grounding.
3. **Pace-view y-clamp** *(deferred since CP-4)*. min/100nm amplifies as
   remaining distance → 0; clamp the final ~20 nm or annotate the amplification.
   More visible now that lines run from the start anchor.
4. **Milestone leader-labels on the map** (nb2026's `mapLabels` pattern): small
   leader lines at fixed DTF milestones so a reader can locate "100 nm to go"
   without hovering.
5. **Story/print mode.** One-column scroll layout, one chart per viewport, the
   act narrative interleaved — the FINDINGS memo as a guided tour of the same
   figures. Mostly CSS + a section-ordering config.
6. **Dark mode.** The palette is already tokenized in `:root`; a
   `prefers-color-scheme` block plus a Plotly layout-template swap.
7. **Beeswarm polish.** Label the class winners inside each division band;
   optional class-6 tint so Ragana's cohort reads at a glance.

## 2. Research integration

1. **Wind field under the SOG chart.** The board's biggest analytical gap — the
   LIS wind buoys were down for the race window (footer notes it), so the Act-3
   "building breeze → broach" story is asserted, not shown. Candidate sources:
   NDBC 44039/44060 archives (if partial), coastal ASOS (Groton GON, Block
   Island BID, Montauk MTP), or ERA5 reanalysis at track points. Ship as an
   hourly wind-barb/percentile strip sharing the SOG x-axis via `decor()`'s
   mappers. Needs a CP round: it introduces a new external data source.
2. **Tidal current gates.** The Race and Plum Gut are current gates; NOAA
   tidal-current predictions for the window would explain the Friday-night
   compression visible in the DTF chart. Shaded flood/ebb bands on the DTF/SOG
   time axes, exactly like the act bands.
3. **Per-act decomposition table.** Elapsed and corrected deltas vs CD per act
   (out / sound→1BI / rounding+home) as a small table module — turns FINDINGS'
   single "Act 3 alone +182 min" line into inspectable structure. All numbers
   derivable from the existing frozen payload (pipeline rerun not required).
4. **1BI charted coordinate** *(open since CP-4)*. Pin from NOAA chart
   13215/13217 or the USCG Light List; then rounding *timestamps* can ship via
   route.py's stateful leg logic. The +4.7 nm distance is already robust to this.
5. **Lane-vs-outcome scatter.** The round-3 stress-test finding (south-max
   offset vs corrected finish, Class 6 / all ORC) as its own chart instead of
   prose in the upwind note — it's the honest version of the "bet south" story.
6. **Polars / target-speed overlay** **[data: needs Ragana's ORC speed guide]**.
   Achieved SOG vs target by leg turns "the rest is pace" into "which pace,
   where."
7. **Expandable race-log rows** **[data: partly present]**. The events layer
   already carries fuller research text in `txt`; a click-to-expand row keeps
   the table compact while surfacing transcript-derived depth. Any *new* private
   material still passes the CP-5 gate.
8. **Weather-verification appendix.** The unverified "~35-kt gusts" relay in the
   footer could become a small sourced note once (1) lands — either confirming
   with observed data or explicitly bounding what the stations support.
