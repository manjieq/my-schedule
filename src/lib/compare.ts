// Ported from course-scheduler-mobile's packages/shared-types/src/compare.ts
// (sharedCourseIds -> sharedClassIds).
/**
 * Given each compared loadout's class ids, returns the set of class ids
 * present in every one of them — the comparison views use this to
 * highlight which classes actually differ between loadouts, rather than
 * making the reader eyeball multiple schedule grids side by side to spot
 * what's not shared.
 *
 * Fewer than two groups has nothing to diff against, so returns an empty
 * set — the comparison UI should read that as "no highlighting", not as
 * "everything is shared" (a lone loadout's own classes aren't "shared
 * with nothing").
 */
export function sharedClassIds(classIdGroups: string[][]): Set<string> {
  if (classIdGroups.length < 2) return new Set();
  const [first, ...rest] = classIdGroups;
  return new Set(first.filter((id) => rest.every((group) => group.includes(id))));
}
