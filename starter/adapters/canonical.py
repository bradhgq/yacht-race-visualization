"""Canonical tracker schema, validators, name hygiene, and the ping-gap report.

Canonical schema (every adapter's load() must return exactly this):
    boat_id : str-able identifier, stable within one export
    name    : display-ish boat name as the tracker spells it (post config overrides)
    t_utc   : datetime64, tz-aware UTC
    lat     : float, degrees, [-90, 90]
    lon     : float, degrees, [-180, 180]

Doctrine 4 ("names are dirty") lives here: whitespace/Unicode normalization for
JOIN KEYS only — stored names are never rewritten by the validator (a rename is
a config decision, not a hygiene side effect).
"""
import re
import unicodedata

import pandas as pd

REQUIRED = ['boat_id', 'name', 't_utc', 'lat', 'lon']


class SchemaError(ValueError):
    pass


def norm_key(s):
    """Join key: Unicode NFC, whitespace collapsed, casefolded.
    Applied to BOTH sides of every name join; never stored."""
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFC', str(s)).strip()).lower()


def display_name(s):
    """Whitespace-collapse a name for display (catches 'Hissy Fit  II')."""
    return re.sub(r'\s+', ' ', str(s).strip())


def sail_disambiguated(name, sail):
    """I4 mechanics for duplicate boat names: 'Phoenix' + sail -> 'Phoenix USA25329'."""
    return f'{display_name(name)} {sail}'.strip()


def validate(df):
    """Validate + normalize ordering. Returns (df, report).

    - required columns present, t_utc tz-aware UTC, lat/lon in range (hard errors)
    - sorts by (boat_id, t_utc); drops exact duplicate (boat_id, t_utc) pings
    """
    missing = [c for c in REQUIRED if c not in df.columns]
    if missing:
        raise SchemaError(f'canonical schema missing columns: {missing}')
    if not isinstance(df['t_utc'].dtype, pd.DatetimeTZDtype) or str(df['t_utc'].dt.tz) != 'UTC':
        raise SchemaError(f't_utc must be tz-aware UTC, got {df["t_utc"].dtype}')
    bad_lat = df[(df['lat'] < -90) | (df['lat'] > 90)]
    bad_lon = df[(df['lon'] < -180) | (df['lon'] > 180)]
    if len(bad_lat) or len(bad_lon):
        raise SchemaError(f'{len(bad_lat)} lat / {len(bad_lon)} lon values out of range '
                          f'(first bad row: {pd.concat([bad_lat, bad_lon]).iloc[0].to_dict()})')
    n0 = len(df)
    df = df.sort_values(['boat_id', 't_utc'], kind='stable').reset_index(drop=True)
    df = df.drop_duplicates(['boat_id', 't_utc'], keep='first').reset_index(drop=True)
    report = {
        'rows': len(df),
        'boats': int(df['boat_id'].nunique()),
        'duplicate_pings_dropped': int(n0 - len(df)),
    }
    return df, report


def ping_gap_report(df, gap_factor=6.0):
    """Per-boat ping-cadence anomalies -> feeds the stage-0 anomalies list.

    A gap is anomalous when it exceeds gap_factor x that boat's median cadence.
    Returns a list of per-boat dicts; boats with no anomalies are summarized in
    the caller's run log via the 'anomalous' flag.
    """
    out = []
    for bid, sub in df.groupby('boat_id', sort=True):
        gaps = sub['t_utc'].diff().dt.total_seconds().dropna()
        if not len(gaps):
            out.append({'boat_id': bid, 'name': sub['name'].iloc[0], 'pings': len(sub),
                        'median_gap_s': None, 'max_gap_s': None, 'anomalous_gaps': 0,
                        'anomalous': len(sub) < 2})
            continue
        med = float(gaps.median())
        thresh = gap_factor * med if med > 0 else float('inf')
        n_anom = int((gaps > thresh).sum())
        out.append({'boat_id': bid, 'name': sub['name'].iloc[0], 'pings': len(sub),
                    'median_gap_s': med, 'max_gap_s': float(gaps.max()),
                    'anomalous_gaps': n_anom, 'anomalous': n_anom > 0})
    return out


def apply_name_overrides(df, overrides):
    """Config-driven renames, applied before anything joins on names.

    overrides:
        by_id:   {tracker boat_id -> new name}   (duplicate-name split, e.g. two Phoenixes)
        by_name: {tracker name    -> new name}   (syndicate/sponsor cleanup)
    """
    if not overrides:
        return df
    for bid, nm in (overrides.get('by_id') or {}).items():
        df.loc[df['boat_id'] == bid, 'name'] = nm
    for old, nm in (overrides.get('by_name') or {}).items():
        df.loc[df['name'] == old, 'name'] = nm
    return df
