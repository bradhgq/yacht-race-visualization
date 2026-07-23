"""Offline regression for the weather-coverage ritual — runs in CI, no network.

Real-data fixture: the 2025-07-23..27 excerpt of NDBC 44065's yearly stdmet
file from the ALIR 2025 worked example (races/alir2025/raw/weather/), cut and
gzipped with awk/gzip. Expected values are pinned from the independently
hand-verified counts in races/alir2025/raw/weather/MANIFEST.md — 432 window
rows, wind 430 (1.2-11.0 m/s, dir 4-347), waves 141 — cross-checked with an
awk count at fixture-creation time, never emitted by the module under test.

The synthetic cases encode the two negative findings the ritual exists for:
MTKN6 (file exists, zero non-sentinel rows all year) and a station that is
live in the year but dead inside the race window.
"""
import contextlib
import gzip
import hashlib
import io
import sys
import unittest
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fetch_weather import (coops_summary, drift_nm, era5_summary,  # noqa: E402
                           ndbc_station, stdmet_coverage)

FIXTURE = Path(__file__).parent / 'fixtures' / '44065h2025_excerpt.txt.gz'
WINDOW = (date(2025, 7, 24), date(2025, 7, 26))

HEADER = ('#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP  VIS  TIDE\n'
          '#yr  mo dy hr mn degT m/s  m/s     m   sec   sec degT   hPa  degC  degC  degC   mi    ft\n')
SENTINEL_ROW = '999 99.0 99.0 99.00 99.00 99.00 999 9999.0 999.0 999.0 999.0 99.0 99.00\n'


class TestRealFixture(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = gzip.decompress(FIXTURE.read_bytes()).decode('ascii')

    def test_fixture_integrity(self):
        self.assertEqual(hashlib.sha256(FIXTURE.read_bytes()).hexdigest(),
                         'b19463c6e594c8a90382703ec18b262ea2f70e615004eb5c94a985162feafbde')

    def test_manifest_pinned_coverage(self):
        cov = stdmet_coverage(self.text, *WINDOW)
        self.assertEqual(cov['window_rows'], 432)
        self.assertEqual(cov['wind_rows'], 430)
        self.assertEqual(cov['wave_rows'], 141)
        self.assertEqual(cov['wspd_ms'], [1.2, 11.0])
        self.assertEqual(cov['wdir_deg'], [4, 347])
        self.assertEqual(cov['wvht_m'], [0.57, 1.42])   # MANIFEST rounds to 0.6-1.4

    def test_window_bounds_are_inclusive_dates(self):
        # the excerpt spans Jul 23-27: widening the window to it takes all 720 rows
        cov = stdmet_coverage(self.text, date(2025, 7, 23), date(2025, 7, 27))
        self.assertEqual(cov['window_rows'], 720)
        # and a window before the excerpt sees nothing
        empty = stdmet_coverage(self.text, date(2025, 7, 1), date(2025, 7, 22))
        self.assertEqual((empty['window_rows'], empty['wind_rows'], empty['wave_rows']),
                         (0, 0, 0))


class TestSyntheticCases(unittest.TestCase):
    def test_sentinel_mix_hand_counted(self):
        text = HEADER + ''.join([
            '2025 07 24 00 00 ' + SENTINEL_ROW,                                       # all-sentinel, in window
            '2025 07 24 00 10 180  5.0  7.0 99.00 99.00 99.00 999 1010.0 20.0 21.0 15.0 99.0 99.00\n',  # wind only
            '2025 07 24 00 20 999 99.0 99.0  1.20  8.00  6.00 180 1010.0 20.0 21.0 15.0 99.0 99.00\n',  # waves only
            '2025 07 23 23 50 200  9.9 12.0  2.00  9.00  7.00 200 1010.0 20.0 21.0 15.0 99.0 99.00\n',  # out of window
        ])
        cov = stdmet_coverage(text, *WINDOW)
        self.assertEqual(cov['window_rows'], 3)
        self.assertEqual(cov['wind_rows'], 1)
        self.assertEqual(cov['wave_rows'], 1)
        self.assertEqual(cov['wspd_ms'], [5.0, 5.0])
        self.assertEqual(cov['wdir_deg'], [180, 180])
        self.assertEqual(cov['wvht_m'], [1.2, 1.2])
        self.assertEqual(cov['year_wind_rows'], 2)   # in-window wind row + out-of-window row
        self.assertEqual(cov['year_wave_rows'], 2)

    def test_legacy_wd_header_alias(self):
        text = ('#YY  MM DD hh mm  WD WSPD GST  WVHT   DPD   APD MWD   PRES\n'
                '2025 07 24 00 00 180  5.0  7.0 99.00 99.00 99.00 999 1010.0\n')
        self.assertEqual(stdmet_coverage(text, *WINDOW)['wind_rows'], 1)

    def _run_station(self, rows):
        blob = gzip.compress((HEADER + ''.join(rows)).encode())
        warnings = []
        with contextlib.redirect_stdout(io.StringIO()):
            kept, rejected = ndbc_station('mtkn6', [2025], *WINDOW, Path('.'),
                                          warnings.append, lambda _fname: blob)
        return kept, rejected, warnings

    def test_mtkn6_case_dead_all_year_is_rejected(self):
        kept, rejected, warnings = self._run_station(
            [f'2025 {m:02d} 15 00 00 ' + SENTINEL_ROW for m in range(1, 13)])
        self.assertEqual(kept, {})
        self.assertIn('the ENTIRE year', rejected['mtkn6h2025.txt.gz']['reason'])
        self.assertTrue(any('false coverage' in w for w in warnings))

    def test_live_year_dead_window_is_rejected_distinctly(self):
        kept, rejected, _ = self._run_station(
            ['2025 07 10 00 00 180  5.0  7.0  1.00 8.0 6.0 180 1010.0 20.0 21.0 15.0 99.0 99.00\n',
             '2025 07 24 00 00 ' + SENTINEL_ROW])
        self.assertEqual(kept, {})
        self.assertIn('the race window', rejected['mtkn6h2025.txt.gz']['reason'])

    def test_waves_only_station_is_kept(self):
        kept, rejected, warnings = self._run_station(
            ['2025 07 24 00 00 999 99.0 99.0  1.20 8.0 6.0 180 1010.0 20.0 21.0 15.0 99.0 99.00\n'])
        self.assertEqual(rejected, {})
        self.assertEqual(kept['mtkn6h2025.txt.gz']['wave_rows'], 1)
        self.assertTrue(any('NO wind' in w for w in warnings))   # the 44097 caveat

    def test_missing_file_is_a_recorded_negative(self):
        warnings = []
        with contextlib.redirect_stdout(io.StringIO()):
            kept, rejected = ndbc_station('44017', [2025], *WINDOW, Path('.'),
                                          warnings.append, lambda _fname: None)
        self.assertEqual(kept, {})
        self.assertIn('no NDBC historical file', rejected['44017h2025.txt.gz']['reason'])


class TestPointSummaries(unittest.TestCase):
    def test_drift_nm(self):
        self.assertAlmostEqual(drift_nm(41.0, -71.9, 42.0, -71.9), 60.0)
        self.assertAlmostEqual(drift_nm(40.6, -74.03, 40.6, -74.03), 0.0)

    def test_era5_summary_alir_harbor_shape(self):
        data = {'latitude': 40.5975, 'longitude': -74.0877,
                'hourly_units': {'wind_speed_10m': 'kn'},
                'hourly': {'time': ['a', 'b', 'c'],
                           'wind_speed_10m': [5.1, None, 7.2]}}
        info = era5_summary(data, 40.60, -74.03)
        self.assertEqual((info['hours'], info['wind_hours'], info['units']), (3, 2, 'kn'))
        self.assertEqual(info['drift_nm'], 2.63)   # matches the worked example's harbor point

    def test_coops_summary(self):
        ok = {'current_predictions': {'units': 'feet, knots', 'cp': [{}, {}, {}]}}
        self.assertEqual(coops_summary(ok), {'rows': 3, 'units': 'feet, knots'})
        err = coops_summary({'error': {'message': 'No station found'}})
        self.assertEqual(err['error'], 'No station found')


if __name__ == '__main__':
    unittest.main()
