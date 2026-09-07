// Ported from course-scheduler-mobile's components/loadouts/LoadoutCard.tsx
// (Course -> ClassEntry, course.code -> class.name).
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

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
  actions?: ReactNode;
}

export function LoadoutCard({ loadout, classes, maxCredits, actions }: LoadoutCardProps) {
  const conflicts = findConflicts(classes);
  const overLimit = loadout.totalCredits > maxCredits;

  return (
    <View className="mb-3 gap-2 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{loadout.name}</Text>
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
  );
}
