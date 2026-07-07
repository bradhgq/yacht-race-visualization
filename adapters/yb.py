"""YB Tracking adapter — reads the CSV produced by yb_tracker_download.py
(columns: boat_id, boat_name, timestamp_utc, epoch, lat, lon).

Verified on the 252k-ping NB2026 export with zero name misses. The 'epoch'
integer column is the time authority (the ISO string is derived from it
downstream of YB's own binary format).
"""
import pandas as pd

EXPECTED = {'boat_id', 'boat_name', 'epoch', 'lat', 'lon'}

ADAPTER = {'vendor': 'yb',
           'notes': 'YB Tracking AllPositions3 export via yb_tracker_download.py; '
                    'epoch column is authoritative for time.'}


def detect(path):
    """Cheap sniff: header row contains the YB download columns."""
    try:
        with open(path) as f:
            header = set(f.readline().strip().split(','))
    except (OSError, UnicodeDecodeError):
        return False
    return EXPECTED <= header


def load(path, cfg=None):
    """-> canonical DataFrame (boat_id, name, t_utc, lat, lon)."""
    raw = pd.read_csv(path)
    missing = EXPECTED - set(raw.columns)
    if missing:
        raise ValueError(f'yb adapter: missing columns {missing} in {path}')
    df = pd.DataFrame({
        'boat_id': raw['boat_id'],
        'name': raw['boat_name'],
        # nanosecond resolution, explicitly: pandas >= 3.0 defaults epoch-seconds to
        # datetime64[s], which changes time-interpolation weight arithmetic enough
        # to flip round-half boundaries vs the frozen worked example
        't_utc': pd.to_datetime(raw['epoch'], unit='s', utc=True).astype('datetime64[ns, UTC]'),
        'lat': raw['lat'].astype(float),
        'lon': raw['lon'].astype(float),
    })
    return df
