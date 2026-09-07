// Ported from course-scheduler-mobile's packages/shared-types/src/credits.test.ts
// (vitest -> jest globals, Course -> ClassEntry).
import { isOverLimit, sumCredits } from './credits';
import type { ClassEntry } from './models';

function classEntry(credits: number): ClassEntry {
  return {
    id: Math.random().toString(36).slice(2),
    name: 'X',
    credits,
    schedule: [],
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('sumCredits / isOverLimit', () => {
  it('sums to zero for an empty list', () => {
    expect(sumCredits([])).toBe(0);
  });

  it('sums credits across classes', () => {
    expect(sumCredits([classEntry(3), classEntry(4), classEntry(2)])).toBe(9);
  });

  it('is over limit only when the sum strictly exceeds the cap', () => {
    const classes = [classEntry(3), classEntry(4), classEntry(2)]; // 9 total
    expect(isOverLimit(classes, 9)).toBe(false);
    expect(isOverLimit(classes, 8)).toBe(true);
  });
});
