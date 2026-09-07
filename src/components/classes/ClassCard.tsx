import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { slotLabel } from '@/lib/time';
import { ACCENT, ICON_MUTED, useRipple } from '@/lib/theme';
import type { ClassEntry } from '@/lib/models';

interface ClassCardProps {
  classEntry: ClassEntry;
  color: string;
  included: boolean;
  /** Position in the list — only used to stagger this card's entrance so a
   *  freshly-added or first-loaded list reveals as a cascade, not a pop. */
  index: number;
  onToggleIncluded: () => void;
  onPress: () => void;
  onDelete: () => void;
}

export function ClassCard({
  classEntry,
  color,
  included,
  index,
  onToggleIncluded,
  onPress,
  onDelete,
}: ClassCardProps) {
  const ripple = useRipple();

  return (
    <Animated.View entering={FadeInDown.duration(260).delay(Math.min(index, 8) * 35)}>
      <Pressable
        onPress={onPress}
        android_ripple={ripple}
        className="mx-4 mb-3 flex-row items-center gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-900"
      >
        <View className="h-10 w-1.5 rounded-full" style={{ backgroundColor: color }} />

        <View className="flex-1 gap-0.5">
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
            {classEntry.name}
          </Text>
          {classEntry.location ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="location-outline" size={12} color={ICON_MUTED} />
              <Text className="text-sm text-neutral-500 dark:text-neutral-400" numberOfLines={1}>
                {classEntry.location}
              </Text>
            </View>
          ) : null}
          {classEntry.instructor ? (
            <Text className="text-sm text-neutral-500 dark:text-neutral-400" numberOfLines={1}>
              {classEntry.instructor}
            </Text>
          ) : null}
          <Text className="text-xs text-neutral-400 dark:text-neutral-500" numberOfLines={2}>
            {classEntry.schedule.length > 0
              ? classEntry.schedule.map(slotLabel).join(' · ')
              : 'No meeting time set'}
          </Text>
          <Text className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {classEntry.credits} {classEntry.credits === 1 ? 'credit' : 'credits'}
          </Text>
        </View>

        <View className="items-center gap-2">
          <Switch
            value={included}
            onValueChange={onToggleIncluded}
            trackColor={{ true: '#c4b5fd' }}
            thumbColor={included ? ACCENT : undefined}
          />
          <Pressable
            onPress={onDelete}
            hitSlop={10}
            android_ripple={{ ...ripple, borderless: true, radius: 20 }}
            className="p-2"
          >
            <Ionicons name="trash-outline" size={18} color={ICON_MUTED} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}
