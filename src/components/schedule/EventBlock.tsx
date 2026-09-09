// A single class on the board — a keycap standing proud of the grid.
//
// The face is steel, not the class colour. The class identity rides on a 3px
// anodized inlay down the leading edge, the way a machined part is marked. That
// inversion is what lets the same sixteen finishes work on both the silver
// chassis and the near-black one (see PALETTE in lib/color.ts) — the colour is
// never a text background, so it never has to carry a contrast ratio.
//
// The hard offset shadow is the block's height. It is the same device the tab
// keys and list rows use, and it is bound to keycaps specifically: see the note
// on KEY_REST in lib/theme.ts.
//
// Ported from course-scheduler-mobile's components/schedule/EventBlock.tsx
// (Course -> ClassEntry, course.code -> class.name).
import type { DimensionValue } from 'react-native';
import { Text, View } from 'react-native';

import { Keycap } from '@/components/panel/Keycap';
import { formatTime } from '@/lib/time';
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
   * instead of solid edge so a reader scanning a comparison grid can
   * immediately spot what differs. Ignored outside a comparison context
   * (ScheduleGrid never passes it). conflicted still wins if a block is
   * somehow both — a real time clash is the more urgent thing to flag.
   */
  differs?: boolean;
  /** Below roughly 40px the room line has nowhere to sit without colliding
   *  with the name, so short items drop it rather than clip it. */
  dense?: boolean;
}

export function EventBlock({
  classEntry,
  slot,
  color,
  conflicted,
  position,
  differs = false,
  dense = false,
}: EventBlockProps) {
  // A clash is the one thing allowed to outline a key; a comparison difference
  // dashes that outline instead. Both are borders on the cap, never a fill —
  // filling the face would bury the class inlay that identifies it.
  const edge = conflicted
    ? 'border border-alert'
    : differs
      ? 'border border-dashed border-edge'
      : '';

  return (
    <Keycap inlay={color} className={`absolute ${edge}`} style={position}>

      {/* Everything sits in normal flow. The room line used to be absolutely
          positioned at the bottom, which collided with a two-line class name
          once the system font scale went above 1.0 — the block height is fixed
          by the clock, but the type inside it is not. In flow, a tight block
          clips its last line instead of printing two lines on top of each
          other. */}
      <View className="flex-1 py-[3px] pl-[9px] pr-[3px]">
        <Text className="font-panel-semi text-tag text-ink-2" numberOfLines={1}>
          {formatTime(slot.start)}
        </Text>
        {/* No sheet face here: class names are the user's own Korean content,
            which Chivo does not carry. See PRODUCT.md. */}
        <Text className="mt-[1px] text-meta font-bold text-ink" numberOfLines={dense ? 1 : 2}>
          {classEntry.name}
        </Text>
        {!dense && classEntry.location ? (
          <Text className="mt-auto font-panel-semi text-tag text-ink-3" numberOfLines={1}>
            {classEntry.location}
          </Text>
        ) : null}
      </View>
    </Keycap>
  );
}
