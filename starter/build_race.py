#!/usr/bin/env python3
"""One-command build chain for a race — kills the stale-standalone trap
(dist embeds out/, tests read dist; running steps out of order silently tests
the previous build).

    .venv/bin/python starter/build_race.py races/<race> [--bootstrap]

Runs, in order, stopping on the first failure:
  1. pipeline/build_data.py  races/<race>/config.yaml
  2. races/<race>/postprocess.py            (if the race has one)
  3. shell/build.py races/<race>            (harness-gated, refuses dist on red)
  4. harness again under TZ=UTC             (the America/New_York run is step 3's gate)
  5. compare_data vs snapshot/ with ties    (when snapshot/dashboard_data.json exists)

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
    args = [a for a in sys.argv[1:] if a != '--bootstrap']
    bootstrap = len(args) != len(sys.argv) - 1
    if len(args) != 1:
        sys.exit(__doc__)
    sys.argv = [sys.argv[0]] + args
    # resolve races/<race> against the CALLER'S cwd first, repo root second —
    # the same rule the chain's inner scripts follow, so one documented
    # invocation behaves identically from anywhere
    arg = Path(sys.argv[1])
    race_dir = arg.resolve() if (arg.is_absolute() or (arg / 'config.yaml').exists()) \
        else (REPO / arg).resolve()
    if not (race_dir / 'config.yaml').exists():
        sys.exit(f'{race_dir}/config.yaml not found')

    run('1/5 build_data', [PY, str(REPO / 'starter/pipeline/build_data.py'),
                           str(race_dir / 'config.yaml')])
    if (race_dir / 'postprocess.py').exists():
        run('2/5 race postprocess', [PY, 'postprocess.py'], cwd=race_dir)
    else:
        print('\n══ 2/5 race postprocess — none ══')
    # --bootstrap: a brand-new race has no dist/ yet, so the harness (which
    # reads dist/standalone.html) cannot gate the FIRST build — build once
    # ungated, pin values at the stage-2 stop, then never use the flag again
    if bootstrap:
        run('3/5 shell build (BOOTSTRAP — harness gate skipped, first build only)',
            [PY, str(REPO / 'starter/shell/build.py'), str(race_dir), '--skip-tests'])
        print('\n══ 4/5 harness SKIPPED (bootstrap) — pin values, then rerun without --bootstrap ══')
    else:
        run('3/5 shell build (harness-gated, TZ=America/New_York)',
            [PY, str(REPO / 'starter/shell/build.py'), str(race_dir)])
        run('4/5 harness under TZ=UTC',
            ['node', str(REPO / 'starter/tests/test_dashboard.js'), str(race_dir)],
            env={'TZ': 'UTC', 'PATH': __import__('os').environ['PATH']})
    snapshot = race_dir / 'snapshot' / 'dashboard_data.json'
    if snapshot.exists():
        run('5/5 snapshot compare (tie-exempt)',
            [PY, str(REPO / 'starter/pipeline/compare_data.py'),
             str(race_dir / 'out' / 'dashboard_data.json'), str(snapshot),
             '--ties', str(race_dir / 'out' / 'rounding_ties.json')])
    else:
        print('\n══ 5/5 compare — no snapshot reference yet ══')

    # the global dist/ gitignore silently skips NEW dist paths on `git add -A`
    # (found in production: BIR's first shell deploy shipped index.html without
    # its app/ and race/ script dirs) — warn loudly when files need a force-add.
    # ls-files enumerates ignored files INDIVIDUALLY, so a brand-new race whose
    # ENTIRE dist/ is untracked (the worst case — the exact first-deploy trap)
    # is caught too; `git status --ignored` collapses it to one 'dist/' line.
    ig = subprocess.run(['git', 'ls-files', '--others', '--ignored', '--exclude-standard',
                         '--', str(race_dir / 'dist')],
                        cwd=REPO, capture_output=True, text=True).stdout
    missing = [l for l in ig.splitlines() if l.strip()]
    if missing:
        print(f'\n*** {len(missing)} dist file(s) are gitignored and NOT tracked — the deploy '
              f'would ship a broken page. Run:  git add -f races/{race_dir.name}/dist')

    print(f'\nCHAIN GREEN for {race_dir.name}.')
    print('Committed dist/ is production (nix serves the git tree): '
          f'`git checkout -- races/{race_dir.name}/dist` unless deploying is the point.')


if __name__ == '__main__':
    main()
