// Ported from course-scheduler-mobile's packages/shared-types/src/time.test.ts
// (vitest -> jest globals, Course -> ClassEntry).
import {
  computeScheduleDays,
  computeScheduleHourRange,
  classHasConflict,
  findConflicts,
  formatTime,
  slotsOverlap,
  toMinutes,
} from './time';
import type { ClassEntry } from './models';

function classEntry(id: string, name: string, schedule: ClassEntry['schedule']): ClassEntry {
  return { id, name, credits: 3, schedule, createdAt: '2026-01-01T00:00:00.000Z' };
}

describe('toMinutes / formatTime', () => {
  it('converts HH:MM to minutes since midnight', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('09:30')).toBe(570);
    expect(toMinutes('23:59')).toBe(1439);
  });

  it('formats 24h time into 12h AM/PM', () => {
    expect(formatTime('00:00')).toBe('12:00 AM');
    expect(formatTime('13:05')).toBe('1:05 PM');
    expect(formatTime('12:00')).toBe('12:00 PM');
  });
});

describe('slotsOverlap', () => {
  it('is false for different days even with the same time range', () => {
    expect(
      slotsOverlap({ day: 'MON', start: '09:00', end: '10:00' }, { day: 'TUE', start: '09:00', end: '10:00' })
    ).toBe(false);
  });

  it('is true for overlapping ranges on the same day', () => {
    expect(
      slotsOverlap({ day: 'MON', start: '09:00', end: '10:30' }, { day: 'MON', start: '10:00', end: '11:00' })
    ).toBe(true);
  });

  it('is false for back-to-back (touching but not overlapping) ranges', () => {
    expect(
      slotsOverlap({ day: 'MON', start: '09:00', end: '10:00' }, { day: 'MON', start: '10:00', end: '11:00' })
    ).toBe(false);
  });
});

describe('findConflicts / classHasConflict', () => {
  it('finds no conflicts among non-overlapping classes', () => {
    const a = classEntry('a', 'CS101', [{ day: 'MON', start: '09:00', end: '10:00' }]);
    const b = classEntry('b', 'CS102', [{ day: 'MON', start: '10:00', end: '11:00' }]);
    const c = classEntry('c', 'CS103', [{ day: 'TUE', start: '09:00', end: '10:00' }]);

    const conflicts = findConflicts([a, b, c]);
    expect(conflicts).toHaveLength(0);
    expect(classHasConflict(a, conflicts)).toBe(false);
  });

  it('finds exactly the overlapping pair among mixed classes', () => {
    const a = classEntry('a', 'CS101', [{ day: 'MON', start: '09:00', end: '10:30' }]);
    const b = classEntry('b', 'CS102', [{ day: 'MON', start: '10:00', end: '11:00' }]); // overlaps a
    const c = classEntry('c', 'CS103', [{ day: 'WED', start: '09:00', end: '10:00' }]); // no overlap

    const conflicts = findConflicts([a, b, c]);
    expect(conflicts).toHaveLength(1);
    expect(new Set([conflicts[0].classA.id, conflicts[0].classB.id])).toEqual(new Set(['a', 'b']));
    expect(classHasConflict(a, conflicts)).toBe(true);
    expect(classHasConflict(b, conflicts)).toBe(true);
    expect(classHasConflict(c, conflicts)).toBe(false);
  });
});

describe('computeScheduleHourRange', () => {
  it('stays at the defaults when every class fits inside them', () => {
    const classes = [classEntry('a', 'CS101', [{ day: 'MON', start: '09:00', end: '10:00' }])];
    expect(computeScheduleHourRange(classes)).toEqual({ startHour: 8, endHour: 17 });
  });

  it('returns the defaults for an empty class list', () => {
    expect(computeScheduleHourRange([])).toEqual({ startHour: 8, endHour: 17 });
  });

  it('extends the end hour, plus padding, for a night class past the default', () => {
    const classes = [classEntry('a', 'CS101', [{ day: 'WED', start: '17:00', end: '18:00' }])];
    // raw end hour is 18 (ceil of 18:00); +1 hour of padding since it exceeded the default.
    expect(computeScheduleHourRange(classes)).toEqual({ startHour: 8, endHour: 19 });
  });

  it('extends the start hour for a class earlier than the default, without padding it', () => {
    const classes = [classEntry('a', 'CS101', [{ day: 'MON', start: '07:00', end: '08:00' }])];
    expect(computeScheduleHourRange(classes)).toEqual({ startHour: 7, endHour: 17 });
  });

  it('rounds a non-hour-aligned end time up before padding', () => {
    const classes = [classEntry('a', 'CS101', [{ day: 'FRI', start: '17:00', end: '17:30' }])];
    // ceil(17:30) = 18, +1 padding = 19.
    expect(computeScheduleHourRange(classes)).toEqual({ startHour: 8, endHour: 19 });
  });
});

describe('computeScheduleDays', () => {
  it('stays at Mon-Fri when no class meets on a weekend', () => {
    const classes = [classEntry('a', 'CS101', [{ day: 'MON', start: '09:00', end: '10:00' }])];
    expect(computeScheduleDays(classes)).toEqual(['MON', 'TUE', 'WED', 'THU', 'FRI']);
  });

  it('returns Mon-Fri for an empty class list', () => {
    expect(computeScheduleDays([])).toEqual(['MON', 'TUE', 'WED', 'THU', 'FRI']);
  });

  it('appends Saturday only when a class actually meets then', () => {
    const classes = [classEntry('a', 'CS101', [{ day: 'SAT', start: '09:00', end: '10:00' }])];
    expect(computeScheduleDays(classes)).toEqual(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']);
  });

  it('appends Sunday only when a class actually meets then, after Saturday', () => {
    const classes = [
      classEntry('a', 'CS101', [{ day: 'SUN', start: '09:00', end: '10:00' }]),
      classEntry('b', 'CS102', [{ day: 'SAT', start: '09:00', end: '10:00' }]),
    ];
    expect(computeScheduleDays(classes)).toEqual(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
  });
});
