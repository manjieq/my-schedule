// Domain types for the app. Ported from course-scheduler-mobile's
// packages/shared-types/src/models.ts, stripped of everything tied to
// accounts/university/department/AI-extraction — every class here is
// entered directly by the user, so there's no separate catalog to browse.

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

// Full canonical week — used by TimeSlotEditor's day picker, which should
// always offer all 7 days. A schedule *grid* rendering existing classes
// should NOT iterate this directly (that would always pay for two columns
// nobody uses) — see computeScheduleDays in time.ts for the "only show
// Sat/Sun once a class actually meets then" grid-sizing counterpart.
export const DAYS_OF_WEEK: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

/** A single weekly meeting time, e.g. Monday 09:00-10:30. */
export interface TimeSlot {
  day: DayOfWeek;
  /** 24h "HH:MM" */
  start: string;
  /** 24h "HH:MM" */
  end: string;
}

/** A class the user has manually entered. Can meet more than once a week
 *  (e.g. a lecture plus a separate lab day) via multiple TimeSlots. */
export interface ClassEntry {
  id: string;
  name: string;
  location?: string;
  credits: number;
  instructor?: string;
  schedule: TimeSlot[];
  createdAt: string;
}

/** Every created class is automatically part of "My Classes" — there's no
 *  separate catalog to add from, so only the *included* subset (the one
 *  actually counted toward the schedule/credit total) needs tracking here.
 *  A class can be created but left un-included (e.g. still deciding). */
export interface IncludedState {
  includedIds: string[];
}

/** A named, immutable, point-in-time snapshot of an included-class
 *  combination the user can reload or compare against others. */
export interface Loadout {
  id: string;
  name: string;
  classIds: string[];
  totalCredits: number;
  createdAt: string;
}

export interface ConflictPair {
  classA: ClassEntry;
  classB: ClassEntry;
  slotA: TimeSlot;
  slotB: TimeSlot;
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface AppSettings {
  creditCap: number;
}

export const DEFAULT_CREDIT_CAP = 18;

// AsyncStorage keys — versioned/namespaced so a future data-shape change
// can migrate instead of silently misreading old data.
export const STORAGE_KEYS = {
  classes: 'myschedule:v1:classes',
  includedIds: 'myschedule:v1:includedIds',
  loadouts: 'myschedule:v1:loadouts',
  settings: 'myschedule:v1:settings',
  themePreference: 'myschedule:v1:theme-preference',
} as const;
