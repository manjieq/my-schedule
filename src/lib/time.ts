// Ported near-verbatim from course-scheduler-mobile's
// packages/shared-types/src/time.ts (Course -> ClassEntry). Conflict
// detection stays a pure, on-demand computation (never persisted) and is a
// warning only, never a block on adding/including a class.
import type { ClassEntry, ConflictPair, DayOfWeek, TimeSlot } from './models';

/** Converts a "HH:MM" 24h string into minutes since midnight. */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Formats "HH:MM" (24h) into a friendlier "h:MM AM/PM" label. */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function slotLabel(slot: TimeSlot): string {
  return `${slot.day} ${formatTime(slot.start)}-${formatTime(slot.end)}`;
}

/** True if two time slots fall on the same day and their intervals overlap. */
export function slotsOverlap(a: TimeSlot, b: TimeSlot): boolean {
  if (a.day !== b.day) return false;
  return toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
}

/**
 * Pairwise-checks every meeting time of every class against every other
 * class and returns each overlapping pair found. O(n^2) over slots, which
 * is fine at the scale of one person's own schedule.
 */
export function findConflicts(classes: ClassEntry[]): ConflictPair[] {
  const conflicts: ConflictPair[] = [];
  for (let i = 0; i < classes.length; i++) {
    for (let j = i + 1; j < classes.length; j++) {
      const classA = classes[i];
      const classB = classes[j];
      for (const slotA of classA.schedule) {
        for (const slotB of classB.schedule) {
          if (slotsOverlap(slotA, slotB)) {
            conflicts.push({ classA, classB, slotA, slotB });
          }
        }
      }
    }
  }
  return conflicts;
}

/** True if the given class has at least one slot conflicting with another class in the list. */
export function classHasConflict(classEntry: ClassEntry, conflicts: ConflictPair[]): boolean {
  return conflicts.some((c) => c.classA.id === classEntry.id || c.classB.id === classEntry.id);
}

export interface ScheduleHourRange {
  startHour: number;
  endHour: number;
}

/**
 * Derives the hour range a weekly schedule grid should render, so a night
 * class isn't cut off at a fixed 5pm boundary. Stays at the given defaults
 * (8am-5pm) whenever every class fits inside them — the padding only kicks
 * in once something actually runs later, rather than always adding dead
 * space to the common case.
 */
export function computeScheduleHourRange(
  classes: ClassEntry[],
  options: { defaultStartHour?: number; defaultEndHour?: number; endPaddingHours?: number } = {}
): ScheduleHourRange {
  const { defaultStartHour = 8, defaultEndHour = 17, endPaddingHours = 1 } = options;

  let earliestStartMin = defaultStartHour * 60;
  let latestEndMin = defaultEndHour * 60;
  for (const classEntry of classes) {
    for (const slot of classEntry.schedule) {
      earliestStartMin = Math.min(earliestStartMin, toMinutes(slot.start));
      latestEndMin = Math.max(latestEndMin, toMinutes(slot.end));
    }
  }

  const startHour = Math.floor(earliestStartMin / 60);
  const rawEndHour = Math.ceil(latestEndMin / 60);
  const endHour = rawEndHour <= defaultEndHour ? defaultEndHour : rawEndHour + endPaddingHours;

  return { startHour, endHour };
}

const WEEKDAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

/**
 * Derives which day columns a weekly schedule grid should render — the
 * same "only pay for what's actually used" idea as
 * computeScheduleHourRange, applied to days instead of hours. Mon-Fri
 * always render (the near-universal case); Saturday and/or Sunday are
 * appended only when a class actually meets then, so the common
 * Mon-Fri-only schedule keeps the narrower 5-day layout instead of always
 * reserving two columns nobody uses. DAYS_OF_WEEK itself (all 7,
 * unconditionally) stays the right choice for an *editor* like
 * TimeSlotEditor, where the point is letting the user pick a day that
 * doesn't show up in their schedule yet.
 */
export function computeScheduleDays(classes: ClassEntry[]): DayOfWeek[] {
  const present = new Set(classes.flatMap((c) => c.schedule.map((slot) => slot.day)));
  const days = [...WEEKDAYS];
  if (present.has('SAT')) days.push('SAT');
  if (present.has('SUN')) days.push('SUN');
  return days;
}
