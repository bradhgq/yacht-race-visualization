#!/usr/bin/env python3
"""Build the RAGANA dashboard into dist/, ready to drop into a static site.

Steps:
  1. run the node regression tests (skip with --skip-tests)
  2. split dashboard_data.json into three payloads:
       core.json  — RAGANA + quick-select tracks, every boat's meta,
                    events / watches / recon / parkFair / stats (eager)
       more.json  — tracks for the "+ More" boats (fetched on demand)
       fleet.json — the 144-boat hourly ghost layer (fetched after first paint)
  3. copy src/ into dist/ with ?v=<hash> cache-busting stamped in
  4. emit dist/standalone.html — a single self-contained file (data + Plotly
     inlined) that works from file:// with no server

The JSON is authoritative — nothing here recomputes race numbers.
"""
import argparse, hashlib, json, re, shutil, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC, DIST = ROOT / 'src', ROOT / 'dist'
QUICK_GRPS = {'ragana', 'class', 'nbr', 'podium', 'club', 'maxi'}
# boats selected by default in app.js (S.boats) must ship with tracks in core
# even when outside the quick groups — Carina is sdl_other but default-on
DEFAULT_BOATS = {'RAGANA', 'Christopher Dragon', 'Divide By Zero', 'In Theory', 'Gesture',
                 'Nicole', 'Carina', 'Hissy Fit II', 'Phoenix USA25329', 'Banter',
                 'Touch of Grey', 'Gemini II'}
# used by the app; 'mil' exists in the source data but nothing renders it
KEEP = ['events', 'watches', 'recon', 'parkFair', 'stats', 'start', 'fin', 'meta']

def run_tests():
    try:
        subprocess.run(['node', '--test', 'test/regression.test.cjs'], cwd=ROOT, check=True,
                       env={'TZ': 'America/New_York', 'PATH': __import__('os').environ['PATH']})
    except FileNotFoundError:
        sys.exit('node not found — regression tests are a build gate (or pass --skip-tests)')
    except subprocess.CalledProcessError:
        sys.exit('regression tests FAILED — not building')

def compact(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':'))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--skip-tests', action='store_true')
    args = ap.parse_args()
    if not args.skip_tests:
        run_tests()

    data = json.loads((ROOT / 'dashboard_data.json').read_text())

    core = {k: data[k] for k in KEEP}
    core['boats'] = {}
    more = {}
    assert DEFAULT_BOATS <= set(data['boats']), DEFAULT_BOATS - set(data['boats'])
    for name, boat in data['boats'].items():   # insertion order is meaningful (palette assignment)
        if boat['meta']['grp'] in QUICK_GRPS or name in DEFAULT_BOATS:
            core['boats'][name] = boat
        else:
            core['boats'][name] = {'meta': boat['meta']}
            more[name] = {k: v for k, v in boat.items() if k != 'meta'}

    for name in DEFAULT_BOATS:   # default selection must render on first paint
        assert 't' in core['boats'][name], f'{name} shipped without a track in core.json'

    payloads = {'core.json': compact(core), 'more.json': compact(more),
                'fleet.json': compact(data['fleet'])}

    # cache-bust on app code + core payload
    h = hashlib.sha1()
    for f in ['app.js', 'helpers.js', 'styles.css', 'index.html']:
        h.update((SRC / f).read_bytes())
    h.update(payloads['core.json'].encode())
    version = h.hexdigest()[:10]
    built = time.strftime('%Y-%m-%d')

    if DIST.exists():
        shutil.rmtree(DIST)
    (DIST / 'data').mkdir(parents=True)
    shutil.copytree(SRC / 'vendor', DIST / 'vendor')
    shutil.copy(SRC / 'favicon.svg', DIST / 'favicon.svg')
    og = ROOT / 'og.png'
    if og.exists():
        shutil.copy(og, DIST / 'og.png')
    else:
        print('warning: og.png missing — social preview image not shipped')

    for name, text in payloads.items():
        (DIST / 'data' / name).write_text(text)

    stamp = lambda s: s.replace('__V__', version).replace('__BUILT__', built)
    for f in ['index.html', 'app.js', 'helpers.js', 'styles.css']:
        (DIST / f).write_text(stamp((SRC / f).read_text()))

    # ── standalone single-file fallback (file:// friendly; no fetches) ──
    html = stamp((SRC / 'index.html').read_text())
    embedded = compact({**{k: data[k] for k in KEEP}, 'boats': data['boats'],
                        'fleet': data['fleet']}).replace('</', '<\\/')
    # function repl: keeps re.sub from interpreting backslashes inside the JSON
    html, n = re.subn(r'<!-- DATA:FETCH.*?/DATA:FETCH -->',
                      lambda _: '<script>window.__DATA_EMBEDDED__=' + embedded + '</script>',
                      html, flags=re.S)
    assert n == 1, 'DATA:FETCH markers not found in index.html'
    html = html.replace('<link rel="stylesheet" href="styles.css?v=%s">' % version,
                        '<style>\n' + stamp((SRC / 'styles.css').read_text()) + '\n</style>')
    # inline scripts don't defer — drop the head tags and re-inline them at the
    # end of <body> so the DOM (and Plotly) exist before app code runs
    tail = ''
    plotly = (SRC / 'vendor' / 'plotly-basic-2.35.2.min.js').read_text()
    tail += '<script id="plotlyjs">\n' + plotly + '\n</script>\n'
    for f in ['helpers.js', 'app.js']:
        tag = '<script src="%s?v=%s" defer></script>' % (f, version)
        assert tag in html, tag
        html = html.replace(tag, '')
        tail += '<script>\n' + stamp((SRC / f).read_text()) + '\n</script>\n'
    html = html.replace('<script src="vendor/plotly-basic-2.35.2.min.js" id="plotlyjs" defer></script>', '')
    assert '</body>' in html
    html = html.replace('</body>', tail + '</body>')
    (DIST / 'standalone.html').write_text(html)

    sizes = {p.relative_to(DIST).as_posix(): p.stat().st_size
             for p in sorted(DIST.rglob('*')) if p.is_file()}
    total = sum(sizes.values())
    print(f'built dist/ (version {version})')
    for k, v in sizes.items():
        print(f'  {v/1024:8.1f} KB  {k}')
    print(f'  {total/1024:8.1f} KB  total')
    print('serve locally:  cd dist && python3 -m http.server 8000')

if __name__ == '__main__':
    main()
