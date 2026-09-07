// Adapted from course-scheduler-mobile's apps/mobile/lib/loadout-compare.ts
// (Course -> ClassEntry, courseIds -> classIds, sharedCourseIds -> sharedClassIds).
import { useMemo } from 'react';

import { computeScheduleDays, computeScheduleHourRange } from './time';
import { sharedClassIds } from './compare';
import type { ClassEntry, Loadout } from './models';

/**
 * Shared by both loadout comparison views — landscape's full-detail
 * app/loadout-compare.tsx and portrait's compact LoadoutComparisonView —
 * so the "one shared hour range/day set across every panel, plus which
 * classes are actually common" math isn't duplicated between them and
 * can't drift out of sync.
 *
 * classIds that no longer resolve to an existing class (the class was
 * deleted after the loadout was saved) are silently dropped here — a
 * loadout is an immutable historical snapshot, so it still records the
 * original selection, but comparison/display only ever works with
 * classes that still exist.
 */
export function useComparisonLayout(comparedLoadouts: Loadout[], classesById: Map<string, ClassEntry>) {
  const loadoutClasses = useMemo(
    () =>
      comparedLoadouts.map((loadout) =>
        loadout.classIds.map((id) => classesById.get(id)).filter((c): c is ClassEntry => Boolean(c))
      ),
    [comparedLoadouts, classesById]
  );

  const allComparedClasses = useMemo(() => loadoutClasses.flat(), [loadoutClasses]);
  const { startHour, endHour } = useMemo(() => computeScheduleHourRange(allComparedClasses), [allComparedClasses]);
  const days = useMemo(() => computeScheduleDays(allComparedClasses), [allComparedClasses]);
  const shared = useMemo(
    () => sharedClassIds(comparedLoadouts.map((l) => l.classIds)),
    [comparedLoadouts]
  );

  return { loadoutClasses, startHour, endHour, days, sharedClassIds: shared };
}
