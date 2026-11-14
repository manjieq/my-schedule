// The campus shuttle: which timetable applies today, and when the next bus
// leaves. Pure functions over the bundled table in bus-timetable.ts, so every
// rule here is unit-tested without a device clock.
import { TIMETABLE, type DayTimetable, type TimetableColumn } from './bus-timetable';

export type BusPeriod = 'semester' | 'session' | 'vacation';
export type BusDayKind = 'weekday' | 'weekend';
export type BusStop = 'residence' | 'shuttlecock' | 'handaeap' | 'terminal';
export type BusRoute = 'direct' | 'terminalDirect' | 'cycle' | 'jungang';

export interface Departure {
  /** Minutes since midnight. */
  minutes: number;
  route: BusRoute;
}

export const BUS_PERIODS: BusPeriod[] = ['semester', 'session', 'vacation'];

export const PERIOD_LABELS: Record<BusPeriod, string> = {
  semester: 'Semester',
  session: 'Session',
  vacation: 'Vacation',
};

/** The four stops, in route order. `detail` is the small second line on the
 *  stop key — the stop names alone mean little to someone new to the campus. */
export const BUS_STOPS: { id: BusStop; name: string; detail: string }[] = [
  { id: 'residence', name: 'Residence', detail: 'Dorms' },
  { id: 'shuttlecock', name: 'Shuttlecock', detail: 'Campus' },
  { id: 'handaeap', name: 'Handaeap', detail: 'Line 4' },
  { id: 'terminal', name: 'Terminal', detail: 'Yesulin APT' },
];

export function stopName(stop: BusStop): string {
  return BUS_STOPS.find((s) => s.id === stop)?.name ?? stop;
}

/**
 * Where a bus from `from` can take you, when that is a choice. Only
 * Shuttlecock splits — towards Handaeap or towards the Terminal. Every bus
 * from the other three stops heads back to campus, so they offer no choice.
 */
export function destinationsFrom(from: BusStop): BusStop[] {
  return from === 'shuttlecock' ? ['handaeap', 'terminal'] : [];
}

/** The stop a trip ends at, for the readout's "to" line. */
export function destinationLabel(from: BusStop, to: BusStop | undefined): string {
  if (from === 'shuttlecock') return stopName(to ?? 'handaeap');
  return 'Campus';
}

/** One-letter mark for the full table. Direct buses are the default and go
 *  unmarked, so the table stays quiet where most of it is the same. */
export const ROUTE_MARKS: Record<BusRoute, string> = {
  direct: '',
  terminalDirect: '',
  cycle: 'C',
  jungang: 'J',
};

export const ROUTE_LABELS: Record<BusRoute, string> = {
  direct: 'Direct',
  terminalDirect: 'Direct',
  cycle: 'Cycle',
  jungang: 'Via Jungang',
};

const SUFFIX_ROUTES: Record<string, BusRoute> = {
  '': 'direct',
  Y: 'terminalDirect',
  C: 'cycle',
  J: 'jungang',
};

/** Parses one column of bus-timetable.ts into departures, in order. */
export function parseColumn(column: TimetableColumn): Departure[] {
  const out: Departure[] = [];
  for (const row of column) {
    const [hour, ...minutes] = row.split(' ');
    for (const token of minutes) {
      const route = SUFFIX_ROUTES[token.slice(2)];
      if (!route) throw new Error(`Unknown route mark in bus timetable: "${token}"`);
      out.push({ minutes: Number(hour) * 60 + Number(token.slice(0, 2)), route });
    }
  }
  return out;
}

/**
 * Every departure from `from` (towards `to`, at Shuttlecock) on one day's
 * table, sorted by time.
 *
 * Residence sometimes prints two buses on the same minute (one direct to
 * Handaeap, one to the Terminal); both reach campus, so the minute is listed
 * once. Shuttlecock towards the Terminal is the cycle buses plus its own
 * direct column.
 */
export function departuresFor(day: DayTimetable, from: BusStop, to?: BusStop): Departure[] {
  let list: Departure[];
  switch (from) {
    case 'residence': {
      const seen = new Set<number>();
      list = parseColumn(day.residence).filter((d) => {
        if (seen.has(d.minutes)) return false;
        seen.add(d.minutes);
        return true;
      });
      break;
    }
    case 'shuttlecock':
      list =
        to === 'terminal'
          ? [
              ...parseColumn(day.shuttlecock).filter((d) => d.route === 'cycle'),
              ...parseColumn(day.shuttlecockTerminal).map((d) => ({ ...d, route: 'terminalDirect' as const })),
            ]
          : parseColumn(day.shuttlecock);
      break;
    case 'handaeap':
      list = parseColumn(day.handaeap);
      break;
    case 'terminal':
      list = parseColumn(day.terminal);
      break;
  }
  return list.sort((a, b) => a.minutes - b.minutes);
}

/* ---------------------------------------------------------------------------
   Which table applies.

   The app is offline, so it cannot read the university calendar. Korean
   semesters open on Mar 1 / Sep 1 by convention and run about sixteen weeks;
   the seasonal sessions follow straight after for roughly three to four
   weeks. These boundaries are estimates and can be a week off at the edges —
   which is why the readout always names the table it is using, and why
   Settings can override it.
--------------------------------------------------------------------------- */

/** Month * 100 + day, so a date range is a plain number comparison. */
function monthDay(date: Date): number {
  return (date.getMonth() + 1) * 100 + date.getDate();
}

export function guessPeriod(date: Date): BusPeriod {
  const md = monthDay(date);
  if ((md >= 301 && md <= 621) || (md >= 901 && md <= 1221)) return 'semester';
  // Summer session after the spring semester, winter session after the fall
  // one (which runs over New Year).
  if ((md >= 622 && md <= 715) || md >= 1222 || md <= 115) return 'session';
  return 'vacation';
}

/**
 * A manual choice of table. `over` is the guess it replaced: once the guess
 * itself moves on (the season changed), the override no longer applies, so a
 * correction made at the edge of a term never outlives that term.
 */
export interface BusPeriodOverride {
  period: BusPeriod;
  over: BusPeriod;
}

export function effectivePeriod(date: Date, override: BusPeriodOverride | null | undefined): BusPeriod {
  const guess = guessPeriod(date);
  return override && override.over === guess ? override.period : guess;
}

/** Whether a manual override is what is deciding the table right now. */
export function isOverrideActive(date: Date, override: BusPeriodOverride | null | undefined): boolean {
  return !!override && override.over === guessPeriod(date) && override.period !== override.over;
}

/* ---------------------------------------------------------------------------
   Holidays.

   South Korean public holidays run the weekend timetable. Bundled for 2026 and
   2027, substitute days included; Labor Day (May 1) and Constitution Day
   (Jul 17) are holidays from 2026. Weekend dates are listed too, for
   completeness, though the weekend rule already covers them. Extend this when
   the next year's dates are announced.
--------------------------------------------------------------------------- */

export const HOLIDAYS = new Set<string>([
  // 2026
  '2026-01-01',
  '2026-02-16', '2026-02-17', '2026-02-18', // Seollal
  '2026-03-01', '2026-03-02', // Independence Movement Day + substitute
  '2026-05-01', // Labor Day
  '2026-05-05', // Children's Day
  '2026-05-24', '2026-05-25', // Buddha's Birthday + substitute
  '2026-06-03', // local elections
  '2026-06-06', // Memorial Day
  '2026-07-17', // Constitution Day
  '2026-08-15', '2026-08-17', // Liberation Day + substitute
  '2026-09-24', '2026-09-25', '2026-09-26', // Chuseok
  '2026-10-03', '2026-10-05', // National Foundation Day + substitute
  '2026-10-09', // Hangul Day
  '2026-12-25',
  // 2027
  '2027-01-01',
  '2027-02-06', '2027-02-07', '2027-02-08', '2027-02-09', // Seollal + substitute
  '2027-03-01',
  '2027-05-01', '2027-05-03', // Labor Day + substitute
  '2027-05-05',
  '2027-05-13', // Buddha's Birthday
  '2027-06-06',
  '2027-07-17', '2027-07-19', // Constitution Day + substitute
  '2027-08-15', '2027-08-16', // Liberation Day + substitute
  '2027-09-14', '2027-09-15', '2027-09-16', // Chuseok
  '2027-10-03', '2027-10-04', // National Foundation Day + substitute
  '2027-10-09', '2027-10-11', // Hangul Day + substitute
  '2027-12-25', '2027-12-27', // Christmas + substitute
]);

/** "YYYY-MM-DD" in local time — the phone's own date, not UTC. */
export function localDateKey(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function isHoliday(date: Date): boolean {
  return HOLIDAYS.has(localDateKey(date));
}

export function dayKindOn(date: Date): BusDayKind {
  const day = date.getDay();
  return day === 0 || day === 6 || isHoliday(date) ? 'weekend' : 'weekday';
}

/** What the readout calls today: a holiday is named as one rather than as
 *  "weekend", so a Tuesday running the weekend table does not look wrong. */
export function dayLabel(date: Date): string {
  const day = date.getDay();
  if (day !== 0 && day !== 6 && isHoliday(date)) return 'Holiday';
  return dayKindOn(date) === 'weekend' ? 'Weekend' : 'Weekday';
}

export function timetableFor(period: BusPeriod, kind: BusDayKind): DayTimetable {
  return TIMETABLE[period][kind];
}

/* ---------------------------------------------------------------------------
   The reading: what the readout says at a given moment.
--------------------------------------------------------------------------- */

/** Beyond this the countdown stops being useful and the readout gives the
 *  time instead — "in 143 min" is arithmetic the reader has to undo. */
export const COUNTDOWN_LIMIT = 99;

export type BusReading =
  | { kind: 'countdown'; next: Departure; inMinutes: number; then: Departure[] }
  | { kind: 'later'; next: Departure; then: Departure[] }
  | { kind: 'ended'; last: Departure | null; firstTomorrow: Departure | null };

export interface BusQuery {
  from: BusStop;
  to?: BusStop;
  override?: BusPeriodOverride | null;
}

export function departuresOn(date: Date, query: BusQuery): Departure[] {
  const period = effectivePeriod(date, query.override);
  return departuresFor(timetableFor(period, dayKindOn(date)), query.from, query.to);
}

export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function readBus(now: Date, query: BusQuery): BusReading {
  const today = departuresOn(now, query);
  const nowMinutes = minutesOfDay(now);
  // A bus leaving this very minute still counts — it is "0 min", not gone.
  const index = today.findIndex((d) => d.minutes >= nowMinutes);

  if (index === -1) {
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return {
      kind: 'ended',
      last: today.length ? today[today.length - 1] : null,
      firstTomorrow: departuresOn(tomorrow, query)[0] ?? null,
    };
  }

  const next = today[index];
  const then = today.slice(index + 1, index + 3);
  const inMinutes = next.minutes - nowMinutes;
  return inMinutes <= COUNTDOWN_LIMIT
    ? { kind: 'countdown', next, inMinutes, then }
    : { kind: 'later', next, then };
}

/** "07:05" from minutes since midnight. */
export function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
