// Ported from course-scheduler-mobile's components/schedule/ScheduleGrid.tsx
// (Course -> ClassEntry). Measures its own available width/height and
// shrinks hour rows / day columns — down to a floor — to try to fit the
// whole week without scrolling, rather than always defaulting to the
// widest/tallest size and forcing the user to scroll.
import { useState } from 'react';
import { ScrollView, Text, View, type LayoutChangeEvent } from 'react-native';

import { DAY_LABELS } from '@/lib/models';
import type { ClassEntry, ConflictPair, TimeSlot } from '@/lib/models';
import { computeScheduleDays, computeScheduleHourRange, toMinutes } from '@/lib/time';
import { layoutOverlaps, type LayoutInput } from '@/lib/layout';

import { EventBlock } from './EventBlock';

const GUTTER_WIDTH = 48;
const DEFAULT_DAY_COLUMN_WIDTH = 104;
const MIN_DAY_COLUMN_WIDTH = 64;
// onLayout reports the root View's border-box width, but its border/rounded
// corners eat a couple of pixels the raw measurement doesn't account for —
// without this, columns sized to exactly fill the measured width could end
// up a hair too wide and get visibly nicked at the edge.
const EDGE_SAFETY_MARGIN = 8;
const DEFAULT_HOUR_PX = 48;
const MIN_HOUR_PX = 28;
// Rough height of the day-label header row — subtracted from maxBodyHeight
// so the shrink math is against the whole grid's footprint.
const HEADER_ROW_HEIGHT = 28;

interface ScheduleGridProps {
  classes: ClassEntry[];
  colorFor: (classId: string) => string;
  conflicts?: ConflictPair[];
  differs?: Set<string>;
  /** Available vertical space for the whole grid component (header row
   *  included), if known. Omit to always use DEFAULT_HOUR_PX. */
  maxBodyHeight?: number;
}

interface EventEntry {
  classEntry: ClassEntry;
  slot: TimeSlot;
}

export function ScheduleGrid({ classes, colorFor, conflicts = [], differs, maxBodyHeight }: ScheduleGridProps) {
  // Hooks first, before the empty-state early return below — rules of hooks.
  const [containerWidth, setContainerWidth] = useState(0);
  const handleContainerLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  if (classes.length === 0) {
    return (
      <View className="mx-4 items-center justify-center rounded-xl border border-dashed border-neutral-300 p-6 dark:border-neutral-700">
        <Text className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          No classes included — add classes and include them to generate a schedule.
        </Text>
      </View>
    );
  }

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
    availableColumnsWidth && naturalColumnsWidth > availableColumnsWidth
      ? Math.max(MIN_DAY_COLUMN_WIDTH, Math.floor(availableColumnsWidth / days.length))
      : DEFAULT_DAY_COLUMN_WIDTH;

  const isConflicted = (slot: TimeSlot) => conflicts.some((c) => c.slotA === slot || c.slotB === slot);

  return (
    <View
      className="mx-4 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800"
      onLayout={handleContainerLayout}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View className="flex-row border-b border-neutral-200 dark:border-neutral-800">
            <View style={{ width: GUTTER_WIDTH }} />
            {days.map((day) => (
              <View key={day} style={{ width: DAY_COLUMN_WIDTH }} className="items-center py-1.5">
                <Text className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                  {DAY_LABELS[day]}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-row">
            <View style={{ width: GUTTER_WIDTH, height: bodyHeight }}>
              {Array.from({ length: totalHours + 1 }, (_, i) => START_HOUR + i).map((hour) => (
                <Text
                  key={hour}
                  className="absolute text-[10px] text-neutral-400 dark:text-neutral-500"
                  style={{ top: (hour - START_HOUR) * HOUR_PX - 5, left: 4 }}
                >
                  {hour}:00
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

              return (
                <View
                  key={day}
                  style={{ width: DAY_COLUMN_WIDTH, height: bodyHeight }}
                  className="border-l border-neutral-100 dark:border-neutral-900"
                >
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
