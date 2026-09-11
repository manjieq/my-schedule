// Ported unchanged (aside from vitest -> jest globals) from
// course-scheduler-mobile's packages/shared-types/src/layout.test.ts.
import {
  DEFAULT_DAY_COLUMN_WIDTH,
  GUTTER_WIDTH,
  layoutOverlaps,
  scheduleGridWidth,
  type LayoutInput,
} from './layout';
import type { ClassEntry } from './models';

function classEntry(id: string, schedule: ClassEntry['schedule']): ClassEntry {
  return { id, name: id, credits: 3, schedule, createdAt: '2026-01-01T00:00:00.000Z' };
}

describe('layoutOverlaps', () => {
  it('gives non-overlapping items their own single-column cluster', () => {
    const items: LayoutInput<string>[] = [
      { key: 'a', start: 0, end: 60, data: 'a' },
      { key: 'b', start: 60, end: 120, data: 'b' }, // touches but doesn't overlap
    ];
    const result = layoutOverlaps(items);
    expect(result.find((r) => r.key === 'a')?.columnCount).toBe(1);
    expect(result.find((r) => r.key === 'b')?.columnCount).toBe(1);
  });

  it('packs a 3-way overlapping cluster into 3 side-by-side columns', () => {
    const items: LayoutInput<string>[] = [
      { key: 'a', start: 0, end: 90, data: 'a' },
      { key: 'b', start: 0, end: 90, data: 'b' },
      { key: 'c', start: 0, end: 90, data: 'c' },
    ];
    const result = layoutOverlaps(items);
    const columns = result.map((r) => r.column).sort();
    expect(columns).toEqual([0, 1, 2]);
    expect(result.every((r) => r.columnCount === 3)).toBe(true);
  });

  it('reuses a freed column once an earlier item in the cluster ends', () => {
    // a: 0-30, b: 10-40 (overlaps both a and c -> keeps the cluster connected),
    // c: 35-60 (starts after a ends at 30, so it can reuse a's column instead
    // of needing a 3rd column even though it overlaps b).
    const items: LayoutInput<string>[] = [
      { key: 'a', start: 0, end: 30, data: 'a' },
      { key: 'b', start: 10, end: 40, data: 'b' },
      { key: 'c', start: 35, end: 60, data: 'c' },
    ];
    const result = layoutOverlaps(items);
    expect(result.every((r) => r.columnCount === 2)).toBe(true);
    expect(result.find((r) => r.key === 'a')?.column).toBe(0);
    expect(result.find((r) => r.key === 'b')?.column).toBe(1);
    expect(result.find((r) => r.key === 'c')?.column).toBe(0);
  });
});

// The export plate sizes itself from this, and a wrong answer is what put the
// schedule against the left edge of the shared image in the first place.
describe('scheduleGridWidth', () => {
  it('counts five columns for a weekday-only schedule', () => {
    const classes = [
      classEntry('a', [{ day: 'MON', start: '09:00', end: '10:00' }]),
      classEntry('b', [{ day: 'FRI', start: '13:00', end: '14:00' }]),
    ];
    expect(scheduleGridWidth(classes)).toBe(GUTTER_WIDTH + 5 * DEFAULT_DAY_COLUMN_WIDTH);
  });

  it('widens to seven columns once a class meets on both weekend days', () => {
    const classes = [
      classEntry('a', [{ day: 'MON', start: '09:00', end: '10:00' }]),
      classEntry('b', [{ day: 'SAT', start: '10:00', end: '11:00' }]),
      classEntry('c', [{ day: 'SUN', start: '10:00', end: '11:00' }]),
    ];
    expect(scheduleGridWidth(classes)).toBe(GUTTER_WIDTH + 7 * DEFAULT_DAY_COLUMN_WIDTH);
  });

  it('keeps the five weekday columns even with nothing scheduled', () => {
    expect(scheduleGridWidth([])).toBe(GUTTER_WIDTH + 5 * DEFAULT_DAY_COLUMN_WIDTH);
  });

  it('honours an explicit column width', () => {
    const classes = [classEntry('a', [{ day: 'MON', start: '09:00', end: '10:00' }])];
    expect(scheduleGridWidth(classes, 80)).toBe(GUTTER_WIDTH + 5 * 80);
  });
});
