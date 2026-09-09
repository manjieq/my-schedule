import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { KEY_REST, useRipple, usePanelColors } from '@/lib/theme';
import { slotLabel } from '@/lib/time';
import type { ClassEntry } from '@/lib/models';

interface ClassCardProps {
  classEntry: ClassEntry;
  color: string;
  included: boolean;
  /** Position in the list — only used to stagger this card's entrance so a
   *  freshly-added or first-loaded list reveals as a cascade, not a pop. */
  index: number;
  /** Delete mode is off by default — see the note on the trash cell below. */
  deletable?: boolean;
  onToggleIncluded: () => void;
  onPress: () => void;
  onDelete: () => void;
}

/** One class on the bench.
 *
 *  A called class is a keycap: it stands proud of the chassis on the same hard
 *  offset shadow the board's blocks and the tab keys use. An omitted one drops
 *  into the body as a recess and loses its ink. That is the whole state
 *  indicator — you can read it from across the room, before any text.
 *
 *  The anodized inlay down the leading edge is the same mark the board uses, so
 *  a class is recognisable in both places by the same device. */
export function ClassCard({
  classEntry,
  color,
  included,
  index,
  deletable = false,
  onToggleIncluded,
  onPress,
  onDelete,
}: ClassCardProps) {
  const ripple = useRipple();
  const c = usePanelColors();

  return (
    <Animated.View entering={FadeInDown.duration(260).delay(Math.min(index, 8) * 35)}>
      <View className="mb-2 flex-row items-stretch gap-1.5">
        <Pressable
          onPress={onPress}
          android_ripple={ripple}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${classEntry.name}`}
          className={`flex-1 flex-row items-center overflow-hidden rounded-key py-3 pl-4 pr-3 ${
            included ? 'bg-key' : 'bg-well'
          }`}
          style={[
            { borderTopWidth: 1, borderTopColor: included ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.10)' },
            included ? KEY_REST : null,
          ]}
        >
          {/* the anodized inlay */}
          <View
            className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full"
            style={{ backgroundColor: color, opacity: included ? 1 : 0.4 }}
          />

          <View className="flex-1 pr-2">
            {/* No panel face here: class names are the user's own Korean
                content, which Chivo does not carry. See PRODUCT.md. */}
            <Text
              className={`text-item font-bold ${included ? 'text-ink' : 'text-ink-3'}`}
              numberOfLines={1}
            >
              {classEntry.name}
            </Text>

            <Text className="mt-1 font-panel-semi text-code uppercase text-ink-2" numberOfLines={2}>
              {classEntry.schedule.length > 0
                ? classEntry.schedule.map(slotLabel).join('  ·  ')
                : 'no meeting time set'}
            </Text>

            {classEntry.location || classEntry.instructor ? (
              <Text className="mt-0.5 text-meta text-ink-2" numberOfLines={1}>
                {[classEntry.location, classEntry.instructor].filter(Boolean).join('  ·  ')}
              </Text>
            ) : null}
          </View>

          <Text
            className={`mr-3 font-panel-bold text-meta ${included ? 'text-accent-hi' : 'text-ink-3'}`}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {classEntry.credits.toFixed(1)}
          </Text>

          {/* The CALL control: a rocker switch, not the platform Switch. The
              slot is a recess cut into the key face and the thumb is a smaller
              keycap sitting in it, so the control is made of the same two
              materials as everything else on the panel. Filled in the trim when
              called, which is the only state colour this world spends. */}
          <Pressable
            onPress={onToggleIncluded}
            accessibilityRole="switch"
            accessibilityState={{ checked: included }}
            accessibilityLabel={`${classEntry.name}, ${included ? 'called' : 'omitted'}`}
            hitSlop={10}
            className="h-[22px] w-[38px] justify-center rounded-well"
            style={{ backgroundColor: included ? c.accentLo : c.well }}
          >
            <View
              className="h-[18px] w-[17px] rounded-[4px]"
              style={{
                marginLeft: included ? 19 : 2,
                backgroundColor: included ? c.accentHi : c.key1,
                ...KEY_REST,
              }}
            />
          </Pressable>
        </Pressable>

        {/* Hidden until delete mode is on. A trash icon permanently parked
            beside a row people tap constantly is an accident waiting to
            happen; the mode makes deleting a thing you go and ask for. */}
        {deletable ? (
          <Pressable
            onPress={onDelete}
            android_ripple={{ ...ripple, borderless: true, radius: 22 }}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${classEntry.name}`}
            className="w-11 items-center justify-center"
          >
            <Ionicons name="trash-outline" size={17} color={c.alert} />
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}
