"""Great-circle geometry shared by the pipeline. Pure functions, numpy-vectorized.

All distances in nautical miles (earth radius 3440.065 nm), angles in radians
internally. These are byte-for-byte the worked example's formulas — do not
"improve" them without regenerating goldens (prime rule 3).
"""
import numpy as np

R_NM = 3440.065


def hav(lat1, lon1, lat2, lon2):
    """Haversine distance in nm. Accepts scalars or arrays."""
    p1, p2, l1, l2 = map(np.radians, [lat1, lat2, lon1, lon2])
    a = np.sin((p2 - p1) / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin((l2 - l1) / 2) ** 2
    return 2 * R_NM * np.arcsin(np.sqrt(a))


def bearing(lat1, lon1, lat2, lon2):
    """Initial great-circle bearing (radians) from point 1 to point 2."""
    p1, p2, l1, l2 = map(np.radians, [lat1, lat2, lon1, lon2])
    y = np.sin(l2 - l1) * np.cos(p2)
    x = np.cos(p1) * np.sin(p2) - np.sin(p1) * np.cos(p2) * np.cos(l2 - l1)
    return np.arctan2(y, x)


def xte_signed(start, finish):
    """Cross-track-distance function for the course line start→finish.

    Returns f(lat, lon) -> nm off the line. Sign convention (inherited from the
    worked example): POSITIVE = port side of the course direction. For a course
    heading roughly south (e.g. Newport→Bermuda) that reads as "east of the
    rhumb line". The standard XTD formula gives positive-starboard; the leading
    minus flips it.
    """
    t12 = bearing(start[0], start[1], finish[0], finish[1])

    def f(lat, lon):
        d13 = hav(start[0], start[1], lat, lon) / R_NM
        t13 = bearing(start[0], start[1], lat, lon)
        return -np.arcsin(np.sin(d13) * np.sin(t13 - t12)) * R_NM

    return f
