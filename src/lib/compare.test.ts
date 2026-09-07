// Ported from course-scheduler-mobile's packages/shared-types/src/compare.test.ts
// (vitest -> jest globals, sharedCourseIds -> sharedClassIds).
import { sharedClassIds } from './compare';

describe('sharedClassIds', () => {
  it('returns an empty set for fewer than two groups', () => {
    expect(sharedClassIds([])).toEqual(new Set());
    expect(sharedClassIds([['a', 'b']])).toEqual(new Set());
  });

  it('returns the intersection across all groups', () => {
    const result = sharedClassIds([
      ['a', 'b', 'c'],
      ['b', 'c', 'd'],
      ['c', 'e'],
    ]);
    expect(result).toEqual(new Set(['c']));
  });

  it('returns an empty set when nothing is common to every group', () => {
    expect(sharedClassIds([['a'], ['b']])).toEqual(new Set());
  });

  it('returns every id when all groups are identical', () => {
    expect(
      sharedClassIds([
        ['a', 'b'],
        ['a', 'b'],
      ])
    ).toEqual(new Set(['a', 'b']));
  });
});
