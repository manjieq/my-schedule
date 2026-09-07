// Ported from course-scheduler-mobile's components/loadouts/ComparisonPanel.tsx
// (Course -> ClassEntry). Deliberately NOT a reuse of ScheduleGrid: that
// component packs its own horizontal ScrollView, which would gesture-
// conflict once nested inside another horizontally-scrollable row of
// panels. This sizes its day columns to the panel's own available width and
// never scrolls itself. EventBlock is still reused as-is.
import { useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';

import { DAY_LABELS } from '@/lib/models';
import type { ClassEntry, DayOfWeek, TimeSlot } from '@/lib/models';
import { findConflicts, toMinutes } from '@/lib/time';
import { layoutOverlaps, type LayoutInput } from '@/lib/layout';

import { EventBlock } from '../schedule/EventBlock';

const GUTTER_WIDTH = 26;
const DEFAULT_HOUR_PX = 26;
const MIN_HOUR_PX = 16;
const DAY_HEADER_ROW_HEIGHT = 20;

interface ComparisonPanelProps {
  name: string;
  totalCredits: number;
  classes: ClassEntry[];
  maxCredits: number;
  colorFor: (classId: string) => string;
  width: number;
  /** Shared across every panel being compared so a night class or weekend
   *  meeting in one loadout doesn't leave the panels' axes misaligned. */
  startHour: number;
  endHour: number;
  days: DayOfWeek[];
  /** This panel's total available height (name/credits block + grid), if
   *  known. Omit to always use DEFAULT_HOUR_PX. */
  maxHeight?: number;
  /** Class ids shared by every loadout in the current comparison — anything
   *  in this panel's classes but not in this set gets EventBlock's dashed
   *  "differs" treatment. Omit to skip highlighting entirely. */
  sharedClassIds?: Set<string>;
}

interface EventEntry {
  classEntry: ClassEntry;
  slot: TimeSlot;
}

export function ComparisonPanel({
  name,
  totalCredits,
  classes,
  maxCredits,
  colorFor,
  width,
  startHour,
  endHour,
  days,
  maxHeight,
  sharedClassIds,
}: ComparisonPanelProps) {
  const conflicts = findConflicts(classes);
  const overLimit = totalCredits > maxCredits;
  const dayWidth = Math.max((width - GUTTER_WIDTH) / days.length, 40);

  const [topHeight, setTopHeight] = useState(0);
  const handleTopLayout = (e: LayoutChangeEvent) => setTopHeight(e.nativeEvent.layout.height);

  const totalHours = endHour - startHour;
  const naturalBodyHeight = totalHours * DEFAULT_HOUR_PX;
  const availableBodyHeight =
    maxHeight && topHeight ? Math.max(maxHeight - topHeight - DAY_HEADER_ROW_HEIGHT, 0) : undefined;
  const HOUR_PX =
    availableBodyHeight && naturalBodyHeight > availableBodyHeight
      ? Math.max(MIN_HOUR_PX, Math.floor(availableBodyHeight / totalHours))
      : DEFAULT_HOUR_PX;
  const pxPerMin = HOUR_PX / 60;
  const bodyHeight = totalHours * HOUR_PX;

  const isConflicted = (slot: TimeSlot) => conflicts.some((c) => c.slotA === slot || c.slotB === slot);

  return (
    <View style={{ width }} className="gap-2">
      <View onLayout={handleTopLayout}>
        <Text className="text-sm font-bold text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
          {name}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Text
            className={`text-xs ${
              overLimit ? 'font-semibold text-red-600 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            {totalCredits} / {maxCredits} credits
          </Text>
          {conflicts.length > 0 && (
            <Text className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>

      <View className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <View className="flex-row border-b border-neutral-200 dark:border-neutral-800">
          <View style={{ width: GUTTER_WIDTH }} />
          {days.map((day) => (
            <View key={day} style={{ width: dayWidth }} className="items-center py-1">
              <Text className="text-[9px] font-semibold text-neutral-500 dark:text-neutral-400">
                {DAY_LABELS[day].slice(0, 3).toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-row">
          <View style={{ width: GUTTER_WIDTH, height: bodyHeight }}>
            {Array.from({ length: totalHours + 1 }, (_, i) => startHour + i).map((hour) => (
              <Text
                key={hour}
                className="absolute text-[8px] text-neutral-400 dark:text-neutral-500"
                style={{ top: (hour - startHour) * HOUR_PX - 4, left: 2 }}
              >
                {hour}
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
                style={{ width: dayWidth, height: bodyHeight }}
                className="border-l border-neutral-100 dark:border-neutral-900"
              >
                {positioned.map((item) => {
                  const top = (item.start - startHour * 60) * pxPerMin;
                  const height = Math.max((item.end - item.start) * pxPerMin - 1, 12);
                  const widthPct = 100 / item.columnCount;
                  const leftPct = item.column * widthPct;
                  return (
                    <EventBlock
                      key={`${item.key}-${item.column}-${item.columnCount}`}
                      classEntry={item.data.classEntry}
                      slot={item.data.slot}
                      color={colorFor(item.data.classEntry.id)}
                      conflicted={isConflicted(item.data.slot)}
                      differs={sharedClassIds ? !sharedClassIds.has(item.data.classEntry.id) : false}
                      position={{ top, height, left: `${leftPct}%`, width: `${widthPct}%` }}
                    />
                  );
                })}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
