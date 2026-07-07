#!/usr/bin/env python3
"""Config-aware injection build: inject <race>/out/dashboard_data.json into a
single-file dashboard template at the __DATA__ marker.

    python3 pipeline/assemble.py races/<race>/config.yaml

Template path (config `template.path`, resolved against the race dir, then the
repo root), data path, and output name all come from config. The '</' escaping
is load-bearing: raw JSON inside a <script> block would otherwise terminate the
tag at the first '</' in a text field.

NOTE: with the shell landed (REPO_SPEC v1.1), `shell/build.py` is the primary
build; this injection path remains for monolith-style templates (the NB2026
reference monolith lives at examples/nb2026/legacy/dashboard_template.html).
"""
import argparse
import sys
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('config', help='races/<race>/config.yaml')
    args = ap.parse_args()
    cfg_path = Path(args.config).resolve()
    race_dir = cfg_path.parent
    cfg = yaml.safe_load(cfg_path.read_text())

    out_dir = race_dir / cfg['output']['dir']
    tpl_rel = cfg.get('template', {}).get('path', 'legacy/dashboard_template.html')
    template = (race_dir / tpl_rel) if (race_dir / tpl_rel).exists() else (REPO / tpl_rel)
    data_file = out_dir / 'dashboard_data.json'
    out_file = out_dir / f"{cfg['race']['slug']}_dashboard.html"

    if not data_file.exists():
        sys.exit(f'{data_file} not found — run build_data.py first')
    data = data_file.read_text().replace('</', '<\\/')
    tpl = template.read_text()
    if '__DATA__' not in tpl:
        sys.exit(f'template {template} has no __DATA__ marker')
    out_file.write_text(tpl.replace('__DATA__', data))
    print(f'assembled {out_file} ({out_file.stat().st_size / 1e6:.2f} MB)')


if __name__ == '__main__':
    main()
