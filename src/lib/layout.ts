// Ported (largely unchanged) from course-scheduler-mobile's
// packages/shared-types/src/layout.ts. UI layout logic (interval-graph
// column packing for the schedule grid) — separate from time.ts's
// conflict-warning logic even though both detect overlaps.
//
// The board's own geometry lives here too, rather than inside ScheduleGrid,
// because the export plate has to size itself around the grid before the grid
// has rendered. Keeping it in a pure module means that arithmetic can be
// tested without standing up React Native.
import { computeScheduleDays } from './time';
import type { ClassEntry } from './models';

/** The hour column down the left of the board. */
export const GUTTER_WIDTH = 24;
/** One day column at full size. The on-screen board shrinks below this to fit
 *  a phone; the exported image never does. */
export const DEFAULT_DAY_COLUMN_WIDTH = 104;

/** The width the board actually draws at for a given class set — the hour
 *  gutter plus one column per day that has something on it. The export plate
 *  uses this to fit itself to the board instead of guessing a width and
 *  leaving the week stranded against one edge. */
export function scheduleGridWidth(
  classes: ClassEntry[],
  dayColumnWidth: number = DEFAULT_DAY_COLUMN_WIDTH
): number {
  return GUTTER_WIDTH + computeScheduleDays(classes).length * dayColumnWidth;
}

/**
 * Assigns a column + column-count to each item so mutually-overlapping items
 * in the same day render side by side instead of stacking on top of each
 * other. Items are grouped into maximal clusters of transitively-overlapping
 * intervals, then packed into the fewest columns via a greedy sweep — the
 * same approach common calendar UIs (e.g. Google Calendar) use.
 */
export interface LayoutInput<T> {
  key: string;
  start: number;
  end: number;
  data: T;
}

export interface LayoutResult<T> extends LayoutInput<T> {
  column: number;
  columnCount: number;
}

export function layoutOverlaps<T>(items: LayoutInput<T>[]): LayoutResult<T>[] {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end);
  const results: LayoutResult<T>[] = [];

  let cluster: LayoutInput<T>[] = [];
  let clusterEnd = -Infinity;

  const flushCluster = (clusterItems: LayoutInput<T>[]) => {
    const columnEnds: number[] = [];
    for (const item of clusterItems) {
      let column = columnEnds.findIndex((end) => end <= item.start);
      if (column === -1) {
        column = columnEnds.length;
        columnEnds.push(item.end);
      } else {
        columnEnds[column] = item.end;
      }
      results.push({ ...item, column, columnCount: -1 });
    }
    const columnCount = columnEnds.length;
    for (let i = results.length - clusterItems.length; i < results.length; i++) {
      results[i].columnCount = columnCount;
    }
  };

  for (const item of sorted) {
    if (cluster.length === 0 || item.start < clusterEnd) {
      cluster.push(item);
      clusterEnd = Math.max(clusterEnd, item.end);
    } else {
      flushCluster(cluster);
      cluster = [item];
      clusterEnd = item.end;
    }
  }
  if (cluster.length > 0) flushCluster(cluster);

  return results;
}
