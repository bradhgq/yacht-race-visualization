#!/usr/bin/env python3
"""One-command build chain for a race — kills the stale-standalone trap
(RETROSPECTIVE_ROUND2 §2: dist embeds out/, tests read dist; running steps out
of order silently tests the previous build).

    .venv/bin/python starter/build_race.py races/<race>

Runs, in order, stopping on the first failure:
  1. pipeline/build_data.py  races/<race>/config.yaml
  2. races/<race>/postprocess.py            (if the race has one)
  3. shell/build.py races/<race>            (harness-gated, refuses dist on red)
  4. harness again under TZ=UTC             (the America/New_York run is step 3's gate)
  5. compare_data vs frozen/ with ties      (when frozen/dashboard_data.json exists)

Reminder printed at the end: committed dist/ is production — `git checkout`
it unless deploying is the point.
"""
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
PY = sys.executable


def run(desc, cmd, **kw):
    print(f'\n══ {desc} ══')
    r = subprocess.run(cmd, **kw)
    if r.returncode != 0:
        sys.exit(f'CHAIN FAILED at: {desc}')


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    race_dir = (REPO / sys.argv[1]).resolve() if not Path(sys.argv[1]).is_absolute() \
        else Path(sys.argv[1])
    if not (race_dir / 'config.yaml').exists():
        sys.exit(f'{race_dir}/config.yaml not found')

    run('1/5 build_data', [PY, str(REPO / 'starter/pipeline/build_data.py'),
                           str(race_dir / 'config.yaml')])
    if (race_dir / 'postprocess.py').exists():
        run('2/5 race postprocess', [PY, 'postprocess.py'], cwd=race_dir)
    else:
        print('\n══ 2/5 race postprocess — none ══')
    run('3/5 shell build (harness-gated, TZ=America/New_York)',
        [PY, str(REPO / 'starter/shell/build.py'), str(race_dir)])
    run('4/5 harness under TZ=UTC',
        ['node', str(REPO / 'starter/tests/test_dashboard.js'), str(race_dir)],
        env={'TZ': 'UTC', 'PATH': __import__('os').environ['PATH']})
    frozen = race_dir / 'frozen' / 'dashboard_data.json'
    if frozen.exists():
        run('5/5 compare vs frozen oracle (tie-exempt)',
            [PY, str(REPO / 'starter/pipeline/compare_data.py'),
             str(race_dir / 'out' / 'dashboard_data.json'), str(frozen),
             '--ties', str(race_dir / 'out' / 'rounding_ties.json')])
    else:
        print('\n══ 5/5 compare — no frozen oracle yet ══')

    print(f'\nCHAIN GREEN for {race_dir.name}.')
    print('Committed dist/ is production (nix serves the git tree): '
          f'`git checkout -- races/{race_dir.name}/dist` unless deploying is the point.')


if __name__ == '__main__':
    main()
