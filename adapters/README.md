# Adapter contract

Every `adapters/<vendor>.py` exposes:

```python
def detect(path) -> bool          # cheap sniff: can this adapter read this file?
def load(path, cfg) -> DataFrame  # canonical schema, below
ADAPTER = {"vendor": "yb", "notes": "..."}
```

Canonical schema (validated by `canonical.validate`):

| column | type | constraint |
|---|---|---|
| `boat_id` | any hashable | stable within one export |
| `name` | str | as the tracker spells it (config `name_overrides` applies before validation) |
| `t_utc` | datetime64 | tz-aware UTC, **nanosecond resolution** (coarser resolutions change interpolation float behavior) |
| `lat` | float | [−90, 90] |
| `lon` | float | [−180, 180] |

`canonical.validate` sorts by `(boat_id, t_utc)`, drops exact duplicate pings,
and hard-errors on schema violations. `canonical.ping_gap_report` flags cadence
anomalies (> 6× a boat's median gap) for the CP-0 anomalies list.

Selection: `tracker.vendor` in config, explicit. `auto` runs `detect()` across
all adapters and **errors on ambiguity** rather than guessing.

Name hygiene (doctrine 4) lives in `canonical.py`: `norm_key` (NFC + whitespace
collapse + casefold) is applied to both sides of every join and never stored;
renames are config decisions (`name_overrides.by_id` / `.by_name`), not
validator side effects.

## Status

- **yb** — implemented; verified on the 252k-ping NB2026 export, zero name misses.
- **kattack / tractrac / predictwind** — stubs. Their schemas are UNVERIFIED
  guesses until one real export each is in hand (PROCESS_NOTES' claims about
  them were never checked). A new adapter is an escalation-to-Claude-Code
  trigger per the skill.
