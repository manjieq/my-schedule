// Ported from course-scheduler-mobile's components/loadouts/LoadoutCard.tsx
// (Course -> ClassEntry, course.code -> class.name).
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { findConflicts } from '@/lib/time';
import type { ClassEntry } from '@/lib/models';

interface LoadoutCardData {
  id: string;
  name: string;
  totalCredits: number;
  createdAt: string;
}

interface LoadoutCardProps {
  loadout: LoadoutCardData;
  classes: ClassEntry[];
  maxCredits: number;
  /** Position in the list — mirrors ClassCard's stagger so both card lists
   *  in the app reveal with the same cascade rather than each inventing
   *  its own entrance. */
  index: number;
  actions?: ReactNode;
}

export function LoadoutCard({ loadout, classes, maxCredits, index, actions }: LoadoutCardProps) {
  const conflicts = findConflicts(classes);
  const overLimit = loadout.totalCredits > maxCredits;

  return (
    <Animated.View entering={FadeInDown.duration(260).delay(Math.min(index, 8) * 35)}>
      <View className="mb-3 gap-2 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-900">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{loadout.name}</Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            {new Date(loadout.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-3">
          <Text
            className={`text-xs ${overLimit ? 'font-semibold text-red-600 dark:text-red-400' : 'text-neutral-600 dark:text-neutral-400'}`}
          >
            {loadout.totalCredits} / {maxCredits} credits
          </Text>
          <Text className="text-xs text-neutral-600 dark:text-neutral-400">
            {classes.length} class{classes.length === 1 ? '' : 'es'}
          </Text>
          {conflicts.length > 0 && (
            <Text className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View className="gap-0.5">
          {classes.map((c) => (
            <Text key={c.id} className="text-xs text-neutral-700 dark:text-neutral-300" numberOfLines={1}>
              {c.name}
            </Text>
          ))}
        </View>
        {actions}
      </View>
    </Animated.View>
  );
}
