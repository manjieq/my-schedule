// Ported unchanged from course-scheduler-mobile's
// packages/shared-types/src/credits.ts (Course -> ClassEntry).
import type { ClassEntry } from './models';

export function sumCredits(classes: ClassEntry[]): number {
  return classes.reduce((total, c) => total + c.credits, 0);
}

export function isOverLimit(classes: ClassEntry[], maxCredits: number): boolean {
  return sumCredits(classes) > maxCredits;
}
