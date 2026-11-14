import {
  COUNTDOWN_LIMIT,
  dayKindOn,
  dayLabel,
  departuresFor,
  effectivePeriod,
  formatClock,
  guessPeriod,
  isOverrideActive,
  parseColumn,
  readBus,
  timetableFor,
  type BusPeriod,
} from './bus';
import { TIMETABLE } from './bus-timetable';

/** Local time, the way the phone's clock would give it. */
function at(y: number, mo: number, d: number, h = 12, mi = 0): Date {
  return new Date(y, mo - 1, d, h, mi);
}

function clocks(list: { minutes: number }[]): string[] {
  return list.map((d) => formatClock(d.minutes));
}

describe('bus timetable data', () => {
  const periods: BusPeriod[] = ['semester', 'session', 'vacation'];

  it('parses every column, in time order, with a known route mark', () => {
    for (const period of periods) {
      for (const kind of ['weekday', 'weekend'] as const) {
        for (const column of Object.values(TIMETABLE[period][kind])) {
          const list = parseColumn(column);
          for (let i = 1; i < list.length; i += 1) {
            expect(list[i].minutes).toBeGreaterThanOrEqual(list[i - 1].minutes);
          }
          for (const d of list) {
            expect(d.minutes % 60).toBeLessThan(60);
            expect(Math.floor(d.minutes / 60)).toBeGreaterThanOrEqual(7);
            expect(Math.floor(d.minutes / 60)).toBeLessThanOrEqual(23);
          }
        }
      }
    }
  });

  // Spot checks against the PDF, one per table, so a hand edit that drifts
  // from the printed timetable fails here.
  it('matches the semester weekday PDF', () => {
    const day = TIMETABLE.semester.weekday;
    expect(day.shuttlecock).toContain('13 00C 15J 20 30C 45 50');
    expect(day.residence).toContain('13 10J 15 25C 40 45 55C');
    expect(day.handaeap).toContain('16 00 10 16 22J 28 34 40 46 52 58');
    expect(day.terminal).toContain('23 00C 15C');
    expect(day.shuttlecockTerminal).toEqual(['08 20 50', '09 20 50', '10 20 50', '11 20 50', '16 00 30', '17 00 30']);
  });

  it('carries the 19:00 Handaeap departure printed inside the 18:00 cell', () => {
    expect(TIMETABLE.semester.weekday.handaeap).toContain('19 00 10C 20C 30C 40C 50C');
    expect(TIMETABLE.session.weekday.handaeap).toContain('19 00 10C 25C 40C 55C');
  });

  it('matches the session and vacation PDFs', () => {
    expect(TIMETABLE.session.weekday.shuttlecock).toContain('13 00C 10J 20 30C 40 50');
    expect(TIMETABLE.session.weekend.residence).toContain('09 15C 45C');
    expect(TIMETABLE.vacation.weekday.shuttlecock).toContain('12 20C 50C');
    expect(TIMETABLE.vacation.weekend.handaeap).toContain('22 00C');
    expect(TIMETABLE.vacation.weekday.shuttlecockTerminal).toEqual([]);
  });
});

describe('departuresFor', () => {
  const semester = timetableFor('semester', 'weekday');

  it('lists a Residence minute once when two buses share it', () => {
    const tenOClock = clocks(departuresFor(semester, 'residence')).filter((t) => t.startsWith('10:'));
    expect(tenOClock).toEqual(['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:35', '10:45', '10:55']);
  });

  it('sends Shuttlecock to Handaeap on every bus in its column', () => {
    const list = departuresFor(semester, 'shuttlecock', 'handaeap');
    expect(clocks(list).filter((t) => t.startsWith('13:'))).toEqual(['13:00', '13:15', '13:20', '13:30', '13:45', '13:50']);
    expect(list.find((d) => d.minutes === 13 * 60 + 15)?.route).toBe('jungang');
  });

  it('sends Shuttlecock to the Terminal on cycle buses plus the direct column', () => {
    const list = departuresFor(semester, 'shuttlecock', 'terminal');
    expect(clocks(list).filter((t) => t.startsWith('08:') || t.startsWith('12:'))).toEqual([
      '08:20',
      '08:50',
      '12:20',
    ]);
    expect(list.find((d) => d.minutes === 8 * 60 + 20)?.route).toBe('terminalDirect');
    expect(list.find((d) => d.minutes === 12 * 60 + 20)?.route).toBe('cycle');
  });

  it('treats a missing destination at Shuttlecock as Handaeap', () => {
    expect(departuresFor(semester, 'shuttlecock')).toEqual(departuresFor(semester, 'shuttlecock', 'handaeap'));
  });
});

describe('guessPeriod', () => {
  it.each([
    [at(2026, 2, 28), 'vacation'],
    [at(2026, 3, 1), 'semester'],
    [at(2026, 6, 21), 'semester'],
    [at(2026, 6, 22), 'session'],
    [at(2026, 7, 15), 'session'],
    [at(2026, 7, 16), 'vacation'],
    [at(2026, 8, 31), 'vacation'],
    [at(2026, 9, 1), 'semester'],
    [at(2026, 12, 21), 'semester'],
    [at(2026, 12, 22), 'session'],
    [at(2027, 1, 15), 'session'],
    [at(2027, 1, 16), 'vacation'],
  ])('%s is %s', (date, period) => {
    expect(guessPeriod(date)).toBe(period);
  });
});

describe('effectivePeriod', () => {
  it('uses the guess when nothing is overridden', () => {
    expect(effectivePeriod(at(2026, 6, 18), null)).toBe('semester');
  });

  it('applies an override while the guess it replaced still holds', () => {
    const override = { period: 'session' as const, over: 'semester' as const };
    expect(effectivePeriod(at(2026, 6, 18), override)).toBe('session');
    expect(isOverrideActive(at(2026, 6, 18), override)).toBe(true);
  });

  it('drops the override once the season changes', () => {
    const override = { period: 'session' as const, over: 'semester' as const };
    expect(effectivePeriod(at(2026, 7, 20), override)).toBe('vacation');
    expect(isOverrideActive(at(2026, 7, 20), override)).toBe(false);
  });
});

describe('dayKindOn', () => {
  it('runs the weekend table on weekends and holidays', () => {
    expect(dayKindOn(at(2026, 11, 14))).toBe('weekend'); // Saturday
    expect(dayKindOn(at(2026, 11, 17))).toBe('weekday'); // Tuesday
    expect(dayKindOn(at(2026, 9, 24))).toBe('weekend'); // Chuseok, Thursday
    expect(dayKindOn(at(2026, 7, 17))).toBe('weekend'); // Constitution Day, Friday
    expect(dayKindOn(at(2027, 2, 9))).toBe('weekend'); // Seollal substitute, Tuesday
  });

  it('names a weekday holiday as a holiday', () => {
    expect(dayLabel(at(2026, 10, 9))).toBe('Holiday');
    expect(dayLabel(at(2026, 10, 10))).toBe('Weekend');
    expect(dayLabel(at(2026, 10, 8))).toBe('Weekday');
  });
});

describe('readBus', () => {
  // Tuesday 17 Nov 2026: semester weekday.
  it('counts down to the next bus and lists the two after it', () => {
    const reading = readBus(at(2026, 11, 17, 13, 11), { from: 'shuttlecock', to: 'handaeap' });
    expect(reading.kind).toBe('countdown');
    if (reading.kind !== 'countdown') return;
    expect(formatClock(reading.next.minutes)).toBe('13:15');
    expect(reading.next.route).toBe('jungang');
    expect(reading.inMinutes).toBe(4);
    expect(clocks(reading.then)).toEqual(['13:20', '13:30']);
  });

  it('counts a bus leaving this minute as 0 min, not gone', () => {
    const reading = readBus(at(2026, 11, 17, 13, 15), { from: 'shuttlecock' });
    expect(reading.kind === 'countdown' && reading.inMinutes).toBe(0);
  });

  it('gives the time instead of a long countdown', () => {
    const reading = readBus(at(2026, 11, 17, 5, 0), { from: 'shuttlecock' });
    expect(reading.kind).toBe('later');
    if (reading.kind !== 'later') return;
    expect(formatClock(reading.next.minutes)).toBe('07:50');
    expect(7 * 60 + 50 - 5 * 60).toBeGreaterThan(COUNTDOWN_LIMIT);
  });

  it("says when service has ended and gives tomorrow's first bus", () => {
    const reading = readBus(at(2026, 11, 17, 23, 20), { from: 'shuttlecock' });
    expect(reading.kind).toBe('ended');
    if (reading.kind !== 'ended') return;
    expect(reading.last && formatClock(reading.last.minutes)).toBe('23:00');
    expect(reading.firstTomorrow && formatClock(reading.firstTomorrow.minutes)).toBe('07:50');
  });

  it("reads tomorrow's first bus from tomorrow's table", () => {
    // Friday night; Saturday runs the semester weekend table, first bus 08:50.
    const reading = readBus(at(2026, 11, 20, 23, 30), { from: 'shuttlecock' });
    expect(reading.kind === 'ended' && reading.firstTomorrow && formatClock(reading.firstTomorrow.minutes)).toBe(
      '08:50'
    );
  });
});
