import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Switch, Text, View } from 'react-native';

import { slotLabel } from '@/lib/time';
import type { ClassEntry } from '@/lib/models';

interface ClassCardProps {
  classEntry: ClassEntry;
  color: string;
  included: boolean;
  onToggleIncluded: () => void;
  onPress: () => void;
  onDelete: () => void;
}

export function ClassCard({ classEntry, color, included, onToggleIncluded, onPress, onDelete }: ClassCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mx-4 mb-3 flex-row items-center gap-3 rounded-2xl bg-white p-4 shadow-sm active:opacity-80 dark:bg-neutral-900"
    >
      <View className="h-10 w-1.5 rounded-full" style={{ backgroundColor: color }} />

      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50" numberOfLines={1}>
          {classEntry.name}
        </Text>
        {classEntry.location ? (
          <Text className="text-sm text-neutral-500 dark:text-neutral-400" numberOfLines={1}>
            📍 {classEntry.location}
          </Text>
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
        <Switch value={included} onValueChange={onToggleIncluded} />
        <Pressable onPress={onDelete} hitSlop={8} className="p-1">
          <Ionicons name="trash-outline" size={18} color="#9ca3af" />
        </Pressable>
      </View>
    </Pressable>
  );
}
