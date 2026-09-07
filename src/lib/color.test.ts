// Ported from course-scheduler-mobile's packages/shared-types/src/color.test.ts
// (vitest -> jest globals, Course -> ClassEntry, sorted by name instead of code).
import { buildColorMap, getContrastText, PALETTE } from './color';
import type { ClassEntry } from './models';

function classEntry(id: string, name: string): ClassEntry {
  return { id, name, credits: 3, schedule: [], createdAt: '2026-01-01T00:00:00.000Z' };
}

describe('buildColorMap', () => {
  it('assigns colors deterministically by sorted class name, independent of input order', () => {
    const a = classEntry('id-a', 'CS201');
    const b = classEntry('id-b', 'CS101');
    const c = classEntry('id-c', 'CS301');

    const mapInOrder = buildColorMap([a, b, c]);
    const mapShuffled = buildColorMap([c, a, b]);

    expect(mapInOrder.get('id-a')).toBe(mapShuffled.get('id-a'));
    expect(mapInOrder.get('id-b')).toBe(mapShuffled.get('id-b'));
    expect(mapInOrder.get('id-c')).toBe(mapShuffled.get('id-c'));

    // CS101 sorts first, so it gets PALETTE[0]; CS201 second; CS301 third.
    expect(mapInOrder.get('id-b')).toBe(PALETTE[0]);
    expect(mapInOrder.get('id-a')).toBe(PALETTE[1]);
    expect(mapInOrder.get('id-c')).toBe(PALETTE[2]);
  });

  it('wraps around the palette once class count exceeds its length', () => {
    const classes = Array.from({ length: PALETTE.length + 1 }, (_, i) =>
      classEntry(`id-${i}`, `CS${String(i).padStart(3, '0')}`)
    );
    const map = buildColorMap(classes);
    expect(map.get('id-0')).toBe(map.get(`id-${PALETTE.length}`));
  });
});

describe('getContrastText', () => {
  it('picks white text on a dark background', () => {
    expect(getContrastText('#000000')).toBe('#ffffff');
  });

  it('picks black text on a light background', () => {
    expect(getContrastText('#ffffff')).toBe('#000000');
  });
});
