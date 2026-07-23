#!/usr/bin/env python3
"""Optional stage-0 weather-evidence acquisition: NDBC buoy observations,
ERA5 reanalysis point winds, and CO-OPS tidal-current predictions, each
verified for race-window coverage before it is kept.

    python3 starter/acquisition/fetch_weather.py --window 2025-07-24..2025-07-26 \
        --ndbc 44065 44025 44097 kptn6 \
        --era5 harbor,40.60,-74.03 --era5 montauk,41.05,-71.90 \
        --coops LIS1012 LIS1001 \
        --tz America/New_York --out-dir races/<race>/raw/weather
    python3 starter/acquisition/fetch_weather.py --window …..… --verify-only races/<race>/raw/weather

SCOPE GUARD (promoted from ALIR 2025): these files are stage-1/2/3
phase-attribution and narrative EVIDENCE only. No pipeline number may depend
on them; the pipeline consumes tracks/results/scratch exclusively. VMC stays
VMC (I18) — a wind-referenced claim cites these files as external evidence,
never implies the tracker measured wind.

THE VERIFIED-COVERAGE RITUAL (mandatory — a file can exist yet be empty):
decompress each NDBC file and count non-sentinel rows whose UTC calendar date
falls inside the race window (sentinels: WDIR 999, WSPD/GST 99.0, WVHT 99.00).
ALIR 2025's MTKN6 file existed with zero wind observations for the entire
year; kept as-is it would have read as Montauk wind coverage. Zero-coverage
files are deleted, and the rejection is recorded in the manifest — negative
findings (station dead, no file for the year) are as record-worthy as
positive ones. Worked example: races/alir2025/raw/weather/MANIFEST.md.

Stdlib only. NETWORK-DEPENDENT (except --verify-only) — never runs in CI;
the offline coverage-counter regression lives in tests/.
"""
import argparse
import gzip
import hashlib
import json
import math
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, timedelta
from pathlib import Path

NDBC_URL = 'https://www.ndbc.noaa.gov/data/historical/stdmet/{station}h{year}.txt.gz'
ERA5_URL = 'https://archive-api.open-meteo.com/v1/archive'
COOPS_URL = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter'

LICENSES = {
    'ndbc': 'US Government work, public domain (NOAA NDBC)',
    'openmeteo': 'CC-BY 4.0 — attribution required: '
                 'Weather data by Open-Meteo.com; ERA5 (c) ECMWF/Copernicus',
    'coops': 'US Government work, public domain (NOAA CO-OPS). '
             'PREDICTIONS, not observations — harmonic/subordinate model output',
}

SENTINELS = {'WDIR': 999, 'WSPD': 99.0, 'GST': 99.0, 'WVHT': 99.0}


def fetch(url, retries=4):
    """GET with backoff on transient 5xx; raises HTTPError otherwise (an NDBC
    404 — no historical file for that station+year — is caught by the caller
    as a finding, not an error)."""
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return resp.read()
        except urllib.error.HTTPError as e:
            if e.code in (500, 502, 503, 504) and attempt < retries - 1:
                time.sleep(2 * (attempt + 1))
                continue
            raise
    raise AssertionError('unreachable')


# ── NDBC standard-met yearly files ───────────────────────────────────────────

def stdmet_coverage(text, start, end):
    """The coverage counter. Parse an NDBC stdmet yearly file (two header
    lines, whitespace-separated, timestamps UTC) and count non-sentinel rows
    whose UTC calendar date lies in [start, end]. Pad the window a day if the
    race's local window nears a UTC date boundary.

    Returns window_rows / wind_rows / wave_rows with min-max ranges, plus
    full-year wind/wave counts so a rejection can say 'dead all year' vs
    'gap during the window' (the MTKN6 distinction)."""
    lines = [ln for ln in text.splitlines() if ln.strip()]
    header = lines[0].lstrip('#').split()
    cols = {name: i for i, name in enumerate(header)}
    if 'WD' in cols and 'WDIR' not in cols:   # pre-2007 header spelling
        cols['WDIR'] = cols['WD']
    for need in ('YY', 'MM', 'DD'):
        if need not in cols:
            raise ValueError(f'unrecognized stdmet header: {header}')

    def val(row, name):
        i = cols.get(name)
        if i is None or i >= len(row):
            return None
        try:
            return float(row[i])
        except ValueError:
            return None

    def live(row, name):
        v = val(row, name)
        if v is None:
            return False
        if name == 'WDIR':
            return int(v) != SENTINELS['WDIR']
        return v < SENTINELS[name] - 1e-9   # catches 99.0 and legacy 999.0 alike

    cov = {'window_rows': 0, 'wind_rows': 0, 'wave_rows': 0,
           'year_wind_rows': 0, 'year_wave_rows': 0,
           'wspd_ms': None, 'wdir_deg': None, 'wvht_m': None}

    def widen(key, v):
        lo, hi = cov[key] or (v, v)
        cov[key] = [min(lo, v), max(hi, v)]

    for ln in lines[1:]:
        if ln.startswith('#'):
            continue
        row = ln.split()
        try:
            d = date(int(row[cols['YY']]), int(row[cols['MM']]), int(row[cols['DD']]))
        except (ValueError, IndexError):
            continue
        wind = live(row, 'WDIR') or live(row, 'WSPD')
        wave = live(row, 'WVHT')
        cov['year_wind_rows'] += wind
        cov['year_wave_rows'] += wave
        if not (start <= d <= end):
            continue
        cov['window_rows'] += 1
        cov['wind_rows'] += wind
        cov['wave_rows'] += wave
        wspd, wdir = val(row, 'WSPD'), val(row, 'WDIR')
        if wspd is not None and live(row, 'WSPD'):
            widen('wspd_ms', wspd)
        if wdir is not None and live(row, 'WDIR'):
            widen('wdir_deg', int(wdir))
        if wave:
            widen('wvht_m', val(row, 'WVHT'))
    return cov


def ndbc_station(station, years, start, end, out_dir, warn, fetch_bytes=None):
    """Fetch (or, in verify mode, re-read) one station's yearly file(s), run
    the coverage counter, keep only positive coverage. Returns (kept, info)."""
    station = station.lower()
    kept, rejected = {}, {}
    for year in years:
        fname = f'{station}h{year}.txt.gz'
        if fetch_bytes:
            raw = fetch_bytes(fname)
        else:
            try:
                raw = fetch(NDBC_URL.format(station=station, year=year))
            except urllib.error.HTTPError as e:
                if e.code != 404:
                    raise
                raw = None
        if raw is None:
            how = 'absent locally' if fetch_bytes else 'HTTP 404'
            rejected[fname] = {'reason': f'no NDBC historical file for {year} ({how})'}
            warn(f'NDBC {station.upper()}: no historical file for {year} — '
                 f'record-worthy negative, no coverage there')
            continue
        cov = stdmet_coverage(gzip.decompress(raw).decode('ascii', 'replace'), start, end)
        if cov['wind_rows'] == 0 and cov['wave_rows'] == 0:
            scope = 'the ENTIRE year' if cov['year_wind_rows'] == 0 and \
                cov['year_wave_rows'] == 0 else 'the race window'
            rejected[fname] = {'reason': f'file exists but zero non-sentinel rows for {scope}',
                               **cov}
            warn(f'NDBC {station.upper()}: {fname} exists but carries zero non-sentinel '
                 f'rows for {scope} — deleted rather than kept as false coverage '
                 f'(the MTKN6 case)')
            continue
        path = out_dir / 'ndbc' / fname
        if not fetch_bytes:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(raw)
        kept[fname] = {'file': f'ndbc/{fname}',
                       'sha256': hashlib.sha256(raw).hexdigest(), **cov}
        wind = (f'wind {cov["wind_rows"]} rows, '
                f'{cov["wspd_ms"][0]}-{cov["wspd_ms"][1]} m/s' if cov['wind_rows']
                else 'NO wind channel')
        wave = (f'waves {cov["wave_rows"]} rows, '
                f'{cov["wvht_m"][0]}-{cov["wvht_m"][1]} m' if cov['wave_rows'] else 'no waves')
        print(f'  NDBC {station.upper()} {year}: {cov["window_rows"]} window rows · {wind} · {wave}')
        if not cov['wind_rows']:
            warn(f'NDBC {station.upper()}: waves only, NO wind — do not cite it for wind')
    return kept, rejected


# ── Open-Meteo ERA5 archive point winds ──────────────────────────────────────

def drift_nm(req_lat, req_lon, got_lat, got_lon):
    """Open-Meteo snaps to the ERA5 grid; report how far the served point
    drifted from the requested one (1° lat = 60 nm)."""
    dlat = (got_lat - req_lat) * 60.0
    dlon = (got_lon - req_lon) * 60.0 * math.cos(math.radians(req_lat))
    return math.hypot(dlat, dlon)


def era5_summary(data, req_lat, req_lon):
    hourly = data.get('hourly', {})
    speeds = hourly.get('wind_speed_10m') or []
    return {'requested': [req_lat, req_lon],
            'served_grid': [data.get('latitude'), data.get('longitude')],
            'drift_nm': round(drift_nm(req_lat, req_lon,
                                       data.get('latitude', req_lat),
                                       data.get('longitude', req_lon)), 2),
            'hours': len(hourly.get('time') or []),
            'wind_hours': sum(1 for s in speeds if s is not None),
            'units': (data.get('hourly_units') or {}).get('wind_speed_10m')}


def era5_point(name, lat, lon, start, end, tz, out_dir, warn, fetch_bytes=None):
    fname = f'era5_{name}.json'
    if fetch_bytes:
        raw = fetch_bytes(fname)
        if raw is None:
            warn(f'ERA5 {name}: {fname} absent locally — nothing to verify')
            return None
    else:
        q = urllib.parse.urlencode({
            'latitude': lat, 'longitude': lon,
            'start_date': start.isoformat(), 'end_date': end.isoformat(),
            'hourly': 'wind_speed_10m,wind_direction_10m,wind_gusts_10m',
            'timezone': tz, 'wind_speed_unit': 'kn'})
        raw = fetch(f'{ERA5_URL}?{q}')
    info = era5_summary(json.loads(raw), lat, lon)
    if info['wind_hours'] == 0:
        warn(f'ERA5 {name}: zero wind hours served — not kept (false coverage)')
        return None
    if info['units'] != 'kn':
        warn(f'ERA5 {name}: units are {info["units"]!r}, expected kn — check the request')
    if not fetch_bytes:
        path = out_dir / 'openmeteo' / fname
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(raw)
    print(f'  ERA5 {name}: {info["wind_hours"]}/{info["hours"]} wind hours in {info["units"]}, '
          f'grid drift {info["drift_nm"]} nm')
    return {'file': f'openmeteo/{fname}',
            'sha256': hashlib.sha256(raw).hexdigest(), **info}


# ── NOAA CO-OPS tidal-current predictions ────────────────────────────────────

def coops_summary(data):
    if 'error' in data:
        return {'error': data['error'].get('message', str(data['error']))}
    return {'rows': len((data.get('current_predictions') or {}).get('cp') or []),
            'units': (data.get('current_predictions') or {}).get('units')}


def coops_station(station, start, end, out_dir, warn, fetch_bytes=None):
    out = {}
    for interval, tag in (('60', 'hourly'), ('MAX_SLACK', 'maxslack')):
        fname = f'{station}_currents_{tag}.json'
        if fetch_bytes:
            raw = fetch_bytes(fname)
            if raw is None:
                warn(f'CO-OPS {station} ({tag}): {fname} absent locally — nothing to verify')
                continue
        else:
            q = urllib.parse.urlencode({
                'product': 'currents_predictions', 'station': station,
                'begin_date': start.strftime('%Y%m%d'), 'end_date': end.strftime('%Y%m%d'),
                'time_zone': 'lst_ldt', 'units': 'english', 'format': 'json',
                'interval': interval})
            raw = fetch(f'{COOPS_URL}?{q}')
        info = coops_summary(json.loads(raw))
        if info.get('error') or not info.get('rows'):
            warn(f'CO-OPS {station} ({tag}): {info.get("error", "zero prediction rows")} '
                 f'— not kept; check the station id on tidesandcurrents.noaa.gov')
            continue
        if not fetch_bytes:
            path = out_dir / 'coops' / fname
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(raw)
        print(f'  CO-OPS {station} {tag}: {info["rows"]} prediction rows ({info["units"]})')
        out[tag] = {'file': f'coops/{fname}',
                    'sha256': hashlib.sha256(raw).hexdigest(), **info}
    return out


# ── driver ───────────────────────────────────────────────────────────────────

def parse_window(s):
    a, b = s.split('..')
    return date.fromisoformat(a), date.fromisoformat(b)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--window', required=True, metavar='START..END',
                    help='race window as inclusive dates, e.g. 2025-07-24..2025-07-26 '
                         '(first warning day .. last in-scope finish day; NDBC rows '
                         'match on UTC date — pad a day if the local window nears '
                         'a UTC boundary)')
    ap.add_argument('--ndbc', nargs='*', default=[], metavar='STATION',
                    help='NDBC station ids (e.g. 44065 kptn6)')
    ap.add_argument('--era5', action='append', default=[], metavar='NAME,LAT,LON',
                    help='ERA5 point, repeatable (e.g. montauk,41.05,-71.90)')
    ap.add_argument('--coops', nargs='*', default=[], metavar='STATION',
                    help='CO-OPS current-prediction station ids (e.g. LIS1012)')
    ap.add_argument('--tz', default='America/New_York',
                    help='IANA timezone for ERA5 hourly local times — the race '
                         'timezone (default: %(default)s)')
    ap.add_argument('--coops-pad-days', type=int, default=1,
                    help='extend the CO-OPS end date so the last night\'s cycle '
                         'completes (default: %(default)s)')
    ap.add_argument('--out-dir', default='.',
                    help='output directory (use races/<race>/raw/weather)')
    ap.add_argument('--verify-only', metavar='DIR',
                    help='no network, no writes: re-run the coverage ritual on '
                         'already-fetched files in DIR and print the manifest '
                         'to stdout (re-verification after any re-download, and '
                         'the offline path the worked example was checked with)')
    args = ap.parse_args()
    start, end = parse_window(args.window)
    if not (args.ndbc or args.era5 or args.coops):
        ap.error('nothing to fetch: give --ndbc, --era5, and/or --coops')

    out_dir = Path(args.verify_only or args.out_dir)
    fetch_bytes = None
    if args.verify_only:
        def _read_local(fname):
            d = 'coops' if '_currents_' in fname else \
                'ndbc' if fname.endswith('.gz') else 'openmeteo'
            p = out_dir / d / fname
            return p.read_bytes() if p.exists() else None
        fetch_bytes = _read_local

    warnings = []
    def warn(msg):
        warnings.append(msg)
        print(f'\n*** WEATHER WARNING: {msg}\n', file=sys.stderr)

    manifest = {
        'fetched': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
        'race_window': {'start': start.isoformat(), 'end': end.isoformat(),
                        'era5_timezone': args.tz},
        'scope_guard': 'stage-1/2/3 EVIDENCE only — no pipeline number may depend '
                       'on these files; VMC stays VMC (I18): the tracker measured '
                       'no wind. CO-OPS files are predictions, not observations.',
        'verified_coverage': {
            'sentinels': SENTINELS,
            'method': 'decompress each NDBC file, count non-sentinel rows whose '
                      'UTC date falls inside the race window; zero-coverage files '
                      'are deleted and recorded below as rejected'},
        'licenses': LICENSES,
        'url_patterns': {'ndbc': NDBC_URL, 'openmeteo': ERA5_URL, 'coops': COOPS_URL},
        'warnings': warnings,
    }

    years = sorted({start.year, end.year})
    kept, rejected = {}, {}
    for st in args.ndbc:
        k, r = ndbc_station(st, years, start, end, out_dir, warn, fetch_bytes)
        kept.update(k)
        rejected.update(r)
    if args.ndbc:
        manifest['ndbc'] = {'kept': kept, 'rejected': rejected}

    era5 = {}
    for spec in args.era5:
        name, lat, lon = spec.split(',')
        info = era5_point(name.strip(), float(lat), float(lon), start, end,
                          args.tz, out_dir, warn, fetch_bytes)
        if info:
            era5[name.strip()] = info
    if args.era5:
        manifest['openmeteo'] = era5

    coops = {}
    for st in args.coops:
        info = coops_station(st, start, end + timedelta(days=args.coops_pad_days),
                             out_dir, warn, fetch_bytes)
        if info:
            coops[st] = info
    if args.coops:
        manifest['coops'] = coops

    if args.verify_only:
        print(json.dumps(manifest, indent=2))
    else:
        mpath = out_dir / 'weather_manifest.json'
        mpath.write_text(json.dumps(manifest, indent=2))
        print(f'\nManifest: {mpath}')
    if warnings:
        print(f'{len(warnings)} finding(s) above are record-worthy — carry them '
              f'(positives AND negatives) into the prose MANIFEST.md '
              f'(model: races/alir2025/raw/weather/MANIFEST.md)', file=sys.stderr)


if __name__ == '__main__':
    main()
