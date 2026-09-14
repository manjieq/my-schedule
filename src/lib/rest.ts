// When the board has nothing to say today.
//
// On a weekend, or on a weekday with nothing called, drawing the full week
// spends the loudest element on the screen on information the user did not
// ask for. The board goes to rest instead: it keeps its ruled shape, drops
// the blocks, and the readout speaks one line. Tapping the board brings the
// week back, so nothing is actually hidden — only quietened.
import type { ClassEntry, DayOfWeek } from './models';

/**
 * What the readout says while the board is at rest. Three lines, picked at
 * random, so the same day twice in a row does not read like a stuck display.
 * Stored lowercase — the LCD uppercases its own text.
 */
export const REST_MESSAGES = ['board is dark', 'no calls today', 'the line is quiet'];

export function isWeekend(day: DayOfWeek): boolean {
  return day === 'SAT' || day === 'SUN';
}

/**
 * Whether the board should rest on `day`. The weekend always rests, even if
 * something is scheduled on it — the week's work is the weekday sheet, and a
 * Saturday class is the exception you go looking for rather than the thing
 * the board opens on.
 */
export function isRestDay(classes: ClassEntry[], day: DayOfWeek): boolean {
  if (isWeekend(day)) return true;
  return !classes.some((c) => c.schedule.some((slot) => slot.day === day));
}

/**
 * An index into REST_MESSAGES. Never returns `current`, so returning the
 * board to rest always changes the line rather than looking like nothing
 * happened.
 */
export function pickRestMessage(current?: number): number {
  if (current === undefined) return Math.floor(Math.random() * REST_MESSAGES.length);
  const offset = 1 + Math.floor(Math.random() * (REST_MESSAGES.length - 1));
  return (current + offset) % REST_MESSAGES.length;
}
