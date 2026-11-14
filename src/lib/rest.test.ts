import { REST_MESSAGES, isRestDay, isWeekend, pickRestMessage } from './rest';
import type { ClassEntry } from './models';

function classEntry(id: string, schedule: ClassEntry['schedule']): ClassEntry {
  return { id, name: id, credits: 3, schedule, createdAt: '2026-01-01T00:00:00.000Z' };
}

const monday = classEntry('a', [{ day: 'MON', start: '09:00', end: '10:30' }]);
const saturday = classEntry('b', [{ day: 'SAT', start: '09:00', end: '10:30' }]);

describe('isWeekend', () => {
  it('is true only for SAT and SUN', () => {
    expect(isWeekend('SAT')).toBe(true);
    expect(isWeekend('SUN')).toBe(true);
    expect(isWeekend('FRI')).toBe(false);
    expect(isWeekend('MON')).toBe(false);
  });
});

describe('isRestDay', () => {
  it('rests on a weekday with nothing scheduled', () => {
    expect(isRestDay([monday], 'TUE')).toBe(true);
  });

  it('does not rest on a weekday with a class', () => {
    expect(isRestDay([monday], 'MON')).toBe(false);
  });

  it('rests on the weekend even when a class meets then', () => {
    expect(isRestDay([saturday], 'SAT')).toBe(true);
  });

  it('rests when there is nothing at all', () => {
    expect(isRestDay([], 'WED')).toBe(true);
  });
});

describe('pickRestMessage', () => {
  it('always returns an index into REST_MESSAGES', () => {
    for (let i = 0; i < 200; i += 1) {
      const index = pickRestMessage();
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(REST_MESSAGES.length);
      expect(REST_MESSAGES[index]).toBeTruthy();
    }
  });

  it('never repeats the message it was given', () => {
    for (let current = 0; current < REST_MESSAGES.length; current += 1) {
      for (let i = 0; i < 200; i += 1) {
        const next = pickRestMessage(current);
        expect(next).not.toBe(current);
        expect(REST_MESSAGES[next]).toBeTruthy();
      }
    }
  });
});
