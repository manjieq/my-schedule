// Ported from course-scheduler-mobile's components/schedule/EventBlock.tsx
// (Course -> ClassEntry, course.code -> class.name).
import type { DimensionValue } from 'react-native';
import { Text, View } from 'react-native';

import { formatTime } from '@/lib/time';
import { getContrastText } from '@/lib/color';
import type { ClassEntry, TimeSlot } from '@/lib/models';

interface EventBlockPosition {
  top: number;
  height: number;
  left: DimensionValue;
  width: DimensionValue;
}

interface EventBlockProps {
  classEntry: ClassEntry;
  slot: TimeSlot;
  color: string;
  conflicted: boolean;
  position: EventBlockPosition;
  /**
   * True when this class isn't shared by every loadout in the current
   * comparison (see lib/compare.ts's sharedClassIds) — drawn with a dashed
   * instead of solid border so a reader scanning a comparison grid can
   * immediately spot what differs. Ignored outside a comparison context
   * (ScheduleGrid never passes it). conflicted still wins if a block is
   * somehow both — a real time clash is the more urgent thing to flag.
   */
  differs?: boolean;
}

export function EventBlock({ classEntry, slot, color, conflicted, position, differs = false }: EventBlockProps) {
  const textColor = getContrastText(color);
  const borderClass = conflicted
    ? 'border-2 border-red-500'
    : differs
      ? 'border-2 border-dashed border-neutral-900 dark:border-neutral-50'
      : '';
  return (
    <View
      className={`absolute overflow-hidden rounded-md px-1.5 py-1 ${borderClass}`}
      style={{ ...position, backgroundColor: color }}
    >
      <Text style={{ color: textColor }} className="text-[11px] font-semibold" numberOfLines={1}>
        {classEntry.name}
      </Text>
      <Text style={{ color: textColor }} className="text-[10px]" numberOfLines={1}>
        {formatTime(slot.start)}-{formatTime(slot.end)}
      </Text>
    </View>
  );
}
