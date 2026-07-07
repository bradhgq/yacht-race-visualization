"""Pluggable corrected-time scoring + probe enforcement.

The probe is the gate, not the formula's plausibility: sign and unit
conventions vary by scoring system and region (stage-2 §4). No fleet math may
run until at least two probe boats reproduce their official corrected times
within 1 second.
"""
import importlib


class ProbeFailure(RuntimeError):
    pass


def parse_duration(s):
    """'4d 01:34:52' or '01:34:52' -> seconds."""
    s = s.strip()
    days = 0
    if 'd' in s:
        d, s = s.split('d ')
        days = int(d)
    h, m, sec = (int(x) for x in s.strip().split(':'))
    return days * 86400 + h * 3600 + m * 60 + sec


def corrected(elapsed_s, boat, distance_nm, cfg):
    """Corrected seconds for one boat. `boat` must carry the rating under
    'rating'. Implementations: tot (time-on-time), tod (time-on-distance),
    custom ('module:function' hook in scoring.params.hook)."""
    system = cfg['scoring']['system']
    if system == 'tot':
        return elapsed_s * boat['rating']
    if system == 'tod':
        return elapsed_s - boat['rating'] * distance_nm
    if system == 'custom':
        mod, fn = cfg['scoring']['params']['hook'].split(':')
        return getattr(importlib.import_module(mod), fn)(elapsed_s, boat, distance_nm, cfg)
    raise ValueError(f'unknown scoring system: {system}')


def run_probe(boats, distance_nm, cfg, tolerance_s=1.0):
    """boats: {display_name: {'rating': float, 'elapsed_s': int, 'official_corrected_s': int}}.

    Every configured probe boat is checked; >= 2 must reproduce official
    corrected within tolerance or ProbeFailure is raised. Returns the report.
    """
    probe_names = cfg['scoring'].get('probe_boats') or []
    if len(probe_names) < 2:
        raise ProbeFailure(f'need >= 2 probe_boats in config, got {probe_names}')
    report = []
    for nm in probe_names:
        if nm not in boats:
            report.append({'boat': nm, 'error': 'not found in official results'})
            continue
        b = boats[nm]
        got = corrected(b['elapsed_s'], b, distance_nm, cfg)
        err = got - b['official_corrected_s']
        report.append({'boat': nm, 'computed_corrected_s': got,
                       'official_corrected_s': b['official_corrected_s'],
                       'error_s': err, 'pass': abs(err) <= tolerance_s})
    n_ok = sum(1 for r in report if r.get('pass'))
    if n_ok < 2:
        raise ProbeFailure(f'scoring probe failed — only {n_ok} boat(s) reproduced official '
                           f'corrected within {tolerance_s}s. Report: {report}')
    return report
