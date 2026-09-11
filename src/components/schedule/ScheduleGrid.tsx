// The board — the week laid out as a production rundown.
//
// Ported from course-scheduler-mobile's components/schedule/ScheduleGrid.tsx
// (Course -> ClassEntry). Measures its own available width/height and
// shrinks hour rows / day columns — down to a floor — to try to fit the
// whole week without scrolling, rather than always defaulting to the
// widest/tallest size and forcing the user to scroll.
//
// Two things were added for the Call Sheet direction, both serving the
// glance-first use in PRODUCT.md: the current day's column is struck in the
// header and washed in the body, and a red NOW rule sits at the current time.
// Both are suppressed on the exported PNG, where "today" is meaningless to
// whoever receives it.
import { useState } from 'react';
import { ScrollView, Text, View, type LayoutChangeEvent } from 'react-native';

import { DAYS_OF_WEEK } from '@/lib/models';
import type { ClassEntry, ConflictPair, DayOfWeek, TimeSlot } from '@/lib/models';
import { computeScheduleDays, computeScheduleHourRange, toMinutes } from '@/lib/time';
import {
  DEFAULT_DAY_COLUMN_WIDTH,
  GUTTER_WIDTH,
  layoutOverlaps,
  type LayoutInput,
} from '@/lib/layout';

import { EventBlock } from './EventBlock';

const MIN_DAY_COLUMN_WIDTH = 64;
// onLayout reports the root View's border-box width, but its border eats a
// couple of pixels the raw measurement doesn't account for — without this,
// columns sized to exactly fill the measured width could end up a hair too
// wide and get visibly nicked at the edge.
const EDGE_SAFETY_MARGIN = 4;
const DEFAULT_HOUR_PX = 62;
const MIN_HOUR_PX = 34;
// Height of the day-label header row — subtracted from maxBodyHeight so the
// shrink math is against the whole board's footprint.
const HEADER_ROW_HEIGHT = 34;
/** The ruled cell: the grid draws a line every half hour, so that is the unit
 *  the NOW band snaps to. */
const SLOT_MINUTES = 30;
// Below this an item has no room for its location line without colliding
// with its own name.
const DENSE_BLOCK_HEIGHT = 86;

interface ScheduleGridProps {
  classes: ClassEntry[];
  colorFor: (classId: string) => string;
  conflicts?: ConflictPair[];
  differs?: Set<string>;
  /** Available vertical space for the whole grid component (header row
   *  included), if known. Omit to always use DEFAULT_HOUR_PX. */
  maxBodyHeight?: number;
  /** Today's strike and the NOW rule. Off for the export plate. */
  showNow?: boolean;
  /** Draw columns at exactly this width instead of measuring the container and
   *  shrinking to fit. The export plate sizes itself around the grid rather
   *  than the other way round, and an off-screen capture cannot wait for an
   *  onLayout pass that may not land before capture(). */
  dayColumnWidth?: number;
}

interface EventEntry {
  classEntry: ClassEntry;
  slot: TimeSlot;
}

/** JS getDay() is Sunday-indexed; DAYS_OF_WEEK is Monday-first. */
function todayKey(now: Date): DayOfWeek {
  return DAYS_OF_WEEK[(now.getDay() + 6) % 7];
}

/** Date number for each weekday of the week `now` falls in, so the header can
 *  read MON 17 / TUE 18 the way a dated sheet does. */
function weekDates(now: Date): Record<DayOfWeek, number> {
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const out = {} as Record<DayOfWeek, number>;
  DAYS_OF_WEEK.forEach((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    out[day] = d.getDate();
  });
  return out;
}

export function ScheduleGrid({
  classes,
  colorFor,
  conflicts = [],
  differs,
  maxBodyHeight,
  showNow = true,
  dayColumnWidth,
}: ScheduleGridProps) {
  // Hooks first, before the empty-state early return below — rules of hooks.
  const [containerWidth, setContainerWidth] = useState(0);
  const handleContainerLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  if (classes.length === 0) {
    return (
      <View className="mx-4 rounded-well bg-well px-6 py-10">
        <Text className="text-center font-panel-semi text-code uppercase text-ink-3">
          nothing called this week
        </Text>
        <Text className="mt-2 text-center text-meta text-ink-2">
          Add classes and include them to build the sheet.
        </Text>
      </View>
    );
  }

  const now = new Date();
  const today = todayKey(now);
  const dates = weekDates(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const days = computeScheduleDays(classes);

  const { startHour: START_HOUR, endHour: END_HOUR } = computeScheduleHourRange(classes);
  const totalHours = END_HOUR - START_HOUR;
  const naturalBodyHeight = totalHours * DEFAULT_HOUR_PX;
  const availableBodyHeight = maxBodyHeight ? Math.max(maxBodyHeight - HEADER_ROW_HEIGHT, 0) : undefined;
  const HOUR_PX =
    availableBodyHeight && naturalBodyHeight > availableBodyHeight
      ? Math.max(MIN_HOUR_PX, Math.floor(availableBodyHeight / totalHours))
      : DEFAULT_HOUR_PX;
  const pxPerMin = HOUR_PX / 60;
  const bodyHeight = totalHours * HOUR_PX;

  const naturalColumnsWidth = DEFAULT_DAY_COLUMN_WIDTH * days.length;
  const availableColumnsWidth = containerWidth
    ? Math.max(containerWidth - GUTTER_WIDTH - EDGE_SAFETY_MARGIN, 0)
    : undefined;
  const DAY_COLUMN_WIDTH =
    dayColumnWidth ??
    (availableColumnsWidth && naturalColumnsWidth > availableColumnsWidth
      ? Math.max(MIN_DAY_COLUMN_WIDTH, Math.floor(availableColumnsWidth / days.length))
      : DEFAULT_DAY_COLUMN_WIDTH);

  const isConflicted = (slot: TimeSlot) => conflicts.some((c) => c.slotA === slot || c.slotB === slot);

  // Now is marked the same way today is: by lighting the cells it falls in,
  // not by drawing a rule across them. The band is one ruled cell tall, so it
  // lands on the grid the sheet is already printed on.
  const nowBandTop = (Math.floor(nowMinutes / SLOT_MINUTES) * SLOT_MINUTES - START_HOUR * 60) * pxPerMin;
  const nowBandHeight = (SLOT_MINUTES * HOUR_PX) / 60;
  const nowVisible = showNow && nowBandTop >= 0 && nowBandTop < bodyHeight;

  return (
    <View
      // The board sits closer to the edge than the rest of the panel. It is
      // the widest thing on the screen and the only one whose content scales
      // with the space it gets; matching the readout's inset made it look
      // narrower than the meter running underneath it.
      className="mx-2"
      // borderStyle is a whole-view property in React Native and was coming
      // through dashed on device; say it outright.
      style={{ borderStyle: 'solid' }}
      onLayout={handleContainerLayout}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* --- day header: today is struck, the way a sheet marks the day
                  it was issued for -------------------------------------- */}
          <View className="flex-row border-b border-hair">
            <View style={{ width: GUTTER_WIDTH }} />
            {days.map((day) => {
              const isToday = showNow && day === today;
              return (
                <View
                  key={day}
                  style={{ width: DAY_COLUMN_WIDTH }}
                  className={`items-center py-[5px] ${isToday ? 'bg-today-wash' : ''}`}
                >
                  <Text
                    className={`font-panel-semi text-code uppercase ${isToday ? 'text-accent' : 'text-ink-3'}`}
                  >
                    {day}
                  </Text>
                  <Text
                    className={`font-panel-bold text-meta ${isToday ? 'text-accent-hi' : 'text-ink-2'}`}
                  >
                    {dates[day]}
                  </Text>
                </View>
              );
            })}
          </View>

          <View className="flex-row">
            {/* --- hour gutter, filled in on the typewriter -------------- */}
            <View style={{ width: GUTTER_WIDTH, height: bodyHeight }}>
              {Array.from({ length: totalHours + 1 }, (_, i) => START_HOUR + i).map((hour) => (
                <Text
                  key={hour}
                  className="absolute font-panel-semi text-tag text-ink-2"
                  style={{
                    top: Math.min((hour - START_HOUR) * HOUR_PX + 2, bodyHeight - 9),
                    right: 5,
                  }}
                >
                  {String(hour).padStart(2, '0')}
                </Text>
              ))}
            </View>

            {days.map((day) => {
              const entries: LayoutInput<EventEntry>[] = [];
              for (const classEntry of classes) {
                for (const slot of classEntry.schedule) {
                  if (slot.day !== day) continue;
                  entries.push({
                    key: `${classEntry.id}-${slot.day}-${slot.start}`,
                    start: toMinutes(slot.start),
                    end: toMinutes(slot.end),
                    data: { classEntry, slot },
                  });
                }
              }
              const positioned = layoutOverlaps(entries);
              const isToday = showNow && day === today;
              const isLastDay = day === days[days.length - 1];

              return (
                <View
                  key={day}
                  style={{
                    width: DAY_COLUMN_WIDTH - (isLastDay ? 0 : 4),
                    height: bodyHeight,
                    marginRight: isLastDay ? 0 : 4,
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(0,0,0,0.10)',
                  }}
                  className="overflow-hidden rounded-well bg-well"
                >
                  {/* today is a wash laid over the recess, not a different
                      recess — the column is still a cut in the same body */}
                  {isToday ? <View className="absolute inset-0 bg-today-wash" /> : null}
                  {/* the cell you are in, right now — same wash as today, so
                      the two cross at the cell you actually care about */}
                  {nowVisible ? (
                    <View
                      className="absolute left-0 right-0 bg-today-wash"
                      style={{ top: nowBandTop, height: nowBandHeight }}
                    />
                  ) : null}
                  <View
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 2 }}
                    className={isToday ? 'bg-today-edge' : ''}
                  />
                  {/* ruled lines: solid on the hour, dotted on the half */}
                  {Array.from({ length: totalHours * 2 }, (_, i) => i).map((i) => (
                    <View
                      key={i}
                      className={`absolute left-0 right-0 border-t ${
                        i % 2 === 0 ? 'border-hair' : 'border-dotted border-hair'
                      }`}
                      style={{ top: (i * HOUR_PX) / 2 }}
                    />
                  ))}

                  {positioned.map((item) => {
                    const top = (item.start - START_HOUR * 60) * pxPerMin;
                    const height = Math.max((item.end - item.start) * pxPerMin - 2, 16);
                    const widthPct = 100 / item.columnCount;
                    const leftPct = item.column * widthPct;
                    return (
                      <EventBlock
                        // column/columnCount ride along in the key so
                        // removing an overlapping sibling forces a fresh
                        // mount of the surviving block instead of an
                        // in-place update.
                        key={`${item.key}-${item.column}-${item.columnCount}`}
                        classEntry={item.data.classEntry}
                        slot={item.data.slot}
                        color={colorFor(item.data.classEntry.id)}
                        conflicted={isConflicted(item.data.slot)}
                        differs={differs?.has(item.data.classEntry.id)}
                        dense={height < DENSE_BLOCK_HEIGHT}
                        position={{
                          top,
                          height,
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
