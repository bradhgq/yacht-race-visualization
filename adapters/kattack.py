"""Kattack adapter — STUB. Schema unverified; do not trust PROCESS_NOTES'
claims about it until a real export is in hand (see adapters/README.md)."""

ADAPTER = {'vendor': 'kattack', 'notes': 'STUB — no verified export yet'}


def detect(path):
    return False


def load(path, cfg=None):
    raise NotImplementedError(
        'kattack adapter is a stub — obtain a real Kattack export, verify its '
        'schema, and implement load() against canonical (see adapters/README.md)')
